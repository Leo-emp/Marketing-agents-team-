/* ============================================================
   RESEARCH AGENT - Real-time Trend & Industry Research
   ============================================================
   Conducts web research via Gemini Search grounding before
   any content is created. Provides current data, trends,
   and angles to ensure content is timely and relevant.
   ============================================================ */

import { callGemini, callGeminiWithSearch } from "./gemini";

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

/* # Discover a high-potential topic autonomously via real-time research
   # Called when no topic is provided — the agent picks its own angle */
export async function discoverTopic(
  platform: string,
  contentType: string,
  tone?: string
): Promise<{ topic: string; reasoning: string; researchBrief: ResearchBrief }> {
  // # Step 1: Research what's trending right now in the career/hiring space
  const researchPrompt = `You are a research analyst specializing in the career tech and job search industry. Your job is to find what's CURRENTLY VIRAL, TRENDING, or generating high engagement in the career and job search space.

TARGET PLATFORM: ${platform}
CONTENT FORMAT: ${contentType}
${tone ? `DESIRED TONE: ${tone}` : ""}

RESEARCH TASK:
1. What career/hiring topics are going VIRAL on ${platform} right now? (last 7 days)
2. What controversial or surprising job market news just dropped?
3. What are job seekers complaining about or celebrating right now?
4. What content from career influencers is getting massive engagement?
5. Any new AI hiring tools, layoff news, salary reports, or workplace policy changes?

INDUSTRY CONTEXT:
- Brand: JobPilot AI — all-in-one AI career platform (resume tools, interview prep, cover letters, LinkedIn optimization, portfolio builder)
- Audience: active job seekers, career changers, recent grads, international professionals
- Voice: expert career advisor, not salesy — builds trust through real expertise

Return a JSON object:
{
  "trending": ["specific trending topic with detail", ...],
  "viral_angles": ["specific angle that's getting engagement", ...],
  "dataPoints": ["recent stat or finding", ...],
  "news": ["recent career/hiring news item", ...],
  "avoidTopics": ["oversaturated topic to skip", ...],
  "summary": "2-3 paragraph landscape brief"
}

Be SPECIFIC and CURRENT. Reference real events, real numbers, real trends from the last 7-14 days.
Return ONLY valid JSON.`;

  let research: ResearchBrief;
  let rawResearch: { trending?: string[]; viral_angles?: string[]; dataPoints?: string[]; news?: string[]; avoidTopics?: string[]; summary?: string } = {};

  try {
    const { text, sources } = await callGeminiWithSearch(researchPrompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      rawResearch = JSON.parse(jsonMatch[0]);
    }
    research = {
      trends: rawResearch.trending || [],
      dataPoints: rawResearch.dataPoints || [],
      angles: rawResearch.viral_angles || [],
      avoidTopics: rawResearch.avoidTopics || [],
      sources,
      rawBrief: buildRawBrief({
        trends: rawResearch.trending,
        dataPoints: rawResearch.dataPoints,
        angles: rawResearch.viral_angles,
        avoidTopics: rawResearch.avoidTopics,
        summary: rawResearch.summary,
      }, sources),
    };
  } catch (e) {
    console.error("Topic discovery research failed:", e);
    research = buildFallbackBrief("career tips job search AI hiring", platform, []);
    rawResearch = {};
  }

  // # Step 2: Pick the single best topic from the research — specific angle, not generic
  const pickPrompt = `You are a content strategist for a career tech brand (JobPilot AI). Based on the research below, pick ONE specific, high-potential content topic.

PLATFORM: ${platform}
CONTENT TYPE: ${contentType}
${tone ? `TONE: ${tone}` : ""}

RESEARCH DATA:
${research.rawBrief}

RULES FOR PICKING A TOPIC:
- Pick something TIMELY — connected to current news, trends, or viral conversations
- Be SPECIFIC — "Why applying to 100 jobs a week actually hurts your chances" not "Resume tips"
- Pick an angle that will STOP THE SCROLL — counterintuitive, data-backed, or emotionally resonant
- Consider what performs best on ${platform}: ${
    platform === "linkedin" ? "thought leadership, data stories, contrarian takes, frameworks"
    : platform === "twitter" ? "punchy takes, surprising stats, hot takes, thread-worthy topics"
    : platform === "instagram" ? "save-worthy tips, carousel-friendly frameworks, visual before/afters"
    : "relatable scenarios, POV hooks, quick tips, surprising reveals"
  }
- The topic should naturally relate to job searching, careers, resumes, interviews, or professional growth
- Avoid generic evergreen topics unless you have a genuinely fresh angle backed by current data
- NEVER pick topics from the "avoid" list

Return a JSON object:
{
  "topic": "The specific, scroll-stopping topic with a clear thesis (this gets passed to the writing agent)",
  "reasoning": "Why this topic will perform well right now — what trend or data point makes it timely"
}

Return ONLY valid JSON.`;

  try {
    const pickRaw = await callGemini(pickPrompt);
    const pickMatch = pickRaw.match(/\{[\s\S]*\}/);
    if (!pickMatch) throw new Error("No JSON in topic pick response");
    const picked = JSON.parse(pickMatch[0]);

    // # Cache the research so the content generator doesn't repeat it
    const key = getCacheKey(picked.topic, platform);
    cache.set(key, { brief: research, timestamp: Date.now() });

    return {
      topic: picked.topic,
      reasoning: picked.reasoning,
      researchBrief: research,
    };
  } catch (e) {
    console.error("Topic pick failed, using fallback:", e);
    // # Fallback: use the first trend or angle from the research
    const fallbackTopic = research.trends[0] || research.angles[0] || "How AI is changing the way companies screen resumes in 2026";
    const key = getCacheKey(fallbackTopic, platform);
    cache.set(key, { brief: research, timestamp: Date.now() });

    return {
      topic: fallbackTopic,
      reasoning: "Auto-selected from trending research data",
      researchBrief: research,
    };
  }
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
