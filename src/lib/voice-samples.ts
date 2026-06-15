/* ============================================================
   VOICE SAMPLES - Real Writing Examples Per Platform
   ============================================================
   Few-shot examples injected into agent prompts so the AI
   mimics actual human writing patterns. Each sample represents
   the TARGET voice — specific, punchy, no-fluff content that
   sounds like a real person, not a content mill.

   Add your own top-performing posts here over time. The more
   samples, the more consistent the voice becomes.
   ============================================================ */

export interface VoiceSample {
  platform: string;
  contentType: string;
  text: string;
}

/* # LinkedIn voice — authoritative expert sharing hard-won insights */
const LINKEDIN_SAMPLES: VoiceSample[] = [
  {
    platform: "linkedin",
    contentType: "post",
    text: `I reviewed 200 resumes last month for a single senior PM role.

Here's what separated the 12 we interviewed from the 188 we didn't:

The rejected resumes listed responsibilities. "Managed a team of 5." "Oversaw product roadmap." "Led cross-functional collaboration."

The shortlisted resumes proved impact. "Reduced churn by 18% in Q3 by redesigning the onboarding flow based on session recording analysis." "Shipped 3 features that drove $1.2M in upsell revenue within 6 months."

The difference isn't talent. It's framing.

Every bullet on your resume should answer one question: "So what happened because of that?"

If the answer is "nothing measurable" — rewrite it until it is.

Most people undersell themselves because they describe what they did, not what changed because they did it.

What's one resume line you've rewritten recently that made a real difference?

#resumetips #jobsearch #careeradvice #hiring`,
  },
  {
    platform: "linkedin",
    contentType: "post",
    text: `Stop applying to jobs you're 100% qualified for.

Counterintuitive, I know. But here's what the data shows:

Men apply to jobs when they meet 60% of the requirements. Women apply when they meet 100%. The result? Women miss out on roles they'd actually excel in.

But here's the part nobody talks about — job descriptions are wish lists, not checklists.

I've hired over 40 people across three companies. Exactly zero of them checked every box in the posting. The strongest hires were people who brought unexpected strengths we didn't know we needed.

If you can do 65-70% of what's listed, you're a real candidate. The rest is learnable on the job — and hiring managers know this.

The only thing "underqualified" means is "hasn't been given the chance yet."

What role did you almost not apply for that turned out to be a great fit?

#careers #hiring #jobsearch`,
  },
  {
    platform: "linkedin",
    contentType: "carousel",
    text: `[SLIDE 1] The salary negotiation script that got me a 35% raise

[SLIDE 2] Step 1: Never give a number first.
"I'd love to understand the full compensation structure before discussing numbers."

[SLIDE 3] Step 2: Anchor high with data.
"Based on my research — Levels.fyi, Glassdoor, and conversations with peers — the market range for this role is X to Y."

[SLIDE 4] Step 3: Justify with specifics.
"Given my background in [specific skill] and the results I delivered at [company] — specifically [metric] — I believe the upper end of that range reflects my value."

[SLIDE 5] Step 4: Pause after stating your number.
Silence is your strongest negotiation tool. Let them respond first.

[SLIDE 6] Step 5: Negotiate beyond salary.
Stock, signing bonus, remote flexibility, title, PTO, learning budget — these all have real value and are often easier for companies to approve.

[SLIDE 7] The magic phrase if they pushback:
"I understand budget constraints. What would need to be true for us to reach [your number] within the first 6-12 months?"

[SLIDE 8] Try this with your next offer. Save this post for when you need it.

CAPTION: I used this exact framework last year and it worked. The key is preparation — if you walk in with market data and specific results, you're not "asking for more money." You're presenting evidence for your value. Most people leave 10-20% on the table because they feel uncomfortable. Practice the conversation out loud before the call. It gets easier.`,
  },
  {
    platform: "linkedin",
    contentType: "post",
    text: `Stop telling people to "just network more."

Here's what networking actually looks like when it works:

It's not attending events with 300 people and collecting business cards. It's sending one specific message to one specific person who works at a company you're targeting.

I tracked my last job search. 147 applications through job boards. Result: 3 interviews.

12 warm introductions through targeted outreach. Result: 5 interviews and 2 offers.

The math isn't subtle. One warm intro is worth roughly 12 cold applications.

But here's the part people skip — the outreach has to be SPECIFIC. "I'd love to pick your brain" gets ignored. "I noticed your team shipped [specific product] last quarter — I led a similar project at [company] and I'd love to understand how you approached [specific challenge]" gets responses.

The difference is effort per contact. Most people optimize for volume. The people who get hired fastest optimize for relevance.

Who gave you the intro that changed your career?

#networking #jobsearch #careeradvice`,
  },
  {
    platform: "linkedin",
    contentType: "post",
    text: `Unpopular take: Your resume doesn't need to be one page.

I know, I know. Every career coach on the internet says one page. Here's what they're not telling you:

That advice was created for campus recruiting. Entry-level roles. Graduates with 0-3 years of experience.

If you have 10+ years of relevant experience, forcing it onto one page means cutting the exact achievements that differentiate you from other candidates.

I've talked to 30+ hiring managers this year. Not one of them said they rejected a two-page resume from a senior candidate. Several said they've rejected one-pagers because the candidate looked "thin on results."

The actual rule: Every line must earn its place. If cutting a bullet point doesn't weaken your candidacy, cut it. If it does — keep it, even if that means page two.

Two pages of impact beats one page of compressed mediocrity.

What's the best advice you've ever ignored?

#resumetips #careeradvice #hiring`,
  },
  {
    platform: "linkedin",
    contentType: "post",
    text: `73% of hiring managers say they've made a bad hire because they rushed the interview process.

That's not a candidate problem. That's a process problem.

I spent 6 years leading hiring at a Series B startup. Here's what I learned about what actually predicts job performance:

Structured interviews (same questions, same rubric for every candidate) — 2x more predictive than unstructured conversations.

Work sample tests — 3x more predictive than years of experience listed on a resume.

Behavioral questions with scoring rubrics — consistently outperform "gut feel" from even experienced hiring managers.

The implication for job seekers: when a company asks you structured, rubric-based questions, that's actually a green flag. It means they have a process. It means your actual skills matter more than your small talk.

And when they don't? When it's all vibes and "tell me about yourself"? Prepare harder, because the bar is less predictable.

What's the best-run interview process you've experienced?

#hiring #interviews #recruiting`,
  },
];

