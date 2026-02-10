using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class orderstatus
{
    public int id_OrderStatus { get; set; }

    public string name { get; set; } = null!;

    public virtual ICollection<order> orders { get; set; } = new List<order>();
}
