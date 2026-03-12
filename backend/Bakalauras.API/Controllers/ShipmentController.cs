// ── Controllers/ShipmentController.cs ───────────────────────────────────────

using Bakalauras.API.Models;
using Bakalauras.API.Dtos;
using Bakalauras.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/shipments")]
[Authorize]
public class ShipmentController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public ShipmentController(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private int GetRequiredCompanyId()
    {
        var companyId = User.GetCompanyId();
        if (companyId <= 0)
            throw new UnauthorizedAccessException("No active company selected.");
        return companyId;
    }

    // ── GET /api/shipments/couriers ───────────────────────────────────────────

    [HttpGet("couriers")]
    public async Task<IActionResult> GetCouriers()
    {
        var couriers = await _db.couriers
            .AsNoTracking()
            .OrderBy(c => c.name)
            .Select(c => new
            {
                c.id_Courier,
                c.name,
                c.contactPhone,
                c.deliveryTermDays,
                c.deliveryPrice
            })
            .ToListAsync();

        return Ok(couriers);
    }

    // ── GET /api/shipments/order-for-shipment/{orderId} ───────────────────────

    [HttpGet("order-for-shipment/{orderId:int}")]
    public async Task<IActionResult> GetOrderForShipment(int orderId)
    {
        int companyId;
        try { companyId = GetRequiredCompanyId(); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }

        var order = await _db.orders
            .AsNoTracking()
            .Where(o => o.id_Orders == orderId && o.fk_Companyid_Company == companyId)
            .Select(o => new
            {
                o.id_Orders,
                o.OrdersDate,
                o.totalAmount,
                o.paymentMethod,
                o.deliveryPrice,
                o.status,
                statusName        = o.statusNavigation.name,
                o.externalDocumentId,
                clientId          = o.fk_Clientid_Users,
                clientName        = o.fk_Clientid_UsersNavigation.name,
                clientSurname     = o.fk_Clientid_UsersNavigation.surname,
                clientEmail       = o.fk_Clientid_UsersNavigation.email,
                clientPhoneNumber = o.fk_Clientid_UsersNavigation.phoneNumber,
                items = o.ordersproducts.Select(op => new
                {
                    op.id_OrdersProduct,
                    op.quantity,
                    op.unitPrice,
                    op.vatValue,
                    productId           = op.fk_Productid_Product,
                    productName         = op.fk_Productid_ProductNavigation.name,
                    productUnit         = op.fk_Productid_ProductNavigation.unit,
                    productExternalCode = op.fk_Productid_ProductNavigation.externalCode,
                    productImages = op.fk_Productid_ProductNavigation.product_images
                        .OrderBy(pi => pi.sortOrder)
                        .Select(pi => new { pi.url, pi.isPrimary })
                        .ToList()
                }).ToList()
            })
            .FirstOrDefaultAsync();

        if (order == null)
            return NotFound("Order not found or does not belong to your company.");

        var cc = await _db.client_companies
            .AsNoTracking()
            .Where(x => x.fk_Companyid_Company == companyId && x.fk_Clientid_Users == order.clientId)
            .Select(x => new { x.deliveryAddress, x.city, x.country, x.vat, x.bankCode, x.externalClientId })
            .FirstOrDefaultAsync();

        var existingShipment = await _db.shipments
            .AsNoTracking()
            .Where(s => s.fk_Ordersid_Orders == orderId)
            .Select(s => new { s.id_Shipment, s.trackingNumber })
            .FirstOrDefaultAsync();

        var result = new
        {
            order.id_Orders,
            order.OrdersDate,
            order.totalAmount,
            order.paymentMethod,
            order.deliveryPrice,
            order.status,
            order.statusName,
            order.externalDocumentId,
            client = new
            {
                id          = order.clientId,
                name        = order.clientName,
                surname     = order.clientSurname,
                email       = order.clientEmail,
                phoneNumber = order.clientPhoneNumber,
            },
            clientCompany = cc == null ? null : (object)new
            {
                cc.deliveryAddress,
                cc.city,
                cc.country,
                cc.vat,
                cc.bankCode,
                cc.externalClientId
            },
            items = order.items.Select(op => new
            {
                op.id_OrdersProduct,
                op.quantity,
                op.unitPrice,
                op.vatValue,
                product = new
                {
                    id           = op.productId,
                    name         = op.productName,
                    unit         = op.productUnit,
                    externalCode = op.productExternalCode,
                    images       = op.productImages
                }
            }).ToList(),
            existingShipment
        };

        return Ok(result);
    }

    // ── GET /api/shipments/all ────────────────────────────────────────────────

    [HttpGet("all")]
    public async Task<IActionResult> GetAllShipments()
    {
        int companyId;
        try { companyId = GetRequiredCompanyId(); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }

        var shipments = await _db.shipments
            .AsNoTracking()
            .Where(s => s.fk_Companyid_Company == companyId)
            .Select(s => new
            {
                s.id_Shipment,
                s.trackingNumber,
                s.shippingDate,
                s.estimatedDeliveryDate,
                s.DeliveryLat,
                s.DeliveryLng,
                courierId    = s.fk_Courierid_Courier,
                courierName  = s.fk_Courierid_CourierNavigation == null ? null : s.fk_Courierid_CourierNavigation.name,
                courierPrice = s.fk_Courierid_CourierNavigation == null ? (double?)null : s.fk_Courierid_CourierNavigation.deliveryPrice,
                orderId      = s.fk_Ordersid_Orders,
            })
            .OrderByDescending(s => s.id_Shipment)
            .ToListAsync();

        if (!shipments.Any())
            return Ok(new List<object>());

        var shipmentIds = shipments.Select(s => s.id_Shipment).ToList();

        var allStatuses = await _db.shipment_statuses
            .AsNoTracking()
            .Where(ss => shipmentIds.Contains(ss.fk_Shipmentid_Shipment))
            .Select(ss => new
            {
                ss.fk_Shipmentid_Shipment,
                ss.date,
                typeName = ss.fk_ShipmentStatusTypeid_ShipmentStatusTypeNavigation.name
            })
            .ToListAsync();

        var latestByShipment = allStatuses
            .GroupBy(ss => ss.fk_Shipmentid_Shipment)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(ss => ss.date).First());

        var result = shipments.Select(s => new
        {
            s.id_Shipment,
            s.trackingNumber,
            s.shippingDate,
            s.estimatedDeliveryDate,
            s.DeliveryLat,
            s.DeliveryLng,
            courier = s.courierId == null ? null : (object)new
            {
                id_Courier    = s.courierId,
                name          = s.courierName,
                deliveryPrice = s.courierPrice,
            },
            s.orderId,
            latestStatus = latestByShipment.TryGetValue(s.id_Shipment, out var ls)
                ? new { ls.date, ls.typeName } : null
        });

        return Ok(result);
    }

    // ── GET /api/shipments/{id} ───────────────────────────────────────────────

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetShipment(int id)
    {
        int companyId;
        try { companyId = GetRequiredCompanyId(); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }

        var shipment = await _db.shipments
            .AsNoTracking()
            .Where(s => s.id_Shipment == id && s.fk_Companyid_Company == companyId)
            .Select(s => new
            {
                s.id_Shipment,
                s.trackingNumber,
                s.shippingDate,
                s.estimatedDeliveryDate,
                s.DeliveryLat,
                s.DeliveryLng,
                courierId = s.fk_Courierid_Courier,
                orderId   = s.fk_Ordersid_Orders,
                statuses  = s.shipment_statuses
                    .OrderByDescending(ss => ss.date)
                    .Select(ss => new
                    {
                        ss.id_ShipmentStatus,
                        ss.date,
                        typeId   = ss.fk_ShipmentStatusTypeid_ShipmentStatusType,
                        typeName = ss.fk_ShipmentStatusTypeid_ShipmentStatusTypeNavigation.name
                    })
                    .ToList()
            })
            .FirstOrDefaultAsync();

        if (shipment == null)
            return NotFound();

        return Ok(shipment);
    }

    // ── GET /api/shipments/{id}/packages ─────────────────────────────────────

    [HttpGet("{id:int}/packages")]
    public async Task<IActionResult> GetPackages(int id)
    {
        int companyId;
        try { companyId = GetRequiredCompanyId(); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }

        // Verify the shipment belongs to this company
        var shipmentExists = await _db.shipments
            .AnyAsync(s => s.id_Shipment == id && s.fk_Companyid_Company == companyId);

        if (!shipmentExists)
            return NotFound();

        var packages = await _db.packages
            .AsNoTracking()
            .Where(p => p.fk_Shipmentid_Shipment == id)
            .OrderBy(p => p.id_Package)
            .Select(p => new
            {
                p.id_Package,
                p.creationDate,
                p.labelFile,
                p.weight,
                p.fk_Shipmentid_Shipment
            })
            .ToListAsync();

        return Ok(packages);
    }

    // ── POST /api/shipments/create ────────────────────────────────────────────
    // Creates the shipment, generates N packages, and generates a label PDF per package.

    [HttpPost("create")]
    public async Task<IActionResult> CreateShipment([FromBody] CreateShipmentDto dto)
    {
        int companyId;
        try { companyId = GetRequiredCompanyId(); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }

        if (dto.PackageCount < 1)
            return BadRequest("PackageCount must be at least 1.");

        // ── Validate order ────────────────────────────────────────────────────
        var order = await _db.orders
            .AsNoTracking()
            .Where(o => o.id_Orders == dto.OrderId && o.fk_Companyid_Company == companyId)
            .Select(o => new
            {
                o.id_Orders,
                clientId      = o.fk_Clientid_Users,
                clientName    = o.fk_Clientid_UsersNavigation.name,
                clientSurname = o.fk_Clientid_UsersNavigation.surname,
                clientPhone   = o.fk_Clientid_UsersNavigation.phoneNumber,
            })
            .FirstOrDefaultAsync();

        if (order == null)
            return NotFound("Order not found or does not belong to your company.");

        var duplicate = await _db.shipments.AnyAsync(s => s.fk_Ordersid_Orders == dto.OrderId);
        if (duplicate)
            return Conflict("A shipment already exists for this order.");

        // ── Validate courier ──────────────────────────────────────────────────
        courier? courier = null;
        if (dto.CourierId.HasValue)
        {
            courier = await _db.couriers.FindAsync(dto.CourierId.Value);
            if (courier == null)
                return BadRequest("Courier not found.");
        }

        // ── Fetch client delivery address ─────────────────────────────────────
        var cc = await _db.client_companies
            .AsNoTracking()
            .Where(x => x.fk_Companyid_Company == companyId && x.fk_Clientid_Users == order.clientId)
            .Select(x => new { x.deliveryAddress, x.city, x.country, x.vat })
            .FirstOrDefaultAsync();

        // ── Fetch company (sender) info ───────────────────────────────────────
        var company = await _db.companies
            .AsNoTracking()
            .Where(c => c.id_Company == companyId)
            .Select(c => new { c.name, c.shippingAddress, c.address, c.phoneNumber })
            .FirstOrDefaultAsync();

        // ── Auto-generate unique tracking number ──────────────────────────────
        string trackingNumber;
        var rng = new Random();
        do
        {
            var ts     = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var suffix = rng.Next(100, 999);
            trackingNumber = $"SHP-{companyId}-{dto.OrderId}-{ts}{suffix}";
        }
        while (await _db.shipments.AnyAsync(s => s.trackingNumber == trackingNumber));

        // ── Prepare label strings ─────────────────────────────────────────────
        var recipientName    = $"{order.clientName} {order.clientSurname}".Trim();
        var recipientAddress = string.Join(", ",
            new[] { cc?.deliveryAddress, cc?.city, cc?.country }
            .Where(s => !string.IsNullOrWhiteSpace(s)));
        var recipientPhone = order.clientPhone ?? "";

        var senderName    = company?.name ?? "—";
        var senderAddress = company?.shippingAddress ?? company?.address ?? "—";
        var senderPhone   = company?.phoneNumber ?? "";

        var courierName       = courier?.name ?? "—";
        var shippingDateStr   = dto.ShippingDate?.ToString("yyyy-MM-dd") ?? "—";
        var estimatedDateStr  = dto.EstimatedDeliveryDate?.ToString("yyyy-MM-dd") ?? "—";

        // ── Persist ───────────────────────────────────────────────────────────
        await using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            var shipment = new shipment
            {
                trackingNumber        = trackingNumber,
                shippingDate          = dto.ShippingDate,
                estimatedDeliveryDate = dto.EstimatedDeliveryDate,
                fk_Courierid_Courier  = dto.CourierId,
                fk_Ordersid_Orders    = dto.OrderId,
                fk_Companyid_Company  = companyId,
                DeliveryLat           = dto.DeliveryLat,
                DeliveryLng           = dto.DeliveryLng,
            };

            _db.shipments.Add(shipment);
            await _db.SaveChangesAsync();   // get shipment.id_Shipment

            // ── Initial status "Sukurta" ──────────────────────────────────────
            _db.shipment_statuses.Add(new shipment_status
            {
                fk_Shipmentid_Shipment                     = shipment.id_Shipment,
                fk_ShipmentStatusTypeid_ShipmentStatusType = 1,
                date                                       = DateTime.UtcNow
            });

            // ── Create packages + generate labels ─────────────────────────────
            var webRoot = _env.WebRootPath
                ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

            var createdPackages = new List<object>();

            for (int i = 1; i <= dto.PackageCount; i++)
            {
                string labelUrl = LabelGenerator.Generate(
                    webRootPath       : webRoot,
                    shipmentId        : shipment.id_Shipment,
                    packageIndex      : i,
                    totalPackages     : dto.PackageCount,
                    trackingNumber    : trackingNumber,
                    senderName        : senderName,
                    senderAddress     : senderAddress,
                    senderPhone       : senderPhone,
                    recipientName     : recipientName,
                    recipientAddress  : recipientAddress,
                    recipientPhone    : recipientPhone,
                    courierName       : courierName,
                    shippingDate      : shippingDateStr,
                    estimatedDelivery : estimatedDateStr
                );

                var pkg = new package
                {
                    fk_Shipmentid_Shipment = shipment.id_Shipment,
                    labelFile              = labelUrl,
                    creationDate           = DateTime.UtcNow,
                };

                _db.packages.Add(pkg);
                await _db.SaveChangesAsync();

                createdPackages.Add(new
                {
                    pkg.id_Package,
                    pkg.labelFile,
                    packageIndex = i,
                });
            }

            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            return Ok(new
            {
                shipmentId     = shipment.id_Shipment,
                trackingNumber,
                packageCount   = dto.PackageCount,
                packages       = createdPackages,
            });
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return StatusCode(500, ex.InnerException?.Message ?? ex.Message);
        }
    }

    // ── POST /api/shipments/{id}/status ──────────────────────────────────────

    [HttpPost("{id:int}/status")]
    public async Task<IActionResult> AddShipmentStatus(int id, [FromBody] AddShipmentStatusDto dto)
    {
        int companyId;
        try { companyId = GetRequiredCompanyId(); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }

        var shipment = await _db.shipments
            .FirstOrDefaultAsync(s => s.id_Shipment == id && s.fk_Companyid_Company == companyId);

        if (shipment == null)
            return NotFound();

        var typeExists = await _db.shipment_status_types
            .AnyAsync(t => t.id_ShipmentStatusType == dto.StatusTypeId);

        if (!typeExists)
            return BadRequest("Invalid status type.");

        _db.shipment_statuses.Add(new shipment_status
        {
            fk_Shipmentid_Shipment                     = id,
            fk_ShipmentStatusTypeid_ShipmentStatusType = dto.StatusTypeId,
            date                                       = dto.Date ?? DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        return Ok();
    }

    // ── GET /api/shipments/status-types ──────────────────────────────────────

    [HttpGet("status-types")]
    public async Task<IActionResult> GetStatusTypes()
    {
        var types = await _db.shipment_status_types
            .AsNoTracking()
            .Select(t => new { t.id_ShipmentStatusType, t.name })
            .ToListAsync();

        return Ok(types);
    }

    // ── DELETE /api/shipments/{id} ────────────────────────────────────────────

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteShipment(int id)
    {
        int companyId;
        try { companyId = GetRequiredCompanyId(); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }

        var shipment = await _db.shipments
            .FirstOrDefaultAsync(s => s.id_Shipment == id && s.fk_Companyid_Company == companyId);

        if (shipment == null)
            return NotFound();

        _db.shipments.Remove(shipment);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}