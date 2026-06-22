/* ============================================================
   CREATIVE STUDIO — Generate Video Clip
   ============================================================
   POST: Admin route for on-demand video clip generation.
   Accepts a prompt + model + duration + aspect ratio.
   Returns the Vercel Blob URL of the generated video.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { isAdmin, unauthorized } from "@/lib/auth-check";
import { generateVideoClip, type FalVideoModel } from "@/lib/visual/fal-video";

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  try {
    const body = await req.json();
    const { prompt, model, duration, aspectRatio } = body as {
      prompt: string;
      model?: FalVideoModel;
      duration?: number;
      aspectRatio?: "16:9" | "9:16" | "1:1";
    };

    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    // # Generate the video clip via fal.ai
    const result = await generateVideoClip(prompt, {
      model: model || "wan-2.1",
      duration: duration || 5,
      aspectRatio: aspectRatio || "9:16",
    });

    if (!result) {
      return NextResponse.json(
        { error: "Video generation failed — check FAL_KEY and try again" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      videoUrl: result.videoUrl,
      duration: result.duration,
    });
  } catch (err) {
    console.error("[Creative Video] Failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
