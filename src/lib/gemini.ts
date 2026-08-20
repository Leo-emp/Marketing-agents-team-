/* ============================================================
   GEMINI CLIENT - Google Gemini AI API
   ============================================================
   Calls Gemini with model fallback, retry logic, and
   optional Google Search grounding for real-time research.
   Shared across all marketing agent personas.
   ============================================================ */

/* eslint-disable @typescript-eslint/no-explicit-any */

// # Only models that are alive — 2.0 series deprecated by Google (404)
const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
];

const deadModels = new Map<string, number>();
const DEAD_TTL = 60 * 60 * 1000;
const TIMEOUT_MS = 45_000;

// # Rate limiter — free tier allows ~2-3 RPM so we space calls 4s apart
let lastCallTime = 0;
const MIN_CALL_GAP_MS = 4000;

async function waitForRateLimit() {
  const now = Date.now();
  const elapsed = now - lastCallTime;
  if (elapsed < MIN_CALL_GAP_MS) {
    await new Promise((r) => setTimeout(r, MIN_CALL_GAP_MS - elapsed));
  }
  lastCallTime = Date.now();
}

/* # Shared fetch logic for both standard and grounded calls */
async function callGeminiInternal(
  prompt: string,
  options?: { useSearch?: boolean }
): Promise<{ text: string; sources: { title: string; uri: string }[] }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

  let lastError = "";

  // # 3 passes with increasing backoff on rate-limit
  for (let pass = 0; pass < 3; pass++) {
    if (pass > 0) await new Promise((r) => setTimeout(r, 5000 * pass));

    for (const model of GEMINI_MODELS) {
      const deadSince = deadModels.get(model);
      if (deadSince && Date.now() - deadSince < DEAD_TTL) continue;
      if (deadSince) deadModels.delete(model);

      // # Wait for rate limit window before calling
      await waitForRateLimit();

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const requestBody: any = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 8192 },
        };

        // # Google Search grounding — gives Gemini real-time web access
        if (options?.useSearch) {
          requestBody.tools = [{ google_search: {} }];
        }

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
          }
        );

        clearTimeout(timeout);

        if (res.status === 404) { deadModels.set(model, Date.now()); continue; }
        // # On rate-limit, wait 6s before trying next model
        if (res.status === 429 || res.status === 503) {
          lastError = `${model} rate-limited`;
          await new Promise((r) => setTimeout(r, 6000));
          continue;
        }
        if (!res.ok) { const d = await res.json(); lastError = d.error?.message || "API error"; continue; }

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) { lastError = "Empty AI response"; continue; }

        // # Extract grounding sources when available
        const sources: { title: string; uri: string }[] = [];
        const chunks = data.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks && Array.isArray(chunks)) {
          for (const chunk of chunks) {
            if (chunk.web?.uri) {
              sources.push({
                title: chunk.web.title || "",
                uri: chunk.web.uri,
              });
            }
          }
        }

        return { text, sources };
      } catch (e: any) {
        lastError = e.message || "Network error";
        continue;
      }
    }
  }

  throw new Error(`AI unavailable: ${lastError}`);
}

/* # Standard Gemini call (no web search) */
export async function callGemini(prompt: string): Promise<string> {
  const result = await callGeminiInternal(prompt);
  return result.text;
}

/* # Gemini call with Google Search grounding for real-time research */
export async function callGeminiWithSearch(prompt: string): Promise<{
  text: string;
  sources: { title: string; uri: string }[];
}> {
  return callGeminiInternal(prompt, { useSearch: true });
}
