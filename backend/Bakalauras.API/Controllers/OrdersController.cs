using Bakalauras.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


[ApiController]
[Route("api/orders/")]
public class OrderController : ControllerBase
{
    private readonly AppDbContext _db;

    public OrderController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("allOrders")]
    public async Task<IActionResult> GetAllOrders()
    {
        var order = await _db.orders
            .Select(o => new
            {
                o.id_Orders,
                o.OrdersDate,
                o.totalAmount,
                o.paymentMethod,
                o.deliveryPrice,
                o.status,
                o.fk_Clientid_Users,
                o.externalDocumentId

            })
            .ToListAsync();

        return Ok(order);
    }

    [HttpGet("allOrdersFullInfo")]
    public async Task<IActionResult> GetAllOrdersFullInfo()
    {
        var orders = await _db.orders
            .AsNoTracking()
            .Select(o => new
            {
                o.id_Orders,
                o.OrdersDate,
                o.totalAmount,
                o.paymentMethod,
                o.deliveryPrice,
                o.status,
                statusName = o.statusNavigation.name,
                o.externalDocumentId,

                client = new
                {
                    id_Users = o.fk_Clientid_UsersNavigation.id_Users,

                    // from users table
                    name = o.fk_Clientid_UsersNavigation.id_UsersNavigation.name,
                    surname = o.fk_Clientid_UsersNavigation.id_UsersNavigation.surname,
                    email = o.fk_Clientid_UsersNavigation.id_UsersNavigation.email,

                    // from client table
                    deliveryAddress = o.fk_Clientid_UsersNavigation.deliveryAddress,
                    city = o.fk_Clientid_UsersNavigation.city,
                    country = o.fk_Clientid_UsersNavigation.country,
                    vat = o.fk_Clientid_UsersNavigation.vat,
                    bankCode = o.fk_Clientid_UsersNavigation.bankCode,
                    maxDebt = o.fk_Clientid_UsersNavigation.maxDebt,
                    externalClientId = o.fk_Clientid_UsersNavigation.externalClientId
                },


                products = o.ordersproducts.Select(op => new
                {
                    quantity = op.quantity,
                    unitPrice = op.unitPrice,
                    vatValue = op.vatValue,
                    productId = op.fk_Productid_Product,
                    name = op.fk_Productid_ProductNavigation.name,
                    price = op.fk_Productid_ProductNavigation.price,
                    unit = op.fk_Productid_ProductNavigation.unit,
                    externalCode = op.fk_Productid_ProductNavigation.externalCode
                }).ToList()
            })
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet("order-statuses")]
    public async Task<IActionResult> GetOrderStatuses()
    {
        var statuses = await _db.orderstatuses
            .Select(s => new { s.id_OrderStatus, s.name })
            .ToListAsync();

        return Ok(statuses);
    }


    [HttpGet("clientInfo/{userId:int}")]
    public async Task<IActionResult> GetClientInfo(int userId)
    {
        var c = await _db.clients.FirstOrDefaultAsync(x => x.id_Users == userId);
        if (c == null) return Ok(null);

        return Ok(new
        {
            deliveryAddress = c.deliveryAddress,
            city = c.city,
            country = c.country,
            vat = c.vat,
            bankCode = c.bankCode
        });
    }

    [HttpGet("products")]
    public async Task<IActionResult> SearchProducts([FromQuery] string? q)
    {
        q = (q ?? "").Trim();

        var products = await _db.products
            .Where(p => q == "" || p.name.Contains(q))
            .Select(p => new { p.id_Product, p.name, p.price })
            .ToListAsync();

        return Ok(products);
    }


    [HttpPost("createOrder")]
    public async Task<IActionResult> CreateOrder([FromBody] OrderUpsertDto dto)
    {
        if (dto.Items == null || dto.Items.Count == 0)
            return BadRequest("Order must have at least 1 product.");

        await using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            // upsert client info if provided OR if client row missing
            var client = await _db.clients.FirstOrDefaultAsync(c => c.id_Users == dto.ClientUserId);

            if (client == null)
            {
                client = new client
                {
                    id_Users = dto.ClientUserId,
                    userId = dto.ClientUserId // if your table needs it
                };
                _db.clients.Add(client);
            }

            // only overwrite if user filled something
            if (dto.ClientInfo != null)
            {
                client.deliveryAddress = dto.ClientInfo.DeliveryAddress;
                client.city = dto.ClientInfo.City;
                client.country = dto.ClientInfo.Country;
                client.vat = dto.ClientInfo.Vat;
                client.bankCode = dto.ClientInfo.BankCode;
            }

            await _db.SaveChangesAsync();

            var order = new order
            {
                OrdersDate = dto.OrdersDate,
                totalAmount = dto.TotalAmount,
                paymentMethod = dto.PaymentMethod,
                deliveryPrice = dto.DeliveryPrice,
                status = dto.Status,
                fk_Clientid_Users = dto.ClientUserId,
                externalDocumentId = dto.ExternalDocumentId,
            };

            _db.orders.Add(order);
            await _db.SaveChangesAsync();

            foreach (var it in dto.Items)
            {
                var op = new ordersproduct
                {
                    fk_Ordersid_Orders = order.id_Orders,
                    fk_Productid_Product = it.ProductId,
                    quantity = it.Quantity,
                    unitPrice = it.UnitPrice,
                    vatValue = it.VatValue
                };
                _db.ordersproducts.Add(op);
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

    [HttpGet("order/{id}")]
    public async Task<IActionResult> GetOrder(int id)
    {
        var order = await _db.orders.FirstOrDefaultAsync(o => o.id_Orders == id);
        if (order == null) return NotFound();

        var items = await _db.ordersproducts
            .Where(x => x.fk_Ordersid_Orders == id)
            .Select(x => new
            {
                productId = x.fk_Productid_Product,
                quantity = x.quantity,
                unitPrice = x.unitPrice,   // ✅ iš ordersproduct
                vatValue = x.vatValue
            })
            .ToListAsync();

        return Ok(new
        {
            id = order.id_Orders,
            ordersDate = order.OrdersDate,
            totalAmount = order.totalAmount,
            paymentMethod = order.paymentMethod,
            deliveryPrice = order.deliveryPrice,
            status = order.status,
            clientUserId = order.fk_Clientid_Users,
            externalDocumentId = order.externalDocumentId,
            items
        });
    }
    [HttpPut("editOrder/{id}")]
    public async Task<IActionResult> UpdateOrder(int id, [FromBody] OrderUpsertDto dto)
    {
        var order = await _db.orders.FirstOrDefaultAsync(o => o.id_Orders == id);
        if (order == null) return NotFound();

        await using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            order.OrdersDate = dto.OrdersDate;
            order.totalAmount = dto.TotalAmount;
            order.paymentMethod = dto.PaymentMethod;
            order.deliveryPrice = dto.DeliveryPrice;
            order.status = dto.Status;
            order.fk_Clientid_Users = dto.ClientUserId;
            order.externalDocumentId = dto.ExternalDocumentId;

            // ✅ UPDATE OR CREATE CLIENT INFO
            var client = await _db.clients
                .FirstOrDefaultAsync(c => c.id_Users == dto.ClientUserId);

            if (client == null)
            {
                client = new client
                {
                    id_Users = dto.ClientUserId,
                    userId = dto.ClientUserId
                };
                _db.clients.Add(client);
            }

            if (dto.ClientInfo != null)
            {
                client.deliveryAddress = dto.ClientInfo.DeliveryAddress;
                client.city = dto.ClientInfo.City;
                client.country = dto.ClientInfo.Country;
                client.vat = dto.ClientInfo.Vat;
                client.bankCode = dto.ClientInfo.BankCode;
            }

            // replace items
            var old = await _db.ordersproducts
                .Where(x => x.fk_Ordersid_Orders == id)
                .ToListAsync();

            _db.ordersproducts.RemoveRange(old);

            foreach (var it in dto.Items)
            {
                _db.ordersproducts.Add(new ordersproduct
                {
                    fk_Ordersid_Orders = id,
                    fk_Productid_Product = it.ProductId,
                    quantity = it.Quantity,
                    unitPrice = it.UnitPrice,  
                    vatValue = it.VatValue     
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

    [HttpDelete("deleteOrder/{id}")]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        var order = await _db.orders.FirstOrDefaultAsync(o => o.id_Orders == id);
        if (order == null) return NotFound();

        await using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            var lines = await _db.ordersproducts.Where(x => x.fk_Ordersid_Orders == id).ToListAsync();
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
