namespace Bakalauras.API.Dtos
{
    public sealed class ButentSalesResponse
    {
        public int Count { get; set; }
        public List<ButentSaleDocDto> Documents { get; set; } = new();
    }

    public sealed class ButentSaleDocDto
    {
        public int DocumentID { get; set; }
        public string? Date { get; set; }
        public double? Total { get; set; }
        public string? Currency { get; set; }
    }

    public sealed class ButentDocumentResponse
    {
        public int Count { get; set; }
        public List<ButentDocumentDto> Documents { get; set; } = new();
    }

    public sealed class ButentDocumentDto
    {
        public int Id { get; set; }
        public int? Client_Id { get; set; }
        public string? Date { get; set; }
        public double? Total { get; set; }
        public string? Currency { get; set; }
    }

    public sealed class ButentItemsResponse
    {
        public int Count { get; set; }
        public List<ButentItemDto> Items { get; set; } = new();
    }

    public sealed class ButentItemDto
    {
        public int Id { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("good_id")]
        public int Good_Id { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("quantity")]
        [System.Text.Json.Serialization.JsonNumberHandling(
            System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString)]
        public double Quantity { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("price")]
        public double? Price { get; set; }
    }
}