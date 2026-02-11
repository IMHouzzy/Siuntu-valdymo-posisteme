using Bakalauras.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Bakalauras.API.Data;

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





}
