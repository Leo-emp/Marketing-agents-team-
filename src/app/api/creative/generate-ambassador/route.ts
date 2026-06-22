/* ============================================================
   CREATIVE STUDIO — Generate Ambassador Video
   ============================================================
   POST: Admin route for on-demand ambassador video generation.
   Accepts an optional topic and platform.
   Runs the full pipeline: topic → script → HeyGen → queue.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { isAdmin, unauthorized } from "@/lib/auth-check";
import { generateAmbassadorVideo } from "@/lib/ambassador";

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  try {
    const body = await req.json();
    const { topic, platform } = body as {
      topic?: string;
      platform?: string;
    };

    // # Run the full ambassador pipeline
    // # If no topic is provided, the pipeline auto-discovers a trending topic
    const result = await generateAmbassadorVideo(topic, platform);

    if (!result) {
      return NextResponse.json(
        { error: "Ambassador video generation failed — check HEYGEN_API_KEY and HEYGEN_AVATAR_ID" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      contentId: result.contentId,
      videoUrl: result.videoUrl,
      script: result.script,
      duration: result.duration,
    });
  } catch (err) {
    console.error("[Creative Ambassador] Failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