/* # X/Twitter voice — sharp, punchy, slightly provocative */
const TWITTER_SAMPLES: VoiceSample[] = [
  {
    platform: "twitter",
    contentType: "plain_text",
    text: `The people who get hired fastest aren't the most qualified.

They're the ones who make it easy for the hiring manager to say yes.

That means: clear resume, tailored application, visible online presence, and a follow-up that adds value instead of just "checking in."

Reduce friction. That's the whole game.`,
  },
  {
    platform: "twitter",
    contentType: "thread",
    text: `Your resume gets 6 seconds of attention. Here's what happens in those 6 seconds (and how to win them):

---TWEET---

Second 1-2: The recruiter scans your current title and company. If it's relevant to the role, they keep reading. If not, they're already looking for a reason to.

---TWEET---

Second 3-4: They skim your top 2-3 bullet points. Are there numbers? Results? Or just responsibilities? Numbers = keep reading. Walls of text = next.

---TWEET---

Second 5: Skills section. Quick keyword match against the job description. Missing the obvious ones? That's a pass.

---TWEET---

Second 6: Education/certs. Only matters for specific industries. For most roles, this is a tiebreaker at best.

---TWEET---

The fix: Your resume is a highlight reel, not an autobiography. Lead with impact. Cut everything that doesn't serve the first 6 seconds.

---TWEET---

Built an AI tool that scores your resume against any job description in under 30 seconds. Shows you exactly what's missing. jobpilotai.co`,
  },
  {
    platform: "twitter",
    contentType: "post",
    text: `"Tell me about yourself" is not an invitation to recite your resume.

It's a test of whether you can communicate clearly under pressure.

30 seconds. Present role, biggest win, why you're here. Done.`,
  },
  {
    platform: "twitter",
    contentType: "carousel",
    text: `[SLIDE 1] The 6-second resume test: what recruiters actually look at

[SLIDE 2] Second 1-2: Job title and current company.
Is it relevant? If not, they're already skeptical.

[SLIDE 3] Second 3-4: Top 3 bullet points.
Numbers = keep reading. Walls of text = next.

[SLIDE 4] Second 5: Skills section.
Quick keyword match against the job description.

[SLIDE 5] Second 6: Overall scan.
Clean formatting? Readable? Professional?

[SLIDE 6] The fix: treat your resume like a highlight reel.
Lead with impact. Cut everything that doesn't serve those 6 seconds.

CAPTION: Recruiters don't read resumes. They scan them. Build yours for scanning.`,
  },
  {
    platform: "twitter",
    contentType: "plain_text",
    text: `The worst career advice I ever got: "Just be yourself in the interview."

No. Be the best, most prepared version of yourself.

Research the company for 30 minutes. Prepare 3 stories using STAR method. Practice your answers out loud. Have 2 thoughtful questions ready.

That's not being fake. That's being professional.`,
  },
  {
    platform: "twitter",
    contentType: "post",
    text: `Recruiters spend 6 seconds on your resume.

In those 6 seconds, they check exactly 3 things:

1. Current title (relevant or not?)
2. Top 2 bullets (numbers or fluff?)
3. Keywords (match the JD or not?)

Everything else is tiebreaker territory.

Build for the scan, not the read.`,
  },
];

