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

  const allowedFields = ["body", "title", "hashtags", "notes", "status", "scheduledFor"];
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

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!(await isAdmin())) return unauthorized();

  const { id } = await params;

  await prisma.content.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
