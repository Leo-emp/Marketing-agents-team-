/* ============================================================
   CANVAS RENDERING ENGINE
   ============================================================
   Replaces Satori with @napi-rs/canvas for full pixel control.
   Supports multiple font weights, shadows, gradients, stock
   photo compositing, geometric accents, and glass-morphism cards.
   ============================================================ */

import { createCanvas, GlobalFonts, loadImage, type SKRSContext2D, type Canvas, type Image } from "@napi-rs/canvas";
import { join } from "path";
import type { SlideData } from "./types";
import { BG, BG_CARD, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, ACCENT_1, ACCENT_2, ACCENT_3, BRAND_NAME, BRAND_URL } from "./brand";

/* ---- Font Registration ---- */

let fontsRegistered = false;

function registerFonts() {
  if (fontsRegistered) return;
  const fontDir = join(process.cwd(), "public", "fonts");
  GlobalFonts.registerFromPath(join(fontDir, "Geist-Regular.ttf"), "Geist");
  GlobalFonts.registerFromPath(join(fontDir, "Geist-Medium.ttf"), "GeistMedium");
  GlobalFonts.registerFromPath(join(fontDir, "Geist-SemiBold.ttf"), "GeistSemiBold");
  GlobalFonts.registerFromPath(join(fontDir, "Geist-Bold.ttf"), "GeistBold");
  GlobalFonts.registerFromPath(join(fontDir, "Geist-Black.ttf"), "GeistBlack");
  GlobalFonts.registerFromPath(join(fontDir, "Geist-Light.ttf"), "GeistLight");
  fontsRegistered = true;
}

/* ---- Color Helpers ---- */

// # Parse hex to rgb components
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ---- Drawing Utilities ---- */

