using System.Text.Json.Serialization;
public sealed class ButentSalesResponse
{
    public int Count { get; set; }
    public List<ButentSaleDocDto> Documents { get; set; } = new();
}

public sealed class ButentSaleDocDto
{
    public int DocumentID { get; set; }       // documentID
    public string? Date { get; set; }         // "2023-05-03 00:00:00"
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
    public int Id { get; set; }               // id
    public int? Client_Id { get; set; }       // client_id
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

    [JsonPropertyName("good_id")]
    public int Good_Id { get; set; }

    [JsonPropertyName("quantity")]
    [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString)]
    public decimal Quantity { get; set; }

    [JsonPropertyName("price")]
    public decimal? Price { get; set; }
}
