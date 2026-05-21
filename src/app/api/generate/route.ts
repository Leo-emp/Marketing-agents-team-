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
import { generateContent, generateBatch, AGENTS } from "@/lib/agents";
import type { PlanItem } from "@/lib/agents";
import { isAdmin, unauthorized } from "@/lib/auth-check";
import { designVisual } from "@/lib/visual/designer-agent";

// # Content types that get auto-visual generation
const VISUAL_CONTENT_TYPES = ["post", "carousel", "single_image", "reel_script"];

// # Auto-generate visual for a content record (non-blocking — failures don't break content creation)
async function autoGenerateVisual(contentId: string) {
  try {
    const content = await prisma.content.findUnique({ where: { id: contentId } });
    if (!content) return;

    const visualType = content.contentType === "carousel" ? "carousel"
      : content.contentType === "reel_script" ? "storyboard"
      : "single_image";

    const design = await designVisual(
      content.body,
      content.platform,
      content.contentType,
      content.mediaPrompt,
      content.title
    );

    // # Save visual data and caption to the content record (no image rendering here — that happens via /api/visual when needed)
    await prisma.content.update({
      where: { id: contentId },
      data: {
        visualData: JSON.stringify(design.slides),
        captionText: design.caption || null,
      },
    });
  } catch (e) {
    // # Visual design failure should never block content creation
    console.warn(`Auto-visual design failed for ${contentId}:`, e);
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
          },
        });
        saved.push(record);
      }

      // # Auto-design visuals for visual content types (runs in background, non-blocking)
      for (const record of saved) {
        if (VISUAL_CONTENT_TYPES.includes(record.contentType)) {
          autoGenerateVisual(record.id);
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

    /* ---- Single mode: generate one piece of content ---- */
    const { agentId, topic, contentType, context, tone } = body;

    if (!agentId || !topic || !contentType) {
      return NextResponse.json(
        { error: "agentId, topic, and contentType are required" },
        { status: 400 }
      );
    }

    if (!AGENTS[agentId]) {
      return NextResponse.json({ error: `Unknown agent: ${agentId}` }, { status: 400 });
    }

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
