using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class user
{
    public int id_Users { get; set; }

    public string name { get; set; } = null!;

    public string surname { get; set; } = null!;

    public string email { get; set; } = null!;

    public string? password { get; set; }

    public string? phoneNumber { get; set; }

    public DateTime creationDate { get; set; }

    public string? googleId { get; set; }

    public string? authProvider { get; set; }

    public int? fk_Companyid_Company { get; set; }

    public virtual admin? admin { get; set; }

    public virtual client? client { get; set; }

    public virtual ICollection<company_user> company_users { get; set; } = new List<company_user>();

    public virtual employee? employee { get; set; }

    public virtual company? fk_Companyid_CompanyNavigation { get; set; }

    public virtual ICollection<product_return> product_returnfk_Adminid_UsersNavigations { get; set; } = new List<product_return>();

    public virtual ICollection<product_return> product_returnfk_Clientid_UsersNavigations { get; set; } = new List<product_return>();
}
