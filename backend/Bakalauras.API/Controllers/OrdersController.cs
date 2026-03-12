using Bakalauras.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Bakalauras.API.Dtos;
[ApiController]
[Route("api/orders/")]
[Authorize]
public class OrderController : ControllerBase
{
    private readonly AppDbContext _db;

    public OrderController(AppDbContext db)
    {
        _db = db;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private int GetRequiredCompanyId()
    {
        var companyId = User.GetCompanyId();
        if (companyId <= 0)
            throw new UnauthorizedAccessException("No active company selected.");
        return companyId;
    }

    // ── READ (LIST) ───────────────────────────────────────────────────────────

    [HttpGet("allOrders")]
    public async Task<IActionResult> GetAllOrders()
    {
        int companyId;
        try { companyId = GetRequiredCompanyId(); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }

        var orders = await _db.orders
            .AsNoTracking()
            .Where(o => o.fk_Companyid_Company == companyId)
            .Select(o => new
            {
                o.id_Orders, o.OrdersDate, o.totalAmount, o.paymentMethod,
                o.deliveryPrice, o.status, o.fk_Clientid_Users,
                o.externalDocumentId, o.fk_Companyid_Company
            })
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet("allOrdersFullInfo")]
    public async Task<IActionResult> GetAllOrdersFullInfo()
    {
        int companyId;
        try { companyId = GetRequiredCompanyId(); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }

        var orders = await _db.orders
            .AsNoTracking()
            .Where(o => o.fk_Companyid_Company == companyId)
            .Select(o => new
            {
                o.id_Orders, o.OrdersDate, o.totalAmount, o.paymentMethod,
                o.deliveryPrice, o.status,
                statusName          = o.statusNavigation.name,
                o.externalDocumentId,
                o.fk_Companyid_Company,

                client = new
                {
                    id_Users = o.fk_Clientid_Users,
                    // user fields come directly from users navigation
                    name    = o.fk_Clientid_UsersNavigation.name,
                    surname = o.fk_Clientid_UsersNavigation.surname,
                    email   = o.fk_Clientid_UsersNavigation.email,

                    // per-company client data from client_company
                    companyData = _db.client_companies
                        .AsNoTracking()
                        .Where(cc =>
                            cc.fk_Companyid_Company == companyId &&
                            cc.fk_Clientid_Users    == o.fk_Clientid_Users)
                        .Select(cc => new
                        {
                            cc.deliveryAddress,
                            cc.city,
                            cc.country,
                            cc.vat,
                            cc.bankCode,
                            cc.externalClientId
                        })
                        .FirstOrDefault()
                },

                products = o.ordersproducts.Select(op => new
                {
                    op.quantity,
                    op.unitPrice,
                    op.vatValue,
                    productId    = op.fk_Productid_Product,
                    name         = op.fk_Productid_ProductNavigation.name,
                    price        = op.fk_Productid_ProductNavigation.price,
                    unit         = op.fk_Productid_ProductNavigation.unit,
                    externalCode = op.fk_Productid_ProductNavigation.externalCode,
                    imageUrl     = op.fk_Productid_ProductNavigation.product_images.Select(pi => pi.url).FirstOrDefault()
                }).ToList()
            })
            .OrderByDescending(x => x.id_Orders)
            .ToListAsync();

        return Ok(orders);
    }

    // ── LOOKUPS ───────────────────────────────────────────────────────────────

    [AllowAnonymous]
    [HttpGet("order-statuses")]
    public async Task<IActionResult> GetOrderStatuses()
    {
        var statuses = await _db.orderstatuses
            .Select(s => new { s.id_OrderStatus, s.name })
            .ToListAsync();

        return Ok(statuses);
    }

    // Returns client_company data for a given user within the active company
    [HttpGet("clientInfo/{userId:int}")]
    public async Task<IActionResult> GetClientInfo(int userId)
    {
        int companyId;
        try { companyId = GetRequiredCompanyId(); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }

        var cc = await _db.client_companies
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.fk_Companyid_Company == companyId &&
                x.fk_Clientid_Users    == userId);

        if (cc == null)
            return StatusCode(403, "Client is not in your company.");

        return Ok(new
        {
            cc.deliveryAddress,
            cc.city,
            cc.country,
            cc.vat,
            cc.bankCode,
            cc.externalClientId
        });
    }

