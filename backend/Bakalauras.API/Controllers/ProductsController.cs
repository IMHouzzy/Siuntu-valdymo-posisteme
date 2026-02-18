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
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _db.categories
            .AsNoTracking()
            .Select(c => new { c.id_Category, c.name })
            .ToListAsync();

        return Ok(categories);
    }

    [HttpGet("productgroups")]
    public async Task<IActionResult> GetProductGroups()
    {
        var groups = await _db.productgroups
            .AsNoTracking()
            .Select(g => new { g.id_ProductGroup, g.name })
            .ToListAsync();

        return Ok(groups);
    }

    [HttpPost("createProduct")]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto)
    {
        var cat = await _db.categories.FindAsync(dto.categoryId);
        var grp = await _db.productgroups.FindAsync(dto.groupId);
        if (cat == null || grp == null) return BadRequest("Invalid category/group");

        var p = new product
        {
            name = dto.name,
            price = dto.price,
            unit = dto.unit ?? "vnt",
            description = dto.description,
            vat = dto.vat,
            canTheProductBeProductReturned = dto.canTheProductBeProductReturned,
            countableItem = dto.countableItem,
            creationDate = DateTime.UtcNow
        };

        p.fk_Categoryid_Categories.Add(cat);
        p.fk_ProductGroupId_ProductGroups.Add(grp);

        _db.products.Add(p);
        await _db.SaveChangesAsync();

        return Ok(new { p.id_Product });
    }
    [HttpGet("product/{id}")]
    public async Task<IActionResult> GetProductForEdit(int id)
    {
        var p = await _db.products
            .AsNoTracking()
            .Where(x => x.id_Product == id)
            .Select(x => new
            {
                x.id_Product,
                x.name,
                x.price,
                x.unit,
                x.description,
                x.vat,
                x.canTheProductBeProductReturned,
                x.countableItem,

                categoryId = x.fk_Categoryid_Categories
                    .Select(c => (int?)c.id_Category)
                    .FirstOrDefault(),

                groupId = x.fk_ProductGroupId_ProductGroups
                    .Select(g => (int?)g.id_ProductGroup)
                    .FirstOrDefault(),
            })
            .FirstOrDefaultAsync();

        if (p == null) return NotFound();
        return Ok(p);
    }
    [HttpPut("editProduct/{id}")]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] CreateProductDto dto)
    {
        var p = await _db.products
            .Include(x => x.fk_Categoryid_Categories)
            .Include(x => x.fk_ProductGroupId_ProductGroups)
            .FirstOrDefaultAsync(x => x.id_Product == id);

        if (p == null) return NotFound();

        p.name = dto.name;
        p.price = dto.price;
        p.unit = dto.unit ?? "vnt";
        p.description = dto.description;
        p.vat = dto.vat;
        p.canTheProductBeProductReturned = dto.canTheProductBeProductReturned;
        p.countableItem = dto.countableItem;

        p.fk_Categoryid_Categories.Clear();
        p.fk_ProductGroupId_ProductGroups.Clear();

        var cat = await _db.categories.FindAsync(dto.categoryId);
        var grp = await _db.productgroups.FindAsync(dto.groupId);
        if (cat == null || grp == null) return BadRequest("Invalid category/group");

        p.fk_Categoryid_Categories.Add(cat);
        p.fk_ProductGroupId_ProductGroups.Add(grp);

        await _db.SaveChangesAsync();
        return Ok();
    }
    [HttpDelete("deleteProduct/{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var p = await _db.products
            .Include(x => x.fk_Categoryid_Categories)
            .Include(x => x.fk_ProductGroupId_ProductGroups)
            .FirstOrDefaultAsync(x => x.id_Product == id);

        if (p == null) return NotFound();

        // remove join table rows
        p.fk_Categoryid_Categories.Clear();
        p.fk_ProductGroupId_ProductGroups.Clear();

        // also if product is in orders -> block or delete links (see note below)
        // p.ordersproducts.Clear(); // only if you include and want to delete order links

        await _db.SaveChangesAsync(); 

        _db.products.Remove(p);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
