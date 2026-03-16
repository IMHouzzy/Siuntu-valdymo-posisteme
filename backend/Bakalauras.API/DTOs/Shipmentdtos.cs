// Dtos/ShipmentDtos.cs

namespace Bakalauras.API.Dtos
{
// Dtos/ShipmentDtos.cs
using System.Text.Json.Serialization;

public class CreateShipmentDto
{
    public int       OrderId               { get; set; }
    public int?      CourierId             { get; set; }
    public DateTime? ShippingDate          { get; set; }
    public DateTime? EstimatedDeliveryDate { get; set; }

    [JsonPropertyName("deliveryLat")]
    public double?   DeliveryLat           { get; set; }

    [JsonPropertyName("deliveryLng")]
    public double?   DeliveryLng           { get; set; }

    public int       PackageCount          { get; set; } = 1;
    public string?   LockerId              { get; set; }
    public string?   RecipientPostalCode   { get; set; }
    public string?   RecipientCity         { get; set; }
    public string?   RecipientStreet       { get; set; }
    public string?   SenderCity            { get; set; }
    public string?   SenderPostalCode      { get; set; }
    public string?   SenderStreet          { get; set; }
    public double?   PackageWeightKg       { get; set; }
    public List<double?>? PackageWeights   { get; set; }
}

    public class AddShipmentStatusDto
    {
        public int StatusTypeId { get; set; }
        public DateTime? Date { get; set; }
    }
}