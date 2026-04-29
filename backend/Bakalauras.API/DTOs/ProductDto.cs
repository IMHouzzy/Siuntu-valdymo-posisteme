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
        public List<IFormFile>? images { get; set; }
        public string? keepImageIdsJson { get; set; }
        public string? imageOrderJson { get; set; }
        public int? primaryImageId { get; set; }
    }

    public class ImageOrderItem
    {
        /// <summary>"existing" or "new"</summary>
        public string? type { get; set; }
        /// <summary>For existing images — the id_ProductImage value.</summary>
        public int? id { get; set; }
        /// <summary>For new images — ignored server-side, used by frontend only.</summary>
        public string? tempKey { get; set; }
    }

}