using Bakalauras.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

public class ProductSyncWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IHttpClientFactory _httpClientFactory;

    public ProductSyncWorker(IServiceScopeFactory scopeFactory, IHttpClientFactory httpClientFactory)
    {
        _scopeFactory = scopeFactory;
        _httpClientFactory = httpClientFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await RunOnce(stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await SyncProductsForAllCompanies(stoppingToken);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ProductSyncWorker] Error: {ex}");
            }

            await Task.Delay(TimeSpan.FromMinutes(60), stoppingToken);
        }
    }

    private async Task RunOnce(CancellationToken ct)
    {
        try { await SyncProductsForAllCompanies(ct); }
        catch (Exception ex) { Console.WriteLine($"[ProductSyncWorker] Startup sync error: {ex}"); }
    }

    private static DateTime? ParseButentTime(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;

        return DateTime.TryParseExact(
            value.Trim(),
            "yyyy-MM-dd HH:mm:ss",
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out var dt)
            ? dt
            : null;
    }

    private async Task SyncProductsForAllCompanies(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Load enabled BUTENT integrations (one per company)
        var integrations = await db.company_integrations
            .AsNoTracking()
            .Where(ci => ci.enabled == true && ci.type == "BUTENT")
            .Select(ci => new
            {
                ci.fk_Companyid_Company,
                ci.baseUrl,
                ci.encryptedSecrets
            })
            .ToListAsync(ct);

        if (integrations.Count == 0)
        {
            Console.WriteLine("[ProductSyncWorker] No enabled BUTENT integrations found.");
            return;
        }

        // Shared lookups (same tables for all companies)
        var categoriesById = await db.categories
            .AsNoTracking()
            .ToDictionaryAsync(c => c.id_Category, ct);

        var groupsById = await db.productgroups
            .AsNoTracking()
            .ToDictionaryAsync(g => g.id_ProductGroup, ct);

        foreach (var integ in integrations)
        {
            if (ct.IsCancellationRequested) break;

            var companyId = integ.fk_Companyid_Company;

            try
            {
                await SyncProductsForCompany(
                    db,
                    companyId,
                    integ.baseUrl,
                    integ.encryptedSecrets,
                    categoriesById,
                    groupsById,
                    ct
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ProductSyncWorker] Company {companyId} sync failed: {ex.Message}");
            }
        }
    }

    private async Task SyncProductsForCompany(
        AppDbContext db,
        int companyId,
        string? baseUrl,
        string encryptedSecrets,
        Dictionary<int, category> categoriesById,
        Dictionary<int, productgroup> groupsById,
        CancellationToken ct)
    {
        // IMPORTANT:
        // "encryptedSecrets" is your column. Here I assume it can be decrypted to JSON like:
        // { "username": "...", "password": "..." }
        // Replace DecryptSecrets(...) with your real decrypt implementation.
        var (username, password) = DecryptSecrets(encryptedSecrets);

        var http = _httpClientFactory.CreateClient();
        http.BaseAddress = new Uri(string.IsNullOrWhiteSpace(baseUrl)
            ? "http://94.176.235.151:3001/api/v1/"
            : baseUrl.TrimEnd('/') + "/");

        var authValue = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{username}:{password}"));
        http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authValue);

        var butentApi = new ButentApiService(http);

        var externalProducts = await butentApi.GetProductsAsync(ct);
        Console.WriteLine($"[ProductSyncWorker] Company {companyId} API goods: {externalProducts.Count}");
        if (externalProducts.Count == 0) return;

        // Existing codes MUST be per-company, because your DB allows same externalCode in different companies
        var existingExternalCodes = (await db.products
                .AsNoTracking()
                .Where(p => p.fk_Companyid_Company == companyId)
                .Select(p => p.externalCode)
                .ToListAsync(ct))
            .Where(x => x.HasValue)
            .Select(x => x!.Value)
            .ToHashSet();

        var toInsert = new List<product>();

        foreach (var ext in externalProducts)
        {
            if (existingExternalCodes.Contains(ext.Code))
                continue;

            var typeName = ext.Type?.Name?.Trim();
            var canReturn = !string.Equals(typeName, "Paslaugos", StringComparison.OrdinalIgnoreCase);

            var p = new product
            {
                fk_Companyid_Company = companyId, // ✅ CRITICAL FIX
                externalCode = ext.Code,
                name = string.IsNullOrWhiteSpace(ext.Name) ? $"Prekė {ext.Code}" : ext.Name.Trim(),

                description = null,
                price = null,
                picture = null,

                canTheProductBeProductReturned = canReturn,
                countableItem = ext.CountableItem,
                unit = string.IsNullOrWhiteSpace(ext.Unit) ? "vnt" : ext.Unit.Trim(),
                shipping_mode = string.IsNullOrWhiteSpace(ext.ShippingMode) ? null : ext.ShippingMode.Trim(),
                vat = ext.Vat,
                creationDate = ParseButentTime(ext.InpTime)
            };

            // NOTE: categories/groups are global tables in your dump (not per-company).
            // If later you make them per-company, you must also add fk_Company in those tables and filter.
            var catId = ext.Type?.Id;
            if (catId.HasValue && categoriesById.TryGetValue(catId.Value, out var catEntity))
            {
                // attach so EF doesn't try to insert category again
                db.Attach(catEntity);
                p.fk_Categoryid_Categories.Add(catEntity);
            }

            var grpId = ext.Group?.Id;
            if (grpId.HasValue && groupsById.TryGetValue(grpId.Value, out var grpEntity))
            {
                db.Attach(grpEntity);
                p.fk_ProductGroupId_ProductGroups.Add(grpEntity);
            }

            toInsert.Add(p);
        }

        if (toInsert.Count == 0)
        {
            Console.WriteLine($"[ProductSyncWorker] Company {companyId}: nothing new to insert.");
            return;
        }

        db.products.AddRange(toInsert);

        try
        {
            await db.SaveChangesAsync(ct);
            Console.WriteLine($"[ProductSyncWorker] Company {companyId}: inserted {toInsert.Count} new products.");
        }
        catch (DbUpdateException ex)
        {
            // If two workers run or API duplicates exist, unique index (companyId, externalCode) can throw.
            // This log helps you see the real reason quickly.
            Console.WriteLine($"[ProductSyncWorker] Company {companyId}: DB update failed: {ex.InnerException?.Message ?? ex.Message}");
            throw;
        }
    }

    // =========================
    // Replace this with REAL decrypt logic.
    // For now, it supports:
    // 1) plain JSON in encryptedSecrets
    // 2) or "username:password" format
    // =========================
    private static (string username, string password) DecryptSecrets(string encryptedSecrets)
    {
        if (string.IsNullOrWhiteSpace(encryptedSecrets))
            return ("", "");

        // Try JSON first
        try
        {
            using var doc = JsonDocument.Parse(encryptedSecrets);
            var root = doc.RootElement;

            var u = root.TryGetProperty("username", out var uEl) ? (uEl.GetString() ?? "") : "";
            var p = root.TryGetProperty("password", out var pEl) ? (pEl.GetString() ?? "") : "";

            if (!string.IsNullOrWhiteSpace(u) || !string.IsNullOrWhiteSpace(p))
                return (u, p);
        }
        catch
        {
            // ignore
        }

        // Fallback: "username:password"
        var parts = encryptedSecrets.Split(':', 2);
        if (parts.Length == 2) return (parts[0], parts[1]);

        return ("", "");
    }
}