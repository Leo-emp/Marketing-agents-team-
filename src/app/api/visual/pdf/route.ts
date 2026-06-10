/* ============================================================
   PDF CAROUSEL EXPORT — /api/visual/pdf
   ============================================================
   POST: Takes a contentId, renders all slides as PNGs via Canvas,
   then combines them into a single PDF document for LinkedIn
   carousel posts. Returns the PDF as a downloadable file.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { prisma } from "@/lib/prisma";
import { isAdmin, unauthorized } from "@/lib/auth-check";
import { renderSlideCanvas } from "@/lib/visual/canvas-renderer";
import { getDimensions, type SlideData } from "@/lib/visual/types";

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

  // # Render each slide to PNG via Canvas
  const pngBuffers: Buffer[] = [];
  for (let i = 0; i < slides.length; i++) {
    const slide: SlideData = {
      ...slides[i],
      slideNumber: slides[i].slideNumber ?? i + 1,
      totalSlides: slides[i].totalSlides ?? slides.length,
    };

    const pngBuffer = await renderSlideCanvas(slide, width, height);
    pngBuffers.push(pngBuffer);
  }

  // # Combine PNGs into a PDF (each slide = one page)
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
