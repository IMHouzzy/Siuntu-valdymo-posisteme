// Controllers/CourierShipmentController.cs
// NEW FILE
// Endpoints used exclusively by the COURIER role.
// A courier can:
//   GET  /api/courier/shipments          — list shipments assigned to their company
//   GET  /api/courier/shipments/{id}     — get shipment detail
//   POST /api/courier/shipments/{id}/status — update status (with optional signature)
//
// Status → Order status auto-sync:
//   Shipment "Vežama"    (id 2)  → Order status "Sent"      (id 5)
//   Shipment "Pristatyta"(id 3)  → Order status "Completed" (id 3)

using Bakalauras.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/courier")]
[Authorize]
public class CourierShipmentController : ControllerBase
{
    private readonly AppDbContext        _db;
    private readonly IWebHostEnvironment _env;

    public CourierShipmentController(AppDbContext db, IWebHostEnvironment env)
    {
        _db  = db;
        _env = env;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private int GetRequiredCompanyId()
    {
        var id = User.GetCompanyId();
        if (id <= 0) throw new UnauthorizedAccessException("No active company selected.");
        return id;
    }

    private async Task<bool> IsCourierOrAbove()
    {
        if (User.IsMasterAdmin()) return true;
        var companyId = User.GetCompanyId();
        var userId    = User.GetUserId();
        var role = await _db.company_users.AsNoTracking()
            .Where(cu => cu.fk_Companyid_Company == companyId && cu.fk_Usersid_Users == userId)
            .Select(cu => cu.role)
            .FirstOrDefaultAsync();
        return role is "OWNER" or "ADMIN" or "STAFF" or "COURIER";
    }

    // ── GET /api/courier/shipments ────────────────────────────────────────────

    [HttpGet("shipments")]
    public async Task<IActionResult> GetShipments()
    {
        if (!await IsCourierOrAbove()) return Forbid();

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
                s.providerParcelNumber,
                orderId = s.fk_Ordersid_Orders,
                courierName  = s.fk_Courierid_CourierNavigation == null ? null : s.fk_Courierid_CourierNavigation.name,
                courierType  = s.fk_Courierid_CourierNavigation == null ? null : s.fk_Courierid_CourierNavigation.type,
                // client name from order
                clientName    = s.fk_Ordersid_OrdersNavigation.fk_Clientid_UsersNavigation.name,
                clientSurname = s.fk_Ordersid_OrdersNavigation.fk_Clientid_UsersNavigation.surname,
                clientPhone   = s.fk_Ordersid_OrdersNavigation.fk_Clientid_UsersNavigation.phoneNumber,
                deliveryAddress = _db.client_companies
                    .Where(cc => cc.fk_Companyid_Company == companyId
                              && cc.fk_Clientid_Users == s.fk_Ordersid_OrdersNavigation.fk_Clientid_Users)
                    .Select(cc => cc.deliveryAddress + ", " + cc.city)
                    .FirstOrDefault(),
                latestStatus = s.shipment_statuses
                    .OrderByDescending(ss => ss.date)
                    .Select(ss => new
                    {
                        ss.id_ShipmentStatus,
                        ss.date,
                        typeId   = ss.fk_ShipmentStatusTypeid_ShipmentStatusType,
                        typeName = ss.fk_ShipmentStatusTypeid_ShipmentStatusTypeNavigation.name
                    })
                    .FirstOrDefault(),
                packages = s.packages
                    .OrderBy(p => p.id_Package)
                    .Select(p => new { p.id_Package, p.trackingNumber, p.weight })
                    .ToList()
            })
            .OrderByDescending(s => s.id_Shipment)
            .ToListAsync();

