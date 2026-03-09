using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class order
{
    public int id_Orders { get; set; }

    public DateTime OrdersDate { get; set; }

    public double totalAmount { get; set; }

    public string paymentMethod { get; set; } = null!;

    public double? deliveryPrice { get; set; }

    public int status { get; set; }

    public int fk_Clientid_Users { get; set; }

    public int? fk_Reportid_Report { get; set; }

    public int? externalDocumentId { get; set; }

    public int fk_Companyid_Company { get; set; }

    public virtual user fk_Clientid_UsersNavigation { get; set; } = null!;

    public virtual company fk_Companyid_CompanyNavigation { get; set; } = null!;

    public virtual ICollection<ordersproduct> ordersproducts { get; set; } = new List<ordersproduct>();

    public virtual ICollection<shipment> shipments { get; set; } = new List<shipment>();

    public virtual orderstatus statusNavigation { get; set; } = null!;
}
