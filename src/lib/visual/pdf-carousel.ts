/* ============================================================
   PDF CAROUSEL — LinkedIn Carousel Document Assembly
   ============================================================
   Assembles multiple PNG slide images into a single PDF file
   for LinkedIn carousel posts. Each slide is one PDF page at
   1080×1350 (portrait 4:5 ratio, LinkedIn's optimal format).
   Uses pdf-lib for zero-dependency PDF creation.
   ============================================================ */

import { PDFDocument } from "pdf-lib";

// # LinkedIn carousel dimensions (4:5 portrait)
const SLIDE_WIDTH = 1080;
const SLIDE_HEIGHT = 1350;

// # Max PDF file size for LinkedIn upload (3MB)
const MAX_PDF_BYTES = 3 * 1024 * 1024;

// # Assemble PNG image buffers into a multi-page PDF
// # Each image becomes one full-page slide
// # Returns the PDF as a Buffer ready for upload
export async function assembleCarouselPdf(images: Buffer[]): Promise<Buffer> {
  if (images.length === 0) {
    throw new Error("Cannot create carousel PDF with zero images");
  }

  const pdf = await PDFDocument.create();

  for (const imgBuffer of images) {
    // # Embed PNG image into the PDF
    const pngImage = await pdf.embedPng(imgBuffer);

    // # Add a page matching the slide dimensions (in PDF points — 1pt = 1px at 72dpi)
    const page = pdf.addPage([SLIDE_WIDTH, SLIDE_HEIGHT]);

    // # Draw the image to fill the entire page
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: SLIDE_WIDTH,
      height: SLIDE_HEIGHT,
    });
  }

  // # Serialize to bytes
  const pdfBytes = await pdf.save();
  const pdfBuffer = Buffer.from(pdfBytes);

  // # Check file size — LinkedIn rejects PDFs over ~10MB but we target 3MB
  if (pdfBuffer.length > MAX_PDF_BYTES) {
    console.warn(
      `[PDF Carousel] PDF is ${(pdfBuffer.length / 1024 / 1024).toFixed(1)}MB — over 3MB target. ` +
      `Consider reducing slide count or image quality.`
    );
  }

  console.log(
    `[PDF Carousel] Created ${images.length}-slide PDF (${(pdfBuffer.length / 1024).toFixed(0)}KB)`
  );

  return pdfBuffer;
}
