using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class return_reason
{
    public int id_ReturnReason { get; set; }

    public string name { get; set; } = null!;

    public virtual ICollection<return_item> return_items { get; set; } = new List<return_item>();
}
