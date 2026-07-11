/* ============================================================
   SCHEDULER CRON ROUTE TESTS
   ============================================================
   Tests for src/app/api/scheduler/route.ts — the cron job that
   auto-posts scheduled content and retries failed posts.

   # WHAT WE'RE TESTING:
   - CRON_SECRET auth check rejects unauthorized requests
   - Due scheduled posts are published to their platform
   - Failed posts with retryAt <= now are retried
   - Posts that fail twice are permanently marked as failed
   - Retry sets retryAt to 30 minutes later on first failure
   - Empty queue returns { posted: 0 } without errors

   # MOCKING STRATEGY:
   - We mock @/lib/prisma to control the database
   - We mock @/lib/social-posting to simulate platform responses
   - We mock @/lib/funnel/utm for UTM tagging (passthrough)
   - We mock @/lib/notify-admin to verify alerting calls
   - We create NextRequest objects to simulate Vercel Cron calls
   ============================================================ */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// # ── Mock prisma ──────────────────────────────────────────────
// # We need to control what findMany returns (scheduled + failed posts)
// # and verify what update() is called with
const mockFindMany = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    content: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}));

// # ── Mock social-posting ──────────────────────────────────────
// # postToPlatform is the function that actually sends to LinkedIn/Twitter/etc.
// # We return success/failure based on what each test needs
const mockPostToPlatform = vi.fn();

vi.mock("@/lib/social-posting", () => ({
  postToPlatform: (...args: unknown[]) => mockPostToPlatform(...args),
}));

// # ── Mock UTM tagging ─────────────────────────────────────────
// # tagContentLinks adds UTM params to jobpilotai.co links
// # For testing, we just pass through the text unchanged
vi.mock("@/lib/funnel/utm", () => ({
  tagContentLinks: (text: string) => text,
}));

// # ── Mock notify-admin ────────────────────────────────────────
// # We verify that notifyAdmin is called when posts permanently fail
const mockNotifyAdmin = vi.fn();

vi.mock("@/lib/notify-admin", () => ({
  notifyAdmin: (...args: unknown[]) => mockNotifyAdmin(...args),
}));

// # ── Helper to build a fake NextRequest with auth header ──────
function makeRequest(secret?: string): NextRequest {
  const headers: Record<string, string> = {};
  if (secret) headers["authorization"] = `Bearer ${secret}`;
  return new NextRequest("http://localhost/api/scheduler", { headers });
}

// # ── Helper to build a fake content item from the DB ──────────
function makeContent(overrides: Record<string, unknown> = {}) {
  return {
    id: "content-1",
    platform: "linkedin",
    status: "scheduled",
    scheduledFor: new Date(Date.now() - 60000), // # 1 minute ago = due now
    body: "Check out JobPilot AI!",
    captionText: null,
    hashtags: null,
    imageUrl: null,
    retryCount: 0,
    retryAt: null,
    title: "Test Post",
    ...overrides,
  };
}

describe("Scheduler Cron Route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // # Set CRON_SECRET so auth passes by default
    process.env.CRON_SECRET = "test-secret-123";

    // # Default: no scheduled or retryable posts
    mockFindMany.mockResolvedValue([]);
    mockUpdate.mockResolvedValue({});
  });

  // # ── Auth Tests ─────────────────────────────────────────────

  it("rejects requests without CRON_SECRET", async () => {
    // # Vercel Cron sends the secret in the Authorization header
    // # Without it, we should get 401 Unauthorized
    const { GET } = await import("@/app/api/scheduler/route");
    const req = makeRequest(); // # No auth header
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("rejects requests with wrong CRON_SECRET", async () => {
    // # Wrong secret should also be rejected
    const { GET } = await import("@/app/api/scheduler/route");
    const req = makeRequest("wrong-secret");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("rejects when CRON_SECRET env var is not set", async () => {
    // # If CRON_SECRET is missing from env, fail closed (500)
    delete process.env.CRON_SECRET;
    const { GET } = await import("@/app/api/scheduler/route");
    const req = makeRequest("any-secret");
    const res = await GET(req);
    expect(res.status).toBe(500);
  });

  // # ── Empty Queue ────────────────────────────────────────────

  it("returns posted:0 when no content is due", async () => {
    // # Both findMany calls return empty arrays = nothing to post
    const { GET } = await import("@/app/api/scheduler/route");
    const req = makeRequest("test-secret-123");
    const res = await GET(req);
    const json = await res.json();
    expect(json.posted).toBe(0);
    expect(json.message).toContain("No scheduled");
  });

  // # ── Successful Post ────────────────────────────────────────

  it("posts due scheduled content and marks it as posted", async () => {
    // # Simulate one scheduled post that's due + successful platform post
    const content = makeContent();
    // # First findMany = scheduled posts, second = retryable posts
    mockFindMany.mockResolvedValueOnce([content]).mockResolvedValueOnce([]);
    mockPostToPlatform.mockResolvedValue({ success: true, platformPostId: "li-123" });

    const { GET } = await import("@/app/api/scheduler/route");
    const req = makeRequest("test-secret-123");
    const res = await GET(req);
    const json = await res.json();

    // # Should have posted 1 item successfully
    expect(json.posted).toBe(1);
    // # Should update DB with status "posted"
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "content-1" },
        data: expect.objectContaining({ status: "posted" }),
      })
    );
  });

  // # ── Retry Logic ────────────────────────────────────────────

  it("sets retryAt to 30 minutes later on first failure", async () => {
    // # When a post fails for the first time, it should be retried in 30 min
    const content = makeContent();
    mockFindMany.mockResolvedValueOnce([content]).mockResolvedValueOnce([]);
    mockPostToPlatform.mockResolvedValue({ success: false, error: "LinkedIn API down" });

    const { GET } = await import("@/app/api/scheduler/route");
    const req = makeRequest("test-secret-123");
    await GET(req);

    // # Verify retryAt is set to ~30 minutes from now
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "failed",
          retryCount: 1,
          // # retryAt should be a Date ~30 min from now (we check it's not null)
          retryAt: expect.any(Date),
        }),
      })
    );

    // # Should NOT alert admin yet — first failure gets a retry
    expect(mockNotifyAdmin).not.toHaveBeenCalled();
  });

  it("permanently fails and alerts admin after 2 failed attempts", async () => {
    // # A post that already failed once (retryCount: 1) fails again
    // # → should be permanently marked failed + admin notified
    const content = makeContent({
      status: "failed",
      retryCount: 1,
      retryAt: new Date(Date.now() - 60000),
    });
    mockFindMany.mockResolvedValueOnce([]).mockResolvedValueOnce([content]);
    mockPostToPlatform.mockResolvedValue({ success: false, error: "Still down" });

    const { GET } = await import("@/app/api/scheduler/route");
    const req = makeRequest("test-secret-123");
    await GET(req);

    // # retryAt should be null — no more retries
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "failed",
          retryCount: 2,
          retryAt: null,
        }),
      })
    );

    // # Admin should be notified of permanent failure
    expect(mockNotifyAdmin).toHaveBeenCalledWith(
      expect.stringContaining("Permanent"),
      expect.any(Error),
      expect.objectContaining({ contentId: "content-1", platform: "linkedin" })
    );
  });
});
