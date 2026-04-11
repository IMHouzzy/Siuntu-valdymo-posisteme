
    public class ClientContactUpdateDto
    {
        public string? DeliveryAddress { get; set; }
        public string? City            { get; set; }
        public string? Country         { get; set; }
        public string? Phone           { get; set; }
    }

public class CreateReturnDto
{
    public List<ReturnItemDto> Items { get; set; } = new();
    public string? ReturnMethod { get; set; }       // "CUSTOM" | "DPD" | "LP_EXPRESS" | "OMNIVA"
    public int? CourierId { get; set; }             // FK to couriers table
    public string? ClientNote { get; set; }
 
    // Address (for home / custom pickup)
    public string? ReturnStreet { get; set; }
    public string? ReturnCity { get; set; }
    public string? ReturnPostalCode { get; set; }
    public string? ReturnCountry { get; set; }
 
    // Locker fields (for parcel-machine couriers like DPD_PARCEL)
    public string? LockerId { get; set; }           // provider locker ID (e.g. DPD PUDO ID)
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
    public List<string>? ImageUrls { get; set; }   // Pre-uploaded temp image URLs
}
