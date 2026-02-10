using Bakalauras.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Bakalauras.API.Data;

[ApiController]
[Route("api/users/")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;

    public UsersController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("allUsers")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _db.users
            .Select(u => new
            {
                u.id_Users,
                u.name,
                u.surname,
                u.email,
                u.phoneNumber,
                u.creationDate,
                u.authProvider
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("allUsersWithClients")]
    public async Task<IActionResult> GetAllUsersWithClients()
    {
        var usersWithClients = await _db.users
            .Include(u => u.client)
            .Select(u => new
            {
                u.id_Users,
                u.name,
                u.surname,
                u.email,
                u.phoneNumber,
                u.creationDate,
                u.authProvider,
                client = u.client == null ? null : new
                {
                    u.client.deliveryAddress,
                    u.client.city,
                    u.client.country,
                    u.client.vat,
                    u.client.bankCode,
                    u.client.daysBuyer,
                    u.client.daysSupplier,
                    u.client.maxDebt,
                    u.client.externalClientId
                }
            })
            .ToListAsync();

        return Ok(usersWithClients);
    }


}
