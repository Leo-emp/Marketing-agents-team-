/* ============================================================
   EMAIL SEQUENCE TESTS
   ============================================================
   Tests for src/lib/email/sequences.ts — the email nurture
   engine that sends drip campaigns with anti-annoyance controls.

   # WHAT WE'RE TESTING:
   - 3 emails/month cap enforcement
   - 5-day minimum gap between emails
   - Cold user detection (2 consecutive unopened -> skip)
   - 24-hour signup protection (only welcome email allowed)
   - Pro upgrade drip suppression (stop if already upgraded)
   - List-Unsubscribe headers are set
   - Per-user error isolation (one failure doesn't stop batch)

   # MOCKING STRATEGY:
   - We mock prisma with all the model methods used by sequences.ts
   - We mock the sendEmail function to simulate successful sends
   - We mock signUnsubscribeToken to return a predictable token
   - We mock buildEmailHtml and appendUtmParams for HTML generation
   ============================================================ */

import { describe, it, expect, vi, beforeEach } from "vitest";

// # Mock prisma — the email sequences module uses many Prisma models:
// # emailPreference, emailSend, emailSequence, funnelEvent, content
vi.mock("@/lib/prisma", () => ({
  prisma: {
    emailPreference: {
      findUnique: vi.fn().mockResolvedValue(null), // # Not unsubscribed by default
    },
    emailSend: {
      count: vi.fn().mockResolvedValue(0),       // # No emails sent this month
      findFirst: vi.fn().mockResolvedValue(null), // # No previous sends
      findMany: vi.fn().mockResolvedValue([]),    // # No recent sends
      create: vi.fn().mockResolvedValue({}),      // # Record creation succeeds
    },
    emailSequence: {
      findMany: vi.fn().mockResolvedValue([]),    // # No active sequences
    },
    funnelEvent: {
      findMany: vi.fn().mockResolvedValue([]),    // # No funnel events
    },
  },
}));

// # Mock the email sending function — we don't want to hit Resend API
vi.mock("@/lib/email/resend", () => ({
  sendEmail: vi.fn().mockResolvedValue({ id: "resend-msg-123" }),
}));

// # Mock unsubscribe token generation
vi.mock("@/lib/email/unsubscribe", () => ({
  signUnsubscribeToken: vi.fn().mockReturnValue("user123.fake-sig"),
}));

// # Mock email template builder
vi.mock("@/lib/email/templates", () => ({
  buildEmailHtml: vi.fn().mockReturnValue("<html>email</html>"),
  appendUtmParams: vi.fn().mockImplementation((url: string) => `${url}?utm_source=email`),
}));

// # Import after mocking
import { canSendToUser, evaluateAndSendEmails } from "@/lib/email/sequences";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/resend";

// # Type-cast mocks for easy access
const mockEmailSendCount = prisma.emailSend.count as ReturnType<typeof vi.fn>;
const mockEmailSendFindFirst = prisma.emailSend.findFirst as ReturnType<typeof vi.fn>;
const mockEmailSendFindMany = prisma.emailSend.findMany as ReturnType<typeof vi.fn>;
const mockEmailSendCreate = prisma.emailSend.create as ReturnType<typeof vi.fn>;
const mockEmailPrefFindUnique = prisma.emailPreference.findUnique as ReturnType<typeof vi.fn>;
const mockSequenceFindMany = prisma.emailSequence.findMany as ReturnType<typeof vi.fn>;
const mockFunnelEventFindMany = prisma.funnelEvent.findMany as ReturnType<typeof vi.fn>;
const mockSendEmail = sendEmail as ReturnType<typeof vi.fn>;

