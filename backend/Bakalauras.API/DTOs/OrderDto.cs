public class OrderItemDto
{
    public int ProductId { get; set; }
    public double Quantity { get; set; }
    public double UnitPrice { get; set; }
    public double VatValue { get; set; }
}

public class ClientInfoDto
{
    public string? DeliveryAddress { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? Vat { get; set; }
    public int? BankCode { get; set; }
}

public class OrderUpsertDto
{
    public DateTime OrdersDate { get; set; }
    public double TotalAmount { get; set; }
    public string PaymentMethod { get; set; }
    public double DeliveryPrice { get; set; }
    public int Status { get; set; }
    public int ClientUserId { get; set; }
    public int? ExternalDocumentId { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();

    public ClientInfoDto? ClientInfo { get; set; } // ✅ new
}
