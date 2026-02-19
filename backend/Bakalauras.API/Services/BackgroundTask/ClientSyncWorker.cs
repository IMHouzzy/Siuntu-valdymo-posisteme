using Bakalauras.API.Models;
using Microsoft.EntityFrameworkCore;

public class ClientSyncWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ButentApiService _butentApi;

    public ClientSyncWorker(
        IServiceScopeFactory scopeFactory,
        ButentApiService butentApi)
    {
        _scopeFactory = scopeFactory;
        _butentApi = butentApi;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await SyncClients();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error syncing clients: {ex}");
            }

            await Task.Delay(TimeSpan.FromMinutes(60), stoppingToken);
        }
    }

    private async Task SyncClients()
{
    using var scope = _scopeFactory.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    var externalClients = await _butentApi.GetClientsAsync();
    Console.WriteLine($"External clients from API: {externalClients.Count}");

    // Get existing clients by externalClientId
    var existingClientIds = await db.clients
        .Select(c => c.externalClientId)
        .ToListAsync();

    var newClients = externalClients
        .Where(ext => !existingClientIds.Contains(ext.ClientID))
        .ToList();

    Console.WriteLine($"New clients to add: {newClients.Count}");
    if (!newClients.Any()) return;

    foreach (var ext in newClients)
    {
        var existingUser = await db.users
            .FirstOrDefaultAsync(u => u.email == $"klientas{ext.ClientID}@gmail.com");

        if (existingUser == null)
        {
            existingUser = new user
            {
                email = $"klientas{ext.ClientID}@gmail.com",
                password = BCrypt.Net.BCrypt.HashPassword("123"),
                name = ext.Name,
                surname = "Klientas",
                authProvider = "LOCAL",
                creationDate = DateTime.Now
            };
            db.users.Add(existingUser);
            await db.SaveChangesAsync(); 
        }

        var clientToAdd = new client
        {
            id_Users = existingUser.id_Users, 
            externalClientId = ext.ClientID,
            deliveryAddress = ext.Address ?? string.Empty,
            city = ext.City ?? string.Empty,
            country = ext.Country ?? string.Empty,
            vat = ext.Vat,
            bankCode = int.TryParse(ext.BankCode, out var b) ? b : null,
            daysBuyer = ext.DaysBuyer,
            daysSupplier = ext.DaysSupplier,
            maxDebt = ext.MaxDebt
        };

        db.clients.Add(clientToAdd);
    }

    await db.SaveChangesAsync();
    Console.WriteLine($"Sync complete: added {newClients.Count} clients.");
}


}
