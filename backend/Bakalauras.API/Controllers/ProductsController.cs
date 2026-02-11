using Bakalauras.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Bakalauras.API.Data;

[ApiController]
[Route("api/products/")]
public class ProductController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProductController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("allProducts")]
    public async Task<IActionResult> GetAllProducts()
    {
        var products = await _db.products
            .Select(p => new
            {
                p.id_Product,
                p.name,
                p.description,
                p.price,
                p.picture,
                p.canTheProductBeProductReturned,
                p.countableItem,
                p.unit,
                p.shipping_mode,
                p.vat,
                p.creationDate,
                p.externalCode,

            })
            .ToListAsync();

        return Ok(products);
    }

 [HttpGet("allProductsFullInfo")]
public async Task<IActionResult> GetAllProductsFullInfo()
{
    var products = await _db.products
        .AsNoTracking()
        .Select(p => new
        {
            p.id_Product,
            p.name,
            p.description,
            p.price,
            p.picture,
            p.canTheProductBeProductReturned,
            p.countableItem,
            p.unit,
            p.shipping_mode,
            p.vat,
            p.creationDate,
            p.externalCode,

            groups = p.fk_ProductGroupId_ProductGroups
                .Select(g => new
                {
                    g.id_ProductGroup,
                    g.name
                })
                .ToList(),

            categories = p.fk_Categoryid_Categories
                .Select(c => new
                {
                    c.id_Category,
                    c.name
                })
                .ToList()
        })
        .ToListAsync();

    return Ok(products);
}




}
