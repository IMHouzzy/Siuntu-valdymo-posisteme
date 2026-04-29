using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Bakalauras.API.Services;
using Bakalauras.API.Models;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace Bakalauras.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SyncController : ControllerBase
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IHttpClientFactory _httpClientFactory;

    public SyncController(IServiceScopeFactory scopeFactory, IHttpClientFactory httpClientFactory)
    {
        _scopeFactory = scopeFactory;
        _httpClientFactory = httpClientFactory;
    }

    /// <summary>
    /// Check if the company has Butent integration configured
    /// </summary>
    [HttpGet("check-integration/{companyId}")]
    public async Task<ActionResult<SyncIntegrationCheckDto>> CheckIntegration(int companyId)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var integration = await db.company_integrations
            .Where(x => x.fk_Companyid_Company == companyId && x.type == "BUTENT")
            .FirstOrDefaultAsync();

        if (integration == null)
        {
            return Ok(new SyncIntegrationCheckDto
            {
                IsConfigured = false,
                IsEnabled = false,
                Message = "Būtent integracija nėra sukonfigūruota"
            });
        }

        var (u, p, b) = IntegrationSecrets.TryUnpack(integration.encryptedSecrets);
        var baseUrl = !string.IsNullOrWhiteSpace(integration.baseUrl) ? integration.baseUrl : b;

        if (string.IsNullOrWhiteSpace(baseUrl) || string.IsNullOrWhiteSpace(u) || string.IsNullOrWhiteSpace(p))
        {
            return Ok(new SyncIntegrationCheckDto
            {
                IsConfigured = false,
                IsEnabled = (bool)integration.enabled,
                Message = "Būtent integracijos duomenys nepilni"
            });
        }

        return Ok(new SyncIntegrationCheckDto
        {
            IsConfigured = true,
            IsEnabled = (bool)integration.enabled,
            BaseUrl = baseUrl,
            Message = (bool)integration.enabled ? "Integracija aktyvi" : "Integracija sustabdyta"
        });
    }

    /// <summary>
    /// Start manual synchronization and get conflicts
    /// </summary>
    [HttpPost("start/{companyId}")]
    public async Task<ActionResult<SyncSessionDto>> StartSync(int companyId)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Verify integration
        var integration = await db.company_integrations
            .Where(x => x.fk_Companyid_Company == companyId && x.type == "BUTENT" && x.enabled == true)
            .FirstOrDefaultAsync();

        if (integration == null)
        {
            return BadRequest(new { message = "Būtent integracija neaktyvi arba nesukonfigūruota" });
        }

        var (u, p, b) = IntegrationSecrets.TryUnpack(integration.encryptedSecrets);
        var baseUrl = !string.IsNullOrWhiteSpace(integration.baseUrl) ? integration.baseUrl : b;

        if (string.IsNullOrWhiteSpace(baseUrl) || string.IsNullOrWhiteSpace(u) || string.IsNullOrWhiteSpace(p))
        {
            return BadRequest(new { message = "Būtent integracijos duomenys nepilni" });
        }

        try
        {
            var syncService = new SyncComparisonService(_scopeFactory, _httpClientFactory);
            var session = await syncService.CompareAllData(companyId, baseUrl!, u!, p!);

            return Ok(session);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Sinchronizacijos klaida: {ex.Message}" });
        }
    }

    /// <summary>
    /// Apply selected resolutions to conflicts
    /// </summary>
    [HttpPost("resolve")]
    public async Task<ActionResult<SyncReportDto>> ResolveConflicts([FromBody] SyncResolutionRequestDto request)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        try
        {
            var syncService = new SyncComparisonService(_scopeFactory, _httpClientFactory);
            var report = await syncService.ApplyResolutions(request);

            return Ok(report);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Taikymo klaida: {ex.Message}" });
        }
    }
}