// # Draw a rounded rectangle path (does not fill/stroke)
function roundedRect(ctx: SKRSContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// # Fill a rounded rectangle
function fillRoundedRect(ctx: SKRSContext2D, x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient) {
  roundedRect(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

// # Draw a rounded rectangle with border
function strokeRoundedRect(ctx: SKRSContext2D, x: number, y: number, w: number, h: number, r: number, strokeColor: string, lineWidth: number) {
  roundedRect(ctx, x, y, w, h, r);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

// # Create a horizontal gradient
function hGradient(ctx: SKRSContext2D, x1: number, x2: number, y: number, colors: string[]): CanvasGradient {
  const g = ctx.createLinearGradient(x1, y, x2, y);
  colors.forEach((c, i) => g.addColorStop(i / (colors.length - 1), c));
  return g;
}

// # Create a vertical gradient
function vGradient(ctx: SKRSContext2D, y1: number, y2: number, x: number, colors: string[]): CanvasGradient {
  const g = ctx.createLinearGradient(x, y1, x, y2);
  colors.forEach((c, i) => g.addColorStop(i / (colors.length - 1), c));
  return g;
}

// # Create a diagonal gradient (135deg)
function diagGradient(ctx: SKRSContext2D, x: number, y: number, w: number, h: number, colors: string[]): CanvasGradient {
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  colors.forEach((c, i) => g.addColorStop(i / (colors.length - 1), c));
  return g;
}

// # Word-wrap text into lines that fit maxWidth
function wrapText(ctx: SKRSContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// # Draw wrapped text, returns Y position after last line
function drawWrappedText(
  ctx: SKRSContext2D, text: string, x: number, y: number,
  maxWidth: number, lineHeight: number, maxLines?: number
): number {
  const lines = wrapText(ctx, text, maxWidth);
  const limited = maxLines ? lines.slice(0, maxLines) : lines;
  for (let i = 0; i < limited.length; i++) {
    let line = limited[i];
    if (maxLines && i === maxLines - 1 && lines.length > maxLines) {
      line = line.replace(/\s*\S*$/, "...");
    }
    ctx.fillText(line, x, y + i * lineHeight);
  }
  return y + limited.length * lineHeight;
}

// # Draw text with gradient fill
function drawGradientText(
  ctx: SKRSContext2D, text: string, x: number, y: number,
  font: string, colors: string[], maxWidth?: number
) {
  ctx.font = font;
  const width = maxWidth || ctx.measureText(text).width;
  const gradient = ctx.createLinearGradient(x, y - 30, x + width, y + 10);
  colors.forEach((c, i) => gradient.addColorStop(i / (colors.length - 1), c));
  ctx.fillStyle = gradient;
  ctx.fillText(text, x, y);
}

// # Draw a glowing circle accent — high visibility for premium look
function drawGlowCircle(ctx: SKRSContext2D, cx: number, cy: number, radius: number, color: string, opacity: number = 0.30) {
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  gradient.addColorStop(0, rgba(color, opacity));
  gradient.addColorStop(0.5, rgba(color, opacity * 0.4));
  gradient.addColorStop(0.8, rgba(color, opacity * 0.12));
  gradient.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
}

// # Draw rich ambient glow accents across the canvas
function drawCornerAccents(ctx: SKRSContext2D, w: number, h: number) {
  // # Large top-right primary glow
  drawGlowCircle(ctx, w * 0.82, h * 0.08, w * 0.45, ACCENT_1, 0.22);
  // # Bottom-left secondary glow
  drawGlowCircle(ctx, w * 0.12, h * 0.88, w * 0.38, ACCENT_2, 0.18);
  // # Center-right subtle tertiary warmth
  drawGlowCircle(ctx, w * 0.7, h * 0.55, w * 0.28, ACCENT_3, 0.10);
}

// # Draw visible grid dots for texture
function drawGridDots(ctx: SKRSContext2D, x: number, y: number, cols: number, rows: number, spacing: number, color: string) {
  ctx.fillStyle = color;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.beginPath();
      ctx.arc(x + c * spacing, y + r * spacing, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// # Draw a glass morphism card with semi-transparent fill and subtle border
function drawGlassCard(ctx: SKRSContext2D, x: number, y: number, w: number, h: number, radius: number = 20) {
  // # Semi-transparent dark fill
  fillRoundedRect(ctx, x, y, w, h, radius, "rgba(17,17,19,0.65)");
  // # Inner highlight at top edge
  const highlight = ctx.createLinearGradient(x, y, x, y + 3);
  highlight.addColorStop(0, "rgba(255,255,255,0.10)");
  highlight.addColorStop(1, "rgba(255,255,255,0)");
  fillRoundedRect(ctx, x, y, w, 3, radius, highlight);
  // # Border
  strokeRoundedRect(ctx, x, y, w, h, radius, "rgba(255,255,255,0.08)", 1);
}

/* ---- Background ---- */

// # Rich layered background — looks premium even without stock photos
async function drawBackground(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  // # Base: dark diagonal gradient (not flat)
  const baseGrad = ctx.createLinearGradient(0, 0, w * 0.4, h);
  baseGrad.addColorStop(0, "#0c0c10");
  baseGrad.addColorStop(0.5, BG);
  baseGrad.addColorStop(1, "#08080c");
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, w, h);

  // # Stock photo layer (if available)
  if (data.backgroundImageUrl) {
    try {
      const img = await loadImage(data.backgroundImageUrl);
      const imgRatio = (img as Image).width / (img as Image).height;
      const canvasRatio = w / h;
      let sx = 0, sy = 0, sw = (img as Image).width, sh = (img as Image).height;
      if (imgRatio > canvasRatio) {
        sw = (img as Image).height * canvasRatio;
        sx = ((img as Image).width - sw) / 2;
      } else {
        sh = (img as Image).width / canvasRatio;
        sy = ((img as Image).height - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

      const overlay = ctx.createLinearGradient(0, 0, 0, h);
      overlay.addColorStop(0, "rgba(9,9,11,0.78)");
      overlay.addColorStop(0.3, "rgba(9,9,11,0.55)");
      overlay.addColorStop(0.7, "rgba(9,9,11,0.55)");
      overlay.addColorStop(1, "rgba(9,9,11,0.82)");
      ctx.fillStyle = overlay;
      ctx.fillRect(0, 0, w, h);
    } catch {
      // # Photo load failed — gradient base is already drawn
    }
  }

  // # Rich ambient glows for depth
  drawCornerAccents(ctx, w, h);

  // # Subtle noise-like grid texture across canvas
  ctx.fillStyle = rgba("#ffffff", 0.015);
  for (let ny = 0; ny < h; ny += 24) {
    for (let nx = 0; nx < w; nx += 24) {
      if (Math.sin(nx * 0.1 + ny * 0.13) > 0.6) {
        ctx.fillRect(nx, ny, 1, 1);
      }
    }
  }
}

/* ---- Header & Footer ---- */

function drawHeader(ctx: SKRSContext2D, w: number, pad: number, slideNumber?: number, totalSlides?: number) {
  const y = pad + 28;

  // # Brand logo circle
  const logoSize = 36;
  const logoGrad = diagGradient(ctx, pad, y - logoSize / 2, logoSize, logoSize, [ACCENT_1, ACCENT_2]);
  fillRoundedRect(ctx, pad, y - logoSize / 2, logoSize, logoSize, 10, logoGrad);

  // # "J" letter in logo
  ctx.font = "18px GeistBold";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("J", pad + logoSize / 2, y + 1);

  // # Brand name
  ctx.font = "16px GeistSemiBold";
  ctx.fillStyle = TEXT_SECONDARY;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(BRAND_NAME, pad + logoSize + 12, y);

  // # Slide counter
  if (slideNumber !== undefined && totalSlides !== undefined) {
    ctx.font = "14px GeistMedium";
    ctx.fillStyle = TEXT_MUTED;
    ctx.textAlign = "right";
    ctx.fillText(`${slideNumber}/${totalSlides}`, w - pad, y);
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

function drawFooter(ctx: SKRSContext2D, w: number, h: number, pad: number) {
  const y = h - pad - 8;

  // # Brand URL
  ctx.font = "14px GeistMedium";
  ctx.fillStyle = TEXT_MUTED;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(BRAND_URL, pad, y);

  // # Gradient accent line
  const lineW = 60;
  const lineGrad = hGradient(ctx, w - pad - lineW, w - pad, y - 4, [ACCENT_1, ACCENT_2]);
  fillRoundedRect(ctx, w - pad - lineW, y - 6, lineW, 3, 2, lineGrad);
}

/* ---- Template Functions ---- */

const PAD = 52; // # Standard padding

// # HERO: Bold headline with glass card, gradient accents, premium look
async function drawHero(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  await drawBackground(ctx, data, w, h);
  drawHeader(ctx, w, PAD, data.slideNumber, data.totalSlides);

  // # Decorative dot grid — top-right, more prominent
  drawGridDots(ctx, w - PAD - 120, PAD + 70, 8, 6, 16, rgba(ACCENT_1, 0.25));

  // # Glass card behind content
  const cardX = PAD - 16;
  const cardY = h * 0.28;
  const cardW = w - PAD * 2 + 32;
  const cardH = h * 0.52;
  drawGlassCard(ctx, cardX, cardY, cardW, cardH, 24);

  // # Gradient accent bar at top of card — wide and prominent
  const accentColor = data.accentColor || ACCENT_1;
  const barGrad = hGradient(ctx, cardX, cardX + 160, cardY + 24, [accentColor, ACCENT_2]);
  fillRoundedRect(ctx, cardX + 24, cardY + 24, 160, 6, 3, barGrad);

  // # Small accent dot
  ctx.beginPath();
  ctx.arc(cardX + 24 + 170, cardY + 27, 4, 0, Math.PI * 2);
  ctx.fillStyle = ACCENT_3;
  ctx.fill();

  // # Headline — bold, large
  const fontSize = w >= 1200 ? 54 : 46;
  ctx.font = `${fontSize}px GeistBold`;
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.textBaseline = "top";
  const headY = cardY + 56;
  const maxW = cardW - 56;
  const nextY = drawWrappedText(ctx, data.headline, cardX + 28, headY, maxW, fontSize + 12, 3);

  // # Subheadline
  if (data.subheadline) {
    ctx.font = "22px GeistMedium";
    ctx.fillStyle = TEXT_SECONDARY;
    drawWrappedText(ctx, data.subheadline, cardX + 28, nextY + 20, maxW, 34, 2);
  }

  // # Decorative gradient line at bottom-left of card
  const lineGrad = vGradient(ctx, cardY + cardH - 100, cardY + cardH - 20, cardX + 28, [ACCENT_2, rgba(ACCENT_2, 0)]);
  ctx.fillStyle = lineGrad;
  fillRoundedRect(ctx, cardX + 28, cardY + cardH - 100, 3, 80, 2, lineGrad);

  // # Bottom-right decorative ring
  ctx.beginPath();
  ctx.arc(w - PAD - 30, cardY + cardH - 40, 24, 0, Math.PI * 2);
  ctx.strokeStyle = rgba(ACCENT_1, 0.20);
  ctx.lineWidth = 2;
  ctx.stroke();

  drawFooter(ctx, w, h, PAD);
}

// # STAT CARD: Large centered stat with glass card and gradient coloring
async function drawStatCard(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  await drawBackground(ctx, data, w, h);
  drawHeader(ctx, w, PAD, data.slideNumber, data.totalSlides);

  const centerX = w / 2;
  const centerY = h / 2;

  // # Glass card behind stat
  const cardW = w * 0.7;
  const cardH = h * 0.35;
  drawGlassCard(ctx, centerX - cardW / 2, centerY - cardH / 2, cardW, cardH, 24);

  // # Visible ring behind stat
  ctx.beginPath();
  ctx.arc(centerX, centerY - 10, 110, 0, Math.PI * 2);
  ctx.strokeStyle = rgba(ACCENT_1, 0.20);
  ctx.lineWidth = 2;
  ctx.stroke();

  // # Second outer ring
  ctx.beginPath();
  ctx.arc(centerX, centerY - 10, 140, 0, Math.PI * 2);
  ctx.strokeStyle = rgba(ACCENT_2, 0.08);
  ctx.lineWidth = 1;
  ctx.stroke();

  if (data.stat) {
    // # Large stat value with bold gradient
    const statFont = `${data.stat.value.length > 4 ? 76 : 100}px GeistBlack`;
    ctx.font = statFont;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const grad = diagGradient(ctx, centerX - 140, centerY - 70, 280, 120, [ACCENT_1, ACCENT_3, ACCENT_2]);
    ctx.fillStyle = grad;
    ctx.fillText(data.stat.value, centerX, centerY - 10);

    // # Label below
    ctx.font = "22px GeistSemiBold";
    ctx.fillStyle = TEXT_SECONDARY;
    const labelLines = wrapText(ctx, data.stat.label, w * 0.65);
    labelLines.forEach((line, i) => {
      ctx.fillText(line, centerX, centerY + 70 + i * 32);
    });
  } else if (data.headline) {
    ctx.font = "38px GeistBold";
    ctx.fillStyle = TEXT_PRIMARY;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const lines = wrapText(ctx, data.headline, w * 0.65);
    lines.forEach((line, i) => {
      ctx.fillText(line, centerX, centerY - ((lines.length - 1) * 24) + i * 48);
    });
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  drawFooter(ctx, w, h, PAD);
}

// # TIP: Numbered tip with glass card, gradient border, and body text
async function drawTip(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  await drawBackground(ctx, data, w, h);
  drawHeader(ctx, w, PAD, data.slideNumber, data.totalSlides);

  const accentColor = data.accentColor || ACCENT_1;

  // # Glass card for content
  const cardX = PAD - 8;
  const cardY = h * 0.24;
  const cardW = w - PAD * 2 + 16;
  const cardH = h * 0.56;
  drawGlassCard(ctx, cardX, cardY, cardW, cardH, 20);

  const contentX = cardX + 24;
  const maxW = cardW - 60;

  // # Vertical accent line — thicker and more visible
  const lineGrad = vGradient(ctx, cardY + 20, cardY + cardH - 20, contentX, [accentColor, ACCENT_2]);
  fillRoundedRect(ctx, contentX, cardY + 20, 5, cardH - 40, 3, lineGrad);

  const textX = contentX + 36;

  // # Tip number badge
  if (data.slideNumber) {
    const badgeSize = 48;
    fillRoundedRect(ctx, textX, cardY + 28, badgeSize, badgeSize, 14, rgba(accentColor, 0.20));
    strokeRoundedRect(ctx, textX, cardY + 28, badgeSize, badgeSize, 14, rgba(accentColor, 0.30), 1);
    ctx.font = "22px GeistBold";
    ctx.fillStyle = accentColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(data.slideNumber), textX + badgeSize / 2, cardY + 28 + badgeSize / 2);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }

  // # Headline
  const headY = cardY + (data.slideNumber ? 98 : 36);
  ctx.font = "34px GeistBold";
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.textBaseline = "top";
  const afterHead = drawWrappedText(ctx, data.headline, textX, headY, maxW - 30, 46, 3);

  // # Body text
  if (data.body) {
    ctx.font = "20px GeistMedium";
    ctx.fillStyle = TEXT_SECONDARY;
    drawWrappedText(ctx, data.body, textX, afterHead + 20, maxW - 30, 32, 5);
  }

  ctx.textBaseline = "alphabetic";
  drawFooter(ctx, w, h, PAD);
}

// # QUOTE: Large quotation mark with glass card and centered quote text
async function drawQuote(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  await drawBackground(ctx, data, w, h);
  drawHeader(ctx, w, PAD, data.slideNumber, data.totalSlides);

  const centerX = w / 2;
  const maxW = w * 0.75;

  // # Glass card behind quote
  const cardW = w * 0.85;
  const cardH = h * 0.48;
  const cardX = centerX - cardW / 2;
  const cardY = h * 0.28;
  drawGlassCard(ctx, cardX, cardY, cardW, cardH, 24);

  // # Large gradient quotation mark
  ctx.font = "160px GeistBlack";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const quoteGrad = diagGradient(ctx, centerX - 60, h * 0.24, 120, 100, [ACCENT_1, ACCENT_2]);
  ctx.fillStyle = quoteGrad;
  ctx.fillText("“", centerX, h * 0.32);

  // # Quote text
  ctx.font = "28px GeistSemiBold";
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.textBaseline = "top";
  const lines = wrapText(ctx, data.headline, maxW);
  const startY = h * 0.42;
  lines.slice(0, 4).forEach((line, i) => {
    ctx.textAlign = "center";
    ctx.fillText(line, centerX, startY + i * 42);
  });

  // # Attribution
  if (data.subheadline) {
    ctx.font = "17px GeistMedium";
    ctx.fillStyle = ACCENT_2;
    ctx.textAlign = "center";
    ctx.fillText(`— ${data.subheadline}`, centerX, startY + Math.min(lines.length, 4) * 42 + 28);
  }

  // # Decorative dot grid below quote
  drawGridDots(ctx, centerX - 40, cardY + cardH - 30, 6, 2, 14, rgba(ACCENT_1, 0.20));

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  drawFooter(ctx, w, h, PAD);
}

// # LIST: Title + bullet items with glass card and gradient indicators
async function drawList(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  await drawBackground(ctx, data, w, h);
  drawHeader(ctx, w, PAD, data.slideNumber, data.totalSlides);

  const maxW = w - PAD * 2;
  let y = h * 0.18;

  // # Headline with gradient accent underline
  ctx.font = "34px GeistBold";
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.textBaseline = "top";
  y = drawWrappedText(ctx, data.headline, PAD, y, maxW, 44, 2);
  const underGrad = hGradient(ctx, PAD, PAD + 120, y + 8, [ACCENT_1, ACCENT_2]);
  fillRoundedRect(ctx, PAD, y + 8, 120, 4, 2, underGrad);
  y += 32;

  // # Bullet items inside glass card
  if (data.bullets) {
    const cardX = PAD - 12;
    const cardW = w - PAD * 2 + 24;
    const bulletH = Math.min(data.bullets.length, 6) * 56 + 32;
    drawGlassCard(ctx, cardX, y - 8, cardW, bulletH, 16);

    const bulletMaxW = maxW - 48;
    const maxBullets = Math.min(data.bullets.length, 6);
    for (let i = 0; i < maxBullets; i++) {
      // # Gradient dot indicator
      const dotY = y + 12 + i * 56;
      const dotGrad = diagGradient(ctx, PAD + 8, dotY, 10, 10, [ACCENT_1, ACCENT_2]);
      ctx.beginPath();
      ctx.arc(PAD + 12, dotY + 4, 5, 0, Math.PI * 2);
      ctx.fillStyle = dotGrad;
      ctx.fill();

      // # Bullet text
      ctx.font = "20px GeistMedium";
      ctx.fillStyle = TEXT_PRIMARY;
      drawWrappedText(ctx, data.bullets[i], PAD + 36, dotY - 4, bulletMaxW, 30, 2);
    }
  }

  ctx.textBaseline = "alphabetic";
  drawFooter(ctx, w, h, PAD);
}

// # CTA: Call-to-action with glass card and gradient button
async function drawCta(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  await drawBackground(ctx, data, w, h);
  drawHeader(ctx, w, PAD, data.slideNumber, data.totalSlides);

  // # Decorative dot grid
  drawGridDots(ctx, PAD, h * 0.2, 5, 3, 16, rgba(ACCENT_2, 0.18));

  const cardW = w * 0.80;
  const cardH = h * 0.50;
  const cardX = (w - cardW) / 2;
  const cardY = (h - cardH) / 2;

  // # Card shadow — more prominent
  ctx.shadowColor = rgba(ACCENT_1, 0.18);
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 12;
  drawGlassCard(ctx, cardX, cardY, cardW, cardH, 24);
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // # Top gradient accent on card — thicker
  ctx.save();
  roundedRect(ctx, cardX, cardY, cardW, 5, 24);
  ctx.clip();
  const topGrad = hGradient(ctx, cardX, cardX + cardW, cardY, [ACCENT_1, ACCENT_2]);
  ctx.fillStyle = topGrad;
  ctx.fillRect(cardX, cardY, cardW, 5);
  ctx.restore();

  const innerPad = 44;
  const centerX = w / 2;

  // # Logo inside card
  const logoY = cardY + innerPad;
  const logoSize = 52;
  const logoGrad = diagGradient(ctx, centerX - logoSize / 2, logoY, logoSize, logoSize, [ACCENT_1, ACCENT_2]);
  fillRoundedRect(ctx, centerX - logoSize / 2, logoY, logoSize, logoSize, 16, logoGrad);
  ctx.font = "24px GeistBold";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("J", centerX, logoY + logoSize / 2 + 1);

  // # CTA headline
  ctx.font = "28px GeistBold";
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.textBaseline = "top";
  const headMaxW = cardW - innerPad * 2;
  const lines = wrapText(ctx, data.headline, headMaxW);
  const headY = logoY + logoSize + 24;
  lines.slice(0, 2).forEach((line, i) => {
    ctx.fillText(line, centerX, headY + i * 38);
  });

  // # Body text
  let bodyEndY = headY + Math.min(lines.length, 2) * 38;
  if (data.body) {
    ctx.font = "18px Geist";
    ctx.fillStyle = TEXT_SECONDARY;
    const bodyLines = wrapText(ctx, data.body, headMaxW);
    bodyEndY += 12;
    bodyLines.slice(0, 2).forEach((line, i) => {
      ctx.fillText(line, centerX, bodyEndY + i * 28);
    });
    bodyEndY += Math.min(bodyLines.length, 2) * 28;
  }

  // # Gradient CTA button
  const btnW = 220;
  const btnH = 48;
  const btnX = centerX - btnW / 2;
  const btnY = bodyEndY + 24;
  const btnGrad = hGradient(ctx, btnX, btnX + btnW, btnY, [ACCENT_1, ACCENT_2]);
  fillRoundedRect(ctx, btnX, btnY, btnW, btnH, 14, btnGrad);
  ctx.font = "18px GeistSemiBold";
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.fillText(BRAND_URL, centerX, btnY + btnH / 2);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  drawFooter(ctx, w, h, PAD);
}

// # BEFORE/AFTER: Side-by-side comparison with glass cards and bold labels
async function drawBeforeAfter(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  await drawBackground(ctx, data, w, h);
  drawHeader(ctx, w, PAD, data.slideNumber, data.totalSlides);

  const maxW = w - PAD * 2;

  // # Title
  if (data.headline) {
    ctx.font = "30px GeistBold";
    ctx.fillStyle = TEXT_PRIMARY;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    drawWrappedText(ctx, data.headline, w / 2, h * 0.16, maxW, 40, 2);
    ctx.textAlign = "left";
  }

  const cardGap = 24;
  const cardW = (maxW - cardGap) / 2;
  const cardH = h * 0.48;
  const cardY = h * 0.30;

  // # BEFORE card — red-tinted glass
  fillRoundedRect(ctx, PAD, cardY, cardW, cardH, 18, "rgba(239,68,68,0.08)");
  strokeRoundedRect(ctx, PAD, cardY, cardW, cardH, 18, "rgba(239,68,68,0.25)", 1.5);
  // # Red top accent
  fillRoundedRect(ctx, PAD, cardY, cardW, 4, 18, "#ef4444");
  ctx.font = "14px GeistBold";
  ctx.fillStyle = "#ef4444";
  ctx.textBaseline = "top";
  ctx.letterSpacing = "3px";
  ctx.fillText("BEFORE", PAD + 24, cardY + 24);
  ctx.letterSpacing = "0px";
  ctx.font = "18px GeistMedium";
  ctx.fillStyle = TEXT_SECONDARY;
  drawWrappedText(ctx, data.beforeText || "", PAD + 24, cardY + 56, cardW - 48, 28, 8);

  // # AFTER card — green-tinted glass
  const afterX = PAD + cardW + cardGap;
  fillRoundedRect(ctx, afterX, cardY, cardW, cardH, 18, "rgba(34,197,94,0.08)");
  strokeRoundedRect(ctx, afterX, cardY, cardW, cardH, 18, "rgba(34,197,94,0.25)", 1.5);
  // # Green top accent
  fillRoundedRect(ctx, afterX, cardY, cardW, 4, 18, "#22c55e");
  ctx.font = "14px GeistBold";
  ctx.fillStyle = "#22c55e";
  ctx.letterSpacing = "3px";
  ctx.fillText("AFTER", afterX + 24, cardY + 24);
  ctx.letterSpacing = "0px";
  ctx.font = "18px GeistSemiBold";
  ctx.fillStyle = TEXT_PRIMARY;
  drawWrappedText(ctx, data.afterText || "", afterX + 24, cardY + 56, cardW - 48, 28, 8);

  // # VS divider circle
  const vsX = PAD + cardW + cardGap / 2;
  const vsY = cardY + cardH / 2;
  ctx.beginPath();
  ctx.arc(vsX, vsY, 18, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(17,17,19,0.9)";
  ctx.fill();
  ctx.strokeStyle = rgba(ACCENT_1, 0.30);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.font = "12px GeistBold";
  ctx.fillStyle = TEXT_SECONDARY;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("VS", vsX, vsY);
  ctx.textAlign = "left";

  ctx.textBaseline = "alphabetic";
  drawFooter(ctx, w, h, PAD);
}

// # SCREENSHOT: Fake tweet/DM/notification card
async function drawScreenshot(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  await drawBackground(ctx, data, w, h);
  drawHeader(ctx, w, PAD, data.slideNumber, data.totalSlides);

  const cardW = w * 0.82;
  const cardH = h * 0.42;
  const cardX = (w - cardW) / 2;
  const cardY = (h - cardH) / 2;

  // # Card with shadow
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 6;
  fillRoundedRect(ctx, cardX, cardY, cardW, cardH, 18, BG_CARD);
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  strokeRoundedRect(ctx, cardX, cardY, cardW, cardH, 18, rgba(ACCENT_1, 0.1), 1);

  // # Avatar
  const avatarSize = 42;
  const avatarX = cardX + 28;
  const avatarY = cardY + 28;
  const avGrad = diagGradient(ctx, avatarX, avatarY, avatarSize, avatarSize, [ACCENT_1, ACCENT_2]);
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.fillStyle = avGrad;
  ctx.fill();
  ctx.font = "18px GeistBold";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText((data.screenshotAuthor || "U")[0].toUpperCase(), avatarX + avatarSize / 2, avatarY + avatarSize / 2 + 1);

  // # Author name and type
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = "17px GeistSemiBold";
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.fillText(data.screenshotAuthor || "User", avatarX + avatarSize + 14, avatarY + 18);
  ctx.font = "13px GeistMedium";
  ctx.fillStyle = TEXT_MUTED;
  const typeLabel = data.screenshotType === "dm" ? "Direct Message" : data.screenshotType === "email" ? "Email" : "Post";
  ctx.fillText(typeLabel, avatarX + avatarSize + 14, avatarY + 38);

  // # Message text
  ctx.font = "20px Geist";
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.textBaseline = "top";
  drawWrappedText(ctx, data.headline, cardX + 28, avatarY + avatarSize + 20, cardW - 56, 32, 6);

  ctx.textBaseline = "alphabetic";
  drawFooter(ctx, w, h, PAD);
}

// # DATA CHART: Horizontal bar chart with gradient bars
async function drawDataChart(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  await drawBackground(ctx, data, w, h);
  drawHeader(ctx, w, PAD, data.slideNumber, data.totalSlides);

  const maxW = w - PAD * 2;
  let y = h * 0.2;

  // # Title
  if (data.headline) {
    ctx.font = "28px GeistBold";
    ctx.fillStyle = TEXT_PRIMARY;
    ctx.textBaseline = "top";
    y = drawWrappedText(ctx, data.headline, PAD, y, maxW, 38, 2);
    y += 32;
  }

  // # Bars
  const bars = data.bars || [];
  const barH = 10;
  const maxBars = Math.min(bars.length, 7);
  const barSpacing = Math.min(52, (h * 0.55) / maxBars);

  for (let i = 0; i < maxBars; i++) {
    const bar = bars[i];
    // # Label + value
    ctx.font = "16px GeistMedium";
    ctx.fillStyle = TEXT_SECONDARY;
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillText(bar.label, PAD, y);
    ctx.textAlign = "right";
    ctx.font = "16px GeistBold";
    ctx.fillStyle = TEXT_PRIMARY;
    ctx.fillText(`${bar.value}%`, PAD + maxW, y);
    ctx.textAlign = "left";

    // # Bar background — visible
    y += 10;
    fillRoundedRect(ctx, PAD, y, maxW, barH, 5, rgba(ACCENT_1, 0.18));

    // # Bar fill
    const fillW = (Math.min(bar.value, 100) / 100) * maxW;
    if (fillW > 0) {
      const barGrad = hGradient(ctx, PAD, PAD + fillW, y, [bar.color || ACCENT_1, ACCENT_2]);
      fillRoundedRect(ctx, PAD, y, fillW, barH, 5, barGrad);
    }

    y += barH + barSpacing - 10;
  }

  drawFooter(ctx, w, h, PAD);
}

// # COMPARISON: Two-column layout with glass cards and accent tops
async function drawComparison(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  await drawBackground(ctx, data, w, h);
  drawHeader(ctx, w, PAD, data.slideNumber, data.totalSlides);

  // # Title
  if (data.headline) {
    ctx.font = "30px GeistBold";
    ctx.fillStyle = TEXT_PRIMARY;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    drawWrappedText(ctx, data.headline, w / 2, h * 0.14, w - PAD * 2, 40, 2);
    ctx.textAlign = "left";
  }

  const gap = 24;
  const colW = (w - PAD * 2 - gap) / 2;
  const colH = h * 0.56;
  const colY = h * 0.27;

  // # Left column — glass card with accent top
  drawGlassCard(ctx, PAD, colY, colW, colH, 18);
  fillRoundedRect(ctx, PAD, colY, colW, 4, 18, ACCENT_1);
  ctx.font = "14px GeistBold";
  ctx.fillStyle = ACCENT_1;
  ctx.textBaseline = "top";
  ctx.letterSpacing = "3px";
  ctx.fillText(data.leftLabel || "OPTION A", PAD + 24, colY + 24);
  ctx.letterSpacing = "0px";

  let ly = colY + 54;
  (data.leftColumn || []).slice(0, 5).forEach((item) => {
    const dotGrad = diagGradient(ctx, PAD + 24, ly, 8, 8, [ACCENT_1, ACCENT_2]);
    ctx.beginPath();
    ctx.arc(PAD + 28, ly + 4, 4, 0, Math.PI * 2);
    ctx.fillStyle = dotGrad;
    ctx.fill();
    ctx.font = "16px GeistMedium";
    ctx.fillStyle = TEXT_SECONDARY;
    ly = drawWrappedText(ctx, item, PAD + 50, ly, colW - 74, 24, 2) + 12;
  });

  // # Right column — glass card with accent top
  const rx = PAD + colW + gap;
  drawGlassCard(ctx, rx, colY, colW, colH, 18);
  fillRoundedRect(ctx, rx, colY, colW, 4, 18, ACCENT_3);
  ctx.font = "14px GeistBold";
  ctx.fillStyle = ACCENT_3;
  ctx.letterSpacing = "3px";
  ctx.fillText(data.rightLabel || "OPTION B", rx + 24, colY + 24);
  ctx.letterSpacing = "0px";

  let ry = colY + 54;
  (data.rightColumn || []).slice(0, 5).forEach((item) => {
    ctx.beginPath();
    ctx.arc(rx + 28, ry + 4, 4, 0, Math.PI * 2);
    ctx.fillStyle = ACCENT_3;
    ctx.fill();
    ctx.font = "16px GeistMedium";
    ctx.fillStyle = TEXT_SECONDARY;
    ry = drawWrappedText(ctx, item, rx + 50, ry, colW - 74, 24, 2) + 12;
  });

  ctx.textBaseline = "alphabetic";
  drawFooter(ctx, w, h, PAD);
}

// # NUMBERED STEPS: Step numbers in gradient badges with descriptions
async function drawNumberedSteps(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  await drawBackground(ctx, data, w, h);
  drawHeader(ctx, w, PAD, data.slideNumber, data.totalSlides);

  const maxW = w - PAD * 2;
  let y = h * 0.18;

  // # Title
  if (data.headline) {
    ctx.font = "28px GeistBold";
    ctx.fillStyle = TEXT_PRIMARY;
    ctx.textBaseline = "top";
    y = drawWrappedText(ctx, data.headline, PAD, y, maxW, 38, 2);
    y += 28;
  }

  const steps = data.steps || [];
  const maxSteps = Math.min(steps.length, 5);
  const stepSpacing = Math.min(72, (h * 0.55) / maxSteps);

  for (let i = 0; i < maxSteps; i++) {
    const step = steps[i];
    const badgeSize = 44;

    // # Gradient badge
    const badgeGrad = diagGradient(ctx, PAD, y, badgeSize, badgeSize, [ACCENT_1, ACCENT_2]);
    fillRoundedRect(ctx, PAD, y, badgeSize, badgeSize, 13, badgeGrad);
    ctx.font = "20px GeistBold";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(step.number), PAD + badgeSize / 2, y + badgeSize / 2 + 1);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    // # Step title
    ctx.font = "20px GeistSemiBold";
    ctx.fillStyle = TEXT_PRIMARY;
    ctx.fillText(step.title, PAD + badgeSize + 20, y + 4);

    // # Step detail
    if (step.detail) {
      ctx.font = "16px Geist";
      ctx.fillStyle = TEXT_SECONDARY;
      drawWrappedText(ctx, step.detail, PAD + badgeSize + 20, y + 28, maxW - badgeSize - 20, 24, 1);
    }

    y += stepSpacing;
  }

  ctx.textBaseline = "alphabetic";
  drawFooter(ctx, w, h, PAD);
}

// # GRADIENT TEXT: Large gradient-colored headline with decorative rings
async function drawGradientTextSlide(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  await drawBackground(ctx, data, w, h);
  drawHeader(ctx, w, PAD, data.slideNumber, data.totalSlides);

  const centerX = w / 2;
  const fontSize = w >= 1200 ? 58 : 50;
  const maxW = w * 0.82;

  // # Decorative rings — visible
  ctx.beginPath();
  ctx.arc(centerX, h * 0.48, 180, 0, Math.PI * 2);
  ctx.strokeStyle = rgba(ACCENT_1, 0.15);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(centerX, h * 0.48, 220, 0, Math.PI * 2);
  ctx.strokeStyle = rgba(ACCENT_2, 0.08);
  ctx.lineWidth = 1;
  ctx.stroke();

  // # Large gradient headline — bold
  ctx.font = `${fontSize}px GeistBlack`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const lines = wrapText(ctx, data.headline, maxW);
  const totalH = lines.length * (fontSize + 12);
  const startY = (h - totalH) / 2;

  const grad = diagGradient(ctx, centerX - maxW / 2, startY, maxW, totalH, [ACCENT_1, ACCENT_3, ACCENT_2]);
  ctx.fillStyle = grad;
  lines.slice(0, 3).forEach((line, i) => {
    ctx.fillText(line, centerX, startY + i * (fontSize + 12));
  });

  // # Gradient underline below text
  const underY = startY + Math.min(lines.length, 3) * (fontSize + 12) + 8;
  const underGrad = hGradient(ctx, centerX - 60, centerX + 60, underY, [ACCENT_1, ACCENT_2]);
  fillRoundedRect(ctx, centerX - 60, underY, 120, 4, 2, underGrad);

  // # Subheadline
  if (data.subheadline) {
    ctx.font = "20px GeistMedium";
    ctx.fillStyle = TEXT_SECONDARY;
    const subLines = wrapText(ctx, data.subheadline, maxW * 0.85);
    subLines.slice(0, 2).forEach((line, i) => {
      ctx.fillText(line, centerX, underY + 24 + i * 30);
    });
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  drawFooter(ctx, w, h, PAD);
}

// # HIGHLIGHT BOX: Key insight in a glowing accent card
async function drawHighlightBox(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  await drawBackground(ctx, data, w, h);
  drawHeader(ctx, w, PAD, data.slideNumber, data.totalSlides);

  const centerX = w / 2;

  // # Label above box
  if (data.subheadline) {
    ctx.font = "15px GeistSemiBold";
    ctx.fillStyle = TEXT_MUTED;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.letterSpacing = "3px";
    ctx.fillText(data.subheadline.toUpperCase(), centerX, h * 0.32);
    ctx.letterSpacing = "0px";
  }

  // # Highlight card with gradient border glow
  const boxW = w * 0.78;
  const boxH = h * 0.28;
  const boxX = (w - boxW) / 2;
  const boxY = h * 0.38;

  // # Outer glow — visible
  drawGlowCircle(ctx, centerX, boxY + boxH / 2, boxW * 0.45, ACCENT_1, 0.18);

  // # Card background with richer gradient
  const bgGrad = diagGradient(ctx, boxX, boxY, boxW, boxH, [rgba(ACCENT_1, 0.14), rgba(ACCENT_2, 0.14)]);
  fillRoundedRect(ctx, boxX, boxY, boxW, boxH, 22, bgGrad);
  strokeRoundedRect(ctx, boxX, boxY, boxW, boxH, 22, rgba(ACCENT_1, 0.35), 1.5);

  // # Text inside box
  ctx.font = "26px GeistSemiBold";
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const lines = wrapText(ctx, data.headline, boxW - 64);
  const textStartY = boxY + (boxH - lines.length * 38) / 2;
  lines.slice(0, 3).forEach((line, i) => {
    ctx.fillText(line, centerX, textStartY + i * 38);
  });

  // # Body below box
  if (data.body) {
    ctx.font = "18px Geist";
    ctx.fillStyle = TEXT_SECONDARY;
    const bodyLines = wrapText(ctx, data.body, w * 0.75);
    bodyLines.slice(0, 2).forEach((line, i) => {
      ctx.fillText(line, centerX, boxY + boxH + 28 + i * 28);
    });
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  drawFooter(ctx, w, h, PAD);
}

// # SPLIT IMAGE: Left gradient accent panel + right text content
async function drawSplitImage(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  await drawBackground(ctx, data, w, h);

  const splitW = w * 0.38;

  // # Left gradient panel
  const panelGrad = vGradient(ctx, 0, h, 0, [ACCENT_1, ACCENT_2]);
  ctx.fillStyle = panelGrad;
  ctx.fillRect(0, 0, splitW, h);

  // # Visible pattern on panel
  drawGridDots(ctx, 24, 24, 5, 10, 18, "rgba(255,255,255,0.15)");

  // # Stat or number on left panel
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (data.stat) {
    ctx.font = `${data.stat.value.length > 4 ? 52 : 68}px GeistBlack`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(data.stat.value, splitW / 2, h / 2 - 16);
    ctx.font = "16px GeistMedium";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    const labelLines = wrapText(ctx, data.stat.label, splitW - 40);
    labelLines.slice(0, 2).forEach((line, i) => {
      ctx.fillText(line, splitW / 2, h / 2 + 30 + i * 24);
    });
  } else if (data.slideNumber) {
    ctx.font = "64px GeistBlack";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(String(data.slideNumber), splitW / 2, h / 2);
  }

  // # Right content
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const rightX = splitW + 48;
  const rightMaxW = w - rightX - PAD;

  ctx.font = "28px GeistBold";
  ctx.fillStyle = TEXT_PRIMARY;
  const headEnd = drawWrappedText(ctx, data.headline, rightX, h * 0.35, rightMaxW, 38, 3);

  if (data.body) {
    ctx.font = "18px Geist";
    ctx.fillStyle = TEXT_SECONDARY;
    drawWrappedText(ctx, data.body, rightX, headEnd + 20, rightMaxW, 28, 4);
  }

  // # Brand URL at bottom-right
  ctx.font = "14px GeistMedium";
  ctx.fillStyle = TEXT_MUTED;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(BRAND_URL, rightX, h - PAD);
}

// # PROGRESS BAR: Multiple progress bars with labels and percentages
async function drawProgressBar(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  await drawBackground(ctx, data, w, h);
  drawHeader(ctx, w, PAD, data.slideNumber, data.totalSlides);

  const maxW = w - PAD * 2;
  let y = h * 0.2;

  // # Title
  if (data.headline) {
    ctx.font = "28px GeistBold";
    ctx.fillStyle = TEXT_PRIMARY;
    ctx.textBaseline = "top";
    y = drawWrappedText(ctx, data.headline, PAD, y, maxW, 38, 2);
    y += 32;
  }

  const bars = data.bars || [];
  const barH = 14;
  const maxBars = Math.min(bars.length, 6);
  const barSpacing = Math.min(60, (h * 0.5) / maxBars);

  for (let i = 0; i < maxBars; i++) {
    const bar = bars[i];

    // # Label
    ctx.font = "18px GeistMedium";
    ctx.fillStyle = TEXT_PRIMARY;
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillText(bar.label, PAD, y);

    // # Percentage
    ctx.textAlign = "right";
    ctx.font = "18px GeistBold";
    ctx.fillStyle = ACCENT_3;
    ctx.fillText(`${bar.value}%`, PAD + maxW, y);
    ctx.textAlign = "left";

    // # Bar track — visible
    y += 14;
    fillRoundedRect(ctx, PAD, y, maxW, barH, 7, rgba(ACCENT_1, 0.15));

    // # Bar fill with gradient
    const fillW = (Math.min(bar.value, 100) / 100) * maxW;
    if (fillW > 0) {
      const grad = hGradient(ctx, PAD, PAD + fillW, y, [ACCENT_1, bar.color || ACCENT_3]);
      fillRoundedRect(ctx, PAD, y, fillW, barH, 7, grad);
    }

    y += barH + barSpacing - 14;
  }

  ctx.textBaseline = "alphabetic";
  drawFooter(ctx, w, h, PAD);
}

/* ---- Main Renderer ---- */

// # Renders a SlideData to a PNG Buffer using Canvas 2D
export async function renderSlideCanvas(data: SlideData, width: number, height: number): Promise<Buffer> {
  registerFonts();

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // # Enable font smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // # Route to the appropriate template
  switch (data.layout) {
    case "hero":           await drawHero(ctx, data, width, height); break;
    case "stat_card":      await drawStatCard(ctx, data, width, height); break;
    case "tip":            await drawTip(ctx, data, width, height); break;
    case "quote":          await drawQuote(ctx, data, width, height); break;
    case "list":           await drawList(ctx, data, width, height); break;
    case "cta":            await drawCta(ctx, data, width, height); break;
    case "before_after":   await drawBeforeAfter(ctx, data, width, height); break;
    case "screenshot":     await drawScreenshot(ctx, data, width, height); break;
    case "data_chart":     await drawDataChart(ctx, data, width, height); break;
    case "comparison":     await drawComparison(ctx, data, width, height); break;
    case "numbered_steps": await drawNumberedSteps(ctx, data, width, height); break;
    case "gradient_text":  await drawGradientTextSlide(ctx, data, width, height); break;
    case "highlight_box":  await drawHighlightBox(ctx, data, width, height); break;
    case "split_image":    await drawSplitImage(ctx, data, width, height); break;
    case "progress_bar":   await drawProgressBar(ctx, data, width, height); break;
    default:               await drawHero(ctx, data, width, height); break;
  }

  return canvas.toBuffer("image/png");
}
