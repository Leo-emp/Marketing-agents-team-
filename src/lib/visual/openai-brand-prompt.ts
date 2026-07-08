/* ============================================================
   OPENAI BRAND PROMPT — Full Brand Brief for Image Generation
   ============================================================
   Single source of truth for the brand context injected into
   every OpenAI gpt-image-1 image generation call.
   Provides rich product context and quality expectations.
   Does NOT prescribe layout — OpenAI decides the design.
   ============================================================ */

import { BRAND_NAME, BRAND_URL, MASCOT_DESCRIPTION, ACCENT_1 } from "./brand";

// # Build the full brand-aware image prompt
// # contentDirection: what the image should communicate (topic, headline, key message)
// # platform: target social platform (affects composition expectations)
export function buildBrandImagePrompt(contentDirection: string, platform: string): string {
  return `Create a professional, designer-grade marketing image for ${BRAND_NAME} (${BRAND_URL}).

ABOUT ${BRAND_NAME}:
${BRAND_NAME} is an AI-powered career platform — the all-in-one toolkit for job seekers. Features include:
- AI Resume Builder: ATS-optimized resumes with scoring, optimization, and complete rebuilds
- AI Cover Letter Generator: matched to specific jobs using real resume achievements
- Interview Prep Coach: AI mock interviews with real-time feedback, STAR-method coaching
- Job Search Aggregator: LinkedIn, Indeed, Glassdoor, Google Jobs — all in one dashboard
- Career Dashboard: application tracking, skill gap analysis, follow-up reminders
- AI Portfolio Builder: 9 premium templates with shareable public URLs
- Chrome Extension: one-click job saving and instant match scoring
Mission: Make job hunting effortless with AI
Values: Precision, empowerment, modern technology, accessibility, quality

BRAND VISUAL IDENTITY:
- Primary color: blue (${ACCENT_1})
- Style: clean, modern, tech-forward, premium SaaS aesthetic
- Must include "${BRAND_URL}" somewhere in the image
- Brand mascot (use when appropriate, not every image): ${MASCOT_DESCRIPTION}

QUALITY REQUIREMENTS (CRITICAL):
- Must look like a professional human designer created it — polished, intentional, production-ready
- NO AI-generated artifacts: no watermarks, no AI logos, no glowing neural networks, no circuit board patterns
- NO generic stock-photo feel: no floating holographic interfaces, no unnamed people pointing at screens
- NO "AI slop": no melted text, no extra fingers, no uncanny valley faces, no overly symmetrical compositions
- Text in the image must be crisp, readable, and correctly spelled
- Color palette should feel cohesive and premium — blues, whites, clean dark backgrounds
- Ready to publish on ${platform} — no additional editing needed

CONTENT DIRECTION:
${contentDirection}`;
}
