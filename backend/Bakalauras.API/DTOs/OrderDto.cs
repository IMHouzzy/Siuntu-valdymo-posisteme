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
    /// Optional delivery address override supplied when creating or editing an order.
    /// Used ONLY to populate the order's snapshot fields — never writes to client_companies.
    /// For billing fields (Vat, BankCode) staff can still pass them; they update client_companies
    /// via a separate explicit call if needed.
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

        // Delivery method snapshot fields
        public int? CourierId { get; set; }
        /// <summary>"HOME" or "LOCKER". Defaults to "HOME" if omitted.</summary>
        public string? DeliveryMethod { get; set; }
        public string? LockerId { get; set; }
        public string? LockerName { get; set; }
        public string? LockerAddress { get; set; }
        public double? DeliveryLat { get; set; }
        public double? DeliveryLng { get; set; }

        public List<OrderItemDto> Items { get; set; } = new();

        /// <summary>
        /// Optional inline delivery address override for this specific order.
        /// Populates the order's snapshot fields only — does NOT update client_companies.
        /// </summary>
        public ClientInfoDto? ClientInfo { get; set; }
    }
}