/* # Instagram voice — visual-first, save-worthy, clean aesthetic */
const INSTAGRAM_SAMPLES: VoiceSample[] = [
  {
    platform: "instagram",
    contentType: "carousel",
    text: `[SLIDE 1] 5 resume mistakes that make recruiters hit "reject" in seconds

[SLIDE 2] Using a generic objective statement.
"Seeking a challenging role where I can grow" tells them nothing.
Replace with a 2-line summary of your best results.

[SLIDE 3] Including every job you've ever had.
Nobody cares about your retail job from 2014.
Last 10-15 years. Relevant roles only.

[SLIDE 4] Listing responsibilities instead of results.
"Managed social media" vs "Grew Instagram from 2K to 45K followers in 8 months, driving 30% increase in website traffic."

[SLIDE 5] Using a two-column or creative layout.
ATS systems can't parse columns, tables, or graphics.
Single column. Simple formatting. Always.

[SLIDE 6] Forgetting to proofread.
One typo = "doesn't pay attention to detail."
Read it backwards. Read it out loud. Have someone else check it.

[SLIDE 7] Save this for your next resume update.
Follow for more career tips that actually work.

CAPTION: I've seen thousands of resumes at this point. These five mistakes account for probably 80% of the rejections I see. The good news — they're all fixable in under an hour. The single biggest impact change you can make today: replace every "responsible for" bullet with a "achieved X by doing Y" bullet. That alone will transform how recruiters read your experience.`,
  },
  {
    platform: "instagram",
    contentType: "reel_script",
    text: `[HOOK - 0:00-0:03] (text overlay: "The interview answer that gets you hired every time") Camera: direct to camera, close up

[BODY - 0:03-0:08] When they ask "Why should we hire you?" — most people list their skills. (text overlay: "Most people: I have 5 years of experience...")

[BODY - 0:08-0:18] Instead, flip it. Tell them what CHANGES when you join. (text overlay: "What changes when I join:") "At my last company, I noticed our onboarding took 3 weeks. I built a system that cut it to 4 days. That's what I do — I find the bottleneck and fix it."

[BODY - 0:18-0:25] You're not selling skills. You're selling outcomes. The hiring manager is thinking "what does my life look like 3 months after I hire this person?" Answer that. (text overlay: "Sell the outcome, not the skill")

[CTA - 0:25-0:30] Save this for your next interview. Follow for more. (text overlay: "Save for later")

CAPTION: This framework works because it shifts the conversation from what you've done to what you'll do for THEM. Practice it out loud before your next interview. The specific example is what sells it — pick your best "I noticed a problem and fixed it" story. That's your go-to answer.`,
  },
  {
    platform: "instagram",
    contentType: "single_image",
    text: `IMAGE TEXT: One resume change that gets 3x more callbacks: Lead every bullet with a number.

CAPTION: I tracked this across 50 job applications. Same resume, same roles, same companies. The only difference: I rewrote every bullet point to start with a measurable result instead of a responsibility.

Before: "Managed social media accounts for the marketing team."
After: "Grew Instagram from 2K to 45K followers in 8 months, generating 30% of all website traffic."

The callbacks went from 4% to 12%. That's not a small improvement — that's the difference between giving up and getting interviews.

The reason this works is simple: recruiters are scanning for proof you can deliver. A number is proof. A description of duties is not.

Take your top 3 bullet points tonight. Rewrite each one to start with a number. If you can't find a number, ask yourself: what changed because I did this? That's your metric.`,
  },
  {
    platform: "instagram",
    contentType: "carousel",
    text: `[SLIDE 1] The job search is mentally brutal. Here's what nobody prepares you for.

[SLIDE 2] The silence.
You'll apply to 30 jobs and hear nothing back from 25 of them. It's not personal. It's the system. 75% of applications never reach a human.

[SLIDE 3] The false hope.
You'll have great interviews and still not get the offer. Sometimes the role gets frozen. Sometimes there's an internal candidate. It's rarely about you.

[SLIDE 4] The comparison trap.
LinkedIn will show you everyone's wins and none of their rejections. For every "thrilled to announce" post, there are 50 silent losses behind the scenes.

[SLIDE 5] The timeline lie.
"It should take 3-6 months" — that's an average, not a deadline. Your timeline is your timeline. Quality matters more than speed.

[SLIDE 6] What actually helps:
Track applications so you can see progress even when it doesn't feel like it. Set a daily limit to prevent burnout. Celebrate small wins — every callback is proof your resume works.

[SLIDE 7] You're not failing. You're in the middle. Keep going.

CAPTION: I posted this because I see too many people blaming themselves for a process that's broken by design. The application process is not a reflection of your worth. It's a numbers game played inside a flawed system. If you're in the middle of it right now, this is your reminder that the silence doesn't mean what you think it means. Save this for the hard days.`,
  },
];

