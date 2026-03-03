using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class courier
{
    public int id_Courier { get; set; }

    public string name { get; set; } = null!;

    public string? contactPhone { get; set; }

    public int? deliveryTermDays { get; set; }

    public double? deliveryPrice { get; set; }

    public virtual ICollection<shipment> shipments { get; set; } = new List<shipment>();
}
