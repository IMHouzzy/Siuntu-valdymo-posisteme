namespace Bakalauras.API.Dtos
{
    public sealed class ButentGoodsResponse
    {
        public int Count { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("goods")]
        public List<ButentProductDto> Goods { get; set; } = new();
    }

    public sealed class ButentProductDto
    {
        [System.Text.Json.Serialization.JsonPropertyName("code")]
        public int Code { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("name")]
        public string? Name { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("type")]
        public ButentIdName? Type { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("group")]
        public ButentIdName? Group { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("countableItem")]
        public bool CountableItem { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("unit")]
        public string? Unit { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("shipping_mode")]
        public string? ShippingMode { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("vat")]
        public bool Vat { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("inpTime")]
        public string? InpTime { get; set; }
    }

    public sealed class ButentIdName
    {
        [System.Text.Json.Serialization.JsonPropertyName("id")]
        public int Id { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("name")]
        public string? Name { get; set; }
    }
}