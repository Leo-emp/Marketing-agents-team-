/* ============================================================
   VISUAL SERVE — /api/visual/[id]
   ============================================================
   GET: Re-renders a stored Visual record on demand as PNG.
   Enables shareable and downloadable image URLs.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";
import { isAdmin, unauthorized } from "@/lib/auth-check";
import { renderSlide } from "@/lib/visual/templates";
import type { SlideData } from "@/lib/visual/types";

/* # Font cache */
let fontCache: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache;
  try {
    const buffer = await readFile(join(process.cwd(), "public", "fonts", "Geist-Regular.ttf"));
    fontCache = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    return fontCache;
  } catch {
    const buffer = await readFile(join(process.cwd(), "node_modules", "next", "dist", "compiled", "@vercel", "og", "Geist-Regular.ttf"));
    fontCache = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    return fontCache;
  }
}

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
    const fontData = await loadFont();

    const element = renderSlide(slideData, visual.width, visual.height);
    const imgResponse = new ImageResponse(element, {
      width: visual.width,
      height: visual.height,
      fonts: [{ name: "Geist", data: fontData, style: "normal" as const, weight: 400 as const }],
    });

    // # Return the image with proper headers
    const arrayBuffer = await imgResponse.arrayBuffer();
    return new NextResponse(arrayBuffer, {
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
