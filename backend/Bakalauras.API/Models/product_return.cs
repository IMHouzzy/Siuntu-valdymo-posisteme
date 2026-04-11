using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class product_return
{
    public int id_Returns { get; set; }

    public DateTime date { get; set; }

    public int fk_ReturnStatusTypeid_ReturnStatusType { get; set; }

    public int fk_Clientid_Users { get; set; }

    public int? fk_Adminid_Users { get; set; }

    public int fk_Companyid_Company { get; set; }

    public int? fk_ordersid_orders { get; set; }

    public string returnMethod { get; set; } = null!;

    public int? returnCourierId { get; set; }

    public string? employeeNote { get; set; }

    public string? clientNote { get; set; }

    public string? returnStreet { get; set; }

    public string? returnCity { get; set; }

    public string? returnPostalCode { get; set; }

    public string? returnCountry { get; set; }

    public int? fk_Courierid_Courier { get; set; }

    public string? returnLockerId { get; set; }

    public string? returnLockerName { get; set; }

    public string? returnLockerAddress { get; set; }

    public double? returnLat { get; set; }

    public double? returnLng { get; set; }

    public virtual user? fk_Adminid_UsersNavigation { get; set; }

    public virtual user fk_Clientid_UsersNavigation { get; set; } = null!;

    public virtual company fk_Companyid_CompanyNavigation { get; set; } = null!;

    public virtual courier? fk_Courierid_CourierNavigation { get; set; }

    public virtual return_status_type fk_ReturnStatusTypeid_ReturnStatusTypeNavigation { get; set; } = null!;

    public virtual order? fk_ordersid_ordersNavigation { get; set; }

    public virtual courier? returnCourier { get; set; }

    public virtual ICollection<return_item> return_items { get; set; } = new List<return_item>();

    public virtual ICollection<shipment> shipments { get; set; } = new List<shipment>();
}
