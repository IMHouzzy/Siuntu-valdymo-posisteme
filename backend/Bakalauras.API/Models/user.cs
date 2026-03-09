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

    public string authProvider { get; set; } = null!;

    public int? fk_Companyid_Company { get; set; }

    public bool isMasterAdmin { get; set; }

    public virtual ICollection<client_company> client_companies { get; set; } = new List<client_company>();

    public virtual ICollection<company_user> company_users { get; set; } = new List<company_user>();

    public virtual company? fk_Companyid_CompanyNavigation { get; set; }

    public virtual ICollection<order> orders { get; set; } = new List<order>();

    public virtual ICollection<product_return> product_returnfk_Adminid_UsersNavigations { get; set; } = new List<product_return>();

    public virtual ICollection<product_return> product_returnfk_Clientid_UsersNavigations { get; set; } = new List<product_return>();
}
