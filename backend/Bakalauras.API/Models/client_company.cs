using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class client_company
{
    public int fk_Clientid_Users { get; set; }

    public int fk_Companyid_Company { get; set; }

    public int? externalClientId { get; set; }

    public string? deliveryAddress { get; set; }

    public string? city { get; set; }

    public string? country { get; set; }

    public string? vat { get; set; }

    public int? bankCode { get; set; }

    public DateTime createdAt { get; set; }

    public virtual user fk_Clientid_UsersNavigation { get; set; } = null!;

    public virtual company fk_Companyid_CompanyNavigation { get; set; } = null!;
}
