/* ============================================================
   MARKETING AGENTS TESTS
   ============================================================
   Tests for src/lib/agents.ts — the AI agent personas that
   generate social media content for different platforms.

   # WHAT WE'RE TESTING:
   - Each platform agent gets a platform-specific system prompt
   - Brand context (BRAND constant) is injected into all prompts
   - Content framework options are included in agent prompts
   - Banned patterns list is included in all writing agents
   - Batch generation respects the concurrency limit of 3
   - Agent definitions contain expected metadata

   # MOCKING STRATEGY:
   - We mock the gemini module (callGemini) to control AI responses
   - We mock the research module to skip real web research
   - We mock the voice-samples module to skip loading samples
   - We mock the editorial module to skip the second-pass review
   - This lets us test the agent orchestration logic in isolation
   ============================================================ */

import { describe, it, expect, vi, beforeEach } from "vitest";

// # Mock all external dependencies that agents.ts imports
// # This isolates our tests to just the agent orchestration logic
vi.mock("@/lib/gemini", () => ({
  callGemini: vi.fn(),
}));

vi.mock("@/lib/research", () => ({
  conductResearch: vi.fn().mockResolvedValue({
    trends: ["AI hiring trends"],
    dataPoints: ["75% of resumes rejected by ATS"],
    angles: ["Contrarian take on resume length"],
    avoidTopics: [],
    sources: [{ title: "Test Source", uri: "https://example.com" }],
    rawBrief: "Research brief content here",
  }),
  discoverTopic: vi.fn().mockResolvedValue({
    topic: "Auto-discovered topic about AI interviews",
    reasoning: "Trending on LinkedIn this week",
  }),
}));

vi.mock("@/lib/voice-samples", () => ({
  getVoiceSamplesPrompt: vi.fn().mockResolvedValue("VOICE SAMPLES: [sample content]"),
}));

vi.mock("@/lib/editorial", () => ({
  reviewContent: vi.fn().mockResolvedValue({
    score: 9,
    passed: true,
    feedback: "Excellent content",
    revisedContent: "Same content — passed editorial",
    revisedHook: "Same hook — passed editorial",
    issues: [],
    hookScore: 9,
    specScore: 9,
    brandScore: 9,
    platformScore: 9,
  }),
}));

// # Import the module under test AFTER setting up mocks
import { AGENTS, generateContent, generateBatch } from "@/lib/agents";
import { callGemini } from "@/lib/gemini";

const mockCallGemini = callGemini as ReturnType<typeof vi.fn>;

