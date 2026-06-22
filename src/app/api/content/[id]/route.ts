/* ============================================================
   CONTENT ITEM API — /api/content/[id]
   ============================================================
   PATCH:  Update content (edit, approve, reject, schedule)
   DELETE: Remove content from queue
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin, unauthorized } from "@/lib/auth-check";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await isAdmin())) return unauthorized();

  const { id } = await params;
  const body = await req.json();

  const allowedFields = ["body", "title", "hashtags", "notes", "status", "scheduledFor", "captionText", "visualData", "imageUrl", "editorialScore", "editorialFeedback", "variationGroup"];
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const data: any = {};
  for (const key of allowedFields) {
    if (body[key] !== undefined) {
      data[key] = key === "scheduledFor" && body[key] ? new Date(body[key]) : body[key];
    }
  }

  const updated = await prisma.content.update({
    where: { id },
    data,
  });

  // # Auto-publish blog articles when an admin approves them.
  // # We call the publish endpoint internally, forwarding the admin session
  // # cookie so the publish route can verify the caller is an admin.
  // # Errors are logged but do NOT fail the approval response — the admin
  // # can always retry the publish manually from the dashboard.
  if (data.status === "approved" && updated.contentType === "blog_article") {
    try {
      // # Build the absolute publish URL using the incoming request's origin
      const publishUrl = `${req.nextUrl.origin}/api/blog/publish`;
      const publishRes = await fetch(publishUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // # Forward the admin session cookie so the publish route can auth
          cookie: req.headers.get("cookie") || "",
        },
        body: JSON.stringify({ contentId: id }),
      });
      // # Log publish result for observability — admin sees no error but we can debug
      if (!publishRes.ok) {
        console.error("Auto-publish blog failed:", await publishRes.text());
      }
    } catch (err) {
      // # Non-fatal — approval still succeeds even if auto-publish fails
      console.error("Auto-publish blog failed:", err);
    }
  }

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!(await isAdmin())) return unauthorized();

  const { id } = await params;

  await prisma.content.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
