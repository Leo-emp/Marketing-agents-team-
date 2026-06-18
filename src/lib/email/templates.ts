/* ============================================================
   EMAIL TEMPLATES - Dark-themed branded HTML emails
   ============================================================
   Generates responsive HTML emails matching the JobPilot brand.
   Dark background, indigo/purple accents, Geist font fallback.
   ============================================================ */

// # Build a branded HTML email with dark theme
export function buildEmailHtml(
  subject: string,
  body: string,
  ctaUrl: string,
  ctaText: string,
  unsubscribeUrl: string
): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#09090b;color:#e4e4e7;font-family:'Geist','Segoe UI',system-ui,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <!-- # Logo / brand header -->
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:24px;font-weight:700;background:linear-gradient(135deg,#818cf8,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
        JobPilot AI
      </span>
    </div>

    <!-- # Email body content -->
    <div style="background-color:#18181b;border:1px solid #27272a;border-radius:12px;padding:32px;margin-bottom:24px;">
      ${body}
    </div>

    <!-- # CTA button -->
    ${ctaUrl && ctaText ? `
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">
        ${escapeHtml(ctaText)}
      </a>
    </div>
    ` : ""}

    <!-- # Footer with unsubscribe -->
    <div style="text-align:center;font-size:12px;color:#71717a;border-top:1px solid #27272a;padding-top:24px;">
      <p>JobPilot AI — Your Career Co-Pilot</p>
      <p><a href="${escapeHtml(unsubscribeUrl)}" style="color:#71717a;text-decoration:underline;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;
}

// # Escape HTML entities to prevent XSS in email templates
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// # Auto-append UTM params to a URL for tracking
export function appendUtmParams(
  url: string,
  source: string,
  medium: string,
  campaign: string
): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}utm_source=${encodeURIComponent(source)}&utm_medium=${encodeURIComponent(medium)}&utm_campaign=${encodeURIComponent(campaign)}`;
}
