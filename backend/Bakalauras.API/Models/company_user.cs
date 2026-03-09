using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class company_user
{
    public int fk_Companyid_Company { get; set; }

    public int fk_Usersid_Users { get; set; }

    public string role { get; set; } = null!;

    public string? position { get; set; }

    public DateTime? startDate { get; set; }

    public bool? active { get; set; }

    public DateTime createdAt { get; set; }

    public virtual company fk_Companyid_CompanyNavigation { get; set; } = null!;

    public virtual user fk_Usersid_UsersNavigation { get; set; } = null!;
}
