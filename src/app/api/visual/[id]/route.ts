/* ============================================================
   VISUAL SERVE — /api/visual/[id]
   ============================================================
   GET: Re-renders a stored Visual record on demand as PNG.
   Uses @napi-rs/canvas for full pixel-level rendering.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin, unauthorized } from "@/lib/auth-check";
import { renderSlideCanvas } from "@/lib/visual/canvas-renderer";
import type { SlideData } from "@/lib/visual/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return unauthorized();

  try {
    const { id } = await params;

    const visual = await prisma.visual.findUnique({ where: { id } });
    if (!visual) {
      return NextResponse.json({ error: "Visual not found" }, { status: 404 });
    }

    const slideData: SlideData = JSON.parse(visual.data);

    // # Render via Canvas
    const pngBuffer = await renderSlideCanvas(slideData, visual.width, visual.height);

    return new NextResponse(pngBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
        "Content-Disposition": `inline; filename="jobpilot-visual-${id}.png"`,
      },
    });
  } catch (e) {
    console.error("Visual render failed:", e);
    return NextResponse.json({ error: "Render failed" }, { status: 500 });
  }
}
