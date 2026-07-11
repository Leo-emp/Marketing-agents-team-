/* ============================================================
   ADMIN FAILURE NOTIFICATION — notify-admin.ts
   ============================================================
   Sends an alert email to the admin when a cron job fails.
   Uses Resend (already a project dependency) to deliver the
   email. This is a fire-and-forget utility — it NEVER throws,
   so a failure in alerting can never crash a cron route.

   Usage:
     import { notifyAdmin } from "@/lib/notify-admin";
     await notifyAdmin("Weekly Pipeline", error, { step: "digest" });

   Environment variables:
     ADMIN_ALERT_EMAIL — who gets the alert (defaults to pmzo.mm08@gmail.com)
     RESEND_API_KEY    — already configured for marketing emails
   ============================================================ */

import { Resend } from "resend";

// # ── Configuration ────────────────────────────────────────────

// # Default admin email — override via env var for flexibility
const DEFAULT_ADMIN_EMAIL = "pmzo.mm08@gmail.com";

// # "From" address uses the alerts subdomain so admin can filter
// # these separately from marketing emails (noreply@jobpilotai.co)
const ALERT_FROM = "JobPilot Alerts <alerts@jobpilotai.co>";

// # ── Lazy Resend client ───────────────────────────────────────
// # We initialise lazily so the module can be imported even if
// # RESEND_API_KEY isn't set yet (e.g. in tests or local dev).
let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    // # If there's no API key, we can't send — return null rather
    // # than throwing, because alerting must never crash the cron
    if (!key) {
      console.error("[notifyAdmin] RESEND_API_KEY not set — cannot send alert email");
      return null;
    }
    _resend = new Resend(key);
  }
  return _resend;
}

// # ── Types ────────────────────────────────────────────────────

// # Optional context object — lets each cron pass relevant data
// # (e.g. content IDs, step names, retry counts) for debugging
interface AlertDetails {
  [key: string]: unknown;
}

// # ── Main export ──────────────────────────────────────────────

/**
 * Send an admin alert email when a cron job fails.
 *
 * @param cronName   - Human-readable name of the cron (e.g. "Weekly Pipeline")
 * @param error      - The caught error (Error object or unknown)
 * @param details    - Optional extra context to include in the email body
 *
 * IMPORTANT: This function NEVER throws. If the email itself
 * fails to send, it logs to console.error and returns silently.
 * This guarantees that adding alerting to a cron route can never
 * make things worse.
 */
export async function notifyAdmin(
  cronName: string,
  error: unknown,
  details?: AlertDetails
): Promise<void> {
  try {
    // # Extract error message and stack trace from the caught error
    // # We handle both Error instances and raw strings/unknowns
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    const stackTrace =
      error instanceof Error ? error.stack || "No stack trace available" : "N/A (not an Error instance)";

    // # ISO timestamp for when the failure happened
    const timestamp = new Date().toISOString();

    // # Always log to console first — this shows up in Vercel logs
    // # even if the email fails to send
    console.error(
      `[CRON_FAILURE] ${cronName} failed at ${timestamp}: ${errorMessage}`
    );

    // # ── Build the HTML email body ──────────────────────────
    // # Inline styles because email clients strip <style> tags
    const detailsHtml = details
      ? `<h3 style="color:#6366f1;margin-top:24px;">Additional Details</h3>
         <pre style="background:#1e1b4b;color:#e0e7ff;padding:16px;border-radius:8px;overflow-x:auto;font-size:13px;">${escapeHtml(
           JSON.stringify(details, null, 2)
         )}</pre>`
      : "";

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;background:#0f0b2e;color:#e0e7ff;padding:32px;border-radius:12px;">
        <h1 style="color:#f87171;margin-top:0;">Cron Failure Alert</h1>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr>
            <td style="padding:8px 12px;color:#a5b4fc;font-weight:600;white-space:nowrap;">Cron Name</td>
            <td style="padding:8px 12px;color:#e0e7ff;">${escapeHtml(cronName)}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;color:#a5b4fc;font-weight:600;white-space:nowrap;">Timestamp</td>
            <td style="padding:8px 12px;color:#e0e7ff;">${timestamp}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;color:#a5b4fc;font-weight:600;white-space:nowrap;">Error</td>
            <td style="padding:8px 12px;color:#fca5a5;">${escapeHtml(errorMessage)}</td>
          </tr>
        </table>

        <h3 style="color:#6366f1;margin-top:24px;">Stack Trace</h3>
        <pre style="background:#1e1b4b;color:#e0e7ff;padding:16px;border-radius:8px;overflow-x:auto;font-size:13px;line-height:1.5;">${escapeHtml(
          stackTrace
        )}</pre>

        ${detailsHtml}

        <p style="margin-top:24px;font-size:12px;color:#6366f1;">
          This is an automated alert from JobPilot Marketing.
          Check Vercel logs for full context.
        </p>
      </div>
    `;

    // # ── Send the email via Resend ──────────────────────────
    const resend = getResend();
    if (!resend) {
      // # Already logged in getResend() — nothing more to do
      return;
    }

    const adminEmail =
      process.env.ADMIN_ALERT_EMAIL || DEFAULT_ADMIN_EMAIL;

    const result = await resend.emails.send({
      from: ALERT_FROM,
      to: adminEmail,
      subject: `[CRON FAIL] ${cronName} — ${errorMessage.slice(0, 80)}`,
      html,
    });

    // # Check for Resend-level errors (API returned error object)
    if (result.error) {
      console.error(
        "[notifyAdmin] Resend returned an error:",
        result.error
      );
    }
  } catch (alertError) {
    // # ── CRITICAL: Never let alerting crash the cron ────────
    // # If anything above throws (network issue, Resend down,
    // # JSON.stringify circular ref, etc.), we just log it.
    // # The cron route continues its normal error handling.
    console.error(
      "[notifyAdmin] Failed to send alert email — alerting error:",
      alertError
    );
  }
}

// # ── Helper ───────────────────────────────────────────────────

// # Escape HTML special characters to prevent XSS in email body
// # (even though email clients are sandboxed, it's good practice)
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
