using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class company_integration
{
    public int id_CompanyIntegration { get; set; }

    public int fk_Companyid_Company { get; set; }

    public string type { get; set; } = null!;

    public string? baseUrl { get; set; }

    public string encryptedSecrets { get; set; } = null!;

    public bool? enabled { get; set; }

    public DateTime updatedAt { get; set; }

    public virtual company fk_Companyid_CompanyNavigation { get; set; } = null!;
}