        return Ok(shipments);
    }

    // ── GET /api/courier/shipments/{id} ───────────────────────────────────────

    [HttpGet("shipments/{id:int}")]
    public async Task<IActionResult> GetShipment(int id)
    {
        if (!await IsCourierOrAbove()) return Forbid();

        int companyId;
        try { companyId = GetRequiredCompanyId(); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }

        var s = await _db.shipments
            .AsNoTracking()
            .Where(x => x.id_Shipment == id && x.fk_Companyid_Company == companyId)
            .Select(x => new
            {
                x.id_Shipment,
                x.trackingNumber,
                x.shippingDate,
                x.estimatedDeliveryDate,
                x.providerParcelNumber,
                x.providerLockerId,
                x.DeliveryLat,
                x.DeliveryLng,
                orderId      = x.fk_Ordersid_Orders,
                orderStatus  = x.fk_Ordersid_OrdersNavigation.status,
                courierName  = x.fk_Courierid_CourierNavigation == null ? null : x.fk_Courierid_CourierNavigation.name,
                courierType  = x.fk_Courierid_CourierNavigation == null ? null : x.fk_Courierid_CourierNavigation.type,
                client = new
                {
                    name    = x.fk_Ordersid_OrdersNavigation.fk_Clientid_UsersNavigation.name,
                    surname = x.fk_Ordersid_OrdersNavigation.fk_Clientid_UsersNavigation.surname,
                    phone   = x.fk_Ordersid_OrdersNavigation.fk_Clientid_UsersNavigation.phoneNumber,
                    email   = x.fk_Ordersid_OrdersNavigation.fk_Clientid_UsersNavigation.email,
                },
                clientCompany = _db.client_companies
                    .Where(cc => cc.fk_Companyid_Company == companyId
                              && cc.fk_Clientid_Users == x.fk_Ordersid_OrdersNavigation.fk_Clientid_Users)
                    .Select(cc => new { cc.deliveryAddress, cc.city, cc.country })
                    .FirstOrDefault(),
                statuses = x.shipment_statuses
                    .OrderByDescending(ss => ss.date)
                    .Select(ss => new
                    {
                        ss.id_ShipmentStatus,
                        ss.date,
                        typeId   = ss.fk_ShipmentStatusTypeid_ShipmentStatusType,
                        typeName = ss.fk_ShipmentStatusTypeid_ShipmentStatusTypeNavigation.name
                    })
                    .ToList(),
                packages = x.packages
                    .OrderBy(p => p.id_Package)
                    .Select(p => new { p.id_Package, p.trackingNumber, p.weight, p.labelFile })
                    .ToList()
            })
            .FirstOrDefaultAsync();

        if (s == null) return NotFound();
        return Ok(s);
    }

    // ── POST /api/courier/shipments/{id}/status ───────────────────────────────
    // Body: { statusTypeId: int, signatureDataUrl?: string }
    //
    // Status mapping (Lithuanian names from shipment_status_type table):
    //   id 2 "Vežama"     → order status 5 "Sent"
    //   id 3 "Pristatyta" → order status 3 "Completed"  (signature required)

    [HttpPost("shipments/{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] CourierStatusUpdateDto dto)
    {
        if (!await IsCourierOrAbove()) return Forbid();

        int companyId;
        try { companyId = GetRequiredCompanyId(); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }

        var shipment = await _db.shipments
            .Include(s => s.fk_Ordersid_OrdersNavigation)
            .FirstOrDefaultAsync(s => s.id_Shipment == id && s.fk_Companyid_Company == companyId);

        if (shipment == null) return NotFound("Siunta nerasta.");

        // Validate status type exists
        var statusType = await _db.shipment_status_types
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.id_ShipmentStatusType == dto.StatusTypeId);
        if (statusType == null) return BadRequest("Neteisinga būsena.");

        // "Pristatyta" (id=3) requires a signature
        if (dto.StatusTypeId == 3 && string.IsNullOrWhiteSpace(dto.SignatureDataUrl))
            return BadRequest("Pristatymo parašas privalomas.");

        await using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            // Add shipment status entry
            _db.shipment_statuses.Add(new shipment_status
            {
                fk_Shipmentid_Shipment = id,
                fk_ShipmentStatusTypeid_ShipmentStatusType = dto.StatusTypeId,
                date = DateTime.UtcNow
            });

            // Save signature if provided
            if (!string.IsNullOrWhiteSpace(dto.SignatureDataUrl))
            {
                var signatureUrl = await SaveSignatureAsync(dto.SignatureDataUrl, id);
                // Store on the shipment as a note (using providerShipmentId as fallback storage
                // — in production you'd add a dedicated signatureFile column)
                // For now we store it as a file and could extend the model later.
                // We'll just save the file; the URL is returned in the response.
            }

            // ── Auto-sync order status ────────────────────────────────────────
            // "Vežama" (id=2)     → Order "Sent"      (id=5)
            // "Pristatyta" (id=3) → Order "Completed" (id=3)
            var order = shipment.fk_Ordersid_OrdersNavigation;
            if (order != null)
            {
                int? newOrderStatus = dto.StatusTypeId switch
                {
                    2 => 5,  // Vežama → Sent
                    3 => 3,  // Pristatyta → Completed
                    _ => null
                };

                if (newOrderStatus.HasValue)
                    order.status = newOrderStatus.Value;
            }

            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            string? sigUrl = null;
            if (!string.IsNullOrWhiteSpace(dto.SignatureDataUrl))
                sigUrl = await SaveSignatureAsync(dto.SignatureDataUrl, id);

            return Ok(new
            {
                shipmentId   = id,
                newStatusId  = dto.StatusTypeId,
                newStatusName = statusType.name,
                signatureUrl = sigUrl
            });
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return StatusCode(500, ex.InnerException?.Message ?? ex.Message);
        }
    }

    // ── GET /api/courier/status-types ─────────────────────────────────────────

    [HttpGet("status-types")]
    public async Task<IActionResult> GetStatusTypes()
    {
        if (!await IsCourierOrAbove()) return Forbid();

        var types = await _db.shipment_status_types
            .AsNoTracking()
            .Select(t => new { t.id_ShipmentStatusType, t.name })
            .ToListAsync();

        return Ok(types);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task<string?> SaveSignatureAsync(string dataUrl, int shipmentId)
    {
        try
        {
            // data:image/png;base64,<data>
            var comma = dataUrl.IndexOf(',');
            if (comma < 0) return null;
            var base64 = dataUrl[(comma + 1)..];
            var bytes  = Convert.FromBase64String(base64);

            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var dir = Path.Combine(webRoot, "signatures", shipmentId.ToString());
            Directory.CreateDirectory(dir);

            var fileName = $"signature_{DateTime.UtcNow:yyyyMMddHHmmss}.png";
            var fullPath = Path.Combine(dir, fileName);
            await System.IO.File.WriteAllBytesAsync(fullPath, bytes);

            return $"/signatures/{shipmentId}/{fileName}";
        }
        catch
        {
            return null;
        }
    }
}

