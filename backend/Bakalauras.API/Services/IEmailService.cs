// Services/IEmailService.cs + SmtpEmailService.cs
// Wire up in Program.cs:
//   builder.Services.AddScoped<IEmailService, SmtpEmailService>();
//
// appsettings.json example:
//   "EmailSettings": {
//     "Host": "smtp.gmail.com",
//     "Port": 587,
//     "Username": "yourapp@gmail.com",
//     "Password": "yourAppPassword",
//     "FromName": "Jūsų Parduotuvė",
//     "FromAddress": "yourapp@gmail.com"
//   }

using System.Net;
using System.Net.Mail;

namespace Bakalauras.API.Services;

public interface IEmailService
{
    Task SendAsync(string to, string subject, string htmlBody);
    Task SendWithAttachmentAsync(string to, string subject, string htmlBody,
                                 string attachmentPath, string attachmentName);
    Task SendWithAttachmentsAsync(string to, string subject, string htmlBody,
                                  IEnumerable<(string path, string name)> attachments); // ← ADD
}
public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _cfg;
    private readonly ILogger<SmtpEmailService> _log;

    public SmtpEmailService(IConfiguration cfg, ILogger<SmtpEmailService> log)
    {
        _cfg = cfg;
        _log = log;
    }



    public Task SendWithAttachmentsAsync(string to, string subject, string htmlBody,
                                             IEnumerable<(string path, string name)> attachments)
            => SendCoreAsync(to, subject, htmlBody, attachments);


    private async Task SendCoreAsync(string to, string subject, string htmlBody,
                                      IEnumerable<(string path, string name)>? attachments)
    {
        var section = _cfg.GetSection("EmailSettings");
        var host = section["Host"] ?? throw new InvalidOperationException("EmailSettings:Host missing");
        var port = int.Parse(section["Port"] ?? "587");
        var user = section["Username"] ?? throw new InvalidOperationException("EmailSettings:Username missing");
        var pass = section["Password"] ?? throw new InvalidOperationException("EmailSettings:Password missing");
        var fromName = section["FromName"] ?? "System";
        var fromAddr = section["FromAddress"] ?? user;

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(user, pass),
            EnableSsl = true,
            DeliveryMethod = SmtpDeliveryMethod.Network,
        };

        using var msg = new MailMessage
        {
            From = new MailAddress(fromAddr, fromName),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true,
        };
        msg.To.Add(to);

        // Attach all files in one message
        if (attachments != null)
        {
            foreach (var (path, name) in attachments)
            {
                if (!string.IsNullOrWhiteSpace(path) && File.Exists(path))
                {
                    msg.Attachments.Add(new Attachment(path) { Name = name });
                }
            }
        }

        try
        {
            await client.SendMailAsync(msg);
            _log.LogInformation("Email sent to {To} — {Subject}", to, subject);
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "SMTP failed for {To} — {Subject}", to, subject);
            throw;
        }
    }

    // Keep old single-attachment methods working by delegating:
    public Task SendAsync(string to, string subject, string htmlBody)
        => SendCoreAsync(to, subject, htmlBody, null);

    public Task SendWithAttachmentAsync(string to, string subject, string htmlBody,
                                        string attachmentPath, string attachmentName)
        => SendCoreAsync(to, subject, htmlBody,
               new[] { (attachmentPath, attachmentName) });
}
