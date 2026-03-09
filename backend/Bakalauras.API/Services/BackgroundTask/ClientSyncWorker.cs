using System.Net.Http.Headers;
using System.Text;
using Bakalauras.API.Models;
using Microsoft.EntityFrameworkCore;

public class ClientSyncWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IHttpClientFactory _httpClientFactory;

    public ClientSyncWorker(IServiceScopeFactory scopeFactory, IHttpClientFactory httpClientFactory)
    {
        _scopeFactory = scopeFactory;
        _httpClientFactory = httpClientFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try { await SyncAllCompanies(stoppingToken); }
        catch (Exception ex) { Console.WriteLine($"[ClientSyncWorker] Startup sync error: {ex}"); }

        while (!stoppingToken.IsCancellationRequested)
        {
            try { await SyncAllCompanies(stoppingToken); }
            catch (Exception ex) { Console.WriteLine($"[ClientSyncWorker] Error syncing clients: {ex}"); }

            await Task.Delay(TimeSpan.FromMinutes(60), stoppingToken);
        }
    }

    private async Task SyncAllCompanies(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var integrations = await db.company_integrations
            .AsNoTracking()
            .Where(x => x.enabled == true && x.type == "BUTENT")
            .Select(x => new { x.fk_Companyid_Company, x.baseUrl, x.encryptedSecrets })
            .ToListAsync(ct);

        if (integrations.Count == 0)
        {
            Console.WriteLine("[ClientSyncWorker] No enabled BUTENT integrations found.");
            return;
        }

        foreach (var integ in integrations)
        {
            ct.ThrowIfCancellationRequested();

            var (u, p, b) = IntegrationSecrets.TryUnpack(integ.encryptedSecrets);
            var baseUrl = !string.IsNullOrWhiteSpace(integ.baseUrl) ? integ.baseUrl : b;

            if (string.IsNullOrWhiteSpace(baseUrl) ||
                string.IsNullOrWhiteSpace(u) ||
                string.IsNullOrWhiteSpace(p))
            {
                Console.WriteLine($"[ClientSyncWorker] Skipping company {integ.fk_Companyid_Company}: missing baseUrl/username/password.");
                continue;
            }

            await SyncCompanyClients(integ.fk_Companyid_Company, baseUrl!, u!, p!, ct);
        }
    }

    private async Task SyncCompanyClients(int companyId, string baseUrl, string username, string password, CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var http = _httpClientFactory.CreateClient();
        http.BaseAddress = new Uri(baseUrl.Trim().TrimEnd('/') + "/");

        var authValue = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{username}:{password}"));
        http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authValue);

        var butent = new ButentApiService(http);

        var externalClients = await butent.GetClientsAsync(ct);
        Console.WriteLine($"[ClientSyncWorker] Company={companyId} external clients from API: {externalClients.Count}");
        if (externalClients.Count == 0) return;

        // Find which externalClientIds we already have for this company
        var existingExternalIds = await db.client_companies
            .AsNoTracking()
            .Where(cc => cc.fk_Companyid_Company == companyId && cc.externalClientId.HasValue)
            .Select(cc => cc.externalClientId!.Value)
            .ToListAsync(ct);

        var existingSet = existingExternalIds.ToHashSet();

        var newClients = externalClients.Where(ext => !existingSet.Contains(ext.ClientID)).ToList();
        Console.WriteLine($"[ClientSyncWorker] Company={companyId} new clients to add: {newClients.Count}");
        if (newClients.Count == 0) return;

        await using var tx = await db.Database.BeginTransactionAsync(ct);

        try
        {
            // Pre-load any users that already exist by the emails we are about to create
            var emails = newClients
                .Select(ext => BuildClientEmail(companyId, ext.ClientID))
                .Distinct()
                .ToList();

            var usersByEmail = await db.users
                .Where(u => emails.Contains(u.email))
                .ToDictionaryAsync(u => u.email, u => u, ct);

            var usersToAdd = new List<user>();
            var linksToAdd  = new List<client_company>();

            foreach (var ext in newClients)
            {
                ct.ThrowIfCancellationRequested();

                var email = BuildClientEmail(companyId, ext.ClientID);

                if (!usersByEmail.TryGetValue(email, out var u))
                {
                    u = new user
                    {
                        email            = email,
                        password         = BCrypt.Net.BCrypt.HashPassword("123"),
                        name             = ext.Name ?? $"Client {ext.ClientID}",
                        surname          = "Klientas",
                        authProvider     = "LOCAL",
                        creationDate     = DateTime.Now,
                        fk_Companyid_Company = null,
                        isMasterAdmin    = false
                    };

                    usersToAdd.Add(u);
                    usersByEmail[email] = u;
                }

                linksToAdd.Add(new client_company
                {
                    fk_Companyid_Company = companyId,
                    externalClientId     = ext.ClientID,
                    deliveryAddress      = ext.Address ?? string.Empty,
                    city                 = ext.City    ?? string.Empty,
                    country              = ext.Country ?? string.Empty,
                    vat                  = ext.Vat,
                    bankCode             = int.TryParse(ext.BankCode, out var bc) ? bc : null
                });
            }

            // 1) Persist new users so EF assigns id_Users
            if (usersToAdd.Count > 0)
            {
                db.users.AddRange(usersToAdd);
                await db.SaveChangesAsync(ct);
            }

            // 2) Build client_company rows (fk now resolvable) + ensure company_users CLIENT link
            foreach (var link in linksToAdd)
            {
                var email = BuildClientEmail(companyId, link.externalClientId ?? 0);
                var u     = usersByEmail[email];

                link.fk_Clientid_Users = u.id_Users;

                // Add CLIENT role to company_users if not already present
                var cuExists = await db.company_users.AnyAsync(cu =>
                    cu.fk_Companyid_Company == companyId &&
                    cu.fk_Usersid_Users     == u.id_Users, ct);

                if (!cuExists)
                {
                    db.company_users.Add(new company_user
                    {
                        fk_Companyid_Company = companyId,
                        fk_Usersid_Users     = u.id_Users,
                        role                 = "CLIENT",
                        active               = true
                    });
                }
            }

            // 3) Insert client_company rows (skip any that already snuck in via race)
            foreach (var link in linksToAdd)
            {
                var already = await db.client_companies.AnyAsync(cc =>
                    cc.fk_Companyid_Company == companyId &&
                    cc.externalClientId     == link.externalClientId, ct);

                if (!already) db.client_companies.Add(link);
            }

            await db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            Console.WriteLine($"[ClientSyncWorker] Company={companyId} sync complete: added {newClients.Count} client_company links.");
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync(ct);
            Console.WriteLine($"[ClientSyncWorker] Company={companyId} sync failed: {ex}");
        }
    }

    private static string BuildClientEmail(int companyId, int clientId)
        => $"butent-c{companyId}-client{clientId}@local";
}