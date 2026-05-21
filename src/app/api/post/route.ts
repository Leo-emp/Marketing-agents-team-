/* ============================================================
   POST API — /api/post
   ============================================================
   POST: Publish an approved content item to its platform.
   Updates the content record with the platform post ID.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { postToPlatform } from "@/lib/social-posting";
import { isAdmin, unauthorized } from "@/lib/auth-check";

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  const { contentId } = await req.json();

  if (!contentId) {
    return NextResponse.json({ error: "contentId is required" }, { status: 400 });
  }

  const content = await prisma.content.findUnique({ where: { id: contentId } });

  if (!content) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  if (content.status !== "approved" && content.status !== "scheduled") {
    return NextResponse.json(
      { error: `Content must be approved first (current status: ${content.status})` },
      { status: 400 }
    );
  }

  /* # Use captionText for platforms with visuals, fall back to body */
  let postText = content.captionText || content.body;
  if (content.hashtags && content.platform !== "twitter") {
    const tags = content.hashtags.split(",").map((t) => `#${t.trim()}`).join(" ");
    postText += `\n\n${tags}`;
  }

  const result = await postToPlatform(content.platform, postText, content.imageUrl || undefined);

  if (result.success) {
    await prisma.content.update({
      where: { id: contentId },
      data: {
        status: "posted",
        postedAt: new Date(),
        platformPostId: result.platformPostId,
      },
    });

    return NextResponse.json({ success: true, platformPostId: result.platformPostId });
  }

  return NextResponse.json({ success: false, error: result.error }, { status: 500 });
}
