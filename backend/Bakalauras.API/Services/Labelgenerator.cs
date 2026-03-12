// ── Services/LabelGenerator.cs ───────────────────────────────────────────────
// Requires:  dotnet add package QuestPDF
// QuestPDF community licence is free for revenue < $1 M/yr.
// Add to Program.cs:  QuestPDF.Settings.License = LicenseType.Community;

using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Bakalauras.API.Services
{
    public static class LabelGenerator
    {
        /// <summary>
        /// Generates a shipping-label PDF and saves it under
        ///   wwwroot/labels/{shipmentId}/label_{packageIndex}.pdf
        /// Returns the relative URL  /labels/{shipmentId}/label_{packageIndex}.pdf
        /// </summary>
        public static string Generate(
            string  webRootPath,
            int     shipmentId,
            int     packageIndex,       // 1-based
            int     totalPackages,
            string  trackingNumber,
            // Sender
            string  senderName,
            string  senderAddress,
            string  senderPhone,
            // Recipient
            string  recipientName,
            string  recipientAddress,
            string  recipientPhone,
            // Courier
            string  courierName,
            // Dates
            string  shippingDate,
            string  estimatedDelivery)
        {
            var dir = Path.Combine(webRootPath, "labels", shipmentId.ToString());
            Directory.CreateDirectory(dir);

            var fileName   = $"label_{packageIndex}.pdf";
            var fullPath   = Path.Combine(dir, fileName);
            var relativeUrl = $"/labels/{shipmentId}/{fileName}";

            // ── Barcode data (Code-128 via text — use ZXing if you need a real barcode image) ──
            var packageTracking = $"{trackingNumber}-P{packageIndex:D2}";

            Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A6);          // 105 × 148 mm — standard label size
                    page.Margin(8, Unit.Millimetre);
                    page.DefaultTextStyle(x => x.FontSize(9).FontFamily("Arial"));

                    page.Content().Column(col =>
                    {
                        // ── Header bar ──────────────────────────────────────
                        col.Item().Background(Colors.Grey.Darken3).Padding(4).Row(row =>
                        {
                            row.RelativeItem().Text(courierName)
                               .Bold().FontColor(Colors.White).FontSize(11);
                            row.ConstantItem(60).AlignRight()
                               .Text($"{packageIndex} / {totalPackages}")
                               .Bold().FontColor(Colors.Yellow.Lighten1).FontSize(11);
                        });

                        col.Item().PaddingTop(4);

                        // ── Tracking number (large, scannable text) ─────────
                        col.Item().Border(1).BorderColor(Colors.Grey.Medium)
                            .Padding(5).Column(inner =>
                        {
                            inner.Item().Text("Siuntos numeris").FontSize(7).FontColor(Colors.Grey.Darken1);
                            inner.Item().Text(packageTracking).Bold().FontSize(13).FontColor(Colors.Black);
                        });

                        col.Item().PaddingTop(4);

                        // ── Addresses side by side ───────────────────────────
                        col.Item().Row(row =>
                        {
                            // Sender
                            row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(5).Column(c =>
                            {
                                c.Item().Text("SIUNTĖJAS").Bold().FontSize(7).FontColor(Colors.Grey.Darken2);
                                c.Item().PaddingTop(2).Text(senderName).Bold().FontSize(9);
                                c.Item().Text(senderAddress).FontSize(8);
                                c.Item().Text(senderPhone).FontSize(8).FontColor(Colors.Grey.Darken1);
                            });

                            row.ConstantItem(4);

                            // Recipient
                            row.RelativeItem().Border(2).BorderColor(Colors.Black).Padding(5).Column(c =>
                            {
                                c.Item().Text("GAVĖJAS").Bold().FontSize(7).FontColor(Colors.Grey.Darken2);
                                c.Item().PaddingTop(2).Text(recipientName).Bold().FontSize(9);
                                c.Item().Text(recipientAddress).FontSize(8);
                                c.Item().Text(recipientPhone).FontSize(8).FontColor(Colors.Grey.Darken1);
                            });
                        });

                        col.Item().PaddingTop(4);

                        // ── Dates row ────────────────────────────────────────
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("Siuntimo data").FontSize(7).FontColor(Colors.Grey.Darken1);
                                c.Item().Text(shippingDate).Bold().FontSize(9);
                            });
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("Pristatymo data").FontSize(7).FontColor(Colors.Grey.Darken1);
                                c.Item().Text(estimatedDelivery).Bold().FontSize(9);
                            });
                        });

                        col.Item().PaddingTop(6);

                        // ── Footer ───────────────────────────────────────────
                        col.Item().Background(Colors.Grey.Lighten3).Padding(3)
                            .AlignCenter().Text($"Sugeneruota: {DateTime.Now:yyyy-MM-dd HH:mm}")
                            .FontSize(6).FontColor(Colors.Grey.Darken1);
                    });
                });
            })
            .GeneratePdf(fullPath);

            return relativeUrl;
        }
    }
}