    [HttpGet("products")]
    public async Task<IActionResult> SearchProducts([FromQuery] string? q)
    {
        int companyId;
        try { companyId = GetRequiredCompanyId(); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }

        q = (q ?? "").Trim();

        var products = await _db.products
            .AsNoTracking()
            .Where(p => p.fk_Companyid_Company == companyId)
            .Where(p => q == "" || p.name.Contains(q))
            .Select(p => new { p.id_Product, p.name, p.price })
            .ToListAsync();

        return Ok(products);
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    [HttpPost("createOrder")]
    public async Task<IActionResult> CreateOrder([FromBody] OrderUpsertDto dto)
    {
        int companyId;
        try { companyId = GetRequiredCompanyId(); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }

        if (dto.Items == null || dto.Items.Count == 0)
            return BadRequest("Order must have at least 1 product.");

        // Client must have a client_company row for this company
        var cc = await _db.client_companies
            .FirstOrDefaultAsync(x =>
                x.fk_Companyid_Company == companyId &&
                x.fk_Clientid_Users    == dto.ClientUserId);

        if (cc == null)
            return StatusCode(403, "Client is not in your company.");

        // All products must belong to this company
        var productIds = dto.Items.Select(i => i.ProductId).Distinct().ToList();
        var okCount    = await _db.products.AsNoTracking()
            .CountAsync(p => productIds.Contains(p.id_Product) && p.fk_Companyid_Company == companyId);

        if (okCount != productIds.Count)
            return StatusCode(403, "One or more products are not in your company.");

        await using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            // Update client_company info if provided
            if (dto.ClientInfo != null)
            {
                cc.deliveryAddress = dto.ClientInfo.DeliveryAddress;
                cc.city            = dto.ClientInfo.City;
                cc.country         = dto.ClientInfo.Country;
                cc.vat             = dto.ClientInfo.Vat;
                cc.bankCode        = dto.ClientInfo.BankCode;
                await _db.SaveChangesAsync();
            }

            var order = new order
            {
                fk_Companyid_Company = companyId,
                OrdersDate           = dto.OrdersDate,
                totalAmount          = dto.TotalAmount,
                paymentMethod        = dto.PaymentMethod,
                deliveryPrice        = dto.DeliveryPrice,
                status               = dto.Status,
                fk_Clientid_Users    = dto.ClientUserId,
                externalDocumentId   = dto.ExternalDocumentId
            };

            _db.orders.Add(order);
            await _db.SaveChangesAsync();

            foreach (var it in dto.Items)
            {
                _db.ordersproducts.Add(new ordersproduct
                {
                    fk_Ordersid_Orders   = order.id_Orders,
                    fk_Productid_Product = it.ProductId,
                    quantity             = it.Quantity,
                    unitPrice            = it.UnitPrice,
                    vatValue             = it.VatValue
                });
            }

            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            return Ok(new { orderId = order.id_Orders });
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return StatusCode(500, ex.InnerException?.Message ?? ex.Message);
        }
    }

    // ── READ (SINGLE) ─────────────────────────────────────────────────────────

