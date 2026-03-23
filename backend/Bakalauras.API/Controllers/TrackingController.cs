// Controllers/TrackingController.cs
// Public endpoint — no [Authorize] so clients can track without logging in.
// Also works for logged-in clients hitting /api/tracking/{number}

using Bakalauras.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/tracking")]
public class TrackingController : ControllerBase
{
    private readonly AppDbContext _db;

    public TrackingController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/tracking/{trackingNumber}
    // Returns:
    //   { type: "dpd",    dpdUrl: "https://..." }                    — redirect client to DPD
    //   { type: "custom", shipment: { ... }, statuses: [...] }       — show internal timeline
    //   404 if not found
    [HttpGet("{trackingNumber}")]
    public async Task<IActionResult> Track(string trackingNumber)
    {
        if (string.IsNullOrWhiteSpace(trackingNumber))
            return BadRequest("Tracking number is required.");

        // Look up the package by its tracking number
        var package = await _db.packages
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.trackingNumber == trackingNumber);

        if (package == null)
            return NotFound(new { message = "Siunta su šiuo numeriu nerasta." });

        // Load the parent shipment with courier info
        var shipment = await _db.shipments
            .AsNoTracking()
            .Where(s => s.id_Shipment == package.fk_Shipmentid_Shipment)
            .Select(s => new
            {
                s.id_Shipment,
                s.trackingNumber,
                s.shippingDate,
                s.estimatedDeliveryDate,
                s.DeliveryLat,
                s.DeliveryLng,
                s.providerParcelNumber,
                s.providerLockerId,
                s.fk_Ordersid_Orders,
                courier = s.fk_Courierid_CourierNavigation == null ? null : new
                {
                    s.fk_Courierid_CourierNavigation.name,
                    s.fk_Courierid_CourierNavigation.type,
                },
                allPackages = s.packages.Select(p => new
                {
                    p.id_Package,
                    p.trackingNumber,
                    p.weight,
                    p.creationDate,
                    p.labelFile,
                }).ToList()
            })
            .FirstOrDefaultAsync();

        if (shipment == null)
            return NotFound(new { message = "Siunta nerasta." });

        // Determine if this is a provider (DPD/LP Express) shipment
        var courierType = shipment.courier?.type ?? "CUSTOM";
        var isProvider = CourierProviderFactory.GetIntegrationKey(courierType) != null;

        if (isProvider)
        {
            // Use the package's own tracking number for DPD redirect
            // (each package has its own DPD parcel number)
            var dpdParcel = trackingNumber;
            var dpdUrl = $"https://www.dpdgroup.com/lt/mydpd/my-parcels/search?lang=lt&parcelNumber={Uri.EscapeDataString(dpdParcel)}";

            return Ok(new
            {
                type = "dpd",
                dpdUrl,
                courierName = shipment.courier?.name,
                trackingNumber
            });
        }

        // Custom courier — return full status history + order info
        var statuses = await _db.shipment_statuses
            .AsNoTracking()
            .Where(ss => ss.fk_Shipmentid_Shipment == shipment.id_Shipment)
            .OrderByDescending(ss => ss.date)
            .Select(ss => new
            {
                ss.id_ShipmentStatus,
                ss.date,
                typeId = ss.fk_ShipmentStatusTypeid_ShipmentStatusType,
                typeName = ss.fk_ShipmentStatusTypeid_ShipmentStatusTypeNavigation.name
            })
            .ToListAsync();

        // Load order + client delivery address for status messages
        var order = await _db.orders
            .AsNoTracking()
            .Where(o => o.id_Orders == shipment.fk_Ordersid_Orders)
            .Select(o => new
            {
                o.id_Orders,
                o.OrdersDate,
                o.totalAmount,
                o.paymentMethod,
                o.deliveryPrice,
                statusName = o.statusNavigation.name,
                client = new
                {
                    name    = o.fk_Clientid_UsersNavigation.name,
                    surname = o.fk_Clientid_UsersNavigation.surname,
                },
                companyId = o.fk_Companyid_Company
            })
            .FirstOrDefaultAsync();

        // Get delivery address for the status message "Vežama" etc.
        string? deliveryAddress = null;
        if (order != null)
        {
            var cc = await _db.client_companies
                .AsNoTracking()
                .Where(x =>
                    x.fk_Companyid_Company == order.companyId &&
                    x.fk_Clientid_Users    == _db.orders
                        .Where(o2 => o2.id_Orders == shipment.fk_Ordersid_Orders)
                        .Select(o2 => o2.fk_Clientid_Users)
                        .FirstOrDefault())
                .Select(x => new { x.deliveryAddress, x.city })
                .FirstOrDefaultAsync();

            deliveryAddress = string.Join(", ",
                new[] { cc?.deliveryAddress, cc?.city }
                .Where(s => !string.IsNullOrWhiteSpace(s)));
        }

        return Ok(new
        {
            type = "custom",
            trackingNumber,
            courierName = shipment.courier?.name ?? "Įmonės kurjeris",
            shipment = new
            {
                shipment.id_Shipment,
                shipment.shippingDate,
                shipment.estimatedDeliveryDate,
                shipment.DeliveryLat,
                shipment.DeliveryLng,
                shipment.providerLockerId,
            },
            packages = shipment.allPackages,
            statuses,
            deliveryAddress,
            order
        });
    }
}