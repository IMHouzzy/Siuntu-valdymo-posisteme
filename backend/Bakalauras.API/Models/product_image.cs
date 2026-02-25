using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class product_image
{
    public int id_ProductImage { get; set; }

    public int fk_Productid_Product { get; set; }

    public string url { get; set; } = null!;

    public bool isPrimary { get; set; }

    public DateTime createdAt { get; set; }

    public int sortOrder { get; set; }

    public virtual product fk_Productid_ProductNavigation { get; set; } = null!;
}
