/* ============================================================
   EDITORIAL REVIEW TESTS
   ============================================================
   Tests for src/lib/editorial.ts — the second-pass quality gate
   that scores and optionally rewrites generated content.

   # WHAT WE'RE TESTING:
   - Content scoring returns numeric scores in valid ranges
   - Content below the threshold (score < 9) gets revised content
   - Content at/above threshold (score >= 9) passes through unchanged
   - Score dimensions (hookScore, specScore, brandScore, platformScore)
   - Passthrough behavior when editorial review fails/errors

   # MOCKING STRATEGY:
   - We mock the gemini module's callGemini function
   - This lets us control exactly what JSON the "editor" returns
   - No real AI calls are made
   ============================================================ */

import { describe, it, expect, vi, beforeEach } from "vitest";

// # Mock the Gemini client — editorial.ts imports callGemini from ./gemini
// # By mocking it, we control what the AI "returns" in each test
vi.mock("@/lib/gemini", () => ({
  callGemini: vi.fn(),
}));

import { reviewContent } from "@/lib/editorial";
import { callGemini } from "@/lib/gemini";

// # Type-cast so we can use mockResolvedValue on the mock
const mockCallGemini = callGemini as ReturnType<typeof vi.fn>;

describe("Editorial Review", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return numeric scores clamped between 1 and 10", async () => {
    // # The editorial function parses JSON from Gemini and clamps each score
    // # to the 1-10 range. We test that out-of-range values get clamped.
    mockCallGemini.mockResolvedValueOnce(
      JSON.stringify({
        score: 15,        // # Should clamp to 10
        hookScore: -3,    // # Should clamp to 1
        specScore: 8,
        brandScore: 7,
        platformScore: 200, // # Should clamp to 10
        issues: ["Test issue"],
        feedback: "Test feedback",
        revisedContent: "Revised text",
        revisedHook: "Revised hook",
      })
    );

    const result = await reviewContent(
      "Original content",
      "linkedin",
      "post",
      "Original hook"
    );

    // # Verify clamping works correctly
    expect(result.score).toBe(10);       // # 15 clamped to 10
    expect(result.hookScore).toBe(1);    // # -3 clamped to 1
    expect(result.specScore).toBe(8);    // # 8 stays as-is
    expect(result.brandScore).toBe(7);   // # 7 stays as-is
    expect(result.platformScore).toBe(10); // # 200 clamped to 10
  });

  it("should return revised content when score is below 9", async () => {
    // # When the editorial score is below 9, the function returns the
    // # AI's revised version instead of the original content.
    // # The calling code in agents.ts uses this to replace the original.
    mockCallGemini.mockResolvedValueOnce(
      JSON.stringify({
        score: 7,
        hookScore: 6,
        specScore: 8,
        brandScore: 7,
        platformScore: 8,
        issues: ["Hook is too generic", "Missing specific data points"],
        feedback: "Strengthened the hook with a stat, added concrete examples",
        revisedContent: "This is the improved version with better specifics",
        revisedHook: "73% of resumes fail in 6 seconds — here's why",
      })
    );

    const result = await reviewContent(
      "Original weak content",
      "linkedin",
      "post",
      "Generic hook"
    );

    // # Score is 7, which is below 9 — revised content should be returned
    expect(result.score).toBe(7);
    expect(result.revisedContent).toBe("This is the improved version with better specifics");
    expect(result.revisedHook).toBe("73% of resumes fail in 6 seconds — here's why");
    expect(result.issues).toHaveLength(2);
    expect(result.feedback).toContain("Strengthened");
  });

  it("should pass through original content when score is >= 9", async () => {
    // # When the editorial score is 9 or above, the content is excellent
    // # and should be returned as-is (the AI returns the original unchanged)
    mockCallGemini.mockResolvedValueOnce(
      JSON.stringify({
        score: 9,
        hookScore: 9,
        specScore: 9,
        brandScore: 10,
        platformScore: 9,
        issues: [],
        feedback: "Excellent content — no changes needed",
        revisedContent: "High quality original content here",
        revisedHook: "Outstanding hook that stops the scroll",
      })
    );

    const result = await reviewContent(
      "High quality original content here",
      "linkedin",
      "carousel",
      "Outstanding hook that stops the scroll"
    );

    expect(result.score).toBe(9);
    // # The revisedContent field carries whatever the AI returned.
    // # When score >= 9, the AI is instructed to return the original unchanged.
    expect(result.revisedContent).toBe("High quality original content here");
    expect(result.issues).toHaveLength(0);
  });

  it("should set passed=true only when all dimension scores are >= 7", async () => {
    // # The `passed` field is true only if ALL four dimension scores
    // # (hookScore, specScore, brandScore, platformScore) are >= 7.
    // # This is the quality gate that determines if content can be published.
    mockCallGemini.mockResolvedValueOnce(
      JSON.stringify({
        score: 8,
        hookScore: 7,
        specScore: 6,  // # Below 7 — should cause passed=false
        brandScore: 8,
        platformScore: 9,
        issues: ["Needs more specific data points"],
        feedback: "Spec score too low",
        revisedContent: "Revised",
        revisedHook: "Better hook",
      })
    );

    const result = await reviewContent("Content", "twitter", "post", "Hook");

    // # specScore is 6, which is below 7 — so passed should be false
    expect(result.passed).toBe(false);
  });

  it("should set passed=true when all dimension scores are >= 7", async () => {
    // # Counterpart to the above test — all scores >= 7 means passed=true
    mockCallGemini.mockResolvedValueOnce(
      JSON.stringify({
        score: 8,
        hookScore: 7,
        specScore: 7,
        brandScore: 8,
        platformScore: 9,
        issues: [],
        feedback: "Good quality",
        revisedContent: "Content",
        revisedHook: "Hook",
      })
    );

    const result = await reviewContent("Content", "instagram", "carousel", "Hook");

    // # All dimension scores are >= 7, so passed should be true
    expect(result.passed).toBe(true);
  });

  it("should return passthrough when Gemini call fails", async () => {
    // # If the editorial review itself fails (network error, Gemini down, etc.),
    // # the function returns a passthrough result so content generation
    // # isn't blocked. This is the buildPassthrough() fallback.
    mockCallGemini.mockRejectedValueOnce(new Error("AI unavailable: all models dead"));

    const result = await reviewContent(
      "Original content that should pass through",
      "tiktok",
      "reel_script",
      "Original hook"
    );

    // # Passthrough returns score=0, passed=true, original content
    expect(result.score).toBe(0);
    expect(result.passed).toBe(true);
    expect(result.revisedContent).toBe("Original content that should pass through");
    expect(result.revisedHook).toBe("Original hook");
    expect(result.feedback).toContain("unavailable");
  });

  it("should return passthrough when Gemini returns non-JSON", async () => {
    // # If Gemini returns text that doesn't contain valid JSON,
    // # the regex match fails and buildPassthrough is returned
    mockCallGemini.mockResolvedValueOnce(
      "Sorry, I cannot review this content because it appears to be empty."
    );

    const result = await reviewContent("Some content", "linkedin", "post", "Some hook");

    // # No JSON found — falls back to passthrough
    expect(result.score).toBe(0);
    expect(result.passed).toBe(true);
    expect(result.revisedContent).toBe("Some content");
  });
});
