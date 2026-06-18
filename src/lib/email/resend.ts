/* ============================================================
   RESEND CLIENT - Email Sending via Resend API
   ============================================================
   Wraps the Resend SDK with lazy initialization and error
   handling. All marketing emails go through this module.
   ============================================================ */

import { Resend } from "resend";
import { createHmac, timingSafeEqual } from "crypto";

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

// # Verify Resend webhook signature using the signing secret
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.error("RESEND_WEBHOOK_SECRET not configured — rejecting webhook");
    return false;
  }
  // # Resend uses svix for webhook signing — for now, basic HMAC check
  // # In production, use the svix package for full verification
  // # Timing-safe comparison to prevent timing attacks
  try {
    const expectedSig = createHmac("sha256", secret).update(body).digest("hex");
    const a = Buffer.from(signature, "hex");
    const b = Buffer.from(expectedSig, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
