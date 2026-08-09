/* ============================================================
   BRAND OVERLAY — Composites logo + name + domain on every slide
   ============================================================
   Post-processing step applied after any renderer (Flux/OpenAI/Canvas).
   Ensures the ACTUAL logo, "JobPilot AI", and "jobpilotai.co" appear
   on every generated image at consistent positions.
   ============================================================ */

import { createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas";
import { join } from "path";
import { BRAND_NAME, BRAND_URL, ACCENT_1 } from "./brand";

let fontsRegistered = false;

function registerFonts() {
  if (fontsRegistered) return;
  const fontDir = join(process.cwd(), "public", "fonts");
  GlobalFonts.registerFromPath(join(fontDir, "Geist-SemiBold.ttf"), "GeistSemiBold");
  GlobalFonts.registerFromPath(join(fontDir, "Geist-Medium.ttf"), "GeistMedium");
  fontsRegistered = true;
}

// # Composite logo + brand name + domain onto a rendered slide
export async function applyBrandOverlay(
  imageBuffer: Buffer,
  width: number,
  height: number,
): Promise<Buffer> {
  registerFonts();

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // # Draw the base image
  const baseImage = await loadImage(imageBuffer);
  ctx.drawImage(baseImage, 0, 0, width, height);

  // # Scale factor relative to 1080px base
  const sf = width / 1080;

  // # Load the logo SVG
  let logoLoaded = false;
  const logoSize = Math.round(36 * sf);
  const margin = Math.round(28 * sf);

  try {
    const logoPath = join(process.cwd(), "public", "jobpilot-logo.svg");
    const logo = await loadImage(logoPath);
    ctx.drawImage(logo, margin, margin, logoSize, logoSize);
    logoLoaded = true;
  } catch (err) {
    console.warn("[Brand Overlay] Logo load failed:", err);
  }

  // # Brand name text next to logo
  const nameX = logoLoaded ? margin + logoSize + Math.round(10 * sf) : margin;
  const nameY = margin + Math.round(logoSize * 0.72);
  const nameFontSize = Math.round(18 * sf);

  ctx.font = `${nameFontSize}px GeistSemiBold`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(BRAND_NAME, nameX, nameY);

  // # Domain URL at bottom-left
  const urlFontSize = Math.round(14 * sf);
  const urlMarginBottom = Math.round(24 * sf);

  ctx.font = `${urlFontSize}px GeistMedium`;
  ctx.fillStyle = ACCENT_1;
  ctx.fillText(BRAND_URL, margin, height - urlMarginBottom);

  return Buffer.from(canvas.toBuffer("image/png"));
}
