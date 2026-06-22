/* ============================================================
   CREATIVE STUDIO — Generate Image
   ============================================================
   POST: Admin route for on-demand image generation.
   Accepts a prompt + dimensions + model choice.
   Returns the Vercel Blob URL of the generated image.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { isAdmin, unauthorized } from "@/lib/auth-check";
import { generateFalImage, type FalImageModel } from "@/lib/visual/fal-image";
import { generateImage as generateOpenAIImage } from "@/lib/visual/openai-image";
import { uploadImage } from "@/lib/blob-storage";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  try {
    const body = await req.json();
    const { prompt, width, height, model, contentId } = body as {
      prompt: string;
      width?: number;
      height?: number;
      model?: string;
      contentId?: string;
    };

    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const w = width || 1080;
    const h = height || 1080;
    let imageBuffer: Buffer | null = null;
    let usedModel = model || "flux-pro";

    // # Route to the requested model
    if (model === "openai") {
      imageBuffer = await generateOpenAIImage(prompt, w, h);
      usedModel = "openai";
    } else {
      // # Default: fal.ai Flux
      const falModel: FalImageModel = model === "flux-schnell" ? "flux-schnell" : "flux-pro";
      imageBuffer = await generateFalImage(prompt, w, h, { model: falModel });
      usedModel = falModel;

      // # Fallback to OpenAI if fal.ai fails
      if (!imageBuffer) {
        console.log("[Creative] fal.ai failed, trying OpenAI fallback");
        imageBuffer = await generateOpenAIImage(prompt, w, h);
        usedModel = "openai-fallback";
      }
    }

    if (!imageBuffer) {
      return NextResponse.json(
        { error: "Image generation failed — all providers returned null" },
        { status: 500 }
      );
    }

    // # Upload to Vercel Blob
    const filename = `creative-${Date.now()}.png`;
    const imageUrl = await uploadImage(imageBuffer, filename);

    // # If contentId provided, update the Content record
    if (contentId) {
      await prisma.content.update({
        where: { id: contentId },
        data: { imageUrl },
      });
    }

    return NextResponse.json({ imageUrl, model: usedModel });
  } catch (err) {
    console.error("[Creative Image] Failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
