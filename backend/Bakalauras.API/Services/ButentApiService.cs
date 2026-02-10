using System.Text.Json;
public class ButentApiService
{
    private readonly HttpClient _http;

    public ButentApiService(HttpClient http)
    {
        _http = http;
    }
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public async Task<List<ButentClientDto>> GetClientsAsync()
    {
        var response = await _http.GetAsync("client");
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();

        var wrapper = JsonSerializer.Deserialize<ButentClientResponse>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        return wrapper?.Clients ?? new List<ButentClientDto>();
    }
    public async Task<List<ButentProductDto>> GetProductsAsync(CancellationToken ct = default)
    {
        var response = await _http.GetAsync("good", ct); // endpoint is "good"
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync(ct);

        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var wrapper = JsonSerializer.Deserialize<ButentGoodsResponse>(json, options);

        return wrapper?.Goods ?? new List<ButentProductDto>();
    }

   public async Task<List<ButentSaleDocDto>> GetSalesAsync(string dateFrom, CancellationToken ct)
    {
        var res = await _http.GetAsync($"trade/sale?dateFrom={Uri.EscapeDataString(dateFrom)}", ct);
        res.EnsureSuccessStatusCode();

        var json = await res.Content.ReadAsStringAsync(ct);
        var opt = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        var wrapper = JsonSerializer.Deserialize<ButentSalesResponse>(json, opt);
        return wrapper?.Documents ?? new();
    }

    public async Task<ButentDocumentDto> GetDocumentAsync(int id, CancellationToken ct)
    {
        var res = await _http.GetAsync($"document?id={id}", ct);
        res.EnsureSuccessStatusCode();

        var json = await res.Content.ReadAsStringAsync(ct);
        var opt = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        var wrapper = JsonSerializer.Deserialize<ButentDocumentResponse>(json, opt);
        return wrapper?.Documents?.FirstOrDefault();
    }

    public async Task<List<ButentItemDto>> GetDocumentItemsAsync(int id, CancellationToken ct)
    {
        var res = await _http.GetAsync($"document/{id}/item", ct);
        res.EnsureSuccessStatusCode();

        var json = await res.Content.ReadAsStringAsync(ct);
        var opt = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        var wrapper = JsonSerializer.Deserialize<ButentItemsResponse>(json, opt);
        return wrapper?.Items ?? new();
    }
}

