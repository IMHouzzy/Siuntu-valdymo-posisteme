using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class product
{
    public int id_Product { get; set; }

    public string? name { get; set; }

    public string? description { get; set; }

    public double? price { get; set; }

    public string? currency { get; set; }

    public string? picture { get; set; }

    public bool canTheProductBeProductReturned { get; set; }

    public bool countableItem { get; set; }

    public string unit { get; set; } = null!;

    public string? shipping_mode { get; set; }

    public bool vat { get; set; }

    public DateTime? creationDate { get; set; }

    public int? externalCode { get; set; }

    public int fk_Companyid_Company { get; set; }

    public virtual company fk_Companyid_CompanyNavigation { get; set; } = null!;

    public virtual ICollection<ordersproduct> ordersproducts { get; set; } = new List<ordersproduct>();

    public virtual ICollection<product_image> product_images { get; set; } = new List<product_image>();

    public virtual ICollection<category> fk_Categoryid_Categories { get; set; } = new List<category>();

    public virtual ICollection<productgroup> fk_ProductGroupId_ProductGroups { get; set; } = new List<productgroup>();
}
