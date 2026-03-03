using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class return_status_type
{
    public int id_ReturnStatusType { get; set; }

    public string name { get; set; } = null!;

    public virtual ICollection<product_return> product_returns { get; set; } = new List<product_return>();
}
