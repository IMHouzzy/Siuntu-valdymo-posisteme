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
}