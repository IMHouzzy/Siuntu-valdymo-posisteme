// Services/IInvoiceService.cs + InvoiceService.cs
// Generates an invoice record in the DB and a PDF label file,
// returning the file URL for email attachment.
//
// If you already use QuestPDF elsewhere in the project, reuse that pattern here.
// This file provides a minimal working implementation you can extend.

using Bakalauras.API.Models;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Bakalauras.API.Services;

public interface IInvoiceService
{
    /// <summary>
    /// Creates (or fetches existing) invoice for the order, generates a PDF,
    /// and returns the server-relative file URL (e.g. /invoices/42/invoice_42.pdf).
    /// </summary>
    Task<string?> GenerateAndSaveAsync(int orderId, int companyId);
}

public class InvoiceService : IInvoiceService
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<InvoiceService> _log;

    public InvoiceService(AppDbContext db, IWebHostEnvironment env, ILogger<InvoiceService> log)
    {
        _db = db;
        _env = env;
        _log = log;
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public async Task<string?> GenerateAndSaveAsync(int orderId, int companyId)
    {
        // Return existing invoice if already generated
        var existing = await _db.invoices
            .FirstOrDefaultAsync(i => i.fk_Ordersid_Orders == orderId);
        if (existing?.fileUrl != null)
            return MapUrlToPath(existing.fileUrl);

        // Load order data
        var order = await _db.orders
            .AsNoTracking()
            .Where(o => o.id_Orders == orderId && o.fk_Companyid_Company == companyId)
            .Select(o => new
            {
                o.id_Orders,
                o.OrdersDate,
                o.totalAmount,
                o.deliveryPrice,
                o.paymentMethod,
                clientName = o.fk_Clientid_UsersNavigation.name + " " + o.fk_Clientid_UsersNavigation.surname,
                clientEmail = o.fk_Clientid_UsersNavigation.email,
                clientPhone = o.fk_Clientid_UsersNavigation.phoneNumber,
                companyName = o.fk_Companyid_CompanyNavigation.name,
                companyCode = o.fk_Companyid_CompanyNavigation.companyCode,
                companyEmail = o.fk_Companyid_CompanyNavigation.email,
                companyPhone = o.fk_Companyid_CompanyNavigation.phoneNumber,
                clientAddress = _db.client_companies
                    .Where(cc => cc.fk_Companyid_Company == companyId && cc.fk_Clientid_Users == o.fk_Clientid_Users)
                    .Select(cc => cc.deliveryAddress + ", " + cc.city + ", " + cc.country)
                    .FirstOrDefault(),
                items = o.ordersproducts.Select(op => new
                {
                    name = op.fk_Productid_ProductNavigation.name,
                    quantity = op.quantity,
                    unitPrice = op.unitPrice,
                    vatValue = op.vatValue,
                }).ToList()
            })
            .FirstOrDefaultAsync();

        if (order == null) return null;

        // Build invoice number
        var invoiceNumber = $"INV-{companyId}-{orderId}-{DateTime.UtcNow:yyyyMMdd}";
        var vatTotal = order.items.Sum(i => i.vatValue * i.quantity);
        var subtotal = order.items.Sum(i => i.unitPrice * i.quantity);

        // ── Persist invoice record ────────────────────────────────────────────
        var inv = existing ?? new invoice();
        inv.invoiceNumber = invoiceNumber;
        inv.date = DateTime.UtcNow;
        inv.dueDate = DateTime.UtcNow.AddDays(30);
        inv.total = order.totalAmount;
        inv.vatTotal = vatTotal;
        inv.fk_Ordersid_Orders = orderId;

        if (existing == null)
            _db.invoices.Add(inv);

        await _db.SaveChangesAsync();

        // ── Generate PDF ──────────────────────────────────────────────────────
        try
        {
            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var dir = Path.Combine(webRoot, "invoices", orderId.ToString());
            Directory.CreateDirectory(dir);
            var filePath = Path.Combine(dir, $"invoice_{orderId}.pdf");
            var fileUrl = $"/invoices/{orderId}/invoice_{orderId}.pdf";

            Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(40);
                    page.DefaultTextStyle(x => x.FontSize(11));

                    page.Header().Column(col =>
                    {
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Text(order.companyName)
                                .SemiBold().FontSize(16);
                            row.RelativeItem().AlignRight().Column(c =>
                            {
                                c.Item().Text($"Sąskaita faktūra").Bold().FontSize(14);
                                c.Item().Text($"Nr. {invoiceNumber}").FontSize(10);
                                c.Item().Text($"Data: {inv.date:yyyy-MM-dd}").FontSize(10);
                            });
                        });
                        col.Item().PaddingTop(4).LineHorizontal(1);
                    });

                    page.Content().PaddingTop(16).Column(col =>
                    {
                        // Seller / Buyer
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("Pardavėjas:").SemiBold();
                                c.Item().Text(order.companyName);
                                c.Item().Text($"Įm. kodas: {order.companyCode}");
                                c.Item().Text($"Tel: {order.companyPhone}");
                                c.Item().Text($"El. p.: {order.companyEmail}");
                            });
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("Pirkėjas:").SemiBold();
                                c.Item().Text(order.clientName);
                                c.Item().Text(order.clientAddress ?? "—");
                                c.Item().Text($"Tel: {order.clientPhone}");
                                c.Item().Text($"El. p.: {order.clientEmail}");
                            });
                        });

                        col.Item().PaddingTop(16).Table(table =>
                        {
                            table.ColumnsDefinition(cols =>
                            {
                                cols.RelativeColumn(4); // name
                                cols.RelativeColumn(1); // qty
                                cols.RelativeColumn(2); // unit price
                                cols.RelativeColumn(2); // total
                            });

                            // Header
                            static IContainer HeaderCell(IContainer c) =>
                                c.Background("#2563eb").Padding(4);

                            table.Header(h =>
                            {
                                h.Cell().Element(HeaderCell).Text("Pavadinimas").FontColor("#fff").SemiBold();
                                h.Cell().Element(HeaderCell).Text("Kiekis").FontColor("#fff").SemiBold();
                                h.Cell().Element(HeaderCell).Text("Kaina").FontColor("#fff").SemiBold();
                                h.Cell().Element(HeaderCell).Text("Suma").FontColor("#fff").SemiBold();
                            });

                            bool shade = false;
                            foreach (var item in order.items)
                            {
                                var bg = shade ? "#f1f5f9" : "#ffffff";
                                shade = !shade;
                                var lineTotal = item.unitPrice * item.quantity;

                                static IContainer Cell(IContainer c, string bg) =>
                                    c.Background(bg).Padding(4);

                                table.Cell().Element(c => Cell(c, bg)).Text(item.name);
                                table.Cell().Element(c => Cell(c, bg)).Text(item.quantity.ToString());
                                table.Cell().Element(c => Cell(c, bg)).Text($"{item.unitPrice:F2} €");
                                table.Cell().Element(c => Cell(c, bg)).Text($"{lineTotal:F2} €");
                            }
                        });

                        col.Item().PaddingTop(8).AlignRight().Column(c =>
                        {
                            c.Item().Text($"Pristatymas: {order.deliveryPrice:F2} €");
                            c.Item().Text($"Tarpinė suma (be PVM): {subtotal:F2} €");
                            c.Item().Text($"PVM (21%): {vatTotal:F2} €");
                            c.Item().Text($"Iš viso: {order.totalAmount:F2} €").SemiBold().FontSize(13);
                        });

                        col.Item().PaddingTop(16).Text(
                            $"Mokėjimo būdas: {order.paymentMethod ?? "—"}");
                        col.Item().Text(
                            $"Apmokėti iki: {inv.dueDate:yyyy-MM-dd}");
                    });

                    page.Footer().AlignCenter().Text(
                        $"Sąskaita sugeneruota automatiškai • {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC");
                });
            }).GeneratePdf(filePath);

            inv.fileUrl = fileUrl;
            await _db.SaveChangesAsync();

            return filePath; // caller needs the physical path for SmtpClient attachment
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "PDF generation failed for order {OrderId}", orderId);
            return null;
        }
    }

    private string MapUrlToPath(string url)
    {
        var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        return Path.Combine(webRoot, url.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
    }
}