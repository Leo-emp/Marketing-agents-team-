/* ============================================================
   GEMINI CLIENT TESTS
   ============================================================
   Tests for src/lib/gemini.ts — the module that calls the
   Google Gemini API with model fallback and retry logic.

   # WHAT WE'RE TESTING:
   - Successful generation returns content text
   - Model fallback when primary model returns 404 (dead model)
   - Retry on 503 (overloaded) — tries next model, then retries
   - Retry on 429 (rate limited) — same behavior
   - 45-second timeout via AbortController
   - Dead model tracking (marks model as dead, skips on next call)
   - All models exhausted returns an error with last error detail

   # MOCKING STRATEGY:
   - We mock global fetch to simulate Gemini API responses
   - We control the GEMINI_API_KEY env var
   - We access the deadModels Map indirectly through behavior
   ============================================================ */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// # We need to control which fetch responses are returned for each model call
// # The gemini module iterates through GEMINI_MODELS and calls fetch for each

// # Store original env
const originalEnv = { ...process.env };

describe("Gemini Client", () => {
  beforeEach(() => {
    // # Set the API key so the module doesn't throw on missing config
    process.env.GEMINI_API_KEY = "test-gemini-key";
    vi.restoreAllMocks();
  });

  afterEach(() => {
    // # Restore original env vars after each test
    process.env = { ...originalEnv };
    process.env.GEMINI_API_KEY = "test-gemini-key";
  });

  it("should return generated text on successful API call", async () => {
    // # The simplest happy path: first model responds with valid content
    // # callGemini should return just the text string
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [{ text: "Generated marketing copy here" }],
              },
            },
          ],
        }),
        { status: 200 }
      )
    );

    // # We need to import fresh each time since the module has internal state
    // # (deadModels Map). Using dynamic import to get the actual exported functions.
    const { callGemini } = await import("@/lib/gemini");
    const result = await callGemini("Write a LinkedIn post about resumes");

    expect(result).toBe("Generated marketing copy here");

    // # Verify the API was called with the correct URL pattern
    const url = fetchSpy.mock.calls[0][0] as string;
    expect(url).toContain("generativelanguage.googleapis.com");
    expect(url).toContain("key=test-gemini-key");
  });

  it("should fall back to next model when primary returns 404", async () => {
    // # When a model returns 404, it means the model is unavailable/deprecated
    // # The module should mark it as "dead" and try the next model in the list
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    // # First model: 404 (dead/unavailable)
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 404 }));

    // # Second model: success
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          candidates: [
            { content: { parts: [{ text: "Fallback model response" }] } },
          ],
        }),
        { status: 200 }
      )
    );

    const { callGemini } = await import("@/lib/gemini");
    const result = await callGemini("Test prompt");

    // # Should get the response from the second model
    expect(result).toBe("Fallback model response");

    // # Verify two fetch calls were made (first model 404, second succeeded)
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("should retry on 503 (overloaded) and try next model", async () => {
    // # A 503 means the model is temporarily overloaded
    // # The module should skip to the next model, and if all fail in pass 1,
    // # do a second pass (with a 2-second delay between passes)
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    // # All 4 models return 503 on first pass
    fetchSpy
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      // # Second pass: first model succeeds
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            candidates: [
              { content: { parts: [{ text: "Recovered after 503" }] } },
            ],
          }),
          { status: 200 }
        )
      );

    const { callGemini } = await import("@/lib/gemini");
    const result = await callGemini("Retry test prompt");

    expect(result).toBe("Recovered after 503");
  });

  it("should retry on 429 (rate limited) and continue to next model", async () => {
    // # A 429 means the model hit its rate limit
    // # The module should move to the next model in the list
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    // # First model: 429 rate limited
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 429 }));

    // # Second model: success
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          candidates: [
            { content: { parts: [{ text: "Rate limit bypassed" }] } },
          ],
        }),
        { status: 200 }
      )
    );

    const { callGemini } = await import("@/lib/gemini");
    const result = await callGemini("Rate limit test");

    expect(result).toBe("Rate limit bypassed");
    // # Verify two calls: first was 429, second succeeded
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("should abort request after 45-second timeout", async () => {
    // # The module creates an AbortController with a 45-second timeout
    // # If the request takes too long, it aborts and tries the next model
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    // # First call: simulate abort (the actual timeout won't fire in tests,
    // # but we can simulate the AbortError that would occur)
    fetchSpy.mockRejectedValueOnce(new DOMException("The operation was aborted", "AbortError"));

    // # Second model: success
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          candidates: [
            { content: { parts: [{ text: "After timeout" }] } },
          ],
        }),
        { status: 200 }
      )
    );

    const { callGemini } = await import("@/lib/gemini");
    const result = await callGemini("Timeout test");

    // # Should recover by falling back to the next model
    expect(result).toBe("After timeout");
  });

  it("should track dead models and skip them on subsequent calls", async () => {
    // # When a model returns 404, it gets added to the deadModels Map
    // # with a timestamp. On the next call within the TTL (1 hour),
    // # that model should be skipped entirely.
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    // # First call: model 1 returns 404 (gets marked dead),
    // # model 2 succeeds
    fetchSpy
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            candidates: [
              { content: { parts: [{ text: "From model 2" }] } },
            ],
          }),
          { status: 200 }
        )
      );

    const { callGemini } = await import("@/lib/gemini");
    const result1 = await callGemini("First call — model 1 dies");
    expect(result1).toBe("From model 2");

    // # Second call: model 1 should be skipped (still dead),
    // # so model 2 is called first
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          candidates: [
            { content: { parts: [{ text: "Skipped dead model" }] } },
          ],
        }),
        { status: 200 }
      )
    );

    const result2 = await callGemini("Second call — should skip model 1");
    expect(result2).toBe("Skipped dead model");

    // # Total fetch calls: 2 (first call) + 1 (second call, skipped dead model)
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });

  it("should throw error when all models are exhausted", async () => {
    // # If every model fails across both passes (2 passes x 4 models = 8 attempts),
    // # the function should throw with the last error message
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    // # All 8 attempts (4 models x 2 passes) return 503
    for (let i = 0; i < 8; i++) {
      fetchSpy.mockResolvedValueOnce(new Response(null, { status: 503 }));
    }

    const { callGemini } = await import("@/lib/gemini");

    // # Expect the function to throw when all models fail
    await expect(callGemini("All models dead")).rejects.toThrow("AI unavailable");
  });

  it("should throw when GEMINI_API_KEY is not configured", async () => {
    // # If the API key env var is missing, the function should throw immediately
    // # rather than making any fetch calls
    delete process.env.GEMINI_API_KEY;

    // # Force a fresh import so the module reads the cleared env
    vi.resetModules();
    const { callGemini } = await import("@/lib/gemini");

    await expect(callGemini("No key")).rejects.toThrow("GEMINI_API_KEY");
  });
});
