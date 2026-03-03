using Bakalauras.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Bakalauras.API.Models;

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
            .Include(u => u.employee)
            .Include(u => u.admin)
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
                },

                employee = u.employee == null ? null : new
                {
                    u.employee.position,
                    u.employee.startDate,
                    u.employee.active
                },

                admin = u.admin == null ? null : new
                {
                    // gali palikti taip, bet geriau duoti kažką prasmingo
                    u.admin.id_Users
                }
            })
            .ToListAsync();

        return Ok(usersWithClients);
    }
    [HttpPost("createUser")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest("Email is required.");

        var exists = await _db.users.AnyAsync(u => u.email == dto.Email);
        if (exists)
            return Conflict("User with this email already exists.");

        await using var tx = await _db.Database.BeginTransactionAsync();

        try
        {
            // 1) Create base user
            var user = new user
            {
                name = dto.Name,
                surname = dto.Surname,
                email = dto.Email,
                phoneNumber = dto.PhoneNumber,
                password = null,
                authProvider = "LOCAL",
                creationDate = DateTime.Now
            };

            _db.users.Add(user);
            await _db.SaveChangesAsync();


            if (dto.IsClient)
            {
                var client = new client
                {
                    id_Users = user.id_Users,
                    deliveryAddress = dto.DeliveryAddress,
                    city = dto.City,
                    country = dto.Country,
                    vat = dto.Vat,
                    bankCode = dto.BankCode,


                };

                _db.clients.Add(client);
                await _db.SaveChangesAsync();
            }

            if (dto.IsEmployee)
            {
                if (string.IsNullOrWhiteSpace(dto.Position))
                    return BadRequest("Position is required when IsEmployee is true.");

                var emp = new employee
                {
                    id_Users = user.id_Users,
                    position = dto.Position,
                    startDate = dto.StartDate ?? DateTime.Now,
                    active = dto.Active
                };

                _db.employees.Add(emp);
                await _db.SaveChangesAsync();


                if (dto.Position == "ADMIN")
                {
                    var admin = new admin
                    {
                        id_Users = user.id_Users
                    };

                    _db.admins.Add(admin);
                    await _db.SaveChangesAsync();
                }
            }

            await tx.CommitAsync();

            return Ok(new { userId = user.id_Users });
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return StatusCode(500, ex.Message);
        }
    }
    [HttpGet("user/{id}")]
    public async Task<IActionResult> GetUser(int id)
    {
        var user = await _db.users.FirstOrDefaultAsync(u => u.id_Users == id);
        if (user == null) return NotFound();

        var client = await _db.clients.FirstOrDefaultAsync(c => c.id_Users == id);
        var employee = await _db.employees.FirstOrDefaultAsync(e => e.id_Users == id);
        var admin = await _db.admins.FirstOrDefaultAsync(a => a.id_Users == id);

        return Ok(new
        {
            id = user.id_Users,
            name = user.name,
            surname = user.surname,
            email = user.email,
            phoneNumber = user.phoneNumber,

            isClient = client != null,
            deliveryAddress = client?.deliveryAddress,
            city = client?.city,
            country = client?.country,
            vat = client?.vat,
            bankCode = client?.bankCode,

            isEmployee = employee != null,
            position = employee?.position,
            startDate = employee?.startDate,
            active = employee?.active ?? false,

            isAdmin = admin != null
        });
    }

    [HttpPut("editUser/{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] CreateUserDto dto)
    {
        var user = await _db.users.FirstOrDefaultAsync(u => u.id_Users == id);
        if (user == null) return NotFound();

        await using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            // base user
            user.name = dto.Name;
            user.surname = dto.Surname;
            user.email = dto.Email;
            user.phoneNumber = dto.PhoneNumber;

            await _db.SaveChangesAsync();

            // CLIENT
            var client = await _db.clients.FirstOrDefaultAsync(c => c.id_Users == id);
            if (dto.IsClient)
            {
                if (client == null)
                {
                    client = new client { id_Users = id, userId = id }; // if userId exists
                    _db.clients.Add(client);
                }

                client.deliveryAddress = dto.DeliveryAddress;
                client.city = dto.City;
                client.country = dto.Country;
                client.vat = dto.Vat;
                client.bankCode = dto.BankCode;
            }
            else
            {
                if (client != null) _db.clients.Remove(client);
            }

            // EMPLOYEE
            var employee = await _db.employees.FirstOrDefaultAsync(e => e.id_Users == id);
            if (dto.IsEmployee)
            {
                if (employee == null)
                {
                    employee = new employee { id_Users = id };
                    _db.employees.Add(employee);
                }

                employee.position = dto.Position;
                employee.startDate = dto.StartDate ?? DateTime.Now;
                employee.active = dto.Active;
            }
            else
            {
                if (employee != null) _db.employees.Remove(employee);
            }

            await _db.SaveChangesAsync();

            // ADMIN row based on employee position
            var admin = await _db.admins.FirstOrDefaultAsync(a => a.id_Users == id);
            var shouldBeAdmin = dto.IsEmployee && dto.Position == "ADMIN";

            if (shouldBeAdmin && admin == null)
            {
                _db.admins.Add(new admin { id_Users = id });
            }
            if (!shouldBeAdmin && admin != null)
            {
                _db.admins.Remove(admin);
            }

            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            return Ok();
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return StatusCode(500, ex.InnerException?.Message ?? ex.Message);
        }
    }

    [HttpDelete("deleteUser/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _db.users.FirstOrDefaultAsync(u => u.id_Users == id);
        if (user == null) return NotFound();

        await using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            var admin = await _db.admins.FirstOrDefaultAsync(a => a.id_Users == id);
            if (admin != null) _db.admins.Remove(admin);

            var employee = await _db.employees.FirstOrDefaultAsync(e => e.id_Users == id);
            if (employee != null) _db.employees.Remove(employee);

            var client = await _db.clients.FirstOrDefaultAsync(c => c.id_Users == id);
            if (client != null) _db.clients.Remove(client);

            _db.users.Remove(user);

            await _db.SaveChangesAsync();
            await tx.CommitAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return StatusCode(500, ex.InnerException?.Message ?? ex.Message);
        }
    }


}