/* # TikTok voice — casual, direct, pattern-interrupting */
const TIKTOK_SAMPLES: VoiceSample[] = [
  {
    platform: "tiktok",
    contentType: "reel_script",
    text: `[HOOK - 0:00-0:03] (text overlay: "POV: You finally understand why you're not getting callbacks") Camera: sitting at desk, looking at phone

[BODY - 0:03-0:10] *picks up phone, shows screen* So I ran an experiment. I applied to 50 jobs with my old resume. Got 2 callbacks. (text overlay: "50 applications. 2 callbacks.")

[BODY - 0:10-0:20] Then I changed ONE thing. I rewrote every bullet point to start with a number. Not "managed projects" — "delivered 12 projects, 3 ahead of schedule, saving $40K." (text overlay: "Lead with numbers. Always.") [CUT TO close-up of resume showing the change]

[BODY - 0:20-0:30] Applied to 50 more jobs with the new resume. Got 11 callbacks. Same experience. Same person. Different framing. (text overlay: "50 apps. 11 callbacks. Same person.")

[CTA - 0:30-0:35] The resume isn't about what you did. It's about what happened because you did it. Link in bio for the free resume scorer. (text overlay: "What happened because of you?")

CAPTION: This is real. Same jobs, same qualifications, completely different results. The hiring manager doesn't care WHAT you did. They care what CHANGED because you did it. Try this with your top 3 bullet points tonight.`,
  },
  {
    platform: "tiktok",
    contentType: "carousel",
    text: `[SLIDE 1] Things recruiters actually check before reading your resume

[SLIDE 2] Your LinkedIn headline.
If it says "Open to Work" and nothing else, that's a red flag.
Add what you actually do and what makes you good at it.

[SLIDE 3] Your most recent role.
If it's more than a year old with no explanation, they assume the worst.
Freelancing, consulting, personal projects — anything is better than a blank gap.

[SLIDE 4] Time at each company.
Under a year at multiple jobs triggers "flight risk" concerns.
If there's a reason (layoffs, contract roles), address it in your summary.

[SLIDE 5] Your skills section.
They're looking for keyword matches with the job description.
Tailor this for every application. Yes, every single one.

[SLIDE 6] This is why "spray and pray" doesn't work.
10 tailored applications beat 100 generic ones.

CAPTION: Talked to a recruiter friend about this last week and it honestly changed how I think about applications. They spend maybe 10 seconds on your profile before even opening the resume. Make those 10 seconds count.`,
  },
  {
    platform: "tiktok",
    contentType: "single_image",
    text: `IMAGE TEXT: The interview question nobody prepares for: "What questions do you have for us?"

CAPTION: This is not a throwaway question. It's the last impression you make, and recruiters notice when you have nothing. Here are 3 that always impress: "What does the first 90 days look like for someone in this role?" — shows you're already thinking about execution. "What's the biggest challenge the team is facing right now?" — shows you want to help solve problems, not just fill a seat. "How do you measure success for this role at 6 months?" — shows you care about delivering results. Save this for your next interview.`,
  },
  {
    platform: "tiktok",
    contentType: "reel_script",
    text: `[HOOK - 0:00-0:03] (text overlay: "I got laid off. Here's what I did in the first 48 hours.") Camera: direct to camera, casual setting

[BODY - 0:03-0:10] First thing — I didn't apply to anything. (text overlay: "Step 1: Don't panic-apply") I took one day to process it. Applied in a panic state means sloppy resumes and generic cover letters.

[BODY - 0:10-0:20] Day 2, I made a list of 10 companies I actually wanted to work at. Not job boards — specific companies. Then I found people at each one on LinkedIn. (text overlay: "10 target companies, not 100 random applications") [CUT TO screen recording showing LinkedIn search]

[BODY - 0:20-0:30] By day 3, I had 4 conversations scheduled. Not interviews — conversations. "I'm exploring my next move and your team is doing interesting work. Could I ask you a few questions?" (text overlay: "4 conversations > 40 applications")

[CTA - 0:30-0:35] Two weeks later I had 2 offers. Targeted always beats volume. (text overlay: "Targeted > Volume. Always.") Follow for more job search strategies that actually work.

CAPTION: Getting laid off feels like the worst day. But the people who bounce back fastest are the ones who resist the urge to spray and pray. 10 targeted companies beat 100 random applications every single time. Sharing this because I wish someone had told me this before I wasted 3 months on job boards.`,
  },
];

