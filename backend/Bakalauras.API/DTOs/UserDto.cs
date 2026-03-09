namespace Bakalauras.API.Dtos
{
    public class CreateUserDto
    {
        // Base user
        public string Name { get; set; } = "";
        public string Surname { get; set; } = "";
        public string Email { get; set; } = "";
        public string? PhoneNumber { get; set; }

        public bool IsClient { get; set; }
        public bool IsEmployee { get; set; }

        // Client fields (only used when IsClient = true)
        public string? DeliveryAddress { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public string? Vat { get; set; }
        public int? BankCode { get; set; }

        // Employee fields (only used when IsEmployee = true)
        /// <summary>
        /// Maps to company_users.position. Use "ADMIN" or "OWNER" to grant admin rights.
        /// Any other value (e.g. "STAFF", "Warehouse manager") gets role = STAFF.
        /// </summary>
        public string? Position { get; set; }
        public DateTime? StartDate { get; set; }

        /// <summary>
        /// Nullable so the caller can omit it (defaults to true on the server).
        /// Pass false to create an inactive employee.
        /// </summary>
        public bool? Active { get; set; }
    }
}