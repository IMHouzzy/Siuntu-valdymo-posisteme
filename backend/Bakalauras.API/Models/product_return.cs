using System;
using System.Collections.Generic;

namespace Bakalauras.API.Models;

public partial class product_return
{
    public int id_Returns { get; set; }

    public DateTime date { get; set; }

    public int fk_ReturnStatusTypeid_ReturnStatusType { get; set; }

    public int fk_Clientid_Users { get; set; }

    public int? fk_Adminid_Users { get; set; }

    public int fk_Companyid_Company { get; set; }

    public virtual user? fk_Adminid_UsersNavigation { get; set; }

    public virtual user fk_Clientid_UsersNavigation { get; set; } = null!;

    public virtual company fk_Companyid_CompanyNavigation { get; set; } = null!;

    public virtual return_status_type fk_ReturnStatusTypeid_ReturnStatusTypeNavigation { get; set; } = null!;

    public virtual ICollection<return_item> return_items { get; set; } = new List<return_item>();
}
