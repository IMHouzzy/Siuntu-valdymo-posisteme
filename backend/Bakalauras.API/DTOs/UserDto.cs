namespace Bakalauras.API.Dtos
{
    public class CreateUserDto
    {
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
        /// Maps to company_users.position.
        /// Use "ADMIN", "OWNER", or "COURIER" to grant those roles;
        /// anything else (e.g. "Warehouse manager") gets role = STAFF.
        /// </summary>
        public string? Position { get; set; }
        public DateTime? StartDate { get; set; }
        /// <summary>Defaults to true. Pass false to create an inactive employee.</summary>
        public bool Active { get; set; } = true;  // not nullable — avoids null-check in controller
    }
}