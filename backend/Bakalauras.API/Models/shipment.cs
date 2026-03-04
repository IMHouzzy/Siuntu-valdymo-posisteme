using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class shipment
{
    public int id_Shipment { get; set; }

    public string trackingNumber { get; set; } = null!;

    public DateTime? shippingDate { get; set; }

    public DateTime? estimatedDeliveryDate { get; set; }

    public int? fk_Courierid_Courier { get; set; }

    public int fk_Ordersid_Orders { get; set; }

    public int fk_Companyid_Company { get; set; }

    public virtual company fk_Companyid_CompanyNavigation { get; set; } = null!;

    public virtual courier? fk_Courierid_CourierNavigation { get; set; }

    public virtual order fk_Ordersid_OrdersNavigation { get; set; } = null!;

    public virtual ICollection<package> packages { get; set; } = new List<package>();

    public virtual ICollection<shipment_status> shipment_statuses { get; set; } = new List<shipment_status>();
}
