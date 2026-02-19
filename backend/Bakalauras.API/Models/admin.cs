using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class admin
{
    public int id_Users { get; set; }

    public virtual user id_UsersNavigation { get; set; } = null!;
}
