using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class client
{
    public int id_Users { get; set; }

    public string? deliveryAddress { get; set; }

    public string? city { get; set; }

    public string? country { get; set; }

    public long? code { get; set; }

    public string? vat { get; set; }

    public int? bankCode { get; set; }

    public int? daysBuyer { get; set; }

    public int? daysSupplier { get; set; }

    public int? maxDebt { get; set; }

    public int? externalClientId { get; set; }

    public int? userId { get; set; }

    public virtual user id_UsersNavigation { get; set; } = null!;

    public virtual ICollection<order> orders { get; set; } = new List<order>();
}
