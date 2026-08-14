# JobPilot Marketing Agents

An autonomous AI marketing system that generates, reviews, schedules, and publishes social media content across 4 platforms — with 8 specialized AI agents, multi-format visual generation, email sequences, and a KPI analytics dashboard.

Built to run a SaaS marketing operation with near-zero human effort: **6,700+ lines of TypeScript**, 46 API routes, 10 database models, AI-generated visuals (fal.ai Flux Pro), and auto-posting to LinkedIn, X, Instagram, and TikTok.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                           │
│  Content queue · Schedule · KPI · Visual editor · Settings   │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────┐
│                     46 API ROUTES                            │
│  /generate · /research · /visual · /post · /kpi · /email    │
└────────────────────────────┬────────────────────────────────┘
                             │
    ┌────────────────────────┼────────────────────────────────┐
    │                        │                                │
    ▼                        ▼                                ▼
┌──────────────┐   ┌─────────────────┐   ┌──────────────────┐
│  8 AI AGENTS │   │  VISUAL ENGINE  │   │  AUTO-POSTING    │
│              │   │                 │   │                  │
│ Growth       │   │ fal.ai Flux Pro │   │ LinkedIn OAuth   │
│ Storyteller  │   │ HTML → PNG      │   │ Twitter OAuth    │
│ Data Nerd    │   │ PDF carousels   │   │ Instagram API    │
│ Provocateur  │   │ Platform temps  │   │ TikTok API       │
│ Educator     │   │ Brand overlay   │   │ Cron scheduler   │
│ Visualist    │   │ Caption burn    │   │ Retry + backoff  │
│ Trend Surfer │   │ 72 templates    │   │ Token refresh    │
│ Ambassador   │   │ Reel designer   │   │                  │
└──────────────┘   └─────────────────┘   └──────────────────┘
        │                   │                      │
        ▼                   ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   QUALITY PIPELINE                            │
│  Research → Generate → Editorial review → Visual → Schedule  │
│  Score 1-10 (hook, specificity, brand, platform fit)         │
└─────────────────────────────────────────────────────────────┘
        │
    ┌───┴────────────────────────────────────────────┐
    ▼                                                ▼
