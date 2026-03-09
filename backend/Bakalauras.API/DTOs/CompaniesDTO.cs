namespace Bakalauras.API.Dtos
{
    public class CompanyUpsertDto
    {
        public string Name { get; set; } = "";
        public string CompanyCode { get; set; } = "";
        public bool Active { get; set; } = true;
        public string? ShippingAddress { get; set; }
        public string? ReturnAddress { get; set; }
        public string DocumentCode { get; set; } = "";
        public string PhoneNumber { get; set; } = "";
        public string Address { get; set; } = "";
        public string Email { get; set; } = "";
        public string? Image { get; set; }
    }

    /// <summary>
    /// Used for POST /members (add) and PUT /members/{userId} (update role).
    /// Position and StartDate are only relevant for STAFF / ADMIN / OWNER roles.
    /// </summary>
    public class MemberUpsertDto
    {
        public int UserId { get; set; }

        /// <summary>OWNER | ADMIN | STAFF | CLIENT</summary>
        public string Role { get; set; } = "STAFF";

        /// <summary>Free-text job title stored in company_users.position (nullable).</summary>
        public string? Position { get; set; }

        /// <summary>Hire / assignment date stored in company_users.startDate (nullable).</summary>
        public DateTime? StartDate { get; set; }
    }

    public class AssignableUserDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = "";
        public string Name { get; set; } = "";
        public string Surname { get; set; } = "";
    }
}