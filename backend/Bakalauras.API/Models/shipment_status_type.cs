using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class shipment_status_type
{
    public int id_ShipmentStatusType { get; set; }

    public string name { get; set; } = null!;

    public virtual ICollection<shipment_status> shipment_statuses { get; set; } = new List<shipment_status>();
}
