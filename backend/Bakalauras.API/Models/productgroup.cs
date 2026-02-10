using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class productgroup
{
    public int id_ProductGroup { get; set; }

    public string name { get; set; } = null!;

    public virtual ICollection<product> fk_Productid_Products { get; set; } = new List<product>();
}
