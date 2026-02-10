using System.Text.Json;
using System.Text.Json.Serialization;

public sealed class ButentGoodsResponse
{
    public int Count { get; set; }

    [JsonPropertyName("goods")]
    public List<ButentProductDto> Goods { get; set; } = new();
}

public sealed class ButentProductDto
{
    [JsonPropertyName("code")]
    public int Code { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("type")]
    public ButentIdName? Type { get; set; } 

    [JsonPropertyName("group")]
    public ButentIdName? Group { get; set; }   

    [JsonPropertyName("countableItem")]
    public bool CountableItem { get; set; }

    [JsonPropertyName("unit")]
    public string? Unit { get; set; }

    [JsonPropertyName("shipping_mode")]
    public string? ShippingMode { get; set; }

    [JsonPropertyName("vat")]
    public bool Vat { get; set; }

    [JsonPropertyName("inpTime")]
    public string? InpTime { get; set; } // "2019-10-22 16:07:00"
}

public sealed class ButentIdName
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }
}
