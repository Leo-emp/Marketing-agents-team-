/* ============================================================
   EDITORIAL REVIEW AGENT - Second-Pass Quality Gate
   ============================================================
   Takes generated content and runs it through a second Gemini
   call acting as a human editor. Catches AI-detectable patterns,
   weak hooks, generic advice, banned phrases, and brand
   misalignment that the single-pass generation missed.
   Returns multi-dimensional scores, feedback, and revised content.
   ============================================================ */

import { callGemini } from "./gemini";

/* ---- Types ---- */
export interface EditorialReview {
  score: number;            // # 1-10 overall quality score
  passed: boolean;          // # true if all dimension scores >= 7
  feedback: string;         // # Specific feedback on what was fixed or flagged
  revisedContent: string;   // # The improved version (or original if score >= 9)
  revisedHook: string;      // # Improved first line
  issues: string[];         // # List of specific issues found
  // # Multi-dimensional scores
  hookScore: number;        // # Hook strength 1-10
  specScore: number;        // # Specificity 1-10
  brandScore: number;       // # Brand alignment 1-10
  platformScore: number;    // # Platform fit 1-10
  coherenceScore: number;   // # Headline-body coherence 1-10
}

/* # Main editorial review function — called after content generation */
export async function reviewContent(
  content: string,
  platform: string,
  contentType: string,
  hook: string,
  topPerformerContext?: string
): Promise<EditorialReview> {
  const prompt = `You are a senior content editor at a top-tier marketing agency. Your job is to review AI-generated social media content and make it indistinguishable from expert human writing.

REVIEW THIS ${platform.toUpperCase()} ${contentType.toUpperCase()}:
---
${content}
---
HOOK: "${hook}"
${topPerformerContext ? `\nTOP-PERFORMING CONTENT FOR REFERENCE:\n${topPerformerContext}\n\nCompare the content under review against these high performers. Does it match their quality, specificity, and voice?\n` : ""}
EVALUATE AGAINST THESE CRITERIA (score each 1-10):

1. AI DETECTION TEST
   - Does it sound like AI wrote it? Check for: overly balanced sentence structure, lists that feel algorithmic, transitions that are too smooth, vocabulary that's uniformly "elevated"
   - Real humans are messier — they emphasize unevenly, skip transitions, use colloquial phrases mixed with technical ones
   - Flag: "Certainly", "Let me break this down", "Here's the thing", "It goes without saying"

2. HOOK STRENGTH (hookScore)
   - Would a real person stop scrolling for this first line?
   - Is it specific (has a number, name, or scenario) or generic?
   - Does it create curiosity or tension?

3. SPECIFICITY CHECK (specScore)
   - Count concrete numbers, percentages, timeframes, named examples
   - Minimum 2 per piece. If fewer, flag it.
   - "Many companies" = fail. "73% of Fortune 500 companies" = pass.

4. BANNED PATTERN CHECK
   - Openers: "In today's competitive...", "It's no secret...", "Whether you're a...", "Picture this:", "Let's talk about..."
   - Phrases: "Game-changer", "Unlock your potential", "Level up", "Hot take:", "Stay ahead of the curve"
   - Structures: 3+ consecutive sentences starting with same word, passive voice in opener, generic numbered lists without data
   - ZERO EMOJIS allowed

5. BRAND ALIGNMENT (brandScore)
   - Does it sound like a senior career advisor sharing real expertise?
   - Is the tone confident and credible without being arrogant?
   - If JobPilot is mentioned, is it natural (not salesy)?

6. PLATFORM FIT (platformScore)
   - ${platform === "linkedin" ? "LinkedIn: 800-1300 chars, short paragraphs, ends with question, 3-5 hashtags" : ""}
   - ${platform === "twitter" ? "X/Twitter: under 280 chars for single tweets, punchy, no hashtags, contrarian edge" : ""}
   - ${platform === "instagram" ? "Instagram: visual-first, save-worthy, caption 100-300 words, 15-20 hashtags in first comment" : ""}
   - ${platform === "tiktok" ? "TikTok: casual voice, 3-second hook, pattern interrupts, 30-45s sweet spot" : ""}

7. CAPTION-VISUAL COMPLEMENTARITY (for image/carousel posts)
   - Does the caption repeat the visual text? It should NOT.
   - Caption should add context, story, or insight the image alone cannot convey.

8. HEADLINE-BODY COHERENCE CHECK (coherenceScore)
   - Re-read the hook/headline. Does the body ACTUALLY deliver what the headline promises?
   - If the headline frames a comparison ("X vs Y", "trap vs edge", "myth vs reality"), does the body show BOTH sides?
   - If the headline makes a bold claim ("the real reason", "why X fails"), does the body reveal that specific reason?
   - If the headline promises a number ("3 reasons", "5 steps"), does the body contain exactly that many?
   - A headline that promises something the body doesn't deliver makes the brand look amateurish. This is a CRITICAL check.
   - Score 1-3 if headline and body are disconnected. Score 4-6 if loosely related. Score 7-10 if body directly delivers the headline's promise.

TASK:
1. Score the content 1-10 overall AND on each dimension (hookScore, specScore, brandScore, platformScore)
2. List every specific issue found
3. If overall score < 9, rewrite the content fixing ALL issues while preserving the core message
4. If score >= 9, return the original unchanged

Return a JSON object:
{
  "score": 8,
  "hookScore": 7,
  "specScore": 8,
  "brandScore": 9,
  "platformScore": 8,
  "coherenceScore": 9,
  "issues": ["Hook is generic — no specific number or scenario", "Third paragraph sounds AI-generated — too balanced"],
  "feedback": "Strengthened the hook with a specific stat, rewrote paragraph 3 with a more natural voice",
  "revisedContent": "the full revised content here",
  "revisedHook": "the improved first line"
}

Return ONLY a valid JSON object. No explanation outside the JSON.`;

  try {
    const raw = await callGemini(prompt);

    // # Parse the editorial response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return buildPassthrough(content, hook);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      score: Math.min(10, Math.max(1, Number(parsed.score) || 5)),
      passed: [parsed.hookScore, parsed.specScore, parsed.brandScore, parsed.platformScore, parsed.coherenceScore]
        .every((s) => (Number(s) || 5) >= 7),
      feedback: String(parsed.feedback || ""),
      revisedContent: String(parsed.revisedContent || content),
      revisedHook: String(parsed.revisedHook || hook),
      issues: Array.isArray(parsed.issues) ? parsed.issues.map(String) : [],
      hookScore: Math.min(10, Math.max(1, Number(parsed.hookScore) || 5)),
      specScore: Math.min(10, Math.max(1, Number(parsed.specScore) || 5)),
      brandScore: Math.min(10, Math.max(1, Number(parsed.brandScore) || 5)),
      platformScore: Math.min(10, Math.max(1, Number(parsed.platformScore) || 5)),
      coherenceScore: Math.min(10, Math.max(1, Number(parsed.coherenceScore) || 5)),
    };
  } catch (e) {
    // # If editorial review fails, pass through the original content
    console.warn("Editorial review failed, using original content:", e);
    return buildPassthrough(content, hook);
  }
}

/* # Passthrough when editorial review fails — don't block content generation */
function buildPassthrough(content: string, hook: string): EditorialReview {
  return {
    score: 0,
    passed: true,
    feedback: "Editorial review unavailable — using original content",
    revisedContent: content,
    revisedHook: hook,
    issues: [],
    hookScore: 0,
    specScore: 0,
    brandScore: 0,
    platformScore: 0,
    coherenceScore: 0,
  };
}
