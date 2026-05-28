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
];

/* # All samples indexed by platform */
export const VOICE_SAMPLES: Record<string, VoiceSample[]> = {
  linkedin: LINKEDIN_SAMPLES,
  twitter: TWITTER_SAMPLES,
  instagram: INSTAGRAM_SAMPLES,
  tiktok: TIKTOK_SAMPLES,
};

/* # Get voice samples for injection into a specific agent's prompt */
export function getVoiceSamplesPrompt(platform: string, contentType?: string): string {
  const samples = VOICE_SAMPLES[platform];
  if (!samples || samples.length === 0) return "";

  /* # Filter by content type if specified, otherwise show all */
  const filtered = contentType
    ? samples.filter((s) => s.contentType === contentType || s.contentType === "post")
    : samples;

  if (filtered.length === 0) return "";

  /* # Pick up to 2 samples to keep prompt reasonable */
  const selected = filtered.slice(0, 2);

  const examples = selected.map((s, i) => `EXAMPLE ${i + 1} (${s.contentType}):\n${s.text}`).join("\n\n---\n\n");

  return `\nVOICE REFERENCE — Study these examples carefully. Match this voice, style, and level of specificity. Do NOT copy these examples — create original content that SOUNDS like them:\n\n${examples}\n\nKey patterns to match from these examples:\n- Specific numbers and scenarios, never vague claims\n- Short paragraphs with line breaks between each thought\n- First person perspective with real-sounding experience\n- One clear takeaway per piece\n- Conversational but authoritative tone\n- No filler phrases, no AI patterns, no corporate speak\n`;
}
