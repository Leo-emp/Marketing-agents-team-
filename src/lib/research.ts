/* ============================================================
   RESEARCH AGENT - Real-time Trend & Industry Research
   ============================================================
   Conducts web research via Gemini Search grounding before
   any content is created. Provides current data, trends,
   and angles to ensure content is timely and relevant.
   ============================================================ */

import { callGeminiWithSearch } from "./gemini";

/* ---- Types ---- */
export interface ResearchBrief {
  trends: string[];       // # Current trending topics in the space
  dataPoints: string[];   // # Specific stats, numbers, recent findings
  angles: string[];       // # Content angles worth exploring
  avoidTopics: string[];  // # Oversaturated or risky topics to skip
  sources: { title: string; uri: string }[];
  rawBrief: string;       // # Full text brief to inject into agent prompts
}

/* ---- In-memory cache (1 hour TTL) ---- */
const cache = new Map<string, { brief: ResearchBrief; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000;

function getCacheKey(topic: string, platform: string): string {
  return `${platform}:${topic.toLowerCase().trim().slice(0, 100)}`;
}

/* # Main research function — called before every content generation */
export async function conductResearch(
  topic: string,
  platform: string,
  context?: string
): Promise<ResearchBrief> {
  // # Check cache first
  const key = getCacheKey(topic, platform);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.brief;
  }

  const prompt = `You are a research analyst specializing in the career tech and job search industry. Your job is to find CURRENT, SPECIFIC, and VERIFIABLE information.

RESEARCH TASK: Find the latest trends, data, and news related to: "${topic}"
TARGET PLATFORM: ${platform}
${context ? `ADDITIONAL CONTEXT: ${context}` : ""}

RESEARCH FOCUS:
1. What is CURRENTLY trending in this space? (last 7-14 days)
2. Any recent news, studies, or reports with specific numbers?
3. What angles are competitors or thought leaders taking on this topic?
4. What content formats are performing well for this topic on ${platform}?
5. What should we AVOID? (oversaturated takes, controversial angles, outdated advice)

INDUSTRY CONTEXT:
- We operate in the career tech / job search / AI hiring space
- Our brand is JobPilot AI — an all-in-one AI job search platform
- We want to position ourselves as a trustworthy, expert authority
- Our audience: professionals actively job hunting

Return a JSON object with this exact structure:
{
  "trends": ["trend 1 with specific detail", "trend 2", ...],
  "dataPoints": ["specific stat or finding with source context", ...],
  "angles": ["content angle worth exploring", ...],
  "avoidTopics": ["topic to avoid and why", ...],
  "summary": "A 2-3 paragraph brief summarizing the research landscape. Include specific numbers, recent events, and recommended positioning. This will be injected into content creator prompts."
}

Be SPECIFIC. No generic observations. Every trend and data point should reference something concrete and current.
Return ONLY a valid JSON object.`;

  try {
    const { text, sources } = await callGeminiWithSearch(prompt);

    // # Parse the research response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return buildFallbackBrief(topic, platform, sources);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const brief: ResearchBrief = {
      trends: parsed.trends || [],
      dataPoints: parsed.dataPoints || [],
      angles: parsed.angles || [],
      avoidTopics: parsed.avoidTopics || [],
      sources,
      rawBrief: buildRawBrief(parsed, sources),
    };

    // # Cache the result
    cache.set(key, { brief, timestamp: Date.now() });

    return brief;
  } catch (e) {
    console.error("Research failed, proceeding without research data:", e);
    return buildFallbackBrief(topic, platform, []);
  }
}

/* # Build the raw brief text that gets injected into agent prompts */
function buildRawBrief(
  parsed: { trends?: string[]; dataPoints?: string[]; angles?: string[]; avoidTopics?: string[]; summary?: string },
  sources: { title: string; uri: string }[]
): string {
  const parts: string[] = [];

  if (parsed.summary) {
    parts.push(`RESEARCH SUMMARY:\n${parsed.summary}`);
  }

  if (parsed.trends?.length) {
    parts.push(`CURRENT TRENDS:\n${parsed.trends.map((t: string) => `- ${t}`).join("\n")}`);
  }

  if (parsed.dataPoints?.length) {
    parts.push(`KEY DATA POINTS:\n${parsed.dataPoints.map((d: string) => `- ${d}`).join("\n")}`);
  }

  if (parsed.angles?.length) {
    parts.push(`RECOMMENDED ANGLES:\n${parsed.angles.map((a: string) => `- ${a}`).join("\n")}`);
  }

  if (parsed.avoidTopics?.length) {
    parts.push(`TOPICS TO AVOID:\n${parsed.avoidTopics.map((t: string) => `- ${t}`).join("\n")}`);
  }

  if (sources.length > 0) {
    parts.push(`SOURCES:\n${sources.slice(0, 5).map((s) => `- ${s.title || s.uri}`).join("\n")}`);
  }

  return parts.join("\n\n");
}

/* # Minimal brief when research fails — content gen can still proceed */
function buildFallbackBrief(
  topic: string,
  platform: string,
  sources: { title: string; uri: string }[]
): ResearchBrief {
  return {
    trends: [],
    dataPoints: [],
    angles: [`Focus on evergreen advice about: ${topic}`],
    avoidTopics: [],
    sources,
    rawBrief: `Research unavailable. Focus on providing specific, actionable advice about "${topic}" for ${platform}. Use concrete examples and data where possible.`,
  };
}
