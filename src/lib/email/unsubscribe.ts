/* ============================================================
   UNSUBSCRIBE TOKENS - HMAC-signed one-click unsubscribe
   ============================================================
   Signs and verifies tokens for email unsubscribe links.
   Prevents abuse — only valid tokens can trigger unsubscribe.
   ============================================================ */

import { createHmac, timingSafeEqual } from "crypto";

// # Generate a signed unsubscribe token for a user ID
export function signUnsubscribeToken(userId: string): string {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret) throw new Error("UNSUBSCRIBE_SECRET not configured");
  // # Token format: userId.hmacSignature
  const sig = createHmac("sha256", secret).update(userId).digest("hex");
  return `${userId}.${sig}`;
}

// # Verify an unsubscribe token — returns userId if valid, null if tampered
export function verifyUnsubscribeToken(token: string): string | null {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret) return null;

  const dotIndex = token.lastIndexOf(".");
  if (dotIndex === -1) return null;

  const userId = token.slice(0, dotIndex);
  const providedSig = token.slice(dotIndex + 1);

  // # Recompute the expected signature
  const expectedSig = createHmac("sha256", secret).update(userId).digest("hex");

  // # Timing-safe comparison to prevent timing attacks
  try {
    const a = Buffer.from(providedSig, "hex");
    const b = Buffer.from(expectedSig, "hex");
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
    return userId;
  } catch {
    return null;
  }
}
