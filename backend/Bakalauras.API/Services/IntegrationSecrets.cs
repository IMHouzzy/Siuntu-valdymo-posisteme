using System.Text.Json;

public static class IntegrationSecrets
{
    public static string Pack(string username, string password, string? baseUrl)
    {
        var payload = new
        {
            username = username?.Trim(),
            password = password ?? "",
            baseUrl = baseUrl?.Trim()
        };

        return JsonSerializer.Serialize(payload);
    }

    public static (string? Username, string? Password, string? BaseUrl) TryUnpack(string encryptedSecrets)
    {
        if (string.IsNullOrWhiteSpace(encryptedSecrets))
            return (null, null, null);

        try
        {
            using var doc = JsonDocument.Parse(encryptedSecrets);
            var root = doc.RootElement;

            var u = root.TryGetProperty("username", out var uEl) ? uEl.GetString() : null;
            var p = root.TryGetProperty("password", out var pEl) ? pEl.GetString() : null;
            var b = root.TryGetProperty("baseUrl", out var bEl) ? bEl.GetString() : null;

            return (u, p, b);
        }
        catch
        {
            // fallback: "username:password"
            var parts = encryptedSecrets.Split(':', 2);
            if (parts.Length == 2) return (parts[0], parts[1], null);

            return (null, null, null);
        }
    }
}