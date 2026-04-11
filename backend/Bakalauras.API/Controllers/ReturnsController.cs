// Controllers/ReturnsController.cs
// Updated logic:
//   1. GET /api/returns/all  — hides status "Atmesta" (6) if evaluation not yet submitted
//      (i.e. no item has been evaluated yet = fk_Adminid_Users is null)
//   2. GET /api/returns/{id} — same visibility rule
//   3. PUT /api/returns/{id}/evaluate/open  — called when worker OPENS the form → sets status to 2 "Vertinamas"
//   4. PUT /api/returns/{id}/evaluate  — on submit:
//        • auto-derives status from item evaluations (no manual status picker needed)
//        • all declined  → 6 "Atmesta"
//        • any approved  → 5 "Patvirtinta"
//        • then creates a return shipment + generates labels (custom or DPD)
//        • if labels created → 7 "Etiketės paruoštos"

using Bakalauras.API.Models;
using Bakalauras.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/returns")]
[Authorize]
public class ReturnsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;
    private readonly CourierProviderFactory _providerFactory;
    private readonly INotificationService _notif;
    public ReturnsController(
        AppDbContext db,
        IWebHostEnvironment env,
        CourierProviderFactory providerFactory,
        INotificationService notif)
    {
        _db = db;
        _env = env;
        _providerFactory = providerFactory;
        _notif = notif;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private int GetRequiredCompanyId()
    {
        var id = User.GetCompanyId();
        if (id <= 0) throw new UnauthorizedAccessException("No active company selected.");
        return id;
    }

    private async Task<bool> IsStaffAsync(int companyId)
    {
        if (User.IsMasterAdmin()) return true;
        var userId = User.GetUserId();
        var role = await _db.company_users
            .AsNoTracking()
            .Where(cu => cu.fk_Companyid_Company == companyId && cu.fk_Usersid_Users == userId)
            .Select(cu => cu.role)
            .FirstOrDefaultAsync();
        return role is "OWNER" or "ADMIN" or "STAFF";
    }

    // ── GET /api/returns/all ─────────────────────────────────────────────────
    // Rule: if evaluation has NOT been submitted yet (fk_Adminid_Users is null),
    // never expose status 6 ("Atmesta") to the list — it stays as "Sukurtas" visually.
    [HttpGet("all")]
    public async Task<IActionResult> ListAll()
    {
        int companyId;
        try { companyId = GetRequiredCompanyId(); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }

        if (!await IsStaffAsync(companyId))
            return Forbid("Only company staff can view returns.");

        var returns = await _db.product_returns
            .AsNoTracking()
            .Where(r => r.fk_Companyid_Company == companyId)
            .OrderByDescending(r => r.id_Returns)
            .Select(r => new
            {
                r.id_Returns,
                r.date,
                // If no admin has touched it yet, clamp to status 1 so "Atmesta" never leaks
                displayStatusId = r.fk_Adminid_Users == null
                    ? 1
                    : r.fk_ReturnStatusTypeid_ReturnStatusType,
                r.fk_ReturnStatusTypeid_ReturnStatusType,
                statusName = r.fk_Adminid_Users == null
                    ? "Sukurtas"
                    : r.fk_ReturnStatusTypeid_ReturnStatusTypeNavigation.name,
                r.returnMethod,
                r.clientNote,
                r.employeeNote,
                orderId = r.fk_ordersid_orders,
                itemCount = r.return_items.Count,
                totalAmount = r.return_items.Sum(ri => ri.returnSubTotal),
                clientName = r.fk_Clientid_Users > 0
                    ? r.fk_Clientid_UsersNavigation.name + " " + r.fk_Clientid_UsersNavigation.surname
                    : null,
                clientEmail = r.fk_Clientid_Users > 0
                    ? r.fk_Clientid_UsersNavigation.email
                    : null,
                evaluationSubmitted = r.fk_Adminid_Users != null,
            })
            .ToListAsync();

        return Ok(returns);
    }

    // ── GET /api/returns/{id} ────────────────────────────────────────────────
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetReturn(int id)
    {
        int companyId;
        try { companyId = GetRequiredCompanyId(); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }

        if (!await IsStaffAsync(companyId))
            return Forbid();

        var ret = await _db.product_returns
            .AsNoTracking()
            .Where(r => r.id_Returns == id && r.fk_Companyid_Company == companyId)
            .Select(r => new
            {
                r.id_Returns,
                r.date,
                r.fk_ReturnStatusTypeid_ReturnStatusType,
                // Clamp to "Sukurtas" if evaluation not yet submitted
                displayStatusId = r.fk_Adminid_Users == null
                    ? 1
                    : r.fk_ReturnStatusTypeid_ReturnStatusType,
                statusName = r.fk_Adminid_Users == null
                    ? "Sukurtas"
                    : r.fk_ReturnStatusTypeid_ReturnStatusTypeNavigation.name,
                evaluationSubmitted = r.fk_Adminid_Users != null,
                r.returnMethod,
                r.clientNote,
                r.employeeNote,
                r.returnStreet,
                r.returnCity,
                r.returnPostalCode,
                r.returnCountry,
                r.returnCourierId,
                r.fk_Courierid_Courier,
                r.returnLockerId,
                r.returnLockerName,
                r.returnLockerAddress,
                r.returnLat,
                r.returnLng,
                r.fk_Adminid_Users,
                orderId = r.fk_ordersid_orders,
                clientName = r.fk_Clientid_UsersNavigation.name + " " + r.fk_Clientid_UsersNavigation.surname,
                clientEmail = r.fk_Clientid_UsersNavigation.email,
                clientPhone = r.fk_Clientid_UsersNavigation.phoneNumber,
                clientId = r.fk_Clientid_Users,
                items = r.return_items.Select(ri => new
                {
                    ri.id_ReturnItem,
                    ri.quantity,
                    ri.returnSubTotal,
                    ri.evaluationComment,
                    ri.evaluation,
                    ri.evaluationDate,
                    ri.imageUrls,
                    reason = ri.reasonId != null && ri.reasonNavigation != null
                                ? ri.reasonNavigation.name
                                : ri.reason,
                    product = new
                    {
                        id = ri.fk_OrdersProductid_OrdersProductNavigation.fk_Productid_Product,
                        name = ri.fk_OrdersProductid_OrdersProductNavigation.fk_Productid_ProductNavigation.name,
                        unit = ri.fk_OrdersProductid_OrdersProductNavigation.fk_Productid_ProductNavigation.unit,
                        imageUrl = ri.fk_OrdersProductid_OrdersProductNavigation
                                      .fk_Productid_ProductNavigation.product_images
                                      .OrderBy(pi => pi.sortOrder)
                                      .Select(pi => pi.url)
                                      .FirstOrDefault()
                    }
                }).ToList()
            })
            .FirstOrDefaultAsync();

        if (ret == null) return NotFound("Return not found or does not belong to your company.");
        return Ok(ret);
    }

    // ── PUT /api/returns/{id}/evaluate/open ──────────────────────────────────
    // Called as soon as the employee opens the evaluation drawer/form.
    // Sets status to 2 "Vertinamas" if still in "Sukurtas" (1).
    [HttpPut("{id:int}/evaluate/open")]
    public async Task<IActionResult> MarkAsBeingEvaluated(int id)
    {
        int companyId;
        try { companyId = GetRequiredCompanyId(); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }

        if (!await IsStaffAsync(companyId))
            return Forbid();

        var ret = await _db.product_returns
            .FirstOrDefaultAsync(r => r.id_Returns == id && r.fk_Companyid_Company == companyId);
        if (ret == null) return NotFound();

        // Only advance from "Sukurtas" (1) — don't overwrite a later status
        if (ret.fk_ReturnStatusTypeid_ReturnStatusType == 1)
        {
            ret.fk_ReturnStatusTypeid_ReturnStatusType = 2; // Vertinamas
            await _db.SaveChangesAsync();
            await _notif.NotifyReturnStatusAsync(id, 2, companyId); // 2 = Vertinamas
        }

        return Ok(new { statusId = ret.fk_ReturnStatusTypeid_ReturnStatusType });
    }

    // ── PUT /api/returns/{id}/evaluate ───────────────────────────────────────
    // Full evaluation submit:
    //   1. Saves per-item evaluation + comment
    //   2. Auto-derives status:
    //        all items declined  → 6 Atmesta   (no labels)
    //        any item approved   → create return shipment + labels
    //           labels ok        → 7 Etiketės paruoštos
    //           labels fail/none → 5 Patvirtinta
    //   3. Creates return shipment row + packages with labels
    [HttpPut("{id:int}/evaluate")]
    public async Task<IActionResult> Evaluate(int id, [FromBody] EvaluateReturnDto dto)
    {
        int companyId;
        try { companyId = GetRequiredCompanyId(); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }

        if (!await IsStaffAsync(companyId))
            return Forbid("Only company staff can evaluate returns.");

        var ret = await _db.product_returns
            .FirstOrDefaultAsync(r => r.id_Returns == id && r.fk_Companyid_Company == companyId);
        if (ret == null) return NotFound("Return not found.");

        await using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            // ── 1. Save per-item evaluations ──────────────────────────────────
            var itemIds = dto.Items?.Select(i => i.ReturnItemId).ToList() ?? new();
            List<return_item> dbItems = new();
            if (itemIds.Count > 0)
            {
                dbItems = await _db.return_items
                    .Where(ri => ri.fk_Returnsid_Returns == id && itemIds.Contains(ri.id_ReturnItem))
                    .ToListAsync();

                foreach (var itemDto in dto.Items ?? new())
                {
                    var item = dbItems.FirstOrDefault(i => i.id_ReturnItem == itemDto.ReturnItemId);
                    if (item == null) continue;
                    item.evaluation = itemDto.Evaluation;
                    item.evaluationComment = itemDto.EvaluationComment?.Trim();
                    item.evaluationDate = DateOnly.FromDateTime(DateTime.UtcNow);
                }
            }

            // Re-load all items for the return (including any not in dto)
            var allItems = await _db.return_items
                .Where(ri => ri.fk_Returnsid_Returns == id)
                .ToListAsync();

            // ── 2. Auto-derive status ─────────────────────────────────────────
            bool allDeclined = allItems.Count > 0 && allItems.All(i => i.evaluation == false);
            bool anyApproved = allItems.Any(i => i.evaluation == true);

            ret.employeeNote = dto.EmployeeNote?.Trim();
            ret.fk_Adminid_Users = User.GetUserId();

            // ── 3. If any approved → create return shipment + labels ──────────
            bool labelsCreated = false;

            if (anyApproved)
            {
                // Only approved items get packages (one package total for return shipment)
                var approvedItems = allItems.Where(i => i.evaluation == true).ToList();
                int packageCount = approvedItems.Count; // one package per approved return item

                // Gather sender info (the client who is returning = "sender" on return label)
                var clientUser = await _db.users.AsNoTracking()
                    .Where(u => u.id_Users == ret.fk_Clientid_Users)
                    .Select(u => new { u.name, u.surname, u.phoneNumber, u.email })
                    .FirstOrDefaultAsync();

                var cc = await _db.client_companies.AsNoTracking()
                    .Where(x => x.fk_Companyid_Company == companyId && x.fk_Clientid_Users == ret.fk_Clientid_Users)
                    .Select(x => new { x.deliveryAddress, x.city, x.country })
                    .FirstOrDefaultAsync();

                // Recipient = company (they receive the returned goods)
                var company = await _db.companies.AsNoTracking()
                    .Where(c => c.id_Company == companyId)
                    .Select(c => new
                    {
                        c.name,
                        c.phoneNumber,
                        c.returnStreet,
                        c.returnCity,
                        c.returnPostalCode,
                        c.returnCountry,
                        c.shippingStreet,
                        c.shippingCity,
                        c.shippingPostalCode,
                        c.shippingCountry,
                        c.address
                    })
                    .FirstOrDefaultAsync();

                var recipientStreet = company?.returnStreet ?? company?.shippingStreet ?? company?.address ?? "";
                var recipientCity = company?.returnCity ?? company?.shippingCity ?? "";
                var recipientPostalCode = (company?.returnPostalCode ?? company?.shippingPostalCode ?? "").Replace("-", "").Replace(" ", "");
                var recipientCountry = company?.returnCountry ?? company?.shippingCountry ?? "LT";

                var senderName = $"{clientUser?.name} {clientUser?.surname}".Trim();
                var senderPhone = clientUser?.phoneNumber ?? "";
                var senderStreet = ret.returnStreet ?? cc?.deliveryAddress ?? "";
                var senderCity = ret.returnCity ?? cc?.city ?? "";
                var senderPostal = (ret.returnPostalCode ?? "").Replace("-", "").Replace(" ", "");
                var senderCountry = MapCountry(ret.returnCountry ?? cc?.country ?? "LT");

                // Fetch courier
                courier? courier = ret.fk_Courierid_Courier.HasValue
                    ? await _db.couriers.FindAsync(ret.fk_Courierid_Courier.Value)
                    : null;

                var courierType = courier?.type ?? "CUSTOM";
                var integKey = CourierProviderFactory.GetIntegrationKey(courierType);
                bool isProvider = integKey != null;

                var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

                // Determine fk_Ordersid_Orders — required non-null on shipment table.
                // Use the original order linked to this return.
                var orderId = ret.fk_ordersid_orders ?? 0;

                var returnShipment = new shipment
                {
                    trackingNumber = "",
                    shippingDate = DateTime.UtcNow,
                    estimatedDeliveryDate = DateTime.UtcNow.AddDays(courier?.deliveryTermDays ?? 3),
                    fk_Courierid_Courier = ret.fk_Courierid_Courier,
                    fk_Ordersid_Orders = orderId,
                    fk_Returnsid_Returns = id,
                    fk_Companyid_Company = companyId,
                    providerLockerId = ret.returnLockerId,
                    DeliveryLat = ret.returnLat,
                    DeliveryLng = ret.returnLng,
                };
                _db.shipments.Add(returnShipment);
                await _db.SaveChangesAsync();

                // Add initial status
                _db.shipment_statuses.Add(new shipment_status
                {
                    fk_Shipmentid_Shipment = returnShipment.id_Shipment,
                    fk_ShipmentStatusTypeid_ShipmentStatusType = 5,
                    date = DateTime.UtcNow
                });

                var dir = Path.Combine(webRoot, "labels", returnShipment.id_Shipment.ToString());
                Directory.CreateDirectory(dir);

                if (isProvider)
                {
                    // ── DPD / provider path ───────────────────────────────────
                    ICourierProvider provider;
                    try { provider = await _providerFactory.GetProviderAsync(companyId, courierType); }
                    catch (InvalidOperationException ex)
                    {
                        await tx.RollbackAsync();
                        return BadRequest(ex.Message);
                    }

                    var providerReq = new CourierShipmentRequest
                    {
                        SenderName = senderName,
                        SenderPhone = senderPhone,
                        SenderStreet = senderStreet,
                        SenderCity = senderCity,
                        SenderPostalCode = senderPostal,
                        SenderCountry = senderCountry,
                        RecipientName = company?.name ?? "—",
                        RecipientEmail = "",
                        RecipientPhone = company?.phoneNumber ?? "",
                        RecipientStreet = recipientStreet,
                        RecipientCity = recipientCity,
                        RecipientPostalCode = recipientPostalCode,
                        RecipientCountry = recipientCountry,
                        LockerId = ret.returnLockerId,
                        PackageCount = packageCount,
                        PackageWeightKg = 1.0,
                        OrderReference = $"Return-{id}",
                    };

                    var result = await provider.CreateShipmentAsync(providerReq);

                    if (result.ErrorMessage == null)
                    {
                        returnShipment.trackingNumber = result.ProviderShipmentId;
                        returnShipment.providerShipmentId = result.ProviderShipmentId;
                        returnShipment.providerParcelNumber = result.ParcelNumbers.Count > 0
                            ? string.Join(",", result.ParcelNumbers)
                            : result.ProviderShipmentId;

                        for (int i = 0; i < packageCount; i++)
                        {
                            var pkgTracking = i < result.ParcelNumbers.Count
                                ? result.ParcelNumbers[i]
                                : result.ProviderShipmentId;

                            byte[]? labelBytes = result.PerParcelLabelBytes.Count > 0
                                ? (i < result.PerParcelLabelBytes.Count ? result.PerParcelLabelBytes[i] : result.PerParcelLabelBytes.Last())
                                : null;

                            string? labelUrl = null;
                            if (labelBytes != null)
                            {
                                var filePath = Path.Combine(dir, $"label_{i + 1}.pdf");
                                await System.IO.File.WriteAllBytesAsync(filePath, labelBytes);
                                labelUrl = $"/labels/{returnShipment.id_Shipment}/label_{i + 1}.pdf";
                            }

                            _db.packages.Add(new package
                            {
                                fk_Shipmentid_Shipment = returnShipment.id_Shipment,
                                labelFile = labelUrl,
                                creationDate = DateTime.UtcNow,
                                weight = 1.0,
                                trackingNumber = pkgTracking,
                            });
                        }
                        labelsCreated = true;
                    }
                    // If DPD call failed we still proceed — labels just won't be there
                    // Status will be "Patvirtinta" (5) instead of 7
                }
                else
                {
                    // ── Custom courier path — generate QuestPDF labels ────────
                    var rng = new Random();
                    var courierName = courier?.name ?? "—";
                    var recipientAddr = string.Join(", ", new[] { recipientStreet, recipientCity, recipientCountry }.Where(s => !string.IsNullOrWhiteSpace(s)));
                    var senderAddr = string.Join(", ", new[] { senderStreet, senderCity, senderCountry }.Where(s => !string.IsNullOrWhiteSpace(s)));
                    var shippingDateStr = DateTime.UtcNow.ToString("yyyy-MM-dd");
                    var estimatedDeliveryStr = DateTime.UtcNow.AddDays(courier?.deliveryTermDays ?? 3).ToString("yyyy-MM-dd");

                    string? firstTracking = null;
                    for (int i = 0; i < packageCount; i++)
                    {
                        string pkgTracking;
                        do
                        {
                            var ts = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                            var suffix = rng.Next(1000, 9999);
                            pkgTracking = $"RET-{companyId}-{id}-{ts}-{suffix}";
                        }
                        while (await _db.packages.AnyAsync(p => p.trackingNumber == pkgTracking));

                        if (firstTracking == null) firstTracking = pkgTracking;

                        string labelUrl = LabelGenerator.Generate(
                            webRootPath: webRoot,
                            shipmentId: returnShipment.id_Shipment,
                            packageIndex: i + 1,
                            totalPackages: packageCount,
                            trackingNumber: pkgTracking,
                            senderName: senderName,
                            senderAddress: senderAddr,
                            senderPhone: senderPhone,
                            recipientName: company?.name ?? "—",
                            recipientAddress: recipientAddr,
                            recipientPhone: company?.phoneNumber ?? "",
                            courierName: courierName,
                            shippingDate: shippingDateStr,
                            estimatedDelivery: estimatedDeliveryStr
                        );

                        _db.packages.Add(new package
                        {
                            fk_Shipmentid_Shipment = returnShipment.id_Shipment,
                            labelFile = labelUrl,
                            creationDate = DateTime.UtcNow,
                            weight = 1.0,
                            trackingNumber = pkgTracking,
                        });
                    }

                    returnShipment.trackingNumber = firstTracking ?? $"RET-{id}";
                    labelsCreated = true;
                }

                await _db.SaveChangesAsync();
            }

            // ── 4. Set final status ───────────────────────────────────────────
            int finalStatus;
            if (allDeclined)
                finalStatus = 6;                          // Atmesta
            else if (labelsCreated)
                finalStatus = 7;                          // Etiketės paruoštos
            else
                finalStatus = 5;                          // Patvirtinta (labels pending / failed)

            ret.fk_ReturnStatusTypeid_ReturnStatusType = finalStatus;

            await _db.SaveChangesAsync();
            await tx.CommitAsync();
            await _notif.NotifyReturnStatusAsync(id, finalStatus, companyId);
            return Ok(new
            {
                returnId = id,
                statusId = finalStatus,
                labelsCreated,
            });
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return StatusCode(500, ex.InnerException?.Message ?? ex.Message);
        }
    }

    // ── Helper ────────────────────────────────────────────────────────────────
    private static string MapCountry(string? country) => country?.ToUpperInvariant() switch
    {
        "LIETUVA" or "LIETUVOS RESPUBLIKA" or "LT" => "LT",
        "LATVIJA" or "LATVIJOS RESPUBLIKA" or "LV" => "LV",
        "ESTIJA" or "ESTIJOS RESPUBLIKA" or "EE" => "EE",
        "LENKIJA" or "LENKIJOS RESPUBLIKA" or "PL" => "PL",
        "VOKIETIJA" or "VOKIETIJOS FEDERACINĖ RESPUBLIKA" or "DE" => "DE",
        _ => "LT"
    };
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

public class EvaluateReturnDto
{
    // NOTE: StatusId is no longer used — status is derived automatically.
    // Kept for backwards compat so old clients don't break.
    public int? StatusId { get; set; }
    public string? EmployeeNote { get; set; }
    public List<ReturnItemEvalDto> Items { get; set; } = new();
}

public class ReturnItemEvalDto
{
    public int ReturnItemId { get; set; }
    public bool Evaluation { get; set; }
    public string? EvaluationComment { get; set; }
}