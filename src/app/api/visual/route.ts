/* ============================================================
   VISUAL API — /api/visual
   ============================================================
   POST: Generate branded PNG images from content.
   Two modes:
   - Design mode: pass contentId, AI designer creates slides
   - Direct mode: pass slides[], renders them directly
   Renders each slide via Satori (next/og ImageResponse).
   Returns base64-encoded PNG data URLs and saves Visual records.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";
import { isAdmin, unauthorized } from "@/lib/auth-check";
import { renderSlide } from "@/lib/visual/templates";
import { getDimensions, type SlideData, type VisualRequest } from "@/lib/visual/types";
import { designVisual } from "@/lib/visual/designer-agent";

/* # Cache the font in memory after first load */
let fontCache: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache;

  // # Try public/fonts first, then fall back to node_modules
  try {
    const fontPath = join(process.cwd(), "public", "fonts", "Geist-Regular.ttf");
    const buffer = await readFile(fontPath);
    fontCache = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    return fontCache;
  } catch {
    const fontPath = join(process.cwd(), "node_modules", "next", "dist", "compiled", "@vercel", "og", "Geist-Regular.ttf");
    const buffer = await readFile(fontPath);
    fontCache = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    return fontCache;
  }
}

/* # Render slides to PNGs and save to DB */
async function renderAndSave(
  slides: SlideData[],
  platform: string,
  type: string,
  contentId: string | null,
  fontData: ArrayBuffer
) {
  const { width, height } = getDimensions(platform, type);
  const results: { index: number; visualId: string; dataUrl: string; width: number; height: number }[] = [];

  for (let i = 0; i < slides.length; i++) {
    const slide: SlideData = {
      ...slides[i],
      slideNumber: slides[i].slideNumber ?? i + 1,
      totalSlides: slides[i].totalSlides ?? slides.length,
    };

    // # Render via Satori
    const element = renderSlide(slide, width, height);
    const imgResponse = new ImageResponse(element, {
      width,
      height,
      fonts: [{ name: "Geist", data: fontData, style: "normal" as const, weight: 400 }],
    });

    const arrayBuffer = await imgResponse.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:image/png;base64,${base64}`;

    const visual = await prisma.visual.create({
      data: {
        contentId: contentId || null,
        type: slides.length === 1 ? "single_image" : "carousel_slide",
        slideIndex: i,
        templateId: slide.layout,
        data: JSON.stringify(slide),
        width,
        height,
      },
    });

    results.push({ index: i, visualId: visual.id, dataUrl, width, height });
  }

  return results;
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  try {
    const body = await req.json();
    const fontData = await loadFont();

    /* ---- Design mode: AI designs slides from existing content ---- */
    if (body.contentId && !body.slides) {
      const content = await prisma.content.findUnique({ where: { id: body.contentId } });
      if (!content) {
        return NextResponse.json({ error: "Content not found" }, { status: 404 });
      }

      const visualType = content.contentType === "carousel" ? "carousel"
        : content.contentType === "reel_script" ? "storyboard"
        : "single_image";

      let slides: SlideData[];
      let caption: string | null = content.captionText;

      // # If visual data already exists (from auto-design), just render it
      // # If body.redesign is true, force a fresh design
      if (content.visualData && !body.redesign) {
        try {
          slides = JSON.parse(content.visualData);
        } catch {
          slides = [];
        }
      }

      // # No existing design data or redesign requested — call the designer agent
      if (!slides! || slides!.length === 0) {
        const design = await designVisual(
          content.body,
          content.platform,
          content.contentType,
          content.mediaPrompt,
          content.title
        );
        slides = design.slides;
        caption = design.caption || null;
      }

      // # Render the slides to PNG
      const results = await renderAndSave(
        slides,
        content.platform,
        visualType,
        content.id,
        fontData
      );

      // # Update Content record with visual data and caption
      const imageUrls = results.map((r) => r.visualId).join(",");
      await prisma.content.update({
        where: { id: content.id },
        data: {
          imageUrl: imageUrls,
          visualData: JSON.stringify(slides),
          captionText: caption,
        },
      });

      return NextResponse.json({
        slides: results,
        caption,
        contentId: content.id,
      });
    }

    /* ---- Direct mode: render pre-built slides ---- */
    const { slides, platform, type, contentId }: VisualRequest = body;

    if (!slides || slides.length === 0) {
      return NextResponse.json({ error: "No slides provided" }, { status: 400 });
    }

    const results = await renderAndSave(slides, platform, type, contentId || null, fontData);

    // # Update the Content record if we have a contentId
    if (contentId) {
      const imageUrls = results.map((r) => r.visualId).join(",");
      await prisma.content.update({
        where: { id: contentId },
        data: {
          imageUrl: imageUrls,
          visualData: JSON.stringify(slides),
        },
      });
    }

    return NextResponse.json({ slides: results, contentId });
  } catch (e) {
    console.error("Visual generation failed:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: `Visual generation failed: ${message}` }, { status: 500 });
  }
}
