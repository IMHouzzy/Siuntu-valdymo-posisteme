namespace Bakalauras.API.Dtos
{
    public class CreateProductDto
    {
        public string? name { get; set; }
        public double? price { get; set; }
        public string? unit { get; set; }
        public string? description { get; set; }
        public bool vat { get; set; }
        public bool canTheProductBeProductReturned { get; set; }
        public bool countableItem { get; set; }
        public int categoryId { get; set; }
        public int groupId { get; set; }
        public List<Microsoft.AspNetCore.Http.IFormFile>? images { get; set; }
        public string? keepImageIdsJson { get; set; }
        public string? imageOrderJson { get; set; }
        public int? primaryImageId { get; set; }
    }

    public class ImageOrderItem
    {
        public string? type { get; set; } // "existing" | "new"
        public int? id { get; set; } // for existing
        public string? tempKey { get; set; } // for new (ignored server-side)
    }
}