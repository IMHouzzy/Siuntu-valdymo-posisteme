namespace Bakalauras.API.DTOs
{
    public class ClientDeliveryUpdateDto
    {
        // Address (used for HOME delivery)
        public string? DeliveryAddress { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public string? Phone { get; set; }

        /// <summary>"HOME" or "LOCKER"</summary>
        public string? DeliveryMethod { get; set; }
        public int? CourierId { get; set; }
        public string? LockerId { get; set; }
        public string? LockerName { get; set; }
        public string? LockerAddress { get; set; }
        public double? DeliveryLat { get; set; }
        public double? DeliveryLng { get; set; }
    }

    public class CreateReturnDto
    {
        public List<ReturnItemDto> Items { get; set; } = new();
        /// <summary>"CUSTOM" | "DPD" | "LP_EXPRESS" | "OMNIVA"</summary>
        public string? ReturnMethod { get; set; }
        public int? CourierId { get; set; }
        public string? ClientNote { get; set; }

        // Address (for home / custom pickup)
        public string? ReturnStreet { get; set; }
        public string? ReturnCity { get; set; }
        public string? ReturnPostalCode { get; set; }
        public string? ReturnCountry { get; set; }

        // Locker fields (for parcel-machine couriers like DPD_PARCEL)
        public string? ReturnLockerId { get; set; }
        public string? ReturnLockerName { get; set; }
        public string? ReturnLockerAddress { get; set; }
        public double? ReturnLat { get; set; }
        public double? ReturnLng { get; set; }
    }

    public class ReturnItemDto
    {
        public int OrdersProductId { get; set; }
        public int Quantity { get; set; }
        public int? ReasonId { get; set; }
        /// <summary>Pre-uploaded temp image URLs from POST /api/client/returns/upload-images</summary>
        public List<string>? ImageUrls { get; set; }
    }
}