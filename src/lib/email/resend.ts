/* ============================================================
   RESEND CLIENT - Email Sending via Resend API
   ============================================================
   Wraps the Resend SDK with lazy initialization and error
   handling. All marketing emails go through this module.
   ============================================================ */

import { Resend } from "resend";

// # Lazy-init so missing env var doesn't crash on import
let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY not configured");
    _resend = new Resend(key);
  }
  return _resend;
}

// # Send a single email via Resend
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  headers?: Record<string, string>
): Promise<{ id: string } | null> {
  try {
    const result = await getResend().emails.send({
      from: "JobPilot AI <noreply@jobpilotai.co>",
      to,
      subject,
      html,
      headers,
    });
    // # Resend returns { data: { id }, error } — unwrap
    if (result.error) {
      console.error("Resend send error:", result.error);
      return null;
    }
    return result.data;
  } catch (err) {
    console.error("Resend send failed:", err);
    return null;
  }
}

// # Webhook verification is handled by Svix in /api/email/webhook/route.ts