/* # All samples indexed by platform */
export const VOICE_SAMPLES: Record<string, VoiceSample[]> = {
  linkedin: LINKEDIN_SAMPLES,
  twitter: TWITTER_SAMPLES,
  instagram: INSTAGRAM_SAMPLES,
  tiktok: TIKTOK_SAMPLES,
};

/* # Fetch top-performing posted content from DB as dynamic voice samples */
/* # These are real posts that performed well — the best training data */
async function getTopPerformers(platform: string, contentType?: string): Promise<VoiceSample[]> {
  try {
    const { prisma } = await import("@/lib/prisma");

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const where: any = {
      platform,
      status: "posted",
      engagementScore: { gt: 0 },
    };
    if (contentType) where.contentType = contentType;

    const top = await prisma.content.findMany({
      where,
      orderBy: { engagementScore: "desc" },
      take: 3,
      select: {
        contentType: true,
        body: true,
        captionText: true,
        engagementScore: true,
      },
    });

    return top.map((item) => ({
      platform,
      contentType: item.contentType,
      text: item.captionText ? `${item.body}\n\nCAPTION: ${item.captionText}` : item.body,
    }));
  } catch {
    return [];
  }
}

/* # Get voice samples for injection into a specific agent's prompt */
/* # Combines static hand-written samples with dynamic top performers */
export async function getVoiceSamplesPrompt(platform: string, contentType?: string): Promise<string> {
  const staticSamples = VOICE_SAMPLES[platform] || [];

  // # Fetch dynamic top performers from DB
  const dynamicSamples = await getTopPerformers(platform, contentType);

  /* # Prioritize exact content type matches, then fall back to any platform sample */
  let selectedStatic: VoiceSample[] = [];

  if (contentType) {
    const exactMatches = staticSamples.filter((s) => s.contentType === contentType);
    const otherSamples = staticSamples.filter((s) => s.contentType !== contentType);
    selectedStatic = [...exactMatches.slice(0, 2), ...otherSamples.slice(0, 3 - Math.min(exactMatches.length, 2))];
  } else {
    selectedStatic = staticSamples.slice(0, 3);
  }

  // # Dynamic samples get priority — they're proven performers
  const allSamples = [...dynamicSamples, ...selectedStatic];
  // # Cap at 5 total to keep prompt size reasonable
  const selected = allSamples.slice(0, 5);

  if (selected.length === 0) return "";

  const dynamicCount = Math.min(dynamicSamples.length, 5);
  const staticCount = selected.length - dynamicCount;

  const examples = selected.map((s, i) => {
    const label = i < dynamicCount ? `TOP PERFORMER ${i + 1}` : `REFERENCE ${i - dynamicCount + 1}`;
    return `${label} (${s.contentType}):\n${s.text}`;
  }).join("\n\n---\n\n");

  const dynamicNote = dynamicCount > 0
    ? `\nThe first ${dynamicCount} example(s) are REAL POSTS that performed well with your audience. Pay extra attention to their voice, structure, and hooks — these are proven winners.\n`
    : "";

  return `\nVOICE REFERENCE — Study these examples carefully. Match this voice, style, and level of specificity. Do NOT copy these examples — create original content that SOUNDS like them:\n${dynamicNote}\n${examples}\n\nKey patterns to match from these examples:\n- Specific numbers and scenarios, never vague claims\n- Short paragraphs with line breaks between each thought\n- First person perspective with real-sounding experience\n- One clear takeaway per piece\n- Conversational but authoritative tone\n- No filler phrases, no AI patterns, no corporate speak\n`;
}
