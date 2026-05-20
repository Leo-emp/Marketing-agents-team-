/* ============================================================
   GENERATE API — /api/generate
   ============================================================
   POST: Generate content using a specific agent persona.
   Can generate a single piece or a batch from a plan.
   Saves generated content directly to the queue.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateContent, generateBatch, AGENTS } from "@/lib/agents";
import type { PlanItem } from "@/lib/agents";
import { isAdmin, unauthorized } from "@/lib/auth-check";

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

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

    /* Save each generated piece to the content queue */
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
        },
      });
      saved.push(record);
    }

    /* Mark plan as active */
    await prisma.contentPlan.update({
      where: { id: body.planId },
      data: { status: "active" },
    });

    return NextResponse.json({ generated: saved.length, items: saved });
  }

  /* ---- Single mode: generate one piece of content ---- */
  const { agentId, topic, contentType, context } = body;

  if (!agentId || !topic || !contentType) {
    return NextResponse.json(
      { error: "agentId, topic, and contentType are required" },
      { status: 400 }
    );
  }

  if (!AGENTS[agentId]) {
    return NextResponse.json({ error: `Unknown agent: ${agentId}` }, { status: 400 });
  }

  const content = await generateContent(agentId, topic, contentType, context);

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
    },
  });

  return NextResponse.json(record);
}
