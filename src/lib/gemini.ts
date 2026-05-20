/* ============================================================
   GEMINI CLIENT - Google Gemini AI API
   ============================================================
   Calls Gemini with model fallback and retry logic.
   Shared across all marketing agent personas.
   ============================================================ */

/* eslint-disable @typescript-eslint/no-explicit-any */

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

const deadModels = new Map<string, number>();
const DEAD_TTL = 60 * 60 * 1000;
const TIMEOUT_MS = 45_000;

export async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

  let lastError = "";

  for (let pass = 0; pass < 2; pass++) {
    if (pass > 0) await new Promise((r) => setTimeout(r, 2000));

    for (const model of GEMINI_MODELS) {
      const deadSince = deadModels.get(model);
      if (deadSince && Date.now() - deadSince < DEAD_TTL) continue;
      if (deadSince) deadModels.delete(model);

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.8, maxOutputTokens: 8192 },
            }),
            signal: controller.signal,
          }
        );

        clearTimeout(timeout);

        if (res.status === 404) { deadModels.set(model, Date.now()); continue; }
        if (res.status === 429 || res.status === 503) { lastError = `${model} rate-limited`; continue; }
        if (!res.ok) { const d = await res.json(); lastError = d.error?.message || "API error"; continue; }

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) { lastError = "Empty AI response"; continue; }

        return text;
      } catch (e: any) {
        lastError = e.message || "Network error";
        continue;
      }
    }
  }

  throw new Error(`AI unavailable: ${lastError}`);
}
