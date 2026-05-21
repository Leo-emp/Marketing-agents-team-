/* ============================================================
   VIDEO API — /api/video
   ============================================================
   POST: Trigger video reel rendering on AWS Lambda.
   Designs scenes from content, starts render, returns renderId.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin, unauthorized } from "@/lib/auth-check";
import { designReel } from "@/lib/visual/reel-designer";
import { triggerRender } from "@/lib/remotion-lambda";
import type { ReelConfig } from "@/lib/visual/types";

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  try {
    const { contentId, redesign } = await req.json();

    if (!contentId) {
      return NextResponse.json({ error: "contentId is required" }, { status: 400 });
    }

    const content = await prisma.content.findUnique({ where: { id: contentId } });
    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    if (content.contentType !== "reel_script") {
      return NextResponse.json({ error: "Content must be a reel_script" }, { status: 400 });
    }

    // # Design reel scenes (or reuse existing)
    let reelConfig: ReelConfig;

    if (content.visualData && !redesign) {
      try {
        const parsed = JSON.parse(content.visualData);
        if (parsed.scenes && parsed.fps) {
          reelConfig = parsed as ReelConfig;
        } else {
          throw new Error("Not a ReelConfig");
        }
      } catch {
        // # Existing visualData isn't a ReelConfig, design fresh
        reelConfig = await designReel(content.body, content.platform, content.mediaPrompt, content.title);
      }
    } else {
      reelConfig = await designReel(content.body, content.platform, content.mediaPrompt, content.title);
    }

    // # Save reel config
    await prisma.content.update({
      where: { id: contentId },
      data: { visualData: JSON.stringify(reelConfig) },
    });

    // # Trigger Lambda render
    const { renderId, bucketName } = await triggerRender(reelConfig, contentId);

    // # Save render ID for progress polling
    await prisma.content.update({
      where: { id: contentId },
      data: { videoRenderId: `${renderId}::${bucketName}` },
    });

    return NextResponse.json({ renderId, bucketName, contentId });
  } catch (e) {
    console.error("Video render trigger failed:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: `Video generation failed: ${message}` }, { status: 500 });
  }
}
