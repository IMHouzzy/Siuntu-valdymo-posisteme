using Bakalauras.API.Data;
using Bakalauras.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

public class ProductSyncWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ButentApiService _butentApi;

    public ProductSyncWorker(IServiceScopeFactory scopeFactory, ButentApiService butentApi)
    {
        _scopeFactory = scopeFactory;
        _butentApi = butentApi;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await RunOnce(stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await SyncProducts(stoppingToken);
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
        try { await SyncProducts(ct); }
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

    private async Task SyncProducts(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var externalProducts = await _butentApi.GetProductsAsync(ct);
        Console.WriteLine($"[ProductSyncWorker] API goods: {externalProducts.Count}");
        if (externalProducts.Count == 0) return;

        var existingExternalCodes = (await db.products
                .AsNoTracking()
                .Select(p => p.externalCode)
                .ToListAsync(ct))
            .ToHashSet();

        var categoriesById = await db.categories
            .AsNoTracking()
            .ToDictionaryAsync(c => c.id_Category, ct);

        var groupsById = await db.productgroups
            .AsNoTracking()
            .ToDictionaryAsync(g => g.id_ProductGroup, ct);

        var toInsert = new List<product>();

        foreach (var ext in externalProducts)
        {
            if (existingExternalCodes.Contains(ext.Code))
                continue;

            var typeName = ext.Type?.Name?.Trim();
            var canReturn = !string.Equals(typeName, "Paslaugos", StringComparison.OrdinalIgnoreCase);

            var p = new product
            {
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

            var catId = ext.Type?.Id;
            if (catId.HasValue && categoriesById.TryGetValue(catId.Value, out var catEntity))
            {
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
            Console.WriteLine("[ProductSyncWorker] Nothing new to insert.");
            return;
        }

        db.products.AddRange(toInsert);
        await db.SaveChangesAsync(ct);

        Console.WriteLine($"[ProductSyncWorker] Inserted {toInsert.Count} new products.");
    }
}
