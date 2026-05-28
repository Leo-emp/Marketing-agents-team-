/* ============================================================
   REPURPOSE API — /api/repurpose
   ============================================================
   POST: Take existing content and adapt it for a different
   platform. LinkedIn post → tweet thread, carousel → reel
   script, etc. Uses the target platform's agent voice and
   format rules to create a native-feeling adaptation.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateContent, AGENTS } from "@/lib/agents";
import { isAdmin, unauthorized } from "@/lib/auth-check";
import { designVisual } from "@/lib/visual/designer-agent";

/* # Content types that get auto-visual generation */
const VISUAL_CONTENT_TYPES = ["post", "carousel", "single_image", "reel_script"];

/* # Platform → agent mapping */
const PLATFORM_AGENT: Record<string, string> = {
  linkedin: "linkedin",
  twitter: "twitter",
  instagram: "instagram",
  tiktok: "tiktok",
};

/* # Suggest the best content type for each platform based on source type */
const DEFAULT_TARGET_TYPE: Record<string, Record<string, string>> = {
  linkedin: {
    post: "post",
    carousel: "carousel",
    thread: "post",
    plain_text: "post",
    reel_script: "carousel",
    single_image: "post",
  },
  twitter: {
    post: "thread",
    carousel: "carousel",
    thread: "thread",
    plain_text: "plain_text",
    reel_script: "thread",
    single_image: "post",
  },
  instagram: {
    post: "carousel",
    carousel: "carousel",
    thread: "carousel",
    plain_text: "single_image",
    reel_script: "reel_script",
    single_image: "single_image",
  },
  tiktok: {
    post: "reel_script",
    carousel: "carousel",
    thread: "reel_script",
    plain_text: "reel_script",
    reel_script: "reel_script",
    single_image: "single_image",
  },
};

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  try {
    const body = await req.json();
    const { contentId, targetPlatform, targetContentType } = body;

    if (!contentId || !targetPlatform) {
      return NextResponse.json(
        { error: "contentId and targetPlatform are required" },
        { status: 400 }
      );
    }

    const agentId = PLATFORM_AGENT[targetPlatform];
    if (!agentId) {
      return NextResponse.json(
        { error: `Unknown platform: ${targetPlatform}` },
        { status: 400 }
      );
    }

    /* # Load the source content */
    const source = await prisma.content.findUnique({ where: { id: contentId } });
    if (!source) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    /* # Determine the target content type */
    const finalType = targetContentType
      || DEFAULT_TARGET_TYPE[targetPlatform]?.[source.contentType]
      || "post";

    /* # Build repurpose context — give the agent the full source content to adapt */
    const repurposeContext = `REPURPOSE TASK: Adapt the following content from ${source.platform} (${source.contentType}) to ${targetPlatform} (${finalType}).

ORIGINAL CONTENT:
---
${source.body}
---
${source.captionText ? `ORIGINAL CAPTION:\n${source.captionText}\n---` : ""}

IMPORTANT RULES FOR REPURPOSING:
- Do NOT copy the original word-for-word. ADAPT it for ${targetPlatform}'s native format and audience.
- Adjust length, structure, and tone to match ${targetPlatform} conventions.
- Keep the core insight/message but reframe it for the new platform's style.
- The hook must be rewritten — what stops the scroll on ${source.platform} is different from ${targetPlatform}.
- If converting to a reel_script, add timing, text overlays, and visual directions.
- If converting to a carousel, break the content into 7-10 scannable slides.
- If converting to a thread, make each tweet standalone-worthy.`;

    /* # Generate using the target platform's agent */
    const content = await generateContent(
      agentId,
      source.title,
      finalType,
      repurposeContext,
      undefined,
      { skipResearch: true }
    );

    /* # Save the repurposed content */
    const record = await prisma.content.create({
      data: {
        agent: agentId,
        platform: targetPlatform,
        contentType: content.contentType || finalType,
        title: `${content.title} (from ${source.platform})`,
        body: content.content,
        hashtags: content.hashtags,
        mediaPrompt: content.mediaPrompt,
        hook: content.hook,
        status: "pending",
        researchBrief: source.researchBrief,
        notes: `Repurposed from ${source.platform} content: ${source.id}`,
      },
    });

    /* # Auto-design visual for visual content types */
    if (VISUAL_CONTENT_TYPES.includes(record.contentType)) {
      try {
        const design = await designVisual(
          record.body,
          record.platform,
          record.contentType,
          record.mediaPrompt,
          record.title
        );
        await prisma.content.update({
          where: { id: record.id },
          data: {
            visualData: JSON.stringify(design.slides),
            captionText: design.caption || null,
          },
        });
      } catch (e) {
        console.warn(`Auto-visual failed for repurposed content ${record.id}:`, e);
      }
    }

    return NextResponse.json({
      repurposed: record,
      source: { id: source.id, platform: source.platform, contentType: source.contentType },
    });
  } catch (e) {
    console.error("Repurpose failed:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: `Repurpose failed: ${message}` }, { status: 500 });
  }
}
