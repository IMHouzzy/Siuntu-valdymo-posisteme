using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class company
{
    public int id_Company { get; set; }

    public string name { get; set; } = null!;

    public string companyCode { get; set; } = null!;

    public bool? active { get; set; }

    public DateTime creationDate { get; set; }

    public string? shippingAddress { get; set; }

    public string? returnAddress { get; set; }

    public string documentCode { get; set; } = null!;

    public string phoneNumber { get; set; } = null!;

    public string address { get; set; } = null!;

    public string email { get; set; } = null!;

    public string image { get; set; } = null!;

    public virtual ICollection<company_user> company_users { get; set; } = new List<company_user>();

    public virtual ICollection<order> orders { get; set; } = new List<order>();

    public virtual ICollection<product_return> product_returns { get; set; } = new List<product_return>();

    public virtual ICollection<product> products { get; set; } = new List<product>();

    public virtual ICollection<shipment> shipments { get; set; } = new List<shipment>();

    public virtual ICollection<user> users { get; set; } = new List<user>();
}
