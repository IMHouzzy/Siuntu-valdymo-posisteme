using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class shipment_status
{
    public int id_ShipmentStatus { get; set; }

    public int fk_Shipmentid_Shipment { get; set; }

    public int fk_ShipmentStatusTypeid_ShipmentStatusType { get; set; }

    public DateTime date { get; set; }

    public virtual shipment_status_type fk_ShipmentStatusTypeid_ShipmentStatusTypeNavigation { get; set; } = null!;

    public virtual shipment fk_Shipmentid_ShipmentNavigation { get; set; } = null!;
}
