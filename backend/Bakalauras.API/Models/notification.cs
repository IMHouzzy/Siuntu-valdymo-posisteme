using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class notification
{
    public int id_Notification { get; set; }

    public string theme { get; set; } = null!;

    public string content { get; set; } = null!;

    public DateTime date { get; set; }

    public bool isRead { get; set; }

    /// <summary>
    /// INFO | ORDER | SHIPMENT | RETURN | INVOICE
    /// </summary>
    public string type { get; set; } = null!;

    /// <summary>
    /// orderId / shipmentId / returnId
    /// </summary>
    public int? referenceId { get; set; }

    /// <summary>
    /// ORDER | SHIPMENT | RETURN
    /// </summary>
    public string? referenceType { get; set; }

    public bool emailSent { get; set; }

    /// <summary>
    /// Company whose staff can see this notification in the bell
    /// </summary>
    public int? fk_Companyid_Company { get; set; }

    public int? fk_Usersid_Users { get; set; }

    public bool? visibleToClient { get; set; }

    public bool visibleToCompany { get; set; }

    public virtual company? fk_Companyid_CompanyNavigation { get; set; }

    public virtual user? fk_Usersid_UsersNavigation { get; set; }
}
