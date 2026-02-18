public class CreateUserDto
{
    // Base user
    public string Name { get; set; }
    public string Surname { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }

    public bool IsClient { get; set; }
    public bool IsEmployee { get; set; }

    // Client fields (nullable!)
    public string? DeliveryAddress { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? Vat { get; set; }
    public int? BankCode { get; set; }

    // Employee fields (nullable!)
    public string? Position { get; set; }
    public DateTime? StartDate { get; set; }
    public bool Active { get; set; }
}
