using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class users
{
    public int id_Users { get; set; }

    public string name { get; set; } = null!;

    public string surname { get; set; } = null!;

    public string email { get; set; } = null!;

    public string password { get; set; } = null!;

    public string? phoneNumber { get; set; }

    public DateTime creationDate { get; set; }

    public string? googleId { get; set; }

    public string? authProvider { get; set; }

    public virtual admin? admin { get; set; }

    public virtual client? client { get; set; }

    public virtual employee? employee { get; set; }
}
