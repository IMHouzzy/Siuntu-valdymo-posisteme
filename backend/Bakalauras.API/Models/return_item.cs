using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class return_item
{
    public int id_ReturnItem { get; set; }

    public int quantity { get; set; }

    public string? reason { get; set; }

    public int? reasonId { get; set; }

    public string? evaluationComment { get; set; }

    public bool? evaluation { get; set; }

    public DateOnly? evaluationDate { get; set; }

    public double returnSubTotal { get; set; }

    public string? imageUrls { get; set; }

    public int fk_Returnsid_Returns { get; set; }

    public int fk_OrdersProductid_OrdersProduct { get; set; }

    public virtual ordersproduct fk_OrdersProductid_OrdersProductNavigation { get; set; } = null!;

    public virtual product_return fk_Returnsid_ReturnsNavigation { get; set; } = null!;

    public virtual return_reason? reasonNavigation { get; set; }
}
