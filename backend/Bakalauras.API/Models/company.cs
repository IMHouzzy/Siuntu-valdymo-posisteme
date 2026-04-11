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

    public string? shippingStreet { get; set; }

    public string? shippingCity { get; set; }

    public string? shippingPostalCode { get; set; }

    public string shippingCountry { get; set; } = null!;

    public string? returnAddress { get; set; }

    public string? returnStreet { get; set; }

    public string? returnCity { get; set; }

    public string? returnPostalCode { get; set; }

    public string returnCountry { get; set; } = null!;

    public string documentCode { get; set; } = null!;

    public string phoneNumber { get; set; } = null!;

    public string address { get; set; } = null!;

    public string email { get; set; } = null!;

    public string? image { get; set; }

    public virtual ICollection<client_company> client_companies { get; set; } = new List<client_company>();

    public virtual ICollection<company_integration> company_integrations { get; set; } = new List<company_integration>();

    public virtual ICollection<company_user> company_users { get; set; } = new List<company_user>();

    public virtual ICollection<courier> couriers { get; set; } = new List<courier>();

    public virtual ICollection<notification> notifications { get; set; } = new List<notification>();

    public virtual ICollection<order> orders { get; set; } = new List<order>();

    public virtual ICollection<product_return> product_returns { get; set; } = new List<product_return>();

    public virtual ICollection<product> products { get; set; } = new List<product>();

    public virtual ICollection<shipment> shipments { get; set; } = new List<shipment>();

    public virtual ICollection<user> users { get; set; } = new List<user>();
}
