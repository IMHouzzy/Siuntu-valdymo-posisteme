// Program.cs
using System.Net.Http.Headers;
using System.Text;
using Bakalauras.API.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QuestPDF.Infrastructure;



var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("Default"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("Default"))
    )
);

// JWT service
builder.Services.AddScoped<JwtService>();

// Optional but often useful
builder.Services.AddHttpContextAccessor();

// Auth
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
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// Butent API client
builder.Services.AddHttpClient();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("LocalDev", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
        // .AllowCredentials(); // ✅ tik jei naudoji cookies. Su Bearer dažniausiai nereikia
    });
});
QuestPDF.Settings.License = LicenseType.Community;
// Workers
builder.Services.AddHostedService<ClientSyncWorker>();
builder.Services.AddHostedService<ProductSyncWorker>();
builder.Services.AddHostedService<OrderSyncWorker>();

var app = builder.Build();

// ✅ svarbi tvarka:
app.UseRouting();

app.UseCors("LocalDev"); // ✅ po routing, prieš auth

app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();