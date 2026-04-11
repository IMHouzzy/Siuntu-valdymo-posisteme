using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class invoice
{
    public int id_Invoice { get; set; }

    public string invoiceNumber { get; set; } = null!;

    public DateTime date { get; set; }

    public DateTime? dueDate { get; set; }

    public double total { get; set; }

    public double vatTotal { get; set; }

    public bool isPaid { get; set; }

    public DateTime? paidAt { get; set; }

    public string? notes { get; set; }

    /// <summary>
    /// Path to generated PDF invoice
    /// </summary>
    public string? fileUrl { get; set; }

    public bool emailSent { get; set; }

    public DateTime? emailSentAt { get; set; }

    public int fk_Ordersid_Orders { get; set; }

    public virtual order fk_Ordersid_OrdersNavigation { get; set; } = null!;
}