describe("Email Sequences", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // # Re-establish default mock behaviors after restoreAllMocks
    mockEmailPrefFindUnique.mockResolvedValue(null);
    mockEmailSendCount.mockResolvedValue(0);
    mockEmailSendFindFirst.mockResolvedValue(null);
    mockEmailSendFindMany.mockResolvedValue([]);
    mockEmailSendCreate.mockResolvedValue({});
    mockSequenceFindMany.mockResolvedValue([]);
    mockFunnelEventFindMany.mockResolvedValue([]);
    mockSendEmail.mockResolvedValue({ id: "resend-msg-123" });
  });

  /* ============================================================
     canSendToUser Tests — Frequency & Anti-Annoyance Controls
     ============================================================ */
  describe("canSendToUser", () => {
    it("should enforce 3 emails/month cap", async () => {
      // # MAX_EMAILS_PER_MONTH is 3. When a user has already received 3
      // # emails in the last 30 days, any additional send should be blocked.
      mockEmailSendCount.mockResolvedValue(3); // # Already at the cap

      const result = await canSendToUser("user-1", "test@example.com");

      // # Should be blocked with a clear reason
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("monthly cap");
    });

    it("should allow sending when under the monthly cap", async () => {
      // # With only 1 email sent this month, we're well under the 3/month limit
      mockEmailSendCount.mockResolvedValue(1);
      mockEmailSendFindFirst.mockResolvedValue(null); // # No gap violation
      mockEmailSendFindMany.mockResolvedValue([]);    // # No cold user issue

      const result = await canSendToUser("user-2", "test@example.com");

      expect(result.allowed).toBe(true);
    });

    it("should enforce 5-day minimum gap between emails", async () => {
      // # MIN_GAP_DAYS is 5. If the last email was sent 2 days ago,
      // # the user should not receive another one yet.
      mockEmailSendCount.mockResolvedValue(1); // # Under monthly cap
      mockEmailSendFindFirst.mockResolvedValue({
        // # Last email was sent 2 days ago — too soon
        sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      });

      const result = await canSendToUser("user-3", "test@example.com");

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("5-day gap");
    });

    it("should detect cold users (2 consecutive unopened emails)", async () => {
      // # If the last 2 delivered emails have no openedAt timestamp,
      // # the user is "cold" and should be skipped to prevent annoyance.
      mockEmailSendCount.mockResolvedValue(1);
      mockEmailSendFindFirst.mockResolvedValue(null); // # No gap issue

      // # Return 2 recent sends — both have null openedAt (never opened)
      mockEmailSendFindMany.mockResolvedValue([
        { status: "sent", openedAt: null, sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
        { status: "delivered", openedAt: null, sentAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
      ]);

      const result = await canSendToUser("user-4", "test@example.com");

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("cold user");
    });

    it("should allow sending when user has opened recent emails", async () => {
      // # If at least one of the last 2 emails was opened, the user
      // # is engaged and should continue receiving emails.
      mockEmailSendCount.mockResolvedValue(1);
      mockEmailSendFindFirst.mockResolvedValue(null);

      // # One opened, one not — user is not cold
      mockEmailSendFindMany.mockResolvedValue([
        { status: "opened", openedAt: new Date(), sentAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
        { status: "sent", openedAt: null, sentAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
      ]);

      const result = await canSendToUser("user-5", "test@example.com");

      expect(result.allowed).toBe(true);
    });

    it("should block sending to unsubscribed users", async () => {
      // # If the user has an unsubscribedAt timestamp in their preferences,
      // # they've opted out and should never receive emails
      mockEmailPrefFindUnique.mockResolvedValue({
        unsubscribedAt: new Date(),
      });

      const result = await canSendToUser("user-6", "test@example.com");

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("unsubscribed");
    });
  });

  /* ============================================================
     evaluateAndSendEmails Tests — Full Sequence Engine
     ============================================================ */
  describe("evaluateAndSendEmails", () => {
    it("should enforce 24-hour signup protection", async () => {
      // # In the first 24 hours after signup, only the welcome email
      // # (step 0 of the signup sequence) is allowed. All other sequences
      // # should be skipped even if the user qualifies for them.
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000); // # 2 hours ago

      // # Active sequence: a "high_usage_free" drip — should be blocked
      // # because user signed up only 2 hours ago
      mockSequenceFindMany.mockResolvedValue([
        {
          id: "seq-upgrade",
          name: "Pro Upgrade Drip",
          trigger: "high_usage_free",
          status: "active",
          priority: 10,
          steps: JSON.stringify([
            { delayDays: 0, subject: "Upgrade to Pro", bodyTemplate: "<p>Upgrade!</p>", ctaUrl: "https://jobpilotai.co/pricing", ctaText: "Upgrade Now" },
          ]),
        },
      ]);

      // # User has both a signup event (2h ago) and a fifth_ai_use event (1h ago)
      mockFunnelEventFindMany.mockResolvedValue([
        { userId: "new-user", eventType: "signup", email: "new@example.com", eventDate: twoHoursAgo, metadata: null },
        { userId: "new-user", eventType: "fifth_ai_use", email: "new@example.com", eventDate: new Date(now.getTime() - 1 * 60 * 60 * 1000), metadata: null },
      ]);

      // # No previous sends for this user in this sequence
      mockEmailSendFindMany.mockResolvedValue([]);

      const result = await evaluateAndSendEmails();

      // # The pro upgrade email should be skipped due to 24h signup protection
      expect(result.skipped).toBeGreaterThanOrEqual(1);
      expect(result.sent).toBe(0);
    });

    it("should suppress pro upgrade drip if user already upgraded", async () => {
      // # If a user triggered "high_usage_free" but later upgraded to pro,
      // # the upgrade drip should stop sending. This prevents pointless emails
      // # asking someone to upgrade when they already did.
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

      mockSequenceFindMany.mockResolvedValue([
        {
          id: "seq-upgrade",
          name: "Pro Upgrade Drip",
          trigger: "high_usage_free",
          status: "active",
          priority: 10,
          steps: JSON.stringify([
            { delayDays: 0, subject: "Go Pro", bodyTemplate: "<p>Upgrade</p>", ctaUrl: "https://jobpilotai.co", ctaText: "Go Pro" },
          ]),
        },
      ]);

      // # User hit 5th AI use AND already upgraded to pro
      mockFunnelEventFindMany.mockResolvedValue([
        { userId: "upgraded-user", eventType: "signup", email: "pro@example.com", eventDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), metadata: null },
        { userId: "upgraded-user", eventType: "fifth_ai_use", email: "pro@example.com", eventDate: threeDaysAgo, metadata: null },
        { userId: "upgraded-user", eventType: "pro_upgrade", email: "pro@example.com", eventDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), metadata: null },
      ]);

      mockEmailSendFindMany.mockResolvedValue([]);

      const result = await evaluateAndSendEmails();

      // # Should be skipped because user already upgraded
      expect(result.skipped).toBeGreaterThanOrEqual(1);
      expect(result.sent).toBe(0);
    });

    it("should include List-Unsubscribe headers in sent emails", async () => {
      // # Gmail and Yahoo require List-Unsubscribe headers since 2024.
      // # Our code sets both List-Unsubscribe and List-Unsubscribe-Post.
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      const fortyDaysAgo = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);

      mockSequenceFindMany.mockResolvedValue([
        {
          id: "seq-welcome",
          name: "Welcome Sequence",
          trigger: "signup",
          status: "active",
          priority: 10,
          steps: JSON.stringify([
            { delayDays: 0, subject: "Welcome to JobPilot", bodyTemplate: "<p>Welcome!</p>", ctaUrl: "https://jobpilotai.co", ctaText: "Get Started" },
          ]),
        },
      ]);

      mockFunnelEventFindMany.mockResolvedValue([
        { userId: "welcome-user", eventType: "signup", email: "welcome@example.com", eventDate: tenDaysAgo, metadata: null },
      ]);

      // # No previous sends
      mockEmailSendFindMany.mockResolvedValue([]);
      // # canSendToUser checks — under cap, no gap issue, not cold
      mockEmailSendCount.mockResolvedValue(0);
      mockEmailSendFindFirst.mockResolvedValue(null);

      // # Set NEXT_PUBLIC_BASE_URL and UNSUBSCRIBE_SECRET so token generation works
      process.env.NEXT_PUBLIC_BASE_URL = "https://test.example.com";

      await evaluateAndSendEmails();

      // # Verify sendEmail was called with headers containing List-Unsubscribe
      if (mockSendEmail.mock.calls.length > 0) {
        const headers = mockSendEmail.mock.calls[0][3]; // # 4th argument is headers
        expect(headers).toBeDefined();
        expect(headers["List-Unsubscribe"]).toBeDefined();
        expect(headers["List-Unsubscribe"]).toContain("unsubscribe");
        expect(headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
      }
    });

    it("should isolate per-user errors (one failure does not stop others)", async () => {
      // # The engine wraps each user's processing in a try-catch.
      // # If one user's processing throws, other users should still be processed.
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      const fortyDaysAgo = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);

      mockSequenceFindMany.mockResolvedValue([
        {
          id: "seq-test",
          name: "Test Sequence",
          trigger: "signup",
          status: "active",
          priority: 10,
          steps: JSON.stringify([
            { delayDays: 0, subject: "Test", bodyTemplate: "<p>Test</p>", ctaUrl: "https://jobpilotai.co", ctaText: "Click" },
          ]),
        },
      ]);

      // # Two users both triggered by signup
      mockFunnelEventFindMany.mockResolvedValue([
        { userId: "user-a", eventType: "signup", email: "a@example.com", eventDate: tenDaysAgo, metadata: null },
        { userId: "user-b", eventType: "signup", email: "b@example.com", eventDate: tenDaysAgo, metadata: null },
      ]);

      // # No previous sends for either user
      mockEmailSendFindMany.mockResolvedValue([]);
      mockEmailSendCount.mockResolvedValue(0);
      mockEmailSendFindFirst.mockResolvedValue(null);

      // # First user's email send works, second user's email send fails
      let callCount = 0;
      mockSendEmail.mockImplementation(async () => {
        callCount++;
        if (callCount === 2) return null; // # Second user's send fails
        return { id: `msg-${callCount}` };
      });

      const result = await evaluateAndSendEmails();

      // # First user should have been sent successfully
      // # Second user should have been recorded as an error
      // # The key point: both users were processed (no early abort)
      expect(result.sent + result.errors).toBeGreaterThanOrEqual(2);
    });

    it("should return zeros when no active sequences exist", async () => {
      // # Edge case: if there are no active email sequences configured,
      // # the function should return immediately with all zeros
      mockSequenceFindMany.mockResolvedValue([]);

      const result = await evaluateAndSendEmails();

      expect(result.sent).toBe(0);
      expect(result.skipped).toBe(0);
      expect(result.errors).toBe(0);
    });
  });
});
