// JwtService.cs
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Bakalauras.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

public class JwtService
{
    private readonly IConfiguration _config;
    private readonly AppDbContext _db;

    public JwtService(IConfiguration config, AppDbContext db)
    {
        _config = config;
        _db = db;
    }

    public async Task<string> GenerateTokenAsync(user user)
    {
        if (user == null) throw new ArgumentNullException(nameof(user));

        var issuer = _config["Jwt:Issuer"];
        var audience = _config["Jwt:Audience"];
        var jwtKey = _config["Jwt:Key"];

        if (string.IsNullOrWhiteSpace(jwtKey))
            throw new InvalidOperationException("Jwt:Key is missing in configuration.");

        // memberships
        var companies = await _db.company_users
            .AsNoTracking()
            .Where(cu => cu.fk_Usersid_Users == user.id_Users)
            .Select(cu => new
            {
                id_Company = cu.fk_Companyid_Company,
                name = cu.fk_Companyid_CompanyNavigation.name,
                code = cu.fk_Companyid_CompanyNavigation.companyCode,
                role = cu.role,
                image = cu.fk_Companyid_CompanyNavigation.image
            })
            .ToListAsync();

        // pick active (based on user.fk_Companyid_Company)
        var desiredCompanyId = user.fk_Companyid_Company ?? 0;

        var active = companies.FirstOrDefault(c => c.id_Company == desiredCompanyId)
                     ?? companies.FirstOrDefault();

        var activeCompanyId = active?.id_Company ?? 0;
        var activeCompanyName = active?.name ?? "";
        var activeCompanyCode = active?.code ?? "";
        var activeCompanyRole = active?.role ?? ""; // ✅ IMPORTANT
        var activeCompanyImage = active?.image ?? "";

        var companiesJson = JsonSerializer.Serialize(companies);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.id_Users.ToString()),
            new Claim(JwtRegisteredClaimNames.Sub, user.id_Users.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.email ?? ""),

            new Claim("provider", user.authProvider ?? "LOCAL"),
            new Claim("name", user.name ?? ""),
            new Claim("surname", user.surname ?? ""),
            new Claim("fullName", $"{user.name} {user.surname}".Trim()),

            new Claim("isMasterAdmin", user.isMasterAdmin ? "1" : "0"),

            // active company
            new Claim("companyId", activeCompanyId.ToString()),
            new Claim("companyName", activeCompanyName),
            new Claim("companyCode", activeCompanyCode),

            // ✅ active role for routing/permissions
            new Claim("companyRole", activeCompanyRole),
            new Claim("companyImage", activeCompanyImage),
            // list for switching
            new Claim("companies", companiesJson),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(1), // Example: token expires in 1 day
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}