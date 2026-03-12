

namespace Bakalauras.API.Dtos
{
    /// <summary>POST /api/shipments/create</summary>
    public class CreateShipmentDto
    {
        public int       OrderId                { get; set; }
        public int?      CourierId              { get; set; }
        public DateTime? ShippingDate           { get; set; }
        public DateTime? EstimatedDeliveryDate  { get; set; }
        public double?   DeliveryLat            { get; set; }
        public double?   DeliveryLng            { get; set; }

        /// <summary>Number of physical packages (≥ 1). A label PDF is generated for each.</summary>
        public int PackageCount { get; set; } = 1;
    }

    /// <summary>POST /api/shipments/{id}/status</summary>
    public class AddShipmentStatusDto
    {
        public int       StatusTypeId { get; set; }
        public DateTime? Date         { get; set; }
    }
}