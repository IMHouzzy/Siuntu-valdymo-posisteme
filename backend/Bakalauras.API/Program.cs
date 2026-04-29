// Program.cs
using System.Text;
using Bakalauras.API.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QuestPDF.Infrastructure;
using Bakalauras.API.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// ── DbContext ─────────────────────────────────────────────────────────────────

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("Default"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("Default"))
    )
);

// ── Services ──────────────────────────────────────────────────────────────────

builder.Services.AddScoped<IEmailService, SmtpEmailService>();
builder.Services.AddScoped<IInvoiceService, InvoiceService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<CourierProviderFactory>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient();

// ── JWT auth — reads token from httpOnly cookie ───────────────────────────────

var jwtSettings = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSettings["Key"];

if (string.IsNullOrWhiteSpace(jwtKey))
    throw new InvalidOperationException("Jwt:Key is missing in configuration.");

var keyBytes = Encoding.UTF8.GetBytes(jwtKey);

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),

            NameClaimType = System.Security.Claims.ClaimTypes.NameIdentifier,
            ClockSkew = TimeSpan.Zero,
        };

        // ── Read JWT from the httpOnly cookie instead of Authorization header ─
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                if (ctx.Request.Cookies.TryGetValue("auth_token", out var cookieToken))
                    ctx.Token = cookieToken;
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// ── CORS — credentials require an explicit origin, not a wildcard ─────────────

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy
            .WithOrigins(
                "http://localhost:3000",   // CRA
                "http://localhost:5173"    // Vite  ← add/remove as needed
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());          // required so the browser sends cookies
});

// ── Misc ──────────────────────────────────────────────────────────────────────

var encKey = builder.Configuration["Encryption:Key"]
    ?? throw new InvalidOperationException("Encryption:Key is missing.");
IntegrationSecrets.Configure(encKey);

QuestPDF.Settings.License = LicenseType.Community;

builder.Services.AddHostedService<ClientSyncWorker>();
builder.Services.AddHostedService<ProductSyncWorker>();
builder.Services.AddHostedService<OrderSyncWorker>();

// ── Pipeline ──────────────────────────────────────────────────────────────────

var app = builder.Build();

app.UseRouting();
app.UseCors("Frontend");       // must be before UseAuthentication
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();