┌──────────────┐                          ┌──────────────┐
│  EMAIL       │                          │  ANALYTICS   │
│              │                          │              │
│ 7 sequences  │                          │ KPI tracker  │
│ Onboarding   │                          │ Engagement   │
│ Drip nurture │                          │ A/B testing  │
│ Re-engage    │                          │ UTM funnel   │
│ Resend API   │                          │ Attribution  │
└──────────────┘                          └──────────────┘
```

## AI/ML Techniques

| # | Technique | Implementation | Purpose |
|---|-----------|---------------|---------|
| 1 | **Multi-Agent System** | 8 specialized personas with Gemini | Each agent has unique voice, platform expertise, content style |
| 2 | **Research Agent** | Topic discovery + competitor analysis | Ground content in real trends and data |
| 3 | **Editorial AI Review** | 4-dimensional scoring (hook, specificity, brand, platform) | Quality gate before publishing |
| 4 | **AI Image Generation** | fal.ai Flux Pro (primary) + branded HTML templates | Platform-native visuals at scale |
| 5 | **Dynamic Voice System** | Voice sample injection per agent | Consistent brand personality across content |
| 6 | **AI Content Repurposing** | Cross-platform adaptation | One piece → 4 platform-optimized versions |
| 7 | **Performance Feedback Loop** | Engagement metrics → content scoring | Learn what works, amplify winning patterns |

## The 8 Agents

| Agent | Persona | Platform Focus | Content Style |
|-------|---------|---------------|---------------|
| Growth Hacker | Data-driven marketer | LinkedIn, X | ROI stats, conversion tips |
| Storyteller | Narrative builder | LinkedIn, Instagram | User journeys, transformation arcs |
| Data Nerd | Analytics obsessed | LinkedIn, X | Charts, benchmarks, surprising stats |
| Provocateur | Hot takes machine | X, TikTok | Contrarian views, debate starters |
| Educator | Patient teacher | LinkedIn, Instagram | How-to guides, step-by-step tutorials |
| Visualist | Design thinker | Instagram, TikTok | Carousel explainers, infographics |
| Trend Surfer | Culture connector | TikTok, X | Trending formats, meme-aware hooks |
| Ambassador | Customer voice | All platforms | Testimonials, case studies, social proof |

## Content Pipeline

Every piece of content flows through a 5-stage pipeline:

1. **Research** — AI discovers trending topics, analyzes competitors, identifies content gaps
2. **Generate** — Selected agent creates platform-optimized content with brand context injected
3. **Editorial Review** — Second AI pass scores the content on 4 dimensions (1-10 each: hook strength, specificity, brand alignment, platform fit). Content below threshold is rejected with feedback
4. **Visual Generation** — fal.ai Flux Pro renders images from AI prompts, or HTML templates generate branded slides/carousels. Brand overlay applied automatically
5. **Schedule & Post** — Content enters the queue, gets scheduled via cron, auto-posts to connected platforms with retry logic

## Visual Generation System

| Format | Technology | Platforms |
|--------|-----------|-----------|
| Single images | fal.ai Flux Pro AI generation | All |
| Branded slides | HTML → PNG rendering with brand overlay | LinkedIn, Instagram |
| PDF carousels | Multi-slide PDF generation | LinkedIn |
| Reels/Shorts | Video assembly pipeline | TikTok, Instagram |
| Blog images | Custom templates per post type | Blog (jobpilotai.co) |

**72 visual templates** across 3 platform template sets (LinkedIn, Instagram, TikTok) with shared constants for brand colors, typography, and layout patterns.

## Email Marketing

| Sequence | Trigger | Purpose |
|----------|---------|---------|
| Welcome | Signup | 3-email onboarding drip |
| Feature Discovery | Day 3-7 | Highlight underused features |
| Engagement | Low activity | Re-engagement nudge |
| Upgrade | Free plan limit | Pro upgrade pitch |
| Win-Back | Churned user | Return incentive |
| Weekly Digest | Cron (weekly) | New features + tips |
| Blog Notify | New blog post | Content alert |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Database | SQLite via Prisma (content queue, analytics, email sends) |
| AI | Google Gemini (content generation, research, editorial) |
| Image AI | fal.ai Flux Pro (primary), HTML Canvas (fallback) |
| Video | Remotion (reel assembly) |
| Email | Resend API |
| Social APIs | LinkedIn, X/Twitter, Instagram, TikTok (OAuth 2.0) |
| Storage | Vercel Blob |
| Deployment | Vercel (serverless + cron) |

## Project Structure

```
jobpilot-marketing/                # 6,700+ lines of TypeScript
├── src/
│   ├── app/
│   │   ├── api/                   # 46 API routes
│   │   │   ├── generate/          # Content generation (agents)
│   │   │   ├── research/          # Topic research + trends
│   │   │   ├── visual/            # Image/PDF/slide generation
│   │   │   ├── post/              # Auto-posting to platforms
│   │   │   ├── scheduler/         # Cron-based scheduling
│   │   │   ├── connect/           # OAuth for 4 platforms
│   │   │   ├── email/             # Email sequences + webhooks
│   │   │   ├── kpi/               # Analytics + performance
│   │   │   ├── funnel/            # UTM attribution + sync
│   │   │   ├── blog/              # Blog post generation
│   │   │   ├── video/             # Reel rendering pipeline
│   │   │   ├── creative/          # AI image + ambassador visuals
│   │   │   └── content/           # CRUD + engagement tracking
│   │   └── page.tsx               # Admin dashboard
│   ├── lib/
│   │   ├── agents.ts              # 8 AI agent personas
│   │   ├── research.ts            # Topic discovery + analysis
│   │   ├── editorial.ts           # 4-dim quality scoring
│   │   ├── gemini.ts              # Gemini API client
│   │   ├── social-posting.ts      # Multi-platform posting
│   │   ├── blog-writer.ts         # SEO blog generation
│   │   ├── visual/                # Visual generation engine
│   │   │   ├── fal-image.ts       # fal.ai Flux Pro integration
│   │   │   ├── templates/         # 72 platform templates
│   │   │   ├── brand-overlay.ts   # Automatic brand watermarks
│   │   │   ├── pdf-carousel.ts    # Multi-slide PDF builder
│   │   │   └── reel-designer.ts   # Short-form video assembly
│   │   ├── email/                 # Email marketing engine
│   │   │   ├── sequences.ts       # 7 automated sequences
│   │   │   ├── templates.ts       # Email HTML templates
│   │   │   └── resend.ts          # Resend API client
│   │   └── funnel/                # Attribution + analytics
│   │       ├── utm.ts             # UTM parameter tracking
│   │       └── analytics.ts       # Engagement analysis
│   └── components/
│       └── PlatformPreview.tsx     # Platform-faithful previews
├── prisma/
│   └── schema.prisma              # 10 models
└── scripts/                       # Seeding + admin tools
```

## By the Numbers

| Metric | Value |
|--------|-------|
| Source files | 148 TypeScript modules |
| Lines of code | 6,700+ |
| API routes | 46 |
| AI agents | 8 specialized personas |
| Visual templates | 72 (LinkedIn + Instagram + TikTok) |
| Email sequences | 7 automated drips |
| Database models | 10 |
| Platform integrations | 4 (LinkedIn, X, Instagram, TikTok) |

## Key Engineering Decisions

**Why 8 agents instead of 1?** Each social platform has distinct content norms. A LinkedIn thought leadership post reads differently than a TikTok hook. Specialized agents with injected voice samples produce platform-native content that a single generic prompt cannot match.

**Why fal.ai over DALL-E/Midjourney?** fal.ai Flux Pro offers API-first access with fast generation, transparent pricing, and no content restrictions on professional marketing imagery. The HTML template fallback ensures visuals are always available even if the AI image API is down.

**Why editorial review as a second AI pass?** First-pass generation optimizes for creativity. The editorial agent optimizes for quality — checking hook strength, specificity, brand alignment, and platform fit. This two-pass approach catches generic content before it reaches the queue.

**Why auto-posting over manual?** A solo founder cannot maintain consistent posting across 4 platforms. The cron scheduler + OAuth pipeline posts approved content automatically, with retry logic for API failures and token refresh for expired credentials.

## Setup

```bash
git clone https://github.com/Leo-emp/Marketing-agents-team-.git
cd Marketing-agents-team-

npm install

# Configure environment
cp .env.example .env
# Add: GEMINI_API_KEY, FAL_KEY, RESEND_API_KEY
# Add OAuth keys for each platform you want to auto-post to

npx prisma migrate dev
npm run dev
```

## Live

- **Powers:** [jobpilotai.co](https://jobpilotai.co) marketing
- **Repository:** [github.com/Leo-emp/Marketing-agents-team-](https://github.com/Leo-emp/Marketing-agents-team-)

## License

MIT
