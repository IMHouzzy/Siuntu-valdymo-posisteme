using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class employee
{
    public string position { get; set; } = null!;

    public DateTime startDate { get; set; }

    public bool? active { get; set; }

    public int id_Users { get; set; }

    public virtual user id_UsersNavigation { get; set; } = null!;
}
