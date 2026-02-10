using Bakalauras.API.Data;
using Bakalauras.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

public class OrderSyncWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ButentApiService _butent;

    public OrderSyncWorker(IServiceScopeFactory scopeFactory, ButentApiService butent)
    {
        _scopeFactory = scopeFactory;
        _butent = butent;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await SyncOrders(stoppingToken);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[OrderSyncWorker] Error: {ex}");
            }

            await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
        }
    }

    private static DateTime? ParseButentDate(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;

        // "2023-05-03 00:00:00"
        if (DateTime.TryParseExact(value.Trim(), "yyyy-MM-dd HH:mm:ss",
            CultureInfo.InvariantCulture, DateTimeStyles.None, out var dt))
            return dt;

        return null;
    }

    private async Task SyncOrders(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // 1) pull sales docs (bills)
        var sales = await _butent.GetSalesAsync("2000-10-01", ct);
        Console.WriteLine($"[OrderSyncWorker] Sales docs: {sales.Count}");
        if (sales.Count == 0) return;

        // existing orders by external id
        var existing = (await db.orders
                .AsNoTracking()
                .Select(o => o.externalDocumentId)
                .ToListAsync(ct))
            .ToHashSet();

        // cache mappings for fast FK resolve
        var clientsByExternal = await db.clients
            .AsNoTracking()
            .ToDictionaryAsync(c => c.externalClientId, c => c.id_Users, ct);
        // NOTE: adjust value if your orders.fk_Clientid_Users references something else

        var productsByExternal = await db.products
            .AsNoTracking()
            .ToDictionaryAsync(p => p.externalCode, p => p.id_Product, ct);

        foreach (var bill in sales)
        {
            var extDocId = bill.DocumentID;
            if (existing.Contains(extDocId)) continue;

            // 2) get document -> to read client_id
            var doc = await _butent.GetDocumentAsync(extDocId, ct);
            if (doc?.Client_Id == null)
            {
                Console.WriteLine($"[OrderSyncWorker] Skipping doc {extDocId}: no client_id");
                continue;
            }

            if (!clientsByExternal.TryGetValue(doc.Client_Id.Value, out var fkClientUserId))
            {
                Console.WriteLine($"[OrderSyncWorker] Skipping doc {extDocId}: client {doc.Client_Id} not in DB yet");
                continue;
            }

            // 3) create order and save FIRST -> get DB id_Orders
            var order = new order
            {
                externalDocumentId = extDocId,
                OrdersDate = ParseButentDate(doc.Date)?.Date ?? DateTime.UtcNow.Date,
                totalAmount = doc.Total ?? bill.Total ?? 0,
                paymentMethod = "butent",     // or null if allowed
                deliveryPrice = 0,            // or null if allowed
                status = 4,
                fk_Clientid_Users = fkClientUserId,
                fk_Reportid_Report = 0         // ONLY if required; otherwise remove
            };

            db.orders.Add(order);
            await db.SaveChangesAsync(ct); // IMPORTANT: now order.id_Orders exists

            // 4) items -> insert ordersproduct rows referencing order.id_Orders
            // now insert items
            var items = await _butent.GetDocumentItemsAsync(extDocId, ct);

            foreach (var it in items)
            {
                if (!productsByExternal.TryGetValue(it.Good_Id, out var productId))
                    continue;

                db.ordersproducts.Add(new ordersproduct
                {
                    fk_Ordersid_Orders = order.id_Orders,
                    fk_Productid_Product = productId,
                    quantity = (int)Math.Round(it.Quantity, MidpointRounding.AwayFromZero)
                });
            }

            await db.SaveChangesAsync(ct);

            Console.WriteLine($"[OrderSyncWorker] Inserted order ext={extDocId} dbId={order.id_Orders} items={items.Count}");
        }
    }
}
