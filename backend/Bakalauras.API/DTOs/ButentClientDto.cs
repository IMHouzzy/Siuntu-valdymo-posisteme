public class ButentClientResponse
{
    public int Count { get; set; }
    public List<ButentClientDto> Clients { get; set; }
}

public class ButentClientDto
{
    public int ClientID { get; set; } 
    public string Name { get; set; } 
    public string Code { get; set; }
    public string Vat { get; set; }
    public string BankCode { get; set; }
    public string Group { get; set; }
    public int? DaysBuyer { get; set; }
    public int? DaysSupplier { get; set; }
    public int? MaxDebt { get; set; }
    public string Address { get; set; }
    public string City { get; set; }
    public string Country { get; set; }
}