    [HttpGet("order/{id:int}")]
    public async Task<IActionResult> GetOrder(int id)
    {
        int companyId;
        try { companyId = GetRequiredCompanyId(); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }

        var order = await _db.orders.AsNoTracking().FirstOrDefaultAsync(o => o.id_Orders == id);
        if (order == null) return NotFound();

        if (order.fk_Companyid_Company != companyId)
            return StatusCode(403, "Order is not in your company.");

        var items = await _db.ordersproducts.AsNoTracking()
            .Where(x => x.fk_Ordersid_Orders == id)
            .Select(x => new
            {
                productId = x.fk_Productid_Product,
                x.quantity, x.unitPrice, x.vatValue
            })
            .ToListAsync();

        return Ok(new
        {
            id                 = order.id_Orders,
            ordersDate         = order.OrdersDate,
            totalAmount        = order.totalAmount,
            paymentMethod      = order.paymentMethod,
            deliveryPrice      = order.deliveryPrice,
            status             = order.status,
            clientUserId       = order.fk_Clientid_Users,
            externalDocumentId = order.externalDocumentId,
            companyId          = order.fk_Companyid_Company,
            items
        });
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    [HttpPut("editOrder/{id:int}")]
    public async Task<IActionResult> UpdateOrder(int id, [FromBody] OrderUpsertDto dto)
    {
        int companyId;
        try { companyId = GetRequiredCompanyId(); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }

        var order = await _db.orders.FirstOrDefaultAsync(o => o.id_Orders == id);
        if (order == null) return NotFound();

        if (order.fk_Companyid_Company != companyId)
            return StatusCode(403, "Order is not in your company.");

        var cc = await _db.client_companies
            .FirstOrDefaultAsync(x =>
                x.fk_Companyid_Company == companyId &&
                x.fk_Clientid_Users    == dto.ClientUserId);

        if (cc == null)
            return StatusCode(403, "Client is not in your company.");

        var productIds = dto.Items.Select(i => i.ProductId).Distinct().ToList();
        var okCount    = await _db.products.AsNoTracking()
            .CountAsync(p => productIds.Contains(p.id_Product) && p.fk_Companyid_Company == companyId);

        if (okCount != productIds.Count)
            return StatusCode(403, "One or more products are not in your company.");

        await using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            order.OrdersDate         = dto.OrdersDate;
            order.totalAmount        = dto.TotalAmount;
            order.paymentMethod      = dto.PaymentMethod;
            order.deliveryPrice      = dto.DeliveryPrice;
            order.status             = dto.Status;
            order.fk_Clientid_Users  = dto.ClientUserId;
            order.externalDocumentId = dto.ExternalDocumentId;

            // Update client_company info if provided
            if (dto.ClientInfo != null)
            {
                cc.deliveryAddress = dto.ClientInfo.DeliveryAddress;
                cc.city            = dto.ClientInfo.City;
                cc.country         = dto.ClientInfo.Country;
                cc.vat             = dto.ClientInfo.Vat;
                cc.bankCode        = dto.ClientInfo.BankCode;
            }

            // Replace order lines
            var old = await _db.ordersproducts
                .Where(x => x.fk_Ordersid_Orders == id)
                .ToListAsync();

            _db.ordersproducts.RemoveRange(old);

            foreach (var it in dto.Items)
            {
                _db.ordersproducts.Add(new ordersproduct
                {
                    fk_Ordersid_Orders   = id,
                    fk_Productid_Product = it.ProductId,
                    quantity             = it.Quantity,
                    unitPrice            = it.UnitPrice,
                    vatValue             = it.VatValue
                });
            }

            await _db.SaveChangesAsync();
            await tx.CommitAsync();
            return Ok();
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return StatusCode(500, ex.InnerException?.Message ?? ex.Message);
        }
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    [HttpDelete("deleteOrder/{id:int}")]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        int companyId;
        try { companyId = GetRequiredCompanyId(); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }

        var order = await _db.orders.FirstOrDefaultAsync(o => o.id_Orders == id);
        if (order == null) return NotFound();

        if (order.fk_Companyid_Company != companyId)
            return StatusCode(403, "Order is not in your company.");

        await using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            var lines = await _db.ordersproducts
                .Where(x => x.fk_Ordersid_Orders == id)
                .ToListAsync();

            _db.ordersproducts.RemoveRange(lines);
            _db.orders.Remove(order);

            await _db.SaveChangesAsync();
            await tx.CommitAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return StatusCode(500, ex.InnerException?.Message ?? ex.Message);
        }
    }
}