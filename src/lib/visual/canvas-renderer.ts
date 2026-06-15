/* ============================================================
   CANVAS RENDERING ENGINE — PREMIUM VISUAL SYSTEM
   ============================================================
   @napi-rs/canvas renderer producing clean, professional
   branded images. Adaptive scaling for all platform sizes.
   Premium glassmorphism, indigo/violet gradients, and
   refined typography with Apple/Linear-level aesthetics.
   ============================================================ */

import { createCanvas, GlobalFonts, loadImage, type SKRSContext2D, type Image } from "@napi-rs/canvas";
import { join } from "path";
import type { SlideData } from "./types";
import { BG, BG_CARD, BG_ELEVATED, BORDER_STRONG, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, ACCENT_1, ACCENT_2, ACCENT_3, BRAND_NAME, BRAND_URL } from "./brand";

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

/* ---- Adaptive Scaling ---- */

// # Returns a scale function based on 1080px reference width
function createScale(w: number) {
  const sf = w / 1080;
  return (v: number) => Math.round(v * sf);
}

/* ---- Color Helpers ---- */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ---- Drawing Primitives ---- */

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

function fillRR(ctx: SKRSContext2D, x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient) {
  roundedRect(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function strokeRR(ctx: SKRSContext2D, x: number, y: number, w: number, h: number, r: number, color: string, lw: number) {
  roundedRect(ctx, x, y, w, h, r);
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.stroke();
}

function hGrad(ctx: SKRSContext2D, x1: number, x2: number, y: number, colors: string[]): CanvasGradient {
  const g = ctx.createLinearGradient(x1, y, x2, y);
  colors.forEach((c, i) => g.addColorStop(i / (colors.length - 1), c));
  return g;
}

function vGrad(ctx: SKRSContext2D, y1: number, y2: number, x: number, colors: string[]): CanvasGradient {
  const g = ctx.createLinearGradient(x, y1, x, y2);
  colors.forEach((c, i) => g.addColorStop(i / (colors.length - 1), c));
  return g;
}

function dGrad(ctx: SKRSContext2D, x: number, y: number, w: number, h: number, colors: string[]): CanvasGradient {
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  colors.forEach((c, i) => g.addColorStop(i / (colors.length - 1), c));
  return g;
}

/* ---- Text Utilities ---- */

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

// # Draw wrapped text with optional drop shadow — returns Y after last line
function drawText(
  ctx: SKRSContext2D, text: string, x: number, y: number,
  maxWidth: number, lineHeight: number, maxLines?: number, shadow?: boolean
): number {
  const lines = wrapText(ctx, text, maxWidth);
  const limited = maxLines ? lines.slice(0, maxLines) : lines;
  for (let i = 0; i < limited.length; i++) {
    let line = limited[i];
    if (maxLines && i === maxLines - 1 && lines.length > maxLines) {
      line = line.replace(/\s*\S*$/, "...");
    }
    if (shadow) {
      const saved = ctx.fillStyle;
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillText(line, x + 1, y + i * lineHeight + 2);
      ctx.fillStyle = saved;
    }
    ctx.fillText(line, x, y + i * lineHeight);
  }
  return y + limited.length * lineHeight;
}

/* ---- Premium Visual Elements ---- */

// # Soft ambient glow orb — clean radial falloff
function drawGlow(ctx: SKRSContext2D, cx: number, cy: number, radius: number, color: string, opacity: number = 0.20) {
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  gradient.addColorStop(0, rgba(color, opacity));
  gradient.addColorStop(0.35, rgba(color, opacity * 0.4));
  gradient.addColorStop(0.65, rgba(color, opacity * 0.1));
  gradient.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
}

// # Glass morphism card — premium dark glass with border highlight
function drawCard(
  ctx: SKRSContext2D, x: number, y: number, w: number, h: number,
  r: number = 20, options?: { glow?: boolean; accentTop?: string }
) {
  if (options?.glow) {
    ctx.shadowColor = rgba(ACCENT_1, 0.12);
    ctx.shadowBlur = 48;
    ctx.shadowOffsetY = 10;
  }

  // # Semi-transparent dark fill
  fillRR(ctx, x, y, w, h, r, "rgba(14,14,18,0.82)");

  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // # Border
  strokeRR(ctx, x, y, w, h, r, BORDER_STRONG, 1);

  // # Top-edge inner highlight
  ctx.save();
  roundedRect(ctx, x + 1, y + 1, w - 2, h - 2, Math.max(r - 1, 0));
  ctx.clip();
  const hl = ctx.createLinearGradient(x, y, x, y + 5);
  hl.addColorStop(0, "rgba(255,255,255,0.10)");
  hl.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = hl;
  ctx.fillRect(x, y, w, 5);
  ctx.restore();

  // # Gradient accent stripe at top of card
  if (options?.accentTop) {
    ctx.save();
    roundedRect(ctx, x, y, w, r, r);
    ctx.clip();
    const ag = hGrad(ctx, x, x + w * 0.45, y, [options.accentTop, ACCENT_2]);
    ctx.fillStyle = ag;
    ctx.fillRect(x, y, w, 3);
    ctx.restore();
  }
}

/* ---- Background System ---- */

async function drawBackground(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  // # Rich multi-stop diagonal gradient base
  const base = ctx.createLinearGradient(0, 0, w * 0.3, h);
  base.addColorStop(0, "#0e0e14");
  base.addColorStop(0.35, BG);
  base.addColorStop(0.65, "#0a0a10");
  base.addColorStop(1, "#080810");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  // # Stock photo compositing
  if (data.backgroundImageUrl) {
    try {
      const img = await loadImage(data.backgroundImageUrl);
      const imgW = (img as Image).width;
      const imgH = (img as Image).height;
      const imgRatio = imgW / imgH;
      const canvasRatio = w / h;
      let sx = 0, sy = 0, sw = imgW, sh = imgH;
      if (imgRatio > canvasRatio) {
        sw = imgH * canvasRatio;
        sx = (imgW - sw) / 2;
      } else {
        sh = imgW / canvasRatio;
        sy = (imgH - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

      // # Overlay — translucent enough to let photo add atmosphere
      const ov = ctx.createLinearGradient(0, 0, 0, h);
      ov.addColorStop(0, "rgba(9,9,11,0.70)");
      ov.addColorStop(0.35, "rgba(9,9,11,0.48)");
      ov.addColorStop(0.65, "rgba(9,9,11,0.48)");
      ov.addColorStop(1, "rgba(9,9,11,0.72)");
      ctx.fillStyle = ov;
      ctx.fillRect(0, 0, w, h);
    } catch {
      // # Photo load failed — base gradient remains
    }
  }

  // # Ambient glow orbs for depth — indigo top-right, violet bottom-left
  drawGlow(ctx, w * 0.82, h * 0.08, w * 0.48, ACCENT_1, 0.16);
  drawGlow(ctx, w * 0.14, h * 0.88, w * 0.40, ACCENT_2, 0.12);

  // # Subtle vignette — darkened edges
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.22)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

/* ---- Header & Footer ---- */

function drawHeader(ctx: SKRSContext2D, w: number, pad: number, s: (v: number) => number, slideNum?: number, totalSlides?: number) {
  const y = pad + s(22);

  // # Logo mark — gradient rounded square
  const ls = s(32);
  const lg = dGrad(ctx, pad, y - ls / 2, ls, ls, [ACCENT_1, ACCENT_2]);
  fillRR(ctx, pad, y - ls / 2, ls, ls, s(8), lg);
  ctx.font = `${s(15)}px GeistBold`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("J", pad + ls / 2, y + 1);

  // # Brand name
  ctx.font = `${s(13)}px GeistSemiBold`;
  ctx.fillStyle = TEXT_MUTED;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(BRAND_NAME, pad + ls + s(10), y);

  // # Slide counter pill
  if (slideNum !== undefined && totalSlides !== undefined) {
    const lbl = `${slideNum} / ${totalSlides}`;
    ctx.font = `${s(11)}px GeistMedium`;
    const tw = ctx.measureText(lbl).width;
    const pw = tw + s(18);
    const ph = s(22);
    const px = w - pad - pw;
    const py = y - ph / 2;
    fillRR(ctx, px, py, pw, ph, ph / 2, "rgba(255,255,255,0.06)");
    strokeRR(ctx, px, py, pw, ph, ph / 2, "rgba(255,255,255,0.08)", 1);
    ctx.fillStyle = TEXT_MUTED;
    ctx.textAlign = "center";
    ctx.fillText(lbl, px + pw / 2, y + 1);
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

function drawFooter(ctx: SKRSContext2D, w: number, h: number, pad: number, s: (v: number) => number) {
  const y = h - pad - s(2);

  // # Separator — gradient fade line
  const sepGrad = hGrad(ctx, pad, w - pad, 0, [rgba(ACCENT_1, 0.15), rgba(ACCENT_2, 0.06), "rgba(255,255,255,0)"]);
  ctx.fillStyle = sepGrad;
  ctx.fillRect(pad, y - s(18), w - pad * 2, 1);

  // # Brand URL
  ctx.font = `${s(11)}px GeistMedium`;
  ctx.fillStyle = TEXT_MUTED;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(BRAND_URL, pad, y);

  // # Small gradient accent mark
  const dotR = s(3);
  const dotGrad = dGrad(ctx, w - pad - dotR * 2, y - dotR * 2, dotR * 4, dotR * 4, [ACCENT_1, ACCENT_2]);
  ctx.beginPath();
  ctx.arc(w - pad - dotR, y - s(3), dotR, 0, Math.PI * 2);
  ctx.fillStyle = dotGrad;
  ctx.fill();
}

/* ---- Content Area Helper ---- */

function contentArea(pad: number, s: (v: number) => number, h: number) {
  const top = pad + s(54);
  const bot = h - pad - s(26);
  return { top, bot, h: bot - top, cy: top + (bot - top) / 2 };
}

/* ============================================================
   TEMPLATE FUNCTIONS — 15 Premium Layouts
   ============================================================ */

// # HERO — Bold headline in a glass card with gradient accent
async function drawHero(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const pad = s(56);
  await drawBackground(ctx, data, w, h);
  drawHeader(ctx, w, pad, s, data.slideNumber, data.totalSlides);

  const area = contentArea(pad, s, h);
  const inner = s(36);
  const cardW = w - pad * 2;
  const cardH = Math.min(area.h * 0.78, s(540));
  const cardX = pad;
  const cardY = area.cy - cardH / 2;
  drawCard(ctx, cardX, cardY, cardW, cardH, s(22), { accentTop: data.accentColor || ACCENT_1 });

  // # Gradient accent bar inside card
  const barGrad = hGrad(ctx, cardX + inner, cardX + inner + s(110), 0, [data.accentColor || ACCENT_1, ACCENT_2]);
  fillRR(ctx, cardX + inner, cardY + inner, s(110), s(5), s(3), barGrad);

  // # Headline
  const fs = s(w >= 1200 ? 48 : 42);
  ctx.font = `${fs}px GeistBold`;
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.textBaseline = "top";
  const headY = cardY + inner + s(26);
  const maxW = cardW - inner * 2;
  const lh = Math.round(fs * 1.22);
  const nextY = drawText(ctx, data.headline, cardX + inner, headY, maxW, lh, 3, true);

  // # Subheadline
  if (data.subheadline) {
    ctx.font = `${s(19)}px GeistMedium`;
    ctx.fillStyle = TEXT_SECONDARY;
    drawText(ctx, data.subheadline, cardX + inner, nextY + s(18), maxW, s(28), 2, true);
  }

  ctx.textBaseline = "alphabetic";
  drawFooter(ctx, w, h, pad, s);
}

// # STAT CARD — Large centered statistic with gradient coloring
async function drawStatCard(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const pad = s(56);
  await drawBackground(ctx, data, w, h);
  drawHeader(ctx, w, pad, s, data.slideNumber, data.totalSlides);

  const area = contentArea(pad, s, h);
  const cx = w / 2;

  // # Glass card behind stat
  const cardW = Math.min(w * 0.74, s(720));
  const cardH = Math.min(area.h * 0.58, s(380));
  drawCard(ctx, cx - cardW / 2, area.cy - cardH / 2, cardW, cardH, s(24));

  // # Decorative ring
  ctx.beginPath();
  ctx.arc(cx, area.cy - s(10), s(105), 0, Math.PI * 2);
  ctx.strokeStyle = rgba(ACCENT_1, 0.12);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  if (data.stat) {
    // # Large stat value with bold gradient
    const vLen = data.stat.value.length;
    const statFs = s(vLen > 5 ? 72 : vLen > 3 ? 100 : 128);
    ctx.font = `${statFs}px GeistBlack`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const sg = dGrad(ctx, cx - s(150), area.cy - s(70), s(300), s(130), [ACCENT_1, ACCENT_3, ACCENT_2]);
    ctx.fillStyle = sg;
    ctx.fillText(data.stat.value, cx, area.cy - s(14));

    // # Label
    ctx.font = `${s(20)}px GeistSemiBold`;
    ctx.fillStyle = TEXT_SECONDARY;
    const labels = wrapText(ctx, data.stat.label, cardW * 0.75);
    labels.slice(0, 2).forEach((line, i) => {
      ctx.fillText(line, cx, area.cy + s(58) + i * s(30));
    });
  } else if (data.headline) {
    ctx.font = `${s(36)}px GeistBold`;
    ctx.fillStyle = TEXT_PRIMARY;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const lines = wrapText(ctx, data.headline, cardW * 0.8);
    lines.slice(0, 3).forEach((line, i) => {
      ctx.fillText(line, cx, area.cy - ((lines.length - 1) * s(24)) + i * s(48));
    });
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  drawFooter(ctx, w, h, pad, s);
}

// # TIP — Numbered tip with accent line, headline, and body text
async function drawTip(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const pad = s(56);
  await drawBackground(ctx, data, w, h);
  drawHeader(ctx, w, pad, s, data.slideNumber, data.totalSlides);

  const area = contentArea(pad, s, h);
  const accent = data.accentColor || ACCENT_1;

  // # Glass card
  const cardW = w - pad * 2 + s(16);
  const cardH = Math.min(area.h * 0.72, s(520));
  const cardX = pad - s(8);
  const cardY = area.cy - cardH / 2;
  drawCard(ctx, cardX, cardY, cardW, cardH, s(20));

  const inner = s(28);

  // # Left accent line — thick gradient
  const lineGrad = vGrad(ctx, cardY + inner, cardY + cardH - inner, 0, [accent, ACCENT_2]);
  fillRR(ctx, cardX + inner, cardY + inner, s(5), cardH - inner * 2, s(3), lineGrad);

  const textX = cardX + inner + s(32);
  const textMaxW = cardW - inner * 2 - s(36);

  // # Tip number badge
  if (data.slideNumber) {
    const bSize = s(44);
    const bGrad = dGrad(ctx, textX, cardY + inner, bSize, bSize, [accent, ACCENT_2]);
    fillRR(ctx, textX, cardY + inner, bSize, bSize, s(12), bGrad);
    ctx.font = `${s(20)}px GeistBold`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(data.slideNumber), textX + bSize / 2, cardY + inner + bSize / 2 + 1);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }

  // # Headline
  const headY = cardY + inner + (data.slideNumber ? s(62) : 0);
  const headFs = s(32);
  ctx.font = `${headFs}px GeistBold`;
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.textBaseline = "top";
  const afterHead = drawText(ctx, data.headline, textX, headY, textMaxW, Math.round(headFs * 1.3), 3, true);

  // # Body text
  if (data.body) {
    ctx.font = `${s(18)}px GeistMedium`;
    ctx.fillStyle = TEXT_SECONDARY;
    drawText(ctx, data.body, textX, afterHead + s(16), textMaxW, s(28), 5, true);
  }

  ctx.textBaseline = "alphabetic";
  drawFooter(ctx, w, h, pad, s);
}

// # QUOTE — Large quotation mark with centered quote text
async function drawQuote(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const pad = s(56);
  await drawBackground(ctx, data, w, h);
  drawHeader(ctx, w, pad, s, data.slideNumber, data.totalSlides);

  const area = contentArea(pad, s, h);
  const cx = w / 2;
  const maxW = w * 0.76;

  // # Glass card
  const cardW = w * 0.84;
  const cardH = Math.min(area.h * 0.60, s(440));
  const cardX = cx - cardW / 2;
  const cardY = area.cy - cardH / 2;
  drawCard(ctx, cardX, cardY, cardW, cardH, s(24));

  // # Large gradient quotation mark
  ctx.font = `${s(140)}px GeistBlack`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const qGrad = dGrad(ctx, cx - s(50), cardY + s(10), s(100), s(80), [ACCENT_1, ACCENT_2]);
  ctx.fillStyle = qGrad;
  ctx.fillText("“", cx, cardY + s(55));

  // # Quote text
  ctx.font = `${s(26)}px GeistSemiBold`;
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.textBaseline = "top";
  const lines = wrapText(ctx, data.headline, maxW);
  const textH = Math.min(lines.length, 4) * s(40);
  const startY = area.cy - textH / 2 + s(20);
  lines.slice(0, 4).forEach((line, i) => {
    ctx.textAlign = "center";
    ctx.fillText(line, cx, startY + i * s(40));
  });

  // # Attribution
  if (data.subheadline) {
    ctx.font = `${s(16)}px GeistMedium`;
    ctx.fillStyle = ACCENT_3;
    ctx.textAlign = "center";
    ctx.fillText(`— ${data.subheadline}`, cx, startY + Math.min(lines.length, 4) * s(40) + s(20));
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  drawFooter(ctx, w, h, pad, s);
}

// # LIST — Title with gradient-accented bullet items inside a glass card
async function drawList(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const pad = s(56);
  await drawBackground(ctx, data, w, h);
  drawHeader(ctx, w, pad, s, data.slideNumber, data.totalSlides);

  const area = contentArea(pad, s, h);
  const maxW = w - pad * 2;
  let y = area.top + s(8);

  // # Headline
  const headFs = s(32);
  ctx.font = `${headFs}px GeistBold`;
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.textBaseline = "top";
  y = drawText(ctx, data.headline, pad, y, maxW, Math.round(headFs * 1.3), 2, true);

  // # Gradient underline
  const ulGrad = hGrad(ctx, pad, pad + s(100), 0, [ACCENT_1, ACCENT_2]);
  fillRR(ctx, pad, y + s(8), s(100), s(4), s(2), ulGrad);
  y += s(28);

  // # Bullet items in glass card
  if (data.bullets) {
    const maxBullets = Math.min(data.bullets.length, 6);
    const bulletH = maxBullets * s(52) + s(32);
    const cardX = pad - s(12);
    const cardW = w - pad * 2 + s(24);
    drawCard(ctx, cardX, y - s(8), cardW, bulletH, s(16));

    const bulletMaxW = maxW - s(40);
    for (let i = 0; i < maxBullets; i++) {
      const dotY = y + s(10) + i * s(52);

      // # Gradient bullet dot
      const dotGrad = dGrad(ctx, pad + s(8), dotY, s(8), s(8), [ACCENT_1, ACCENT_2]);
      ctx.beginPath();
      ctx.arc(pad + s(12), dotY + s(4), s(4), 0, Math.PI * 2);
      ctx.fillStyle = dotGrad;
      ctx.fill();

      // # Bullet text
      ctx.font = `${s(18)}px GeistMedium`;
      ctx.fillStyle = TEXT_PRIMARY;
      drawText(ctx, data.bullets[i], pad + s(32), dotY - s(4), bulletMaxW, s(28), 2);
    }
  }

  ctx.textBaseline = "alphabetic";
  drawFooter(ctx, w, h, pad, s);
}

// # CTA — Call-to-action with centered card, logo, and gradient button
async function drawCta(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const pad = s(56);
  await drawBackground(ctx, data, w, h);
  drawHeader(ctx, w, pad, s, data.slideNumber, data.totalSlides);

  const area = contentArea(pad, s, h);
  const cx = w / 2;

  // # Card with glow shadow
  const cardW = Math.min(w * 0.78, s(740));
  const cardH = Math.min(area.h * 0.62, s(440));
  const cardX = cx - cardW / 2;
  const cardY = area.cy - cardH / 2;
  drawCard(ctx, cardX, cardY, cardW, cardH, s(24), { glow: true, accentTop: ACCENT_1 });

  const inner = s(40);

  // # Logo
  const logoY = cardY + inner;
  const logoSize = s(48);
  const logoGrad = dGrad(ctx, cx - logoSize / 2, logoY, logoSize, logoSize, [ACCENT_1, ACCENT_2]);
  fillRR(ctx, cx - logoSize / 2, logoY, logoSize, logoSize, s(14), logoGrad);
  ctx.font = `${s(22)}px GeistBold`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("J", cx, logoY + logoSize / 2 + 1);

  // # CTA headline
  const headFs = s(26);
  ctx.font = `${headFs}px GeistBold`;
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.textBaseline = "top";
  const headMaxW = cardW - inner * 2;
  const lines = wrapText(ctx, data.headline, headMaxW);
  const headY = logoY + logoSize + s(22);
  lines.slice(0, 2).forEach((line, i) => {
    ctx.fillText(line, cx, headY + i * Math.round(headFs * 1.35));
  });

  // # Body
  let bodyEndY = headY + Math.min(lines.length, 2) * Math.round(headFs * 1.35);
  if (data.body) {
    ctx.font = `${s(17)}px Geist`;
    ctx.fillStyle = TEXT_SECONDARY;
    const bodyLines = wrapText(ctx, data.body, headMaxW);
    bodyEndY += s(10);
    bodyLines.slice(0, 2).forEach((line, i) => {
      ctx.fillText(line, cx, bodyEndY + i * s(26));
    });
    bodyEndY += Math.min(bodyLines.length, 2) * s(26);
  }

  // # Gradient CTA button
  const btnW = s(200);
  const btnH = s(46);
  const btnX = cx - btnW / 2;
  const btnY = bodyEndY + s(22);
  const btnGrad = hGrad(ctx, btnX, btnX + btnW, 0, [ACCENT_1, ACCENT_2]);
  fillRR(ctx, btnX, btnY, btnW, btnH, s(12), btnGrad);
  ctx.font = `${s(16)}px GeistSemiBold`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.fillText(BRAND_URL, cx, btnY + btnH / 2);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  drawFooter(ctx, w, h, pad, s);
}

// # BEFORE/AFTER — Side-by-side comparison with red/green coding
async function drawBeforeAfter(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const pad = s(56);
  await drawBackground(ctx, data, w, h);
  drawHeader(ctx, w, pad, s, data.slideNumber, data.totalSlides);

  const area = contentArea(pad, s, h);

  // # Title
  if (data.headline) {
    ctx.font = `${s(28)}px GeistBold`;
    ctx.fillStyle = TEXT_PRIMARY;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    drawText(ctx, data.headline, w / 2, area.top, w - pad * 2, s(38), 2);
    ctx.textAlign = "left";
  }

  const gap = s(20);
  const cardW = (w - pad * 2 - gap) / 2;
  const cardH = Math.min(area.h * 0.62, s(520));
  const cardY = area.cy - cardH / 2 + s(20);

  // # BEFORE card — red-tinted
  fillRR(ctx, pad, cardY, cardW, cardH, s(18), "rgba(239,68,68,0.06)");
  strokeRR(ctx, pad, cardY, cardW, cardH, s(18), "rgba(239,68,68,0.20)", 1);
  ctx.save();
  roundedRect(ctx, pad, cardY, cardW, s(3), s(18));
  ctx.clip();
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(pad, cardY, cardW, s(3));
  ctx.restore();
  ctx.font = `${s(12)}px GeistBold`;
  ctx.fillStyle = "#ef4444";
  ctx.textBaseline = "top";
  ctx.letterSpacing = `${s(3)}px`;
  ctx.fillText("BEFORE", pad + s(24), cardY + s(22));
  ctx.letterSpacing = "0px";
  ctx.font = `${s(17)}px GeistMedium`;
  ctx.fillStyle = TEXT_SECONDARY;
  drawText(ctx, data.beforeText || "", pad + s(24), cardY + s(50), cardW - s(48), s(26), 8);

  // # AFTER card — green-tinted
  const afterX = pad + cardW + gap;
  fillRR(ctx, afterX, cardY, cardW, cardH, s(18), "rgba(34,197,94,0.06)");
  strokeRR(ctx, afterX, cardY, cardW, cardH, s(18), "rgba(34,197,94,0.20)", 1);
  ctx.save();
  roundedRect(ctx, afterX, cardY, cardW, s(3), s(18));
  ctx.clip();
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(afterX, cardY, cardW, s(3));
  ctx.restore();
  ctx.font = `${s(12)}px GeistBold`;
  ctx.fillStyle = "#22c55e";
  ctx.letterSpacing = `${s(3)}px`;
  ctx.fillText("AFTER", afterX + s(24), cardY + s(22));
  ctx.letterSpacing = "0px";
  ctx.font = `${s(17)}px GeistSemiBold`;
  ctx.fillStyle = TEXT_PRIMARY;
  drawText(ctx, data.afterText || "", afterX + s(24), cardY + s(50), cardW - s(48), s(26), 8);

  // # VS divider
  const vsX = pad + cardW + gap / 2;
  const vsY = cardY + cardH / 2;
  ctx.beginPath();
  ctx.arc(vsX, vsY, s(16), 0, Math.PI * 2);
  ctx.fillStyle = BG_ELEVATED;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(vsX, vsY, s(16), 0, Math.PI * 2);
  ctx.strokeStyle = rgba(ACCENT_1, 0.25);
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.font = `${s(11)}px GeistBold`;
  ctx.fillStyle = TEXT_SECONDARY;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("VS", vsX, vsY);
  ctx.textAlign = "left";

  ctx.textBaseline = "alphabetic";
  drawFooter(ctx, w, h, pad, s);
}

// # SCREENSHOT — Fake tweet/DM/notification card
async function drawScreenshot(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const pad = s(56);
  await drawBackground(ctx, data, w, h);
  drawHeader(ctx, w, pad, s, data.slideNumber, data.totalSlides);

  const area = contentArea(pad, s, h);
  const cx = w / 2;

  // # Card with drop shadow
  const cardW = Math.min(w * 0.82, s(780));
  const cardH = Math.min(area.h * 0.55, s(380));
  const cardX = cx - cardW / 2;
  const cardY = area.cy - cardH / 2;

  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = s(28);
  ctx.shadowOffsetY = s(6);
  fillRR(ctx, cardX, cardY, cardW, cardH, s(18), BG_CARD);
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  strokeRR(ctx, cardX, cardY, cardW, cardH, s(18), rgba(ACCENT_1, 0.08), 1);

  // # Avatar
  const avSize = s(40);
  const avX = cardX + s(28);
  const avY = cardY + s(28);
  const avGrad = dGrad(ctx, avX, avY, avSize, avSize, [ACCENT_1, ACCENT_2]);
  ctx.beginPath();
  ctx.arc(avX + avSize / 2, avY + avSize / 2, avSize / 2, 0, Math.PI * 2);
  ctx.fillStyle = avGrad;
  ctx.fill();
  ctx.font = `${s(17)}px GeistBold`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText((data.screenshotAuthor || "U")[0].toUpperCase(), avX + avSize / 2, avY + avSize / 2 + 1);

  // # Author + type label
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = `${s(16)}px GeistSemiBold`;
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.fillText(data.screenshotAuthor || "User", avX + avSize + s(12), avY + s(16));
  ctx.font = `${s(12)}px GeistMedium`;
  ctx.fillStyle = TEXT_MUTED;
  const typeLabel = data.screenshotType === "dm" ? "Direct Message" : data.screenshotType === "email" ? "Email" : "Post";
  ctx.fillText(typeLabel, avX + avSize + s(12), avY + s(34));

  // # Message text
  ctx.font = `${s(18)}px Geist`;
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.textBaseline = "top";
  drawText(ctx, data.headline, cardX + s(28), avY + avSize + s(18), cardW - s(56), s(30), 6);

  ctx.textBaseline = "alphabetic";
  drawFooter(ctx, w, h, pad, s);
}

// # DATA CHART — Horizontal bar chart with gradient fills
async function drawDataChart(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const pad = s(56);
  await drawBackground(ctx, data, w, h);
  drawHeader(ctx, w, pad, s, data.slideNumber, data.totalSlides);

  const area = contentArea(pad, s, h);
  const maxW = w - pad * 2;
  let y = area.top + s(8);

  // # Title
  if (data.headline) {
    ctx.font = `${s(26)}px GeistBold`;
    ctx.fillStyle = TEXT_PRIMARY;
    ctx.textBaseline = "top";
    y = drawText(ctx, data.headline, pad, y, maxW, s(36), 2, true);
    y += s(28);
  }

  // # Bars
  const bars = data.bars || [];
  const barH = s(12);
  const maxBars = Math.min(bars.length, 7);
  const barSpacing = Math.min(s(56), (area.bot - y) / maxBars);

  for (let i = 0; i < maxBars; i++) {
    const bar = bars[i];

    // # Label + value
    ctx.font = `${s(15)}px GeistMedium`;
    ctx.fillStyle = TEXT_SECONDARY;
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillText(bar.label, pad, y);
    ctx.textAlign = "right";
    ctx.font = `${s(15)}px GeistBold`;
    ctx.fillStyle = TEXT_PRIMARY;
    ctx.fillText(`${bar.value}%`, pad + maxW, y);
    ctx.textAlign = "left";

    // # Bar track
    y += s(10);
    fillRR(ctx, pad, y, maxW, barH, s(6), rgba(ACCENT_1, 0.12));

    // # Bar fill
    const fillW = (Math.min(bar.value, 100) / 100) * maxW;
    if (fillW > 0) {
      const bg = hGrad(ctx, pad, pad + fillW, 0, [bar.color || ACCENT_1, ACCENT_2]);
      fillRR(ctx, pad, y, fillW, barH, s(6), bg);
    }

    y += barH + barSpacing - s(10);
  }

  drawFooter(ctx, w, h, pad, s);
}

// # COMPARISON — Two-column layout with glass cards and accent headers
async function drawComparison(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const pad = s(56);
  await drawBackground(ctx, data, w, h);
  drawHeader(ctx, w, pad, s, data.slideNumber, data.totalSlides);

  const area = contentArea(pad, s, h);

  // # Title
  if (data.headline) {
    ctx.font = `${s(28)}px GeistBold`;
    ctx.fillStyle = TEXT_PRIMARY;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    drawText(ctx, data.headline, w / 2, area.top, w - pad * 2, s(38), 2);
    ctx.textAlign = "left";
  }

  const gap = s(20);
  const colW = (w - pad * 2 - gap) / 2;
  const colH = Math.min(area.h * 0.66, s(540));
  const colY = area.cy - colH / 2 + s(18);

  // # Left column
  drawCard(ctx, pad, colY, colW, colH, s(18), { accentTop: ACCENT_1 });
  ctx.font = `${s(12)}px GeistBold`;
  ctx.fillStyle = ACCENT_1;
  ctx.textBaseline = "top";
  ctx.letterSpacing = `${s(3)}px`;
  ctx.fillText(data.leftLabel || "OPTION A", pad + s(24), colY + s(20));
  ctx.letterSpacing = "0px";

  let ly = colY + s(48);
  (data.leftColumn || []).slice(0, 5).forEach((item) => {
    ctx.beginPath();
    ctx.arc(pad + s(28), ly + s(4), s(3), 0, Math.PI * 2);
    ctx.fillStyle = ACCENT_1;
    ctx.fill();
    ctx.font = `${s(15)}px GeistMedium`;
    ctx.fillStyle = TEXT_SECONDARY;
    ly = drawText(ctx, item, pad + s(46), ly, colW - s(70), s(22), 2) + s(10);
  });

  // # Right column
  const rx = pad + colW + gap;
  drawCard(ctx, rx, colY, colW, colH, s(18), { accentTop: ACCENT_3 });
  ctx.font = `${s(12)}px GeistBold`;
  ctx.fillStyle = ACCENT_3;
  ctx.letterSpacing = `${s(3)}px`;
  ctx.fillText(data.rightLabel || "OPTION B", rx + s(24), colY + s(20));
  ctx.letterSpacing = "0px";

  let ry = colY + s(48);
  (data.rightColumn || []).slice(0, 5).forEach((item) => {
    ctx.beginPath();
    ctx.arc(rx + s(28), ry + s(4), s(3), 0, Math.PI * 2);
    ctx.fillStyle = ACCENT_3;
    ctx.fill();
    ctx.font = `${s(15)}px GeistMedium`;
    ctx.fillStyle = TEXT_SECONDARY;
    ry = drawText(ctx, item, rx + s(46), ry, colW - s(70), s(22), 2) + s(10);
  });

  ctx.textBaseline = "alphabetic";
  drawFooter(ctx, w, h, pad, s);
}

// # NUMBERED STEPS — Step badges with titles and details
async function drawNumberedSteps(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const pad = s(56);
  await drawBackground(ctx, data, w, h);
  drawHeader(ctx, w, pad, s, data.slideNumber, data.totalSlides);

  const area = contentArea(pad, s, h);
  const maxW = w - pad * 2;
  let y = area.top + s(8);

  // # Title
  if (data.headline) {
    ctx.font = `${s(26)}px GeistBold`;
    ctx.fillStyle = TEXT_PRIMARY;
    ctx.textBaseline = "top";
    y = drawText(ctx, data.headline, pad, y, maxW, s(36), 2, true);
    y += s(26);
  }

  const steps = data.steps || [];
  const maxSteps = Math.min(steps.length, 5);
  const stepSpace = Math.min(s(72), (area.bot - y) / maxSteps);
  const badgeSize = s(42);

  // # Connecting line between badges
  if (maxSteps > 1) {
    const lineX = pad + badgeSize / 2;
    const lineTop = y + badgeSize;
    const lineBot = y + (maxSteps - 1) * stepSpace + badgeSize / 2;
    const lineGrad = vGrad(ctx, lineTop, lineBot, 0, [rgba(ACCENT_1, 0.20), rgba(ACCENT_2, 0.08)]);
    ctx.fillStyle = lineGrad;
    ctx.fillRect(lineX - 1, lineTop, 2, lineBot - lineTop);
  }

  for (let i = 0; i < maxSteps; i++) {
    const step = steps[i];
    const sy = y + i * stepSpace;

    // # Gradient badge
    const bGrad = dGrad(ctx, pad, sy, badgeSize, badgeSize, [ACCENT_1, ACCENT_2]);
    fillRR(ctx, pad, sy, badgeSize, badgeSize, s(12), bGrad);
    ctx.font = `${s(18)}px GeistBold`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(step.number), pad + badgeSize / 2, sy + badgeSize / 2 + 1);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    // # Step title
    const textX = pad + badgeSize + s(18);
    ctx.font = `${s(19)}px GeistSemiBold`;
    ctx.fillStyle = TEXT_PRIMARY;
    ctx.fillText(step.title, textX, sy + s(4));

    // # Step detail
    if (step.detail) {
      ctx.font = `${s(15)}px Geist`;
      ctx.fillStyle = TEXT_SECONDARY;
      drawText(ctx, step.detail, textX, sy + s(28), maxW - badgeSize - s(18), s(22), 1);
    }
  }

  ctx.textBaseline = "alphabetic";
  drawFooter(ctx, w, h, pad, s);
}

// # GRADIENT TEXT — Large gradient headline with minimal decoration
async function drawGradientTextSlide(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const pad = s(56);
  await drawBackground(ctx, data, w, h);
  drawHeader(ctx, w, pad, s, data.slideNumber, data.totalSlides);

  const area = contentArea(pad, s, h);
  const cx = w / 2;
  const maxW = w * 0.82;

  // # Single decorative ring
  ctx.beginPath();
  ctx.arc(cx, area.cy, s(170), 0, Math.PI * 2);
  ctx.strokeStyle = rgba(ACCENT_1, 0.10);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // # Large gradient headline
  const fs = s(w >= 1200 ? 54 : 48);
  ctx.font = `${fs}px GeistBlack`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const lines = wrapText(ctx, data.headline, maxW);
  const lh = Math.round(fs * 1.18);
  const totalH = Math.min(lines.length, 3) * lh;
  const startY = area.cy - totalH / 2;

  const grad = dGrad(ctx, cx - maxW / 2, startY, maxW, totalH, [ACCENT_1, ACCENT_3, ACCENT_2]);
  ctx.fillStyle = grad;
  lines.slice(0, 3).forEach((line, i) => {
    ctx.fillText(line, cx, startY + i * lh);
  });

  // # Gradient underline
  const ulY = startY + Math.min(lines.length, 3) * lh + s(10);
  const ulGrad = hGrad(ctx, cx - s(50), cx + s(50), 0, [ACCENT_1, ACCENT_2]);
  fillRR(ctx, cx - s(50), ulY, s(100), s(4), s(2), ulGrad);

  // # Subheadline
  if (data.subheadline) {
    ctx.font = `${s(19)}px GeistMedium`;
    ctx.fillStyle = TEXT_SECONDARY;
    const subLines = wrapText(ctx, data.subheadline, maxW * 0.85);
    subLines.slice(0, 2).forEach((line, i) => {
      ctx.fillText(line, cx, ulY + s(22) + i * s(28));
    });
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  drawFooter(ctx, w, h, pad, s);
}

// # HIGHLIGHT BOX — Key insight in a glowing accent card
async function drawHighlightBox(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const pad = s(56);
  await drawBackground(ctx, data, w, h);
  drawHeader(ctx, w, pad, s, data.slideNumber, data.totalSlides);

  const area = contentArea(pad, s, h);
  const cx = w / 2;

  // # Label above box
  if (data.subheadline) {
    ctx.font = `${s(13)}px GeistSemiBold`;
    ctx.fillStyle = TEXT_MUTED;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.letterSpacing = `${s(3)}px`;
    ctx.fillText(data.subheadline.toUpperCase(), cx, area.cy - s(120));
    ctx.letterSpacing = "0px";
  }

  // # Highlight card with glow
  const boxW = Math.min(w * 0.78, s(740));
  const boxH = Math.min(area.h * 0.32, s(260));
  const boxX = cx - boxW / 2;
  const boxY = area.cy - boxH / 2;

  drawGlow(ctx, cx, boxY + boxH / 2, boxW * 0.40, ACCENT_1, 0.14);

  const bgGrad = dGrad(ctx, boxX, boxY, boxW, boxH, [rgba(ACCENT_1, 0.10), rgba(ACCENT_2, 0.10)]);
  fillRR(ctx, boxX, boxY, boxW, boxH, s(22), bgGrad);
  strokeRR(ctx, boxX, boxY, boxW, boxH, s(22), rgba(ACCENT_1, 0.28), 1.5);

  // # Text inside box
  ctx.font = `${s(24)}px GeistSemiBold`;
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const lines = wrapText(ctx, data.headline, boxW - s(56));
  const textStartY = boxY + (boxH - lines.length * s(36)) / 2;
  lines.slice(0, 3).forEach((line, i) => {
    ctx.fillText(line, cx, textStartY + i * s(36));
  });

  // # Body below box
  if (data.body) {
    ctx.font = `${s(17)}px Geist`;
    ctx.fillStyle = TEXT_SECONDARY;
    const bodyLines = wrapText(ctx, data.body, w * 0.72);
    bodyLines.slice(0, 2).forEach((line, i) => {
      ctx.fillText(line, cx, boxY + boxH + s(24) + i * s(26));
    });
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  drawFooter(ctx, w, h, pad, s);
}

// # SPLIT IMAGE — Left gradient accent panel + right text content
async function drawSplitImage(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const pad = s(56);
  await drawBackground(ctx, data, w, h);

  const splitW = w * 0.36;

  // # Left gradient panel
  const panelGrad = vGrad(ctx, 0, h, 0, [ACCENT_1, ACCENT_2]);
  ctx.fillStyle = panelGrad;
  ctx.fillRect(0, 0, splitW, h);

  // # Subtle horizontal lines on panel for texture
  for (let py = 0; py < h; py += s(24)) {
    if (Math.sin(py * 0.01) > 0.3) {
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.fillRect(0, py, splitW, 1);
    }
  }

  // # Stat or number on left panel
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (data.stat) {
    const vLen = data.stat.value.length;
    ctx.font = `${s(vLen > 4 ? 48 : 64)}px GeistBlack`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(data.stat.value, splitW / 2, h / 2 - s(16));
    ctx.font = `${s(15)}px GeistMedium`;
    ctx.fillStyle = "rgba(255,255,255,0.78)";
    const labels = wrapText(ctx, data.stat.label, splitW - s(40));
    labels.slice(0, 2).forEach((line, i) => {
      ctx.fillText(line, splitW / 2, h / 2 + s(28) + i * s(22));
    });
  } else if (data.slideNumber) {
    ctx.font = `${s(60)}px GeistBlack`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(String(data.slideNumber), splitW / 2, h / 2);
  }

  // # Right content
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const rightX = splitW + s(44);
  const rightMaxW = w - rightX - pad;

  ctx.font = `${s(26)}px GeistBold`;
  ctx.fillStyle = TEXT_PRIMARY;
  const headEnd = drawText(ctx, data.headline, rightX, h * 0.32, rightMaxW, s(36), 3, true);

  if (data.body) {
    ctx.font = `${s(17)}px Geist`;
    ctx.fillStyle = TEXT_SECONDARY;
    drawText(ctx, data.body, rightX, headEnd + s(18), rightMaxW, s(26), 4, true);
  }

  // # Brand URL at bottom-right
  ctx.font = `${s(12)}px GeistMedium`;
  ctx.fillStyle = TEXT_MUTED;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(BRAND_URL, rightX, h - pad);
}

// # PROGRESS BAR — Multiple progress bars with labels and percentages
async function drawProgressBar(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const pad = s(56);
  await drawBackground(ctx, data, w, h);
  drawHeader(ctx, w, pad, s, data.slideNumber, data.totalSlides);

  const area = contentArea(pad, s, h);
  const maxW = w - pad * 2;
  let y = area.top + s(8);

  // # Title
  if (data.headline) {
    ctx.font = `${s(26)}px GeistBold`;
    ctx.fillStyle = TEXT_PRIMARY;
    ctx.textBaseline = "top";
    y = drawText(ctx, data.headline, pad, y, maxW, s(36), 2, true);
    y += s(28);
  }

  const bars = data.bars || [];
  const barH = s(14);
  const maxBars = Math.min(bars.length, 6);
  const barSpacing = Math.min(s(60), (area.bot - y) / maxBars);

  for (let i = 0; i < maxBars; i++) {
    const bar = bars[i];

    // # Label
    ctx.font = `${s(16)}px GeistMedium`;
    ctx.fillStyle = TEXT_PRIMARY;
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillText(bar.label, pad, y);

    // # Percentage
    ctx.textAlign = "right";
    ctx.font = `${s(16)}px GeistBold`;
    ctx.fillStyle = ACCENT_3;
    ctx.fillText(`${bar.value}%`, pad + maxW, y);
    ctx.textAlign = "left";

    // # Bar track
    y += s(12);
    fillRR(ctx, pad, y, maxW, barH, s(7), rgba(ACCENT_1, 0.10));

    // # Bar fill
    const fillW = (Math.min(bar.value, 100) / 100) * maxW;
    if (fillW > 0) {
      const grad = hGrad(ctx, pad, pad + fillW, 0, [ACCENT_1, bar.color || ACCENT_3]);
      fillRR(ctx, pad, y, fillW, barH, s(7), grad);
    }

    y += barH + barSpacing - s(12);
  }

  ctx.textBaseline = "alphabetic";
  drawFooter(ctx, w, h, pad, s);
}

/* ============================================================
   MAIN RENDERER
   ============================================================ */

export async function renderSlideCanvas(data: SlideData, width: number, height: number): Promise<Buffer> {
  registerFonts();

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

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
