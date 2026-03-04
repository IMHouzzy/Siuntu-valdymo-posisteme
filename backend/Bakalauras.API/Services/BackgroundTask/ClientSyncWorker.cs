using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
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
        // run once on startup
        try { await SyncAllCompanies(stoppingToken); }
        catch (Exception ex) { Console.WriteLine($"[ClientSyncWorker] Startup sync error: {ex}"); }

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await SyncAllCompanies(stoppingToken);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ClientSyncWorker] Error syncing clients: {ex}");
            }

            await Task.Delay(TimeSpan.FromMinutes(60), stoppingToken);
        }
    }

    private async Task SyncAllCompanies(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // NOTE: adapt "type" value to your real one (e.g. "BUTENT")
        var integrations = await db.company_integrations
            .AsNoTracking()
            .Where(x => x.enabled == true && x.type == "BUTENT")
            .Select(x => new
            {
                x.fk_Companyid_Company,
                x.baseUrl,
                x.encryptedSecrets
            })
            .ToListAsync(ct);

        // If you still have only one global Butent config, you can skip this integration loop
        // and just call SyncCompany(companyId, baseUrl, username, password).
        if (integrations.Count == 0)
        {
            Console.WriteLine("[ClientSyncWorker] No enabled BUTENT integrations found.");
            return;
        }

        foreach (var integ in integrations)
        {
            ct.ThrowIfCancellationRequested();

            var secrets = ParseSecrets(integ.encryptedSecrets);
            var baseUrl = !string.IsNullOrWhiteSpace(integ.baseUrl) ? integ.baseUrl : secrets.BaseUrl;

            if (string.IsNullOrWhiteSpace(baseUrl) ||
                string.IsNullOrWhiteSpace(secrets.Username) ||
                string.IsNullOrWhiteSpace(secrets.Password))
            {
                Console.WriteLine($"[ClientSyncWorker] Skipping company {integ.fk_Companyid_Company}: missing baseUrl/username/password.");
                continue;
            }

            await SyncCompanyClients(
                companyId: integ.fk_Companyid_Company,
                baseUrl: baseUrl,
                username: secrets.Username!,
                password: secrets.Password!,
                ct: ct);
        }
    }

    private async Task SyncCompanyClients(int companyId, string baseUrl, string username, string password, CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Build per-company HttpClient
        var http = _httpClientFactory.CreateClient();
        http.BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/");

        var authValue = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{username}:{password}"));
        http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authValue);

        var butent = new ButentApiService(http);

        var externalClients = await butent.GetClientsAsync();
        Console.WriteLine($"[ClientSyncWorker] Company={companyId} external clients from API: {externalClients.Count}");
        if (externalClients.Count == 0) return;

        // Existing mappings (companyId + externalClientId) => already synced for THIS company
        var existingExternalIds = await db.client_companies
            .AsNoTracking()
            .Where(cc => cc.fk_Companyid_Company == companyId && cc.externalClientId.HasValue)
            .Select(cc => cc.externalClientId!.Value)
            .ToListAsync(ct);

        var existingSet = existingExternalIds.ToHashSet();

        var newClients = externalClients
            .Where(ext => !existingSet.Contains(ext.ClientID))
            .ToList();

        Console.WriteLine($"[ClientSyncWorker] Company={companyId} new clients to add: {newClients.Count}");
        if (newClients.Count == 0) return;

        await using var tx = await db.Database.BeginTransactionAsync(ct);

        try
        {
            // Prefetch users by generated email to avoid N queries
            // IMPORTANT: make email unique per company so different companies can have same Butent client ID
            var emails = newClients
                .Select(ext => BuildClientEmail(companyId, ext.ClientID))
                .Distinct()
                .ToList();

            var usersByEmail = await db.users
                .Where(u => emails.Contains(u.email))
                .ToDictionaryAsync(u => u.email, u => u, ct);

            var usersToAdd = new List<user>();
            var clientsToAdd = new List<client>();
            var linksToAdd = new List<client_company>();

            foreach (var ext in newClients)
            {
                ct.ThrowIfCancellationRequested();

                var email = BuildClientEmail(companyId, ext.ClientID);

                if (!usersByEmail.TryGetValue(email, out var u))
                {
                    u = new user
                    {
                        email = email,
                        password = BCrypt.Net.BCrypt.HashPassword("123"), // TODO: replace with proper onboarding
                        name = ext.Name ?? $"Client {ext.ClientID}",
                        surname = "Klientas",
                        authProvider = "LOCAL",
                        creationDate = DateTime.Now,

                        // clients can belong to multiple companies -> keep NULL here
                        fk_Companyid_Company = null,
                        isMasterAdmin = false
                    };

                    usersToAdd.Add(u);
                    usersByEmail[email] = u;
                }

                // Ensure base "client" row exists (one-to-one with users)
                // Company-specific fields should live in client_company now.
                // We only ensure presence here.
                var clientExists = await db.clients.AsNoTracking().AnyAsync(c => c.id_Users == u.id_Users, ct);

                // If u is new, id_Users is not known yet; we'll create client row after SaveChanges.
                // For existing users, create client row if missing.
                if (!clientExists && u.id_Users > 0)
                {
                    clientsToAdd.Add(new client
                    {
                        id_Users = u.id_Users,
                        userId = u.id_Users
                    });
                }

                // Create link row (company + user) with externalClientId and address data
                linksToAdd.Add(new client_company
                {
                    fk_Companyid_Company = companyId,
                    // fk_Clientid_Users will be filled after users are saved (if user is new)
                    externalClientId = ext.ClientID,
                    deliveryAddress = ext.Address ?? string.Empty,
                    city = ext.City ?? string.Empty,
                    country = ext.Country ?? string.Empty,
                    vat = ext.Vat,
                    bankCode = int.TryParse(ext.BankCode, out var b) ? b : null
                });
            }

            if (usersToAdd.Count > 0)
            {
                db.users.AddRange(usersToAdd);
                await db.SaveChangesAsync(ct);
            }

            // Now that new users have IDs, ensure client rows + fill fk on links
            foreach (var link in linksToAdd)
            {
                var email = BuildClientEmail(companyId, link.externalClientId ?? 0);
                var u = usersByEmail[email];

                link.fk_Clientid_Users = u.id_Users;

                // if client row still missing, create it
                var exists = await db.clients.AsNoTracking().AnyAsync(c => c.id_Users == u.id_Users, ct);
                if (!exists)
                {
                    db.clients.Add(new client
                    {
                        id_Users = u.id_Users,
                        userId = u.id_Users
                    });
                }
            }

            // IMPORTANT: upsert protection: someone might have inserted in-between
            // (unique key: (fk_Companyid_Company, externalClientId))
            foreach (var link in linksToAdd)
            {
                var already = await db.client_companies.AnyAsync(cc =>
                    cc.fk_Companyid_Company == companyId &&
                    cc.externalClientId == link.externalClientId, ct);

                if (!already)
                    db.client_companies.Add(link);
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

    private static ButentSecrets ParseSecrets(string encryptedSecrets)
    {
        // If you later implement real encryption, decrypt first, then parse JSON.
        // For now we assume JSON in this shape:
        // { "username": "...", "password": "...", "baseUrl": "http://..." }
        try
        {
            var doc = JsonDocument.Parse(encryptedSecrets);
            var root = doc.RootElement;

            return new ButentSecrets
            {
                Username = root.TryGetProperty("username", out var u) ? u.GetString() : null,
                Password = root.TryGetProperty("password", out var p) ? p.GetString() : null,
                BaseUrl = root.TryGetProperty("baseUrl", out var b) ? b.GetString() : null
            };
        }
        catch
        {
            return new ButentSecrets();
        }
    }

    private sealed class ButentSecrets
    {
        public string? Username { get; set; }
        public string? Password { get; set; }
        public string? BaseUrl { get; set; }
    }
}