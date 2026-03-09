namespace Bakalauras.API.Dtos
{
    public sealed class CompanyIntegrationUpsertDto
    {
        public string Type { get; set; } = "BUTENT";
        public string? BaseUrl { get; set; }
        public string Username { get; set; } = "";
        public string Password { get; set; } = "";
        public bool Enabled { get; set; } = true;
    }

    public sealed class CompanyIntegrationViewDto
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public string Type { get; set; } = "";
        public string? BaseUrl { get; set; }
        public bool Enabled { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}