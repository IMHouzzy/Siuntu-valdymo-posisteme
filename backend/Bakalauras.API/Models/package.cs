using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class package
{
    public int id_Package { get; set; }

    public DateTime creationDate { get; set; }

    public string? labelFile { get; set; }

    public double? weight { get; set; }

    public int fk_Shipmentid_Shipment { get; set; }

    public string? trackingNumber { get; set; }

    public virtual shipment fk_Shipmentid_ShipmentNavigation { get; set; } = null!;
}
