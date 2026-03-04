// Program.cs
using System.Net.Http.Headers;
using System.Text;
using Bakalauras.API.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

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

            // ✅ important: maps principal.Identity.Name / NameIdentifier correctly
            NameClaimType = System.Security.Claims.ClaimTypes.NameIdentifier,

            // ✅ removes random “token expired” issues because of default 5 min skew
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// Butent API client
builder.Services.AddHttpClient<ButentApiService>(client =>
{
    client.BaseAddress = new Uri("http://94.176.235.151:3001/api/v1/");

    var username = builder.Configuration["Butent:Username"];
    var password = builder.Configuration["Butent:Password"];

    var authValue = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{username}:{password}"));
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authValue);
});

// CORS (pick ONE style: either default policy OR UseCors builder below)
// Here we register a named policy and use it.
builder.Services.AddCors(options =>
{
    options.AddPolicy("LocalReact", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Workers
builder.Services.AddHostedService<ClientSyncWorker>();
builder.Services.AddHostedService<ProductSyncWorker>();
builder.Services.AddHostedService<OrderSyncWorker>();

var app = builder.Build();

// ✅ use named cors policy
app.UseCors("LocalReact");

app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();