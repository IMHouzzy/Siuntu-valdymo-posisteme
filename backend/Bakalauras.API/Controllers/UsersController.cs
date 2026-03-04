using Bakalauras.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/users/")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;

    public UsersController(AppDbContext db)
    {
        _db = db;
    }

    // -------- Helpers --------

    private int GetRequiredCompanyId()
    {
        var companyId = User.GetCompanyId();
        if (companyId <= 0)
            throw new UnauthorizedAccessException("No active company selected.");
        return companyId;
    }

    private Task<bool> UserBelongsToCompany(int companyId, int userId)
        => _db.company_users.AnyAsync(cu =>
            cu.fk_Companyid_Company == companyId &&
            cu.fk_Usersid_Users == userId);

    // -------- Endpoints --------

    [HttpGet("allUsers")]
    public async Task<IActionResult> GetAllUsers()
    {
        int companyId;
        try { companyId = GetRequiredCompanyId(); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }

        var users = await _db.users
            .AsNoTracking()
            .Where(u => _db.company_users.Any(cu =>
                cu.fk_Companyid_Company == companyId &&
                cu.fk_Usersid_Users == u.id_Users))
            .Select(u => new
            {
                u.id_Users,
                u.name,
                u.surname,
                u.email,
                u.phoneNumber,
                u.creationDate,
                u.authProvider,
                u.fk_Companyid_Company,
                u.isMasterAdmin
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("allUsersWithClients")]
    public async Task<IActionResult> GetAllUsersWithClients()
    {
        int companyId;
        try { companyId = GetRequiredCompanyId(); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }

        var q = _db.users
            .AsNoTracking()
            .Where(u => _db.company_users.Any(cu =>
                cu.fk_Companyid_Company == companyId &&
                cu.fk_Usersid_Users == u.id_Users))
            .Include(u => u.client)
            .Include(u => u.employee)
            .Include(u => u.admin);

        var usersWithClients = await q
            .Select(u => new
            {
                u.id_Users,
                u.name,
                u.surname,
                u.email,
                u.phoneNumber,
                u.creationDate,
                u.authProvider,
                u.fk_Companyid_Company,

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
                    u.admin.id_Users
                }
            })
            .ToListAsync();

        return Ok(usersWithClients);
    }

    [HttpPost("createUser")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
    {
        int companyId;
        try { companyId = GetRequiredCompanyId(); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }

        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest("Email is required.");

        var exists = await _db.users.AnyAsync(u => u.email == dto.Email);
        if (exists)
            return Conflict("User with this email already exists.");

        await using var tx = await _db.Database.BeginTransactionAsync();

        try
        {
            // 1) Create base user and set active company
            var user = new user
            {
                name = dto.Name,
                surname = dto.Surname,
                email = dto.Email,
                phoneNumber = dto.PhoneNumber,
                password = null,
                authProvider = "LOCAL",
                creationDate = DateTime.Now,
                fk_Companyid_Company = companyId, // ✅ always set selected company
                isMasterAdmin = false
            };

            _db.users.Add(user);
            await _db.SaveChangesAsync();

            // 2) Link user to company via company_users (membership)
            var role = dto.IsEmployee
                ? (dto.Position ?? "EMPLOYEE")
                : (dto.IsClient ? "CLIENT" : "USER");

            _db.company_users.Add(new company_user
            {
                fk_Companyid_Company = companyId,
                fk_Usersid_Users = user.id_Users,
                role = role
            });

            await _db.SaveChangesAsync();

            // 3) Client
            if (dto.IsClient)
            {
                var client = new client
                {
                    id_Users = user.id_Users,
                    deliveryAddress = dto.DeliveryAddress,
                    city = dto.City,
                    country = dto.Country,
                    vat = dto.Vat,
                    bankCode = dto.BankCode
                };
                _db.clients.Add(client);
                await _db.SaveChangesAsync();

                // client_company membership row
                _db.client_companies.Add(new client_company
                {
                    fk_Clientid_Users = user.id_Users,
                    fk_Companyid_Company = companyId,
                    externalClientId = null,
                    deliveryAddress = dto.DeliveryAddress,
                    city = dto.City,
                    country = dto.Country,
                    vat = dto.Vat,
                    bankCode = dto.BankCode
                });
                await _db.SaveChangesAsync();
            }

            // 4) Employee + optional Admin row
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
                    _db.admins.Add(new admin { id_Users = user.id_Users });
                    await _db.SaveChangesAsync();
                }
            }

            await tx.CommitAsync();
            return Ok(new { userId = user.id_Users });
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return StatusCode(500, ex.InnerException?.Message ?? ex.Message);
        }
    }

    [HttpGet("user/{id:int}")]
    public async Task<IActionResult> GetUser(int id)
    {
        int companyId;
        try { companyId = GetRequiredCompanyId(); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }

        // ✅ enforce tenant isolation for everyone (including master)
        if (!await UserBelongsToCompany(companyId, id))
            return StatusCode(403, "User is not in your company.");

        var user = await _db.users.AsNoTracking().FirstOrDefaultAsync(u => u.id_Users == id);
        if (user == null) return NotFound();

        var client = await _db.clients.AsNoTracking().FirstOrDefaultAsync(c => c.id_Users == id);
        var employee = await _db.employees.AsNoTracking().FirstOrDefaultAsync(e => e.id_Users == id);
        var admin = await _db.admins.AsNoTracking().FirstOrDefaultAsync(a => a.id_Users == id);

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

    [HttpPut("editUser/{id:int}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] CreateUserDto dto)
    {
        int companyId;
        try { companyId = GetRequiredCompanyId(); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }

        // ✅ tenant isolation for everyone
        if (!await UserBelongsToCompany(companyId, id))
            return StatusCode(403, "User is not in your company.");

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

            // keep the user's active company aligned with selected company (optional, but consistent)
            user.fk_Companyid_Company = companyId;

            await _db.SaveChangesAsync();

            // CLIENT
            var client = await _db.clients.FirstOrDefaultAsync(c => c.id_Users == id);
            if (dto.IsClient)
            {
                if (client == null)
                {
                    client = new client { id_Users = id, userId = id };
                    _db.clients.Add(client);
                }

                client.deliveryAddress = dto.DeliveryAddress;
                client.city = dto.City;
                client.country = dto.Country;
                client.vat = dto.Vat;
                client.bankCode = dto.BankCode;

                // ensure client_company exists/updated for selected company
                var cc = await _db.client_companies.FirstOrDefaultAsync(x =>
                    x.fk_Companyid_Company == companyId && x.fk_Clientid_Users == id);

                if (cc == null)
                {
                    _db.client_companies.Add(new client_company
                    {
                        fk_Clientid_Users = id,
                        fk_Companyid_Company = companyId,
                        externalClientId = client.externalClientId,
                        deliveryAddress = dto.DeliveryAddress,
                        city = dto.City,
                        country = dto.Country,
                        vat = dto.Vat,
                        bankCode = dto.BankCode
                    });
                }
                else
                {
                    cc.deliveryAddress = dto.DeliveryAddress;
                    cc.city = dto.City;
                    cc.country = dto.Country;
                    cc.vat = dto.Vat;
                    cc.bankCode = dto.BankCode;
                }
            }
            else
            {
                if (client != null) _db.clients.Remove(client);

                // remove client_company link for this company
                var cc = await _db.client_companies.FirstOrDefaultAsync(x =>
                    x.fk_Companyid_Company == companyId && x.fk_Clientid_Users == id);
                if (cc != null) _db.client_companies.Remove(cc);
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

                employee.position = dto.Position ?? employee.position;
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

            if (shouldBeAdmin && admin == null) _db.admins.Add(new admin { id_Users = id });
            if (!shouldBeAdmin && admin != null) _db.admins.Remove(admin);

            // company_users role update for selected company
            var cu = await _db.company_users.FirstOrDefaultAsync(x =>
                x.fk_Companyid_Company == companyId && x.fk_Usersid_Users == id);

            if (cu != null)
            {
                cu.role = dto.IsEmployee
                    ? (dto.Position ?? "EMPLOYEE")
                    : (dto.IsClient ? "CLIENT" : "USER");
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

    [HttpDelete("deleteUser/{id:int}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        int companyId;
        try { companyId = GetRequiredCompanyId(); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }

        // ✅ tenant isolation for everyone
        if (!await UserBelongsToCompany(companyId, id))
            return StatusCode(403, "User is not in your company.");

        var user = await _db.users.FirstOrDefaultAsync(u => u.id_Users == id);
        if (user == null) return NotFound();

        await using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            // remove role tables if present
            var admin = await _db.admins.FirstOrDefaultAsync(a => a.id_Users == id);
            if (admin != null) _db.admins.Remove(admin);

            var employee = await _db.employees.FirstOrDefaultAsync(e => e.id_Users == id);
            if (employee != null) _db.employees.Remove(employee);

            var client = await _db.clients.FirstOrDefaultAsync(c => c.id_Users == id);
            if (client != null) _db.clients.Remove(client);

            // remove tenant links for this user (all companies)
            var cus = await _db.company_users.Where(x => x.fk_Usersid_Users == id).ToListAsync();
            _db.company_users.RemoveRange(cus);

            var ccs = await _db.client_companies.Where(x => x.fk_Clientid_Users == id).ToListAsync();
            _db.client_companies.RemoveRange(ccs);

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