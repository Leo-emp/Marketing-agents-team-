/* ============================================================
   GENERATE API — /api/generate
   ============================================================
   POST: Generate content using a specific agent persona.
   Includes research context. After text generation, auto-
   generates visuals for image/carousel/reel content types.
   Can generate a single piece, regenerate existing, or batch
   from a plan. Saves generated content to the queue.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateContent, generateVariations, generateBatch, AGENTS } from "@/lib/agents";
import type { PlanItem } from "@/lib/agents";
import { isAdmin, unauthorized } from "@/lib/auth-check";
import { designVisual } from "@/lib/visual/designer-agent";
import { renderSlideCanvas } from "@/lib/visual/canvas-renderer";
import { getDimensions, type SlideData } from "@/lib/visual/types";
import { generateImage } from "@/lib/visual/openai-image";
import { generateFalImage } from "@/lib/visual/fal-image";
import { uploadImage } from "@/lib/blob-storage";
import { isTemplateId, getTemplateDimensions } from "@/lib/visual/templates/index";
import { renderTemplateHTML } from "@/lib/visual/html-renderer";
import type { TemplateContent, TemplateId } from "@/lib/visual/templates/shared";

// # Content types that get auto-visual generation
const VISUAL_CONTENT_TYPES = ["post", "carousel", "single_image", "reel_script"];

// # Convert SlideData to TemplateContent for the HTML renderer
function slideToTemplateContent(slide: SlideData): TemplateContent {
  return {
    headline: slide.headline,
    subheadline: slide.subheadline,
    body: slide.body,
    stat: slide.stat,
    beforeText: slide.beforeText,
    afterText: slide.afterText,
    bars: slide.bars,
    steps: slide.steps?.map(s => ({
      label: String(s.number),
      title: s.title,
      description: s.detail,
    })),
    bullets: slide.bullets,
    ...(slide as unknown as Record<string, unknown>),
  };
}

// # Render a single slide with tiered fallback:
// # 1. HTML template (PRIMARY — layout is t1-t186, Puppeteer render)
// # 2. fal.ai Flux Pro (fallback — $0.05/image)
// # 3. OpenAI gpt-image-1 (secondary fallback)
// # 4. Canvas 2D (last resort — text-only, free)
async function renderSlide(slide: SlideData, width: number, height: number, platform: string): Promise<Buffer> {
  // # HTML template path — branded Puppeteer-rendered templates
  if (isTemplateId(slide.layout)) {
    const content = slideToTemplateContent(slide);
    return renderTemplateHTML(slide.layout as TemplateId, content, width, height);
  }

  if (slide.aiImagePrompt) {
    // # Try fal.ai Flux Pro first (best quality, supports exact dimensions)
    const falBuffer = await generateFalImage(slide.aiImagePrompt, width, height, { model: "flux-pro" });
    if (falBuffer) return falBuffer;
    console.log("[Visual] fal.ai failed — trying OpenAI...");

    // # Try OpenAI as secondary
    const aiBuffer = await generateImage(slide.aiImagePrompt, width, height, platform);
    if (aiBuffer) return aiBuffer;
    console.log("[Visual] OpenAI failed — falling back to Canvas 2D");
  }
  return renderSlideCanvas(slide, width, height);
}

// # Render designed slides to PNGs, upload to Blob, return comma-separated URLs
async function renderAndUploadSlides(slides: SlideData[], platform: string, contentType: string, contentId: string): Promise<string> {
  const visualType = contentType === "carousel" ? "carousel" : contentType === "reel_script" ? "storyboard" : "single_image";
  const platformDims = getDimensions(platform, visualType);
  const urls: string[] = [];

  for (let i = 0; i < slides.length; i++) {
    const slide: SlideData = { ...slides[i], slideNumber: slides[i].slideNumber ?? i + 1, totalSlides: slides[i].totalSlides ?? slides.length };
    // # Use template-native dimensions to avoid clipping portrait templates
    const tDims = isTemplateId(slide.layout) ? getTemplateDimensions(slide.layout) : null;
    const width = tDims?.width ?? platformDims.width;
    const height = tDims?.height ?? platformDims.height;
    const pngBuffer = await renderSlide(slide, width, height, platform);

    try {
      const filename = `visual-${platform}-${contentId}-slide-${i}.png`;
      urls.push(await uploadImage(pngBuffer, filename));
    } catch (err) {
      console.warn("[Visual] Blob upload failed, using base64 fallback:", err);
      urls.push(`data:image/png;base64,${pngBuffer.toString("base64")}`);
    }
  }

  return urls.join(",");
}

// # Auto-generate visual for a content record: design + render + upload
// # Retries once on failure, falls back to basic hero slide if both attempts fail
async function autoGenerateVisual(contentId: string) {
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content) return;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const design = await designVisual(
        content.body,
        content.platform,
        content.contentType,
        content.mediaPrompt,
        content.title
      );

      // # Render slides to PNGs and upload to Blob for HTTPS URLs
      const imageUrl = await renderAndUploadSlides(design.slides, content.platform, content.contentType, contentId);

      await prisma.content.update({
        where: { id: contentId },
        data: {
          visualData: JSON.stringify(design.slides),
          captionText: design.caption || null,
          imageUrl,
        },
      });

      console.log(`[Visual] Auto-design + render succeeded for ${contentId} (attempt ${attempt})`);
      return;
    } catch (e) {
      console.error(`[Visual] Auto-design attempt ${attempt} failed for ${contentId}:`, e);
      if (attempt < 2) {
        // # Wait 30s between attempts so Gemini rate limit resets
        await new Promise((r) => setTimeout(r, 30000));
      }
    }
  }

  // # Both attempts failed — create a fallback hero slide, render it, and save
  try {
    const fallbackSlides: SlideData[] = [{
      headline: content.hook || content.title,
      subheadline: content.hook && content.title !== content.hook ? content.title : undefined,
      layout: "hero" as const,
      slideNumber: 1,
      totalSlides: 1,
      photoKeywords: "professional career modern office",
    }];

    const imageUrl = await renderAndUploadSlides(fallbackSlides, content.platform, content.contentType, contentId);

    await prisma.content.update({
      where: { id: contentId },
      data: {
        visualData: JSON.stringify(fallbackSlides),
        imageUrl,
        notes: `${content.notes ? content.notes + " | " : ""}Visual design failed — using fallback hero slide`,
      },
    });

    console.warn(`[Visual] Using fallback hero slide (rendered) for ${contentId}`);
  } catch (fallbackErr) {
    console.error(`[Visual] Even fallback failed for ${contentId}:`, fallbackErr);
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  try {
    const body = await req.json();

    /* ---- Batch mode: generate all posts from a plan ---- */
    if (body.planId) {
      const planRecord = await prisma.contentPlan.findUnique({
        where: { id: body.planId },
      });

      if (!planRecord) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
      }

      const plan: PlanItem[] = JSON.parse(planRecord.plan);
      const results = await generateBatch(plan);

      if (results.length === 0) {
        return NextResponse.json({ error: "All content generation failed — check your Gemini API key" }, { status: 500 });
      }

      const saved = [];
      for (const r of results) {
        const record = await prisma.content.create({
          data: {
            agent: r.agentId,
            platform: r.plan.platform,
            contentType: r.content.contentType || r.plan.contentType,
            title: r.content.title,
            body: r.content.content,
            hashtags: r.content.hashtags,
            mediaPrompt: r.content.mediaPrompt,
            hook: r.content.hook,
            status: "pending",
            researchBrief: r.content.researchBrief || null,
            editorialScore: r.content.editorial?.score || null,
            editorialFeedback: r.content.editorial ? `${r.content.editorial.feedback}${r.content.editorial.issues.length ? " | Issues: " + r.content.editorial.issues.join("; ") : ""}` : null,
          },
        });
        saved.push(record);
      }

      // # Auto-design visuals for visual content types (awaited so Vercel doesn't kill the function)
      const visualRecords = saved.filter((r) => VISUAL_CONTENT_TYPES.includes(r.contentType));
      await Promise.allSettled(
        visualRecords.map((record) => autoGenerateVisual(record.id))
      );

      await prisma.contentPlan.update({
        where: { id: body.planId },
        data: { status: "active" },
      });

      return NextResponse.json({ generated: saved.length, total: plan.length, items: saved });
    }

    /* ---- Regenerate mode: create new version of existing content ---- */
    if (body.regenerateId) {
      const existing = await prisma.content.findUnique({
        where: { id: body.regenerateId },
      });

      if (!existing) {
        return NextResponse.json({ error: "Content not found" }, { status: 404 });
      }

      const content = await generateContent(
        existing.agent,
        existing.title,
        existing.contentType,
        body.context || undefined,
        body.tone || undefined
      );

      const record = await prisma.content.create({
        data: {
          agent: existing.agent,
          platform: existing.platform,
          contentType: content.contentType || existing.contentType,
          title: content.title,
          body: content.content,
          hashtags: content.hashtags,
          mediaPrompt: content.mediaPrompt,
          hook: content.hook,
          status: "pending",
          researchBrief: content.researchBrief || null,
        },
      });

      // # Auto-design visual for visual content types
      if (VISUAL_CONTENT_TYPES.includes(record.contentType)) {
        autoGenerateVisual(record.id);
      }

      return NextResponse.json(record);
    }

    /* ---- Single mode: generate one piece of content (with optional variations) ---- */
    // # topic is optional — when empty, the agent auto-discovers a trending topic
    const { agentId, topic, contentType, context, tone, variations } = body;

    if (!agentId || !contentType) {
      return NextResponse.json(
        { error: "agentId and contentType are required" },
        { status: 400 }
      );
    }

    if (!AGENTS[agentId]) {
      return NextResponse.json({ error: `Unknown agent: ${agentId}` }, { status: 400 });
    }

    /* # Generate variations if requested (2-3 alternative versions) */
    const variationCount = typeof variations === "number" ? variations : 1;

    if (variationCount > 1) {
      const { contents: allVariants, variationGroup } = await generateVariations(agentId, topic, contentType, variationCount, context, tone);

      const saved = [];
      for (let i = 0; i < allVariants.length; i++) {
        const v = allVariants[i];
        const record = await prisma.content.create({
          data: {
            agent: agentId,
            platform: AGENTS[agentId].platform,
            contentType: v.contentType || contentType,
            title: `${v.title}${i > 0 ? ` (v${i + 1})` : ""}`,
            body: v.content,
            hashtags: v.hashtags,
            mediaPrompt: v.mediaPrompt,
            hook: v.hook,
            status: "pending",
            researchBrief: v.researchBrief || null,
            variationGroup,
            editorialScore: v.editorial?.score || null,
            editorialFeedback: v.editorial ? `${v.editorial.feedback}${v.editorial.issues.length ? " | Issues: " + v.editorial.issues.join("; ") : ""}` : null,
            notes: i > 0 ? `Variation ${i + 1} of ${allVariants.length}` : `Original (1 of ${allVariants.length} variations)`,
          },
        });
        saved.push(record);

        if (VISUAL_CONTENT_TYPES.includes(record.contentType)) {
          autoGenerateVisual(record.id);
        }
      }

      return NextResponse.json({ variations: saved.length, variationGroup, items: saved });
    }

    /* # Single generation (default) */
    const content = await generateContent(agentId, topic, contentType, context, tone);

    const record = await prisma.content.create({
      data: {
        agent: agentId,
        platform: AGENTS[agentId].platform,
        contentType: content.contentType || contentType,
        title: content.title,
        body: content.content,
        hashtags: content.hashtags,
        mediaPrompt: content.mediaPrompt,
        hook: content.hook,
        status: "pending",
        researchBrief: content.researchBrief || null,
        editorialScore: content.editorial?.score || null,
        editorialFeedback: content.editorial ? `${content.editorial.feedback}${content.editorial.issues.length ? " | Issues: " + content.editorial.issues.join("; ") : ""}` : null,
      },
    });

    // # Auto-design visual for visual content types
    if (VISUAL_CONTENT_TYPES.includes(record.contentType)) {
      await autoGenerateVisual(record.id);
    }

    return NextResponse.json(record);
  } catch (e) {
    console.error("Content generation failed:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: `Generation failed: ${message}` }, { status: 500 });
  }
}
