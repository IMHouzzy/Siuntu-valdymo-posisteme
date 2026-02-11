using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class ordersproduct
{
    public double quantity { get; set; }

    public int id_OrdersProduct { get; set; }

    public int fk_Ordersid_Orders { get; set; }

    public int fk_Productid_Product { get; set; }

    public virtual order fk_Ordersid_OrdersNavigation { get; set; } = null!;

    public virtual product fk_Productid_ProductNavigation { get; set; } = null!;
}
