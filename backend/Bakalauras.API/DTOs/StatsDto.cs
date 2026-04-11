public class StatsResponseDto
{
    public List<ChartPointDto> Orders { get; set; } = new();
    public List<ChartPointDto> Revenue { get; set; } = new();
    public List<ChartPointDto> Shipments { get; set; } = new();
    public List<ChartPointDto> Returns { get; set; } = new();
    public List<ChartPointDto> Clients { get; set; } = new();
}

public class ChartPointDto
{
    public DateTime Label { get; set; }
    public int Count { get; set; }
    public decimal? Revenue { get; set; }
}