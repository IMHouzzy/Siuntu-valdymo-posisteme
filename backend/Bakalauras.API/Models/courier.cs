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

    public string type { get; set; } = null!;

    public int? fk_Companyid_Company { get; set; }

    public virtual company? fk_Companyid_CompanyNavigation { get; set; }

    public virtual ICollection<order> orders { get; set; } = new List<order>();

    public virtual ICollection<product_return> product_returnfk_Courierid_CourierNavigations { get; set; } = new List<product_return>();

    public virtual ICollection<product_return> product_returnreturnCouriers { get; set; } = new List<product_return>();

    public virtual ICollection<shipment> shipments { get; set; } = new List<shipment>();
}
