/* ============================================================
   VISUAL API — /api/visual
   ============================================================
   POST: Generate branded PNG images from content.
   Three-tier rendering with smart fallback:
   1. fal.ai Flux (premium photorealistic — default)
   2. OpenAI gpt-image-1 (fallback)
   3. Canvas 2D @napi-rs/canvas (always works, free)
   Uploads to Vercel Blob for HTTPS URLs.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin, unauthorized } from "@/lib/auth-check";
import { renderSlideCanvas } from "@/lib/visual/canvas-renderer";
import { getDimensions, type SlideData, type VisualRequest } from "@/lib/visual/types";
import { designVisual } from "@/lib/visual/designer-agent";
import { generateImage } from "@/lib/visual/openai-image";
import { generateFalImage, type FalImageModel } from "@/lib/visual/fal-image";
import { uploadImage } from "@/lib/blob-storage";

/* # Render a single slide with three-tier fallback:
   # 1. fal.ai Flux (if slide has aiImagePrompt)
   # 2. OpenAI gpt-image-1 (if fal.ai fails)
   # 3. Canvas 2D (always works, free — text-heavy slides go here directly) */
async function renderSlide(
  slide: SlideData,
  width: number,
  height: number,
  platform: string,
  model?: string
): Promise<Buffer> {
  // # Slides with aiImagePrompt get AI image generation
  if (slide.aiImagePrompt) {
    // # If admin explicitly chose "canvas" model, skip AI generation entirely
    if (model === "canvas") {
      return renderSlideCanvas(slide, width, height);
    }

    // # If admin explicitly chose "openai", skip fal.ai
    if (model === "openai") {
      const aiBuffer = await generateImage(slide.aiImagePrompt, width, height, platform);
      if (aiBuffer) return aiBuffer;
      console.log("[Visual API] OpenAI failed — falling back to Canvas 2D");
      return renderSlideCanvas(slide, width, height);
    }

    // # Default path: try fal.ai first
    const falModel: FalImageModel = model === "flux-schnell" ? "flux-schnell" : "flux-pro";
    const falBuffer = await generateFalImage(slide.aiImagePrompt, width, height, { model: falModel });
    if (falBuffer) return falBuffer;

    // # fal.ai failed — try OpenAI as fallback
    console.log("[Visual API] fal.ai failed — trying OpenAI fallback");
    const aiBuffer = await generateImage(slide.aiImagePrompt, width, height, platform);
    if (aiBuffer) return aiBuffer;

    // # Both AI providers failed — Canvas 2D as final fallback
    console.log("[Visual API] OpenAI also failed — rendering with Canvas 2D");
  }

  // # Non-AI slides (text-heavy, colored backgrounds) always use Canvas 2D
  return renderSlideCanvas(slide, width, height);
}

/* # Render slides to PNGs, upload to Vercel Blob, and save Visual records */
async function renderAndSave(
  slides: SlideData[],
  platform: string,
  type: string,
  contentId: string | null,
  model?: string,
) {
  const { width, height } = getDimensions(platform, type);
  const results: { index: number; visualId: string; imageUrl: string; width: number; height: number }[] = [];

  for (let i = 0; i < slides.length; i++) {
    const slide: SlideData = {
      ...slides[i],
      slideNumber: slides[i].slideNumber ?? i + 1,
      totalSlides: slides[i].totalSlides ?? slides.length,
    };

    // # Render via fal.ai / OpenAI / Canvas 2D
    const pngBuffer = await renderSlide(slide, width, height, platform, model);

    // # Upload to Vercel Blob for a proper HTTPS URL
    // # Falls back to base64 data URL if Blob upload fails (env var missing, etc.)
    let imageUrl: string;
    try {
      const filename = `visual-${platform}-${contentId || "direct"}-slide-${i}.png`;
      imageUrl = await uploadImage(pngBuffer, filename);
    } catch (err) {
      console.warn("[Visual API] Blob upload failed, using base64 fallback:", err);
      imageUrl = `data:image/png;base64,${pngBuffer.toString("base64")}`;
    }

    // # Save a Visual record for tracking which template/layout was used
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

    results.push({ index: i, visualId: visual.id, imageUrl, width, height });
  }

  return results;
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  try {
    const body = await req.json();

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

      // # Render the slides to PNG (fal.ai / OpenAI / Canvas 2D)
      const results = await renderAndSave(
        slides,
        content.platform,
        visualType,
        content.id,
        body.model,
      );

      // # Store Blob URLs (HTTPS) instead of visual IDs
      const imageUrls = results.map((r) => r.imageUrl).join(",");
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

    const results = await renderAndSave(slides, platform, type, contentId || null, body.model);

    // # Update the Content record if we have a contentId
    if (contentId) {
      const imageUrls = results.map((r) => r.imageUrl).join(",");
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
