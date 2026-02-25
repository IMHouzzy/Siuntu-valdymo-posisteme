using Microsoft.AspNetCore.Http;

public class CreateProductDto
{
    public string name { get; set; }
    public double? price { get; set; }
    public string unit { get; set; }
    public string? description { get; set; }
    public bool vat { get; set; }
    public bool canTheProductBeProductReturned { get; set; }
    public bool countableItem { get; set; }

    public int categoryId { get; set; }
    public int groupId { get; set; }

    public List<IFormFile>? images { get; set; }   // ✅ new uploads

    public string? keepImageIdsJson { get; set; }  // ✅ JSON: [1,2,3]
    public string? imageOrderJson { get; set; }    // ✅ JSON: [{type:"existing",id:1},{type:"new",tempKey:"x"}...]
    public int? primaryImageId { get; set; }       // ✅ existing primary
}

public class ImageOrderItem
{
    public string? type { get; set; } // "existing" | "new"
    public int? id { get; set; }      // for existing
    public string? tempKey { get; set; } // for new (backendui nebūtina)
}