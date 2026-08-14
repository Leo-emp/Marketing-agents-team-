# JobPilot Marketing Agents: Technical Report

## Problem Statement

SaaS marketing demands consistent, high-quality content across multiple social platforms — a task that typically requires a dedicated marketing team or agency ($5,000-15,000/month). Solo founders face an impossible tradeoff: spend hours creating content manually, or neglect marketing entirely.

Three technical challenges make automation harder than simply "hooking up an AI to social media":

1. **Voice consistency** — Generic AI content sounds identical across posts and platforms. Building a recognizable brand requires distinct personas that maintain character across hundreds of posts.
2. **Quality variance** — LLM output quality is unpredictable. Without a quality gate, low-effort content dilutes the brand and reduces engagement.
3. **Multi-platform formatting** — A LinkedIn carousel has different constraints than a TikTok caption or an Instagram reel. Content must be platform-native, not cross-posted verbatim.

## Approach

### Multi-Agent Architecture

The system implements 8 specialized AI agents, each with a unique persona, voice, and platform expertise. Every agent receives the same brand context (product features, positioning, target audience) but applies it through a different lens:

| Agent | Role | Technique |
|-------|------|-----------|
| Growth Hacker | Conversion-focused | Data-driven hooks, ROI framing |
| Storyteller | Emotional connection | User journey narratives |
| Data Nerd | Authority building | Stats, benchmarks, surprising data |
| Provocateur | Engagement farming | Contrarian takes, debate starters |
| Educator | Trust building | Step-by-step guides, tutorials |
| Visualist | Visual-first content | Carousel designs, infographics |
| Trend Surfer | Cultural relevance | Trending formats, timely hooks |
| Ambassador | Social proof | Testimonials, case studies |

Each agent receives **voice samples** — curated examples of their ideal writing style — injected into the prompt. This grounds the LLM's output in a specific voice rather than its default register, producing content that reads like it came from 8 different human writers.

### Two-Pass Quality Pipeline

Content generation uses a two-pass architecture:

**Pass 1 — Generation:** The selected agent creates content optimized for creativity, relevance, and platform-specific formatting. The prompt includes brand context, recent research, and voice samples.

**Pass 2 — Editorial Review:** A separate AI agent evaluates the content on 4 independent dimensions, each scored 1-10:

- **Hook Strength** — Will the first line stop the scroll?
- **Specificity** — Does it reference concrete features/data, or speak in generalities?
- **Brand Alignment** — Is the tone, positioning, and product representation accurate?
- **Platform Fit** — Does the format, length, and style match the target platform's norms?

Content scoring below threshold on any dimension is rejected with specific feedback. This two-pass approach is more effective than a single "generate good content" prompt because the generation and evaluation objectives are distinct — creativity vs. quality — and LLMs perform better when optimizing for one objective at a time.

### Visual Generation Engine

The system produces 5 types of visual content through different rendering pipelines:

**AI-Generated Images (fal.ai Flux Pro):** For original imagery — hero shots, abstract concepts, lifestyle scenes. The AI prompt is derived from the post content, with brand color and style constraints injected. fal.ai was chosen over alternatives for its API-first design, fast generation, and pricing transparency.

**Branded HTML Templates (72 templates):** For structured content — stats cards, feature highlights, tip lists, quotes. The system renders React/HTML templates to PNG using a headless renderer, with automatic brand overlay (logo, watermark, color scheme). Templates are organized by platform (LinkedIn, Instagram, TikTok) with shared constants ensuring visual consistency.

**PDF Carousels:** For LinkedIn and Instagram multi-slide posts. The system generates a sequence of slides as individual canvases, composites them into a PDF, and uploads for platform carousel format.

**Caption Burning:** Text overlays applied directly to images for platforms where captions are secondary to visuals (Instagram Stories, TikTok).

**Reel Assembly:** Short-form video construction combining generated images, text overlays, transitions, and background music using Remotion's programmatic video framework.

### Auto-Posting Pipeline

The posting system handles the full lifecycle from approved content to live post:

1. **OAuth Connection** — Each platform (LinkedIn, X, Instagram, TikTok) is connected via OAuth 2.0 with token storage and automatic refresh via cron
2. **Scheduling** — Content is assigned a posting time based on platform-specific optimal engagement windows
3. **Posting** — The cron scheduler picks up due content, calls the platform API, handles media upload (images, PDFs, videos), and records the platform post ID
4. **Retry Logic** — Failed posts are retried with exponential backoff (3 attempts), with failure notifications sent to the admin
5. **Engagement Tracking** — After posting, the system pulls engagement metrics (likes, comments, shares, impressions) back into the database for performance analysis

### Email Marketing Engine

Seven automated email sequences handle user lifecycle communication:

Each sequence is defined as a series of timed emails with conditional triggers. The email engine uses Resend's API for delivery, with unsubscribe handling, webhook processing for delivery/bounce/complaint events, and automatic seed-on-deploy so sequences are always available in production.

### Analytics & Attribution

The KPI module tracks content performance across platforms and feeds insights back into the generation process:

- **Engagement metrics** per post (likes, comments, shares, saves, impressions)
- **A/B variation tracking** — content can be grouped into variation sets for split testing
- **UTM parameter generation** — every link includes UTM tags for funnel attribution
- **Attribution sync** — connects social engagement to website signups and conversions

## Results

### System Specifications

| Metric | Value |
|--------|-------|
| Total codebase | 6,700+ lines of TypeScript |
| Source files | 148 modules |
| API routes | 46 endpoints |
| AI agents | 8 specialized personas |
| Visual templates | 72 across 3 platforms |
| Email sequences | 7 automated drips |
| Database models | 10 |
| Platform integrations | 4 social + 4 external services |
| Content pipeline stages | 5 (research → generate → review → visual → post) |

### Architecture Highlights

- **Zero human effort for content creation** — agents research, write, review, visualize, and schedule autonomously
- **Quality gate** — 4-dimensional editorial scoring prevents low-quality content from reaching platforms
- **Platform-native output** — separate template sets and formatting rules per platform
- **Fault tolerance** — retry logic, token refresh, fallback renderers ensure posting continuity

## Conclusions

The multi-agent approach to marketing automation demonstrates that LLM-based systems can produce diverse, brand-consistent content at scale when each agent is given a distinct voice, platform expertise, and quality feedback loop. The key insight is separation of concerns: generation agents optimize for creativity and relevance, while the editorial agent optimizes for quality — this division produces better results than a single agent trying to do both.

The visual generation system's dual approach (AI imagery + branded templates) provides both creative flexibility and brand consistency. AI-generated images work best for attention-grabbing hero shots, while templated slides ensure every stat card, feature highlight, and tip list carries the brand identity.

Auto-posting with OAuth + cron eliminates the manual bottleneck that kills most solo-founder marketing efforts. The system maintains a 4-platform posting cadence that would require 10-15 hours/week of manual work.

## Future Work

- **Performance-driven agent selection** — automatically assign the best-performing agent per platform based on historical engagement data
- **Audience segmentation** — tailor content based on follower demographics and engagement patterns
- **Competitive intelligence** — monitor competitor social accounts and identify content gaps to exploit
- **Video-first content** — expand Remotion pipeline for TikTok/Reels as short-form video dominates engagement
