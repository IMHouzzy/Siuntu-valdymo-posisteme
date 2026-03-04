using System.Globalization;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Bakalauras.API.Models;
using Microsoft.EntityFrameworkCore;

public class OrderSyncWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IHttpClientFactory _httpClientFactory;

    public OrderSyncWorker(
        IServiceScopeFactory scopeFactory,
        IHttpClientFactory httpClientFactory)
    {
        _scopeFactory = scopeFactory;
        _httpClientFactory = httpClientFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try { await SyncAllCompanies(stoppingToken); }
        catch (Exception ex) { Console.WriteLine($"[OrderSyncWorker] Startup error: {ex}"); }

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await SyncAllCompanies(stoppingToken);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[OrderSyncWorker] Error: {ex}");
            }

            await Task.Delay(TimeSpan.FromMinutes(60), stoppingToken);
        }
    }

    // ===============================
    // MULTI COMPANY LOOP
    // ===============================
    private async Task SyncAllCompanies(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var integrations = await db.company_integrations
            .AsNoTracking()
            .Where(x => x.enabled == true && x.type == "BUTENT")
            .ToListAsync(ct);

        foreach (var integ in integrations)
        {
            var secrets = ParseSecrets(integ.encryptedSecrets);

            if (string.IsNullOrWhiteSpace(secrets.Username) ||
                string.IsNullOrWhiteSpace(secrets.Password))
                continue;

            await SyncCompanyOrders(
                integ.fk_Companyid_Company,
                integ.baseUrl!,
                secrets.Username!,
                secrets.Password!,
                ct);
        }
    }

    // ===============================
    // COMPANY SYNC
    // ===============================
    private async Task SyncCompanyOrders(
        int companyId,
        string baseUrl,
        string username,
        string password,
        CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var http = _httpClientFactory.CreateClient();
        http.BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/");

        var auth = Convert.ToBase64String(
            Encoding.UTF8.GetBytes($"{username}:{password}")
        );

        http.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Basic", auth);

        var butent = new ButentApiService(http);

        var sales = await butent.GetSalesAsync("2000-10-01", ct);
        Console.WriteLine($"[OrderSyncWorker] Company={companyId} docs={sales.Count}");
        if (sales.Count == 0) return;

        // Existing orders PER COMPANY
        var existing = (await db.orders
                .Where(o => o.fk_Companyid_Company == companyId)
                .Select(o => o.externalDocumentId)
                .ToListAsync(ct))
            .ToHashSet();

        // CLIENT mapping via client_company
        var clientsByExternal = await db.client_companies
            .Where(cc => cc.fk_Companyid_Company == companyId &&
                         cc.externalClientId.HasValue)
            .ToDictionaryAsync(
                cc => cc.externalClientId!.Value,
                cc => cc.fk_Clientid_Users,
                ct);

        var productsByExternal = await db.products
            .Where(p => p.fk_Companyid_Company == companyId &&
                        p.externalCode.HasValue)
            .ToDictionaryAsync(
                p => p.externalCode!.Value,
                p => p.id_Product,
                ct);

        foreach (var bill in sales)
        {
            var extDocId = bill.DocumentID;
            if (existing.Contains(extDocId))
                continue;

            var doc = await butent.GetDocumentAsync(extDocId, ct);
            if (doc?.Client_Id == null)
                continue;

            if (!clientsByExternal.TryGetValue(doc.Client_Id.Value, out var clientUserId))
            {
                Console.WriteLine($"Client missing for company {companyId}");
                continue;
            }

            var order = new order
            {
                fk_Companyid_Company = companyId,
                externalDocumentId = extDocId,
                OrdersDate = ParseButentDate(doc.Date)?.Date ?? DateTime.UtcNow.Date,
                totalAmount = doc.Total ?? bill.Total ?? 0,
                paymentMethod = "butent",
                deliveryPrice = 0,
                status = 4,
                fk_Clientid_Users = clientUserId
            };

            db.orders.Add(order);
            await db.SaveChangesAsync(ct);

            var items = await butent.GetDocumentItemsAsync(extDocId, ct);

            const double VatRate = 0.21;

            foreach (var it in items)
            {
                if (!productsByExternal.TryGetValue(it.Good_Id, out var productId))
                    continue;

                var unitPrice = it.Price ?? 0;
                var vatValue = Math.Round(unitPrice * VatRate, 2);

                db.ordersproducts.Add(new ordersproduct
                {
                    fk_Ordersid_Orders = order.id_Orders,
                    fk_Productid_Product = productId,
                    quantity = it.Quantity,
                    unitPrice = unitPrice,
                    vatValue = vatValue
                });
            }

            await db.SaveChangesAsync(ct);

            Console.WriteLine(
                $"[OrderSyncWorker] Company={companyId} inserted order ext={extDocId}");
        }
    }

    // ===============================
    private static DateTime? ParseButentDate(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;

        if (DateTime.TryParseExact(
            value.Trim(),
            "yyyy-MM-dd HH:mm:ss",
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out var dt))
            return dt;

        return null;
    }

    // ===============================
    private static ButentSecrets ParseSecrets(string json)
    {
        try
        {
            var doc = JsonDocument.Parse(json).RootElement;

            return new ButentSecrets
            {
                Username = doc.GetProperty("username").GetString(),
                Password = doc.GetProperty("password").GetString()
            };
        }
        catch
        {
            return new ButentSecrets();
        }
    }

    private class ButentSecrets
    {
        public string? Username { get; set; }
        public string? Password { get; set; }
    }
}