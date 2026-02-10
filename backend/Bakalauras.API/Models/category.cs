using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class category
{
    public int id_Category { get; set; }

    public string name { get; set; } = null!;

    public virtual ICollection<product> fk_Productid_Products { get; set; } = new List<product>();
}
