using Bakalauras.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Bakalauras.API.Dtos;
[ApiController]
[Route("api/companies/{companyId:int}/integrations")]
[Authorize]
public class CompanyIntegrationsController : ControllerBase
{
    private readonly AppDbContext _db;

    public CompanyIntegrationsController(AppDbContext db)
    {
        _db = db;
    }

    private async Task<string?> GetMyRoleInCompany(int companyId, int userId)
    {
        return await _db.company_users.AsNoTracking()
            .Where(cu => cu.fk_Companyid_Company == companyId && cu.fk_Usersid_Users == userId)
            .Select(cu => cu.role)
            .FirstOrDefaultAsync();
    }

    private static bool CanManageIntegrations(string? role)
        => string.Equals(role, "OWNER", StringComparison.OrdinalIgnoreCase)
        || string.Equals(role, "ADMIN", StringComparison.OrdinalIgnoreCase);

    private async Task<bool> CanManageThisCompany(int companyId)
    {
        if (User.IsMasterAdmin()) return true;

        var activeCompanyId = User.GetCompanyId();
        if (activeCompanyId != companyId) return false;

        var userId = User.GetUserId();
        var role = await GetMyRoleInCompany(companyId, userId);
        return CanManageIntegrations(role);
    }

    // ------------------------------------------
    // LIST (be password)
    // ------------------------------------------
    [HttpGet]
    public async Task<IActionResult> List(int companyId)
    {
        if (!await CanManageThisCompany(companyId))
            return Forbid("You cannot view integrations of this company.");

        var items = await _db.company_integrations.AsNoTracking()
            .Where(x => x.fk_Companyid_Company == companyId)
            .OrderByDescending(x => x.updatedAt)
            .Select(x => new CompanyIntegrationViewDto
            {
                Id = x.id_CompanyIntegration,
                CompanyId = x.fk_Companyid_Company,
                Type = x.type,
                BaseUrl = x.baseUrl,
                Enabled = x.enabled == true,
                UpdatedAt = x.updatedAt
            })
            .ToListAsync();

        return Ok(items);
    }

    // ------------------------------------------
    // UPSERT BUTENT (1 per company by unique key)
    // ------------------------------------------
    [HttpPut("butent")]
    public async Task<IActionResult> UpsertButent(int companyId, [FromBody] CompanyIntegrationUpsertDto dto)
    {
        if (!await CanManageThisCompany(companyId))
            return Forbid("You cannot manage integrations of this company.");

        var type = (dto.Type ?? "BUTENT").Trim().ToUpperInvariant();
        if (type != "BUTENT") return BadRequest("Only BUTENT integration supported here.");

        if (string.IsNullOrWhiteSpace(dto.Username)) return BadRequest("Username required.");
        if (string.IsNullOrWhiteSpace(dto.Password)) return BadRequest("Password required.");

        var baseUrl = string.IsNullOrWhiteSpace(dto.BaseUrl) ? null : dto.BaseUrl.Trim();
        if (baseUrl != null && !Uri.TryCreate(baseUrl, UriKind.Absolute, out _))
            return BadRequest("BaseUrl invalid.");

        var secretsJson = IntegrationSecrets.Pack(dto.Username, dto.Password, baseUrl);

        var existing = await _db.company_integrations
            .FirstOrDefaultAsync(x => x.fk_Companyid_Company == companyId && x.type == type);

        if (existing == null)
        {
            existing = new company_integration
            {
                fk_Companyid_Company = companyId,
                type = type,
                baseUrl = baseUrl,
                encryptedSecrets = secretsJson,
                enabled = dto.Enabled
            };
            _db.company_integrations.Add(existing);
        }
        else
        {
            existing.baseUrl = baseUrl;
            existing.encryptedSecrets = secretsJson;
            existing.enabled = dto.Enabled;
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            companyId,
            type = existing.type,
            enabled = existing.enabled,
            baseUrl = existing.baseUrl,
            updatedAt = existing.updatedAt
        });
    }

    // ------------------------------------------
    // DISABLE BUTENT
    // ------------------------------------------
    [HttpPost("butent/disable")]
    public async Task<IActionResult> DisableButent(int companyId)
    {
        if (!await CanManageThisCompany(companyId))
            return Forbid("You cannot manage integrations of this company.");

        var existing = await _db.company_integrations
            .FirstOrDefaultAsync(x => x.fk_Companyid_Company == companyId && x.type == "BUTENT");

        if (existing == null) return NotFound("BUTENT integration not found.");

        existing.enabled = false;
        await _db.SaveChangesAsync();

        return Ok();
    }
    [HttpDelete("butent")]
    public async Task<IActionResult> DeleteButent(int companyId)
    {
        if (!await CanManageThisCompany(companyId))
            return Forbid("You cannot manage integrations of this company.");

        var existing = await _db.company_integrations
            .FirstOrDefaultAsync(x => x.fk_Companyid_Company == companyId && x.type == "BUTENT");

        if (existing == null) return NotFound("BUTENT integration not found.");

        _db.company_integrations.Remove(existing);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}