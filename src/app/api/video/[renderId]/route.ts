/* ============================================================
   VIDEO PROGRESS — /api/video/[renderId]
   ============================================================
   GET: Poll Lambda render progress. Returns status, progress
   percentage, and video URL when complete.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin, unauthorized } from "@/lib/auth-check";
import { checkProgress } from "@/lib/remotion-lambda";

type Params = { params: Promise<{ renderId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  if (!(await isAdmin())) return unauthorized();

  const { renderId } = await params;

  // # Find content with this render ID
  const content = await prisma.content.findFirst({
    where: { videoRenderId: { startsWith: renderId } },
  });

  if (!content || !content.videoRenderId) {
    return NextResponse.json({ error: "Render not found" }, { status: 404 });
  }

  // # Extract renderId and bucketName from stored value
  const [storedRenderId, bucketName] = content.videoRenderId.split("::");

  if (!bucketName) {
    return NextResponse.json({ error: "Invalid render data" }, { status: 500 });
  }

  const status = await checkProgress(storedRenderId, bucketName);

  // # If done, save the video URL
  if (status.status === "done" && status.videoUrl) {
    await prisma.content.update({
      where: { id: content.id },
      data: { videoUrl: status.videoUrl },
    });
  }

  return NextResponse.json(status);
}
