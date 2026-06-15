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

// # Content types that get auto-visual generation
const VISUAL_CONTENT_TYPES = ["post", "carousel", "single_image", "reel_script"];

// # Auto-generate visual for a content record
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

      await prisma.content.update({
        where: { id: contentId },
        data: {
          visualData: JSON.stringify(design.slides),
          captionText: design.caption || null,
        },
      });

      console.log(`[Visual] Auto-design succeeded for ${contentId} (attempt ${attempt})`);
      return;
    } catch (e) {
      console.error(`[Visual] Auto-design attempt ${attempt} failed for ${contentId}:`, e);
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }

  // # Both attempts failed — create a fallback hero slide so the post still has a visual
  try {
    const fallbackSlide = [{
      headline: content.hook || content.title,
      subheadline: content.hook && content.title !== content.hook ? content.title : undefined,
      layout: "hero" as const,
      slideNumber: 1,
      totalSlides: 1,
      photoKeywords: "professional career modern office",
    }];

    await prisma.content.update({
      where: { id: contentId },
      data: {
        visualData: JSON.stringify(fallbackSlide),
        notes: `${content.notes ? content.notes + " | " : ""}Visual design failed — using fallback hero slide`,
      },
    });

    console.warn(`[Visual] Using fallback hero slide for ${contentId}`);
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

      // # Auto-design visuals for visual content types (runs in background, non-blocking)
      for (const record of saved) {
        if (VISUAL_CONTENT_TYPES.includes(record.contentType)) {
          autoGenerateVisual(record.id).catch((e) =>
            console.error(`[Visual] Batch auto-visual failed for ${record.id}:`, e)
          );
        }
      }

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
