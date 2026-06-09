/* ============================================================
   PDF CAROUSEL EXPORT — /api/visual/pdf
   ============================================================
   POST: Takes a contentId, renders all slides as PNGs via Satori,
   then combines them into a single PDF document for LinkedIn
   carousel posts. Returns the PDF as a downloadable file.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import { jsPDF } from "jspdf";
import { prisma } from "@/lib/prisma";
import { isAdmin, unauthorized } from "@/lib/auth-check";
import { renderSlide } from "@/lib/visual/templates";
import { getDimensions, type SlideData } from "@/lib/visual/types";

let fontCache: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache;
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

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  const { contentId } = await req.json();
  if (!contentId) {
    return NextResponse.json({ error: "contentId is required" }, { status: 400 });
  }

  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content || !content.visualData) {
    return NextResponse.json({ error: "Content not found or has no visual data" }, { status: 404 });
  }

  const slides: SlideData[] = JSON.parse(content.visualData);
  const { width, height } = getDimensions(content.platform, content.contentType);
  const fontData = await loadFont();

  // # Render each slide to PNG
  const pngBuffers: Buffer[] = [];
  for (let i = 0; i < slides.length; i++) {
    const slide: SlideData = {
      ...slides[i],
      slideNumber: slides[i].slideNumber ?? i + 1,
      totalSlides: slides[i].totalSlides ?? slides.length,
    };

    const response = new ImageResponse(renderSlide(slide, width, height), {
      width,
      height,
      fonts: [{ name: "Geist", data: fontData, style: "normal", weight: 400 }],
    });

    const arrayBuffer = await response.arrayBuffer();
    pngBuffers.push(Buffer.from(arrayBuffer));
  }

  // # Combine PNGs into a PDF (each slide = one page)
  // # LinkedIn carousel PDFs use the slide dimensions as page size
  const pxToMm = (px: number) => px * 0.264583;
  const pageW = pxToMm(width);
  const pageH = pxToMm(height);

  const pdf = new jsPDF({
    orientation: pageW > pageH ? "landscape" : "portrait",
    unit: "mm",
    format: [pageW, pageH],
  });

  for (let i = 0; i < pngBuffers.length; i++) {
    if (i > 0) pdf.addPage([pageW, pageH]);
    const dataUrl = `data:image/png;base64,${pngBuffers[i].toString("base64")}`;
    pdf.addImage(dataUrl, "PNG", 0, 0, pageW, pageH);
  }

  const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="jobpilot-carousel-${content.platform}.pdf"`,
    },
  });
}
