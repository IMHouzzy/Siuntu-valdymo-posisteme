namespace Bakalauras.API.Dtos
{
public class UpdateProfileInfoDto
{
    public string? Name { get; set; }
    public string? Surname { get; set; }
    public string? PhoneNumber { get; set; }

    public string? DeliveryAddress { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? Vat { get; set; }
    public int? BankCode { get; set; }
}

    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; } = "";
        public string NewPassword { get; set; } = "";
    }
}