namespace Bakalauras.API.Dtos
{
    public class OrderItemDto
    {
        public int ProductId { get; set; }
        public double Quantity { get; set; }
        public double UnitPrice { get; set; }
        public double VatValue { get; set; }
    }

    /// <summary>
    /// Write-only client info supplied inline when creating / editing an order.
    /// This updates client_company for the active company.
    /// ExternalClientId is intentionally absent — it is managed by the sync worker.
    /// </summary>
    public class ClientInfoDto
    {
        public string? DeliveryAddress { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public string? Vat { get; set; }
        public int? BankCode { get; set; }
    }

    /// <summary>
    /// Read-only client info returned by GET clientInfo/{userId}.
    /// Includes externalClientId so the frontend can display it.
    /// </summary>
    public class ClientInfoViewDto
    {
        public string? DeliveryAddress { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public string? Vat { get; set; }
        public int? BankCode { get; set; }
        public int? ExternalClientId { get; set; }
    }

    public class OrderUpsertDto
    {
        public DateTime OrdersDate { get; set; }
        public double TotalAmount { get; set; }
        public string PaymentMethod { get; set; } = "";
        public double DeliveryPrice { get; set; }
        public int Status { get; set; }
        public int ClientUserId { get; set; }
        public int? ExternalDocumentId { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();

        /// <summary>Optional: update client address data at the same time as the order.</summary>
        public ClientInfoDto? ClientInfo { get; set; }
    }
}