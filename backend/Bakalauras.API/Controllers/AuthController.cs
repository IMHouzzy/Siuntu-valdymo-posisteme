using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc;

using Bakalauras.API.Models;

using Bakalauras.API.Data;
using Bakalauras.API.Dtos;

[ApiController]
[Route("api/auth/")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly JwtService _jwtService;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext db, JwtService jwtService, IConfiguration config)
    {
        _db = db;
        _jwtService = jwtService;
        _config = config;
    }


    [HttpPost("register")]
    public IActionResult Register(RegisterDto dto)
    {
        var user = new users
        {
            email = dto.Email,
            password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            name = dto.Name,
            surname = dto.Surname,
            authProvider = "LOCAL",
            creationDate = DateTime.Now
        };

        _db.users.Add(user);
        _db.SaveChanges();

        var token = _jwtService.GenerateToken(user);
        return Ok(new { token });
    }

    [HttpPost("login")]
    public IActionResult Login(LoginDto dto)
    {
        var user = _db.users.FirstOrDefault(u => u.email == dto.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.password))
            return Unauthorized();

        var token = _jwtService.GenerateToken(user);
        return Ok(new { token });
    }



    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin(GoogleLoginDto dto)
    {
        var payload = await GoogleJsonWebSignature.ValidateAsync(
            dto.IdToken,
            new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { _config["GoogleAuth:ClientId"] }
            });

        var user = _db.users.FirstOrDefault(u => u.googleId == payload.Subject);

        if (user == null)
{
    user = new users
    {
        email = payload.Email ?? $"unknown{Guid.NewGuid()}@google.com",
        name = payload.GivenName ?? "Unknown",
        surname = payload.FamilyName ?? "Unknown",
        googleId = payload.Subject,
        authProvider = "GOOGLE",
        creationDate = DateTime.Now,
        password = Guid.NewGuid().ToString(),
        phoneNumber = ""
    };

    _db.users.Add(user);
    _db.SaveChanges();
}


        var token = _jwtService.GenerateToken(user);
        return Ok(new { token });
    }
}