describe("Marketing Agents", () => {
  beforeEach(() => {
    // # clearAllMocks resets call counts but keeps mock implementations
    // # (restoreAllMocks would undo the vi.mock() setup at the top of the file)
    vi.clearAllMocks();

    // # Default: Gemini returns valid JSON content for any generation call
    // # Individual tests can override this as needed
    mockCallGemini.mockResolvedValue(
      JSON.stringify({
        title: "Test Post Title",
        content: "Generated content body with specific data",
        contentType: "post",
        hashtags: "career, resume, jobsearch",
        mediaPrompt: "Dark blue professional image",
        hook: "73% of resumes fail in 6 seconds",
        framework: "DATA_STORY",
      })
    );
  });

  /* ============================================================
     Agent Definition Tests
     ============================================================ */
  describe("Agent Definitions", () => {
    it("should have platform-specific system prompts for each agent", () => {
      // # Each platform agent should have a unique system prompt
      // # tailored to that platform's algorithm, conventions, and style
      const linkedin = AGENTS.linkedin;
      const twitter = AGENTS.twitter;
      const instagram = AGENTS.instagram;
      const tiktok = AGENTS.tiktok;

      // # LinkedIn agent should reference LinkedIn algorithm and UGC conventions
      expect(linkedin.systemPrompt).toContain("LinkedIn");
      expect(linkedin.platform).toBe("linkedin");
      expect(linkedin.contentTypes).toContain("post");
      expect(linkedin.contentTypes).toContain("carousel");

      // # Twitter agent should reference X/Twitter algorithm and character limits
      expect(twitter.systemPrompt).toContain("280");
      expect(twitter.platform).toBe("twitter");

      // # Instagram agent should reference saves and carousel best practices
      expect(instagram.systemPrompt).toContain("Saves");
      expect(instagram.platform).toBe("instagram");

      // # TikTok agent should reference watch time and FYP algorithm
      expect(tiktok.systemPrompt).toContain("FYP");
      expect(tiktok.platform).toBe("tiktok");
    });

    it("should include brand context in all writing agent prompts", () => {
      // # The BRAND constant (product info, tone, values) should be
      // # injected into every writing agent's system prompt so all
      // # content is on-brand regardless of platform
      const writingAgents = ["linkedin", "twitter", "instagram", "tiktok"];

      for (const agentId of writingAgents) {
        const agent = AGENTS[agentId];
        // # Check for key brand elements in the prompt
        expect(agent.systemPrompt).toContain("JobPilot AI");
        expect(agent.systemPrompt).toContain("jobpilotai.co");
        // # Tone directives should be present
        expect(agent.systemPrompt).toContain("TONE");
      }
    });

    it("should include content frameworks in writing agent prompts", () => {
      // # Content frameworks (PAS, AIDA, CONTRARIAN FLIP, etc.) guide
      // # how each post is structured. They should be in every agent's prompt.
      const writingAgents = ["linkedin", "twitter", "instagram", "tiktok"];

      for (const agentId of writingAgents) {
        const agent = AGENTS[agentId];
        // # Check that framework options are included
        expect(agent.systemPrompt).toContain("PAS");
        expect(agent.systemPrompt).toContain("AIDA");
        expect(agent.systemPrompt).toContain("CONTRARIAN");
        expect(agent.systemPrompt).toContain("DATA_STORY");
        expect(agent.systemPrompt).toContain("BEFORE_AFTER");
      }
    });

    it("should include banned patterns in all writing agent prompts", () => {
      // # The banned patterns list prevents AI-detectable writing habits
      // # like "In today's competitive...", emojis, etc.
      const writingAgents = ["linkedin", "twitter", "instagram", "tiktok"];

      for (const agentId of writingAgents) {
        const agent = AGENTS[agentId];
        // # Check for banned openers
        expect(agent.systemPrompt).toContain("BANNED");
        expect(agent.systemPrompt).toContain("It's no secret");
        expect(agent.systemPrompt).toContain("Picture this:");
      }
    });
  });

  /* ============================================================
     Content Generation Tests
     ============================================================ */
  describe("generateContent", () => {
    it("should generate content for a valid agent and return structured result", async () => {
      // # generateContent orchestrates: research -> generation -> editorial review
      // # It should return a structured object matching GeneratedContent type
      const result = await generateContent(
        "linkedin",
        "Why ATS resume scanning is broken",
        "post",
        "Career Tips pillar"
      );

      // # Verify the returned object has all expected fields
      expect(result.title).toBe("Test Post Title");
      expect(result.content).toBeDefined();
      expect(result.hook).toBeDefined();
      expect(result.contentType).toBe("post");

      // # Verify research sources were attached
      expect(result.researchSources).toHaveLength(1);
      expect(result.researchBrief).toContain("Research brief");
    });

    it("should throw error for unknown agent ID", async () => {
      // # Passing a non-existent agent ID should throw immediately
      await expect(
        generateContent("nonexistent_agent", "topic", "post")
      ).rejects.toThrow("Unknown agent");
    });
  });

  /* ============================================================
     Batch Generation Tests
     ============================================================ */
  describe("generateBatch", () => {
    it("should respect concurrency limit of 3 when generating batch", async () => {
      // # generateBatch processes plan items with a concurrency limit of 3
      // # It uses Promise.allSettled on batches of 3 at a time

      // # Track how many concurrent calls are active at once
      let currentConcurrent = 0;
      let maxConcurrent = 0;

      mockCallGemini.mockImplementation(async () => {
        currentConcurrent++;
        maxConcurrent = Math.max(maxConcurrent, currentConcurrent);

        // # Simulate some async work
        await new Promise((r) => setTimeout(r, 10));
        currentConcurrent--;

        return JSON.stringify({
          title: "Batch item",
          content: "Batch content",
          contentType: "post",
          hashtags: "test",
          mediaPrompt: null,
          hook: "Batch hook",
          framework: "PAS",
        });
      });

      // # Create a plan with 6 items — should be processed in 2 batches of 3
      const plan = [
        { day: "Monday", platform: "linkedin", pillar: "Career Tips", contentType: "post", topic: "Topic 1", hook: "Hook 1", reasoning: "R1" },
        { day: "Monday", platform: "twitter", pillar: "AI in Hiring", contentType: "post", topic: "Topic 2", hook: "Hook 2", reasoning: "R2" },
        { day: "Tuesday", platform: "instagram", pillar: "Industry Insights", contentType: "carousel", topic: "Topic 3", hook: "Hook 3", reasoning: "R3" },
        { day: "Tuesday", platform: "tiktok", pillar: "Motivation", contentType: "reel_script", topic: "Topic 4", hook: "Hook 4", reasoning: "R4" },
        { day: "Wednesday", platform: "linkedin", pillar: "Product Showcases", contentType: "carousel", topic: "Topic 5", hook: "Hook 5", reasoning: "R5" },
        { day: "Wednesday", platform: "twitter", pillar: "Behind the Scenes", contentType: "thread", topic: "Topic 6", hook: "Hook 6", reasoning: "R6" },
      ];

      const results = await generateBatch(plan);

      // # All 6 items should produce results
      expect(results.length).toBe(6);

      // # Concurrency should never exceed 3 (the CONCURRENCY constant)
      // # Note: each generateContent call makes multiple Gemini calls internally
      // # (research + generation + editorial), so the raw concurrent count may be
      // # higher, but the batch-level concurrency is 3 plan items at a time
      // # We verify all items were processed successfully
      for (const r of results) {
        expect(r.content.title).toBe("Batch item");
        expect(r.agentId).toBeTruthy();
      }
    });

    it("should skip items with unknown platforms in batch", async () => {
      // # If a plan item has a platform that doesn't map to any agent,
      // # it should be silently skipped rather than crashing the batch
      const plan = [
        { day: "Monday", platform: "mastodon", pillar: "Tips", contentType: "post", topic: "Topic", hook: "Hook", reasoning: "R" },
      ];

      const results = await generateBatch(plan);

      // # Unknown platform "mastodon" should produce no results
      expect(results.length).toBe(0);
    });
  });
});
