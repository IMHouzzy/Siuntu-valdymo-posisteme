using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class ordersproduct
{
    public int id_OrdersProduct { get; set; }

    public double quantity { get; set; }

    public double unitPrice { get; set; }

    public double vatValue { get; set; }

    public int fk_Ordersid_Orders { get; set; }

    public int fk_Productid_Product { get; set; }

    public virtual order fk_Ordersid_OrdersNavigation { get; set; } = null!;

    public virtual product fk_Productid_ProductNavigation { get; set; } = null!;

    public virtual ICollection<return_item> return_items { get; set; } = new List<return_item>();
}
