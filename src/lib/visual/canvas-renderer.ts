/* ============================================================
   CANVAS RENDERING ENGINE V2 — PREMIUM VISUAL SYSTEM
   ============================================================
   Three background modes: color-tinted photo, bold solid,
   dark gradient. Dramatically larger fonts, geometric
   decorations, minimal chrome on colored slides. All 15
   layouts adapted for both solid and dark backgrounds.
   ============================================================ */

import { createCanvas, GlobalFonts, loadImage, type SKRSContext2D, type Image } from "@napi-rs/canvas";
import { join } from "path";
import type { SlideData } from "./types";
import {
  BG, BG_CARD, BG_ELEVATED, BORDER_STRONG,
  TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED,
  SOLID_TEXT, SOLID_TEXT_DIM, SOLID_TEXT_MUTED,
  ACCENT_1, ACCENT_2, ACCENT_3,
  BRAND_NAME, BRAND_URL, BRAND_TAGLINE,
} from "./brand";

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
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillText(line, x + 2, y + i * lineHeight + 2);
      ctx.fillStyle = saved;
    }
    ctx.fillText(line, x, y + i * lineHeight);
  }
  return y + limited.length * lineHeight;
}

/* ---- Diagonal Line Texture — premium background depth ---- */

function drawDiagonalTexture(ctx: SKRSContext2D, w: number, h: number, isSolid: boolean) {
  // # Subtle diagonal lines at ~30° for richness (like premium financial/corporate reports)
  const lineOpacity = isSolid ? 0.04 : 0.03;
  const spacing = Math.round(w * 0.028);
  ctx.strokeStyle = `rgba(255,255,255,${lineOpacity})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  const diag = w + h;
  for (let i = -h; i < diag; i += spacing) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i + h * 0.58, h);
  }
  ctx.stroke();
}

/* ---- Horizontal Accent Line — structural separator ---- */

function drawAccentLine(ctx: SKRSContext2D, x: number, y: number, lineW: number, s: (v: number) => number, isSolid: boolean) {
  const grad = ctx.createLinearGradient(x, y, x + lineW, y);
  if (isSolid) {
    grad.addColorStop(0, "rgba(255,255,255,0.45)");
    grad.addColorStop(0.6, "rgba(255,255,255,0.15)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
  } else {
    grad.addColorStop(0, rgba(ACCENT_1, 0.80));
    grad.addColorStop(0.5, rgba(ACCENT_2, 0.40));
    grad.addColorStop(1, "rgba(255,255,255,0)");
  }
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, lineW, s(3));
}

/* ---- Brand Footer Bar — consistent bottom band ---- */

function drawBrandBar(ctx: SKRSContext2D, w: number, h: number, s: (v: number) => number, isSolid: boolean) {
  const barH = s(100);
  const barY = h - barH;

  // # Dark band background — semi-transparent
  ctx.fillStyle = isSolid ? "rgba(0,0,0,0.30)" : "rgba(0,0,0,0.40)";
  ctx.fillRect(0, barY, w, barH);

  // # Thin accent line at top of bar
  const accentGrad = ctx.createLinearGradient(0, barY, w, barY);
  accentGrad.addColorStop(0, rgba(ACCENT_1, 0.60));
  accentGrad.addColorStop(0.5, rgba(ACCENT_2, 0.40));
  accentGrad.addColorStop(1, rgba(ACCENT_1, 0.10));
  ctx.fillStyle = accentGrad;
  ctx.fillRect(0, barY, w, s(2));

  const pad = s(40);
  const cy = barY + barH / 2;

  // # Logo square — gradient blue "J" icon (left side)
  const logoSize = s(38);
  const logoX = pad;
  const logoY = cy - logoSize / 2;
  const lg = dGrad(ctx, logoX, logoY, logoSize, logoSize, [ACCENT_1, ACCENT_2]);
  fillRR(ctx, logoX, logoY, logoSize, logoSize, s(8), lg);
  ctx.font = `${s(20)}px GeistBold`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("J", logoX + logoSize / 2, cy + s(1));

  // # Brand name + URL — large and readable
  const textX = logoX + logoSize + s(14);
  ctx.font = `${s(24)}px GeistBold`;
  ctx.fillStyle = isSolid ? SOLID_TEXT : TEXT_PRIMARY;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(BRAND_NAME, textX, cy - s(14));

  ctx.font = `${s(20)}px Geist`;
  ctx.fillStyle = isSolid ? SOLID_TEXT_DIM : TEXT_SECONDARY;
  ctx.fillText(BRAND_URL, textX, cy + s(14));

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

/* ---- Premium Visual Elements ---- */

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

// # Glass morphism card — used only on dark backgrounds
function drawCard(
  ctx: SKRSContext2D, x: number, y: number, w: number, h: number,
  r: number = 20, options?: { glow?: boolean; accentTop?: string }
) {
  if (options?.glow) {
    ctx.shadowColor = rgba(ACCENT_1, 0.12);
    ctx.shadowBlur = 48;
    ctx.shadowOffsetY = 10;
  }
  fillRR(ctx, x, y, w, h, r, "rgba(14,14,18,0.82)");
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  strokeRR(ctx, x, y, w, h, r, BORDER_STRONG, 1);
  ctx.save();
  roundedRect(ctx, x + 1, y + 1, w - 2, h - 2, Math.max(r - 1, 0));
  ctx.clip();
  const hl = ctx.createLinearGradient(x, y, x, y + 5);
  hl.addColorStop(0, "rgba(255,255,255,0.10)");
  hl.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = hl;
  ctx.fillRect(x, y, w, 5);
  ctx.restore();
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

// # Light overlay card — used on solid colored backgrounds
function drawSolidCard(
  ctx: SKRSContext2D, x: number, y: number, w: number, h: number, r: number = 20
) {
  fillRR(ctx, x, y, w, h, r, "rgba(0,0,0,0.18)");
  strokeRR(ctx, x, y, w, h, r, "rgba(255,255,255,0.10)", 1);
}

/* ---- Background System — Three Modes ---- */

async function drawBackground(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const bgColor = data.backgroundColor;

  if (bgColor && data.backgroundImageUrl) {
    // # MODE 1: Color-tinted photo — our signature differentiator
    // # Draw photo full-bleed, then overlay with brand color at 72% opacity
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);

    try {
      const img = await loadImage(data.backgroundImageUrl);
      const imgW = (img as Image).width;
      const imgH = (img as Image).height;
      const imgRatio = imgW / imgH;
      const canvasRatio = w / h;
      let sx = 0, sy = 0, sw = imgW, sh = imgH;
      if (imgRatio > canvasRatio) { sw = imgH * canvasRatio; sx = (imgW - sw) / 2; }
      else { sh = imgW / canvasRatio; sy = (imgH - sh) / 2; }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

      // # Color overlay — lets photo show through as texture
      const ov = ctx.createLinearGradient(0, 0, 0, h);
      ov.addColorStop(0, rgba(bgColor, 0.75));
      ov.addColorStop(0.5, rgba(bgColor, 0.68));
      ov.addColorStop(1, rgba(bgColor, 0.78));
      ctx.fillStyle = ov;
      ctx.fillRect(0, 0, w, h);
    } catch {
      // # Photo failed — solid color remains
    }

    drawDiagonalTexture(ctx, w, h, true);

  } else if (bgColor) {
    // # MODE 2: Bold solid — clean flat color (Teal-style, no texture/gradient)
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);

  } else {
    // # MODE 3: Dark gradient — fallback with ambient glows
    const base = ctx.createLinearGradient(0, 0, w * 0.3, h);
    base.addColorStop(0, "#0e0e14");
    base.addColorStop(0.35, BG);
    base.addColorStop(0.65, "#0a0a10");
    base.addColorStop(1, "#080810");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    if (data.backgroundImageUrl) {
      try {
        const img = await loadImage(data.backgroundImageUrl);
        const imgW = (img as Image).width;
        const imgH = (img as Image).height;
        const imgRatio = imgW / imgH;
        const canvasRatio = w / h;
        let sx = 0, sy = 0, sw = imgW, sh = imgH;
        if (imgRatio > canvasRatio) { sw = imgH * canvasRatio; sx = (imgW - sw) / 2; }
        else { sh = imgW / canvasRatio; sy = (imgH - sh) / 2; }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
        const ov = ctx.createLinearGradient(0, 0, 0, h);
        ov.addColorStop(0, "rgba(9,9,11,0.70)");
        ov.addColorStop(0.35, "rgba(9,9,11,0.48)");
        ov.addColorStop(0.65, "rgba(9,9,11,0.48)");
        ov.addColorStop(1, "rgba(9,9,11,0.72)");
        ctx.fillStyle = ov;
        ctx.fillRect(0, 0, w, h);
      } catch { /* base gradient remains */ }
    }

    drawGlow(ctx, w * 0.82, h * 0.08, w * 0.48, ACCENT_1, 0.16);
    drawGlow(ctx, w * 0.14, h * 0.88, w * 0.40, ACCENT_2, 0.12);

    drawDiagonalTexture(ctx, w, h, false);

    const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.22)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
  }
}

/* ---- Header & Footer ---- */

// # Solid background: minimal header (slide counter only)
function drawHeaderSolid(ctx: SKRSContext2D, w: number, pad: number, s: (v: number) => number, slideNum?: number, totalSlides?: number) {
  if (slideNum !== undefined && totalSlides !== undefined) {
    const lbl = `${slideNum}/${totalSlides}`;
    ctx.font = `${s(22)}px GeistBold`;
    ctx.fillStyle = SOLID_TEXT_DIM;
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText(lbl, w - pad, pad);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }
}

// # Solid background: footer is now handled by drawBrandBar

// # Dark background: full header with logo
function drawHeader(ctx: SKRSContext2D, w: number, pad: number, s: (v: number) => number, slideNum?: number, totalSlides?: number) {
  const y = pad + s(22);
  const ls = s(32);
  const lg = dGrad(ctx, pad, y - ls / 2, ls, ls, [ACCENT_1, ACCENT_2]);
  fillRR(ctx, pad, y - ls / 2, ls, ls, s(8), lg);
  ctx.font = `${s(15)}px GeistBold`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("J", pad + ls / 2, y + 1);
  ctx.font = `${s(13)}px GeistSemiBold`;
  ctx.fillStyle = TEXT_MUTED;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(BRAND_NAME, pad + ls + s(10), y);
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

// # Dark background: footer is now handled by drawBrandBar

/* ---- Chrome Helpers ---- */

function drawChrome(
  ctx: SKRSContext2D, w: number, h: number, pad: number, s: (v: number) => number,
  isSolid: boolean, slideNum?: number, totalSlides?: number
) {
  if (isSolid) {
    drawHeaderSolid(ctx, w, pad, s, slideNum, totalSlides);
  } else {
    drawHeader(ctx, w, pad, s, slideNum, totalSlides);
  }
  // # Brand bar at the bottom of every slide
  drawBrandBar(ctx, w, h, s, isSolid);
}

/* ---- Content Area Helper ---- */

function contentArea(pad: number, s: (v: number) => number, h: number, isSolid: boolean) {
  const top = isSolid ? pad + s(36) : pad + s(54);
  // # Leave room for the brand bar at bottom (100px scaled)
  const bot = h - s(108);
  return { top, bot, h: bot - top, cy: top + (bot - top) / 2 };
}

// # Get text colors based on background mode
function textColors(isSolid: boolean) {
  return {
    primary: isSolid ? SOLID_TEXT : TEXT_PRIMARY,
    secondary: isSolid ? SOLID_TEXT_DIM : TEXT_SECONDARY,
    muted: isSolid ? SOLID_TEXT_MUTED : TEXT_MUTED,
  };
}

/* ============================================================
   TEMPLATE FUNCTIONS — 15 Premium Layouts
   ============================================================ */

// # HERO — Teal-style: eyebrow top, huge headline, body in lower half
async function drawHero(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const isSolid = !!data.backgroundColor;
  const pad = s(48);
  const tc = textColors(isSolid);
  await drawBackground(ctx, data, w, h);
  drawChrome(ctx, w, h, pad, s, isSolid, data.slideNumber, data.totalSlides);

  const maxW = w - pad * 2;
  let curY = s(80);

  // # Eyebrow / category label near the top with breathing room
  if (data.subheadline) {
    ctx.font = `${s(22)}px GeistBold`;
    ctx.fillStyle = isSolid ? SOLID_TEXT_DIM : ACCENT_3;
    ctx.textBaseline = "top";
    ctx.letterSpacing = `${s(2)}px`;
    ctx.fillText(data.subheadline.toUpperCase(), pad, curY);
    ctx.letterSpacing = "0px";
    curY += s(60);
  } else {
    curY += s(40);
  }

  // # Huge headline — GeistBlack for maximum weight
  const fs = s(88);
  const lh = Math.round(fs * 1.10);
  ctx.font = `${fs}px GeistBlack`;
  ctx.fillStyle = tc.primary;
  ctx.textBaseline = "top";
  const headEndY = drawText(ctx, data.headline, pad, curY, maxW, lh, 5);

  // # Body text — large and readable, natural flow below headline
  if (data.body) {
    const bodyFs = s(56);
    const bodyLh = Math.round(bodyFs * 1.38);
    const bodyY = headEndY + s(60);
    ctx.font = `${bodyFs}px GeistMedium`;
    ctx.fillStyle = isSolid ? SOLID_TEXT_DIM : tc.secondary;
    drawText(ctx, data.body, pad, bodyY, maxW * 0.88, bodyLh, 5);
  }

  ctx.textBaseline = "alphabetic";
}

// # STAT CARD — Headline at top, giant centered stat, label below
async function drawStatCard(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const isSolid = !!data.backgroundColor;
  const pad = s(48);
  const tc = textColors(isSolid);
  await drawBackground(ctx, data, w, h);
  drawChrome(ctx, w, h, pad, s, isSolid, data.slideNumber, data.totalSlides);

  const cx = w / 2;
  const maxW = w - pad * 2;

  // # Headline at the top — gives context to the stat
  let statCenterY = h * 0.45;
  if (data.headline) {
    ctx.font = `${s(52)}px GeistBlack`;
    ctx.fillStyle = tc.primary;
    ctx.textBaseline = "top";
    const headEndY = drawText(ctx, data.headline, pad, s(80), maxW, s(62), 3);
    statCenterY = Math.max(headEndY + s(120), h * 0.45);
  }

  // # Decorative ring behind the stat
  ctx.beginPath();
  ctx.arc(cx, statCenterY, s(115), 0, Math.PI * 2);
  ctx.strokeStyle = isSolid ? "rgba(255,255,255,0.10)" : rgba(ACCENT_1, 0.12);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  if (data.stat) {
    const vLen = data.stat.value.length;
    const statFs = s(vLen > 5 ? 100 : vLen > 3 ? 140 : 160);
    ctx.font = `${statFs}px GeistBlack`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = isSolid ? SOLID_TEXT : ACCENT_1;
    ctx.fillText(data.stat.value, cx, statCenterY);

    // # Label below stat — large and readable
    ctx.font = `${s(36)}px GeistMedium`;
    ctx.fillStyle = tc.secondary;
    const labels = wrapText(ctx, data.stat.label, w * 0.75);
    labels.slice(0, 3).forEach((line, i) => {
      ctx.fillText(line, cx, statCenterY + s(100) + i * s(48));
    });
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

// # TIP — Numbered tip with accent line, headline, and body text
async function drawTip(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const isSolid = !!data.backgroundColor;
  const pad = isSolid ? s(40) : s(56);
  const tc = textColors(isSolid);
  await drawBackground(ctx, data, w, h);
  drawChrome(ctx, w, h, pad, s, isSolid, data.slideNumber, data.totalSlides);

  const area = contentArea(pad, s, h, isSolid);
  const accent = data.accentColor || ACCENT_1;

  const cardW = w - pad * 2 + s(16);
  const cardH = Math.min(area.h * 0.78, s(620));
  const cardX = pad - s(8);
  const cardY = area.cy - cardH / 2;
  if (isSolid) drawSolidCard(ctx, cardX, cardY, cardW, cardH, s(20));
  else drawCard(ctx, cardX, cardY, cardW, cardH, s(20));

  const inner = s(28);

  // # Left accent line
  const lineColor = isSolid ? "rgba(255,255,255,0.40)" : accent;
  const lineColor2 = isSolid ? "rgba(255,255,255,0.15)" : ACCENT_2;
  const lineGrad = vGrad(ctx, cardY + inner, cardY + cardH - inner, 0, [lineColor, lineColor2]);
  fillRR(ctx, cardX + inner, cardY + inner, s(5), cardH - inner * 2, s(3), lineGrad);

  const textX = cardX + inner + s(32);
  const textMaxW = cardW - inner * 2 - s(36);

  // # Tip number badge
  if (data.slideNumber) {
    const bSize = s(52);
    if (isSolid) {
      fillRR(ctx, textX, cardY + inner, bSize, bSize, s(14), "rgba(255,255,255,0.15)");
    } else {
      const bGrad = dGrad(ctx, textX, cardY + inner, bSize, bSize, [accent, ACCENT_2]);
      fillRR(ctx, textX, cardY + inner, bSize, bSize, s(14), bGrad);
    }
    ctx.font = `${s(24)}px GeistBold`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(data.slideNumber), textX + bSize / 2, cardY + inner + bSize / 2 + 1);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }

  // # Headline
  const headY = cardY + inner + (data.slideNumber ? s(72) : 0);
  const headFs = s(64);
  ctx.font = `${headFs}px GeistBlack`;
  ctx.fillStyle = tc.primary;
  ctx.textBaseline = "top";
  const afterHead = drawText(ctx, data.headline, textX, headY, textMaxW, Math.round(headFs * 1.15), 4, true);

  // # Body text
  if (data.body) {
    ctx.font = `${s(40)}px GeistMedium`;
    ctx.fillStyle = tc.secondary;
    drawText(ctx, data.body, textX, afterHead + s(24), textMaxW, s(54), 6, true);
  }

  ctx.textBaseline = "alphabetic";
}

// # QUOTE — Large quotation mark with centered quote text
async function drawQuote(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const isSolid = !!data.backgroundColor;
  const pad = isSolid ? s(40) : s(56);
  const tc = textColors(isSolid);
  await drawBackground(ctx, data, w, h);
  drawChrome(ctx, w, h, pad, s, isSolid, data.slideNumber, data.totalSlides);

  const area = contentArea(pad, s, h, isSolid);
  const cx = w / 2;
  const maxW = w * 0.80;

  if (!isSolid) {
    const cardW = w * 0.84;
    const cardH = Math.min(area.h * 0.65, s(520));
    drawCard(ctx, cx - cardW / 2, area.cy - cardH / 2, cardW, cardH, s(24));
  }

  // # Large quotation mark
  ctx.font = `${s(160)}px GeistBlack`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (isSolid) {
    ctx.fillStyle = "rgba(255,255,255,0.15)";
  } else {
    const qGrad = dGrad(ctx, cx - s(50), area.cy - s(140), s(100), s(80), [ACCENT_1, ACCENT_2]);
    ctx.fillStyle = qGrad;
  }
  ctx.fillText("“", cx, area.cy - s(100));

  // # Quote text
  ctx.font = `${s(42)}px GeistSemiBold`;
  ctx.fillStyle = tc.primary;
  ctx.textBaseline = "top";
  const lines = wrapText(ctx, data.headline, maxW);
  const lh = s(56);
  const totalH = Math.min(lines.length, 5) * lh;
  const startY = area.cy - totalH / 2 + s(10);
  lines.slice(0, 5).forEach((line, i) => {
    ctx.textAlign = "center";
    ctx.fillText(line, cx, startY + i * lh);
  });

  // # Attribution
  if (data.subheadline) {
    ctx.font = `${s(22)}px GeistMedium`;
    ctx.fillStyle = isSolid ? SOLID_TEXT_DIM : ACCENT_3;
    ctx.textAlign = "center";
    ctx.fillText(`— ${data.subheadline}`, cx, startY + Math.min(lines.length, 5) * lh + s(24));
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

// # LIST — Title with bullet items
async function drawList(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const isSolid = !!data.backgroundColor;
  const pad = isSolid ? s(40) : s(56);
  const tc = textColors(isSolid);
  await drawBackground(ctx, data, w, h);
  drawChrome(ctx, w, h, pad, s, isSolid, data.slideNumber, data.totalSlides);

  const maxW = w - pad * 2;
  let y = h * 0.12;

  // # Headline
  const headFs = s(68);
  ctx.font = `${headFs}px GeistBlack`;
  ctx.fillStyle = tc.primary;
  ctx.textBaseline = "top";
  y = drawText(ctx, data.headline, pad, y, maxW, Math.round(headFs * 1.15), 3, true);

  // # Gradient underline
  const ulColor1 = isSolid ? "rgba(255,255,255,0.5)" : ACCENT_1;
  const ulColor2 = isSolid ? "rgba(255,255,255,0.1)" : ACCENT_2;
  const ulGrad = hGrad(ctx, pad, pad + s(120), 0, [ulColor1, ulColor2]);
  fillRR(ctx, pad, y + s(16), s(120), s(4), s(2), ulGrad);
  y += s(56);

  // # Bullet items
  if (data.bullets) {
    const maxBullets = Math.min(data.bullets.length, 7);
    const bulletH = maxBullets * s(76) + s(32);

    if (!isSolid) {
      const cardX = pad - s(12);
      const cardW = w - pad * 2 + s(24);
      drawCard(ctx, cardX, y - s(8), cardW, bulletH, s(16));
    }

    const bulletMaxW = maxW - s(48);
    for (let i = 0; i < maxBullets; i++) {
      const dotY = y + s(12) + i * s(76);

      // # Bullet dot
      if (isSolid) {
        ctx.beginPath();
        ctx.arc(pad + s(12), dotY + s(4), s(5), 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.50)";
        ctx.fill();
      } else {
        const dotGrad = dGrad(ctx, pad + s(8), dotY, s(10), s(10), [ACCENT_1, ACCENT_2]);
        ctx.beginPath();
        ctx.arc(pad + s(12), dotY + s(4), s(5), 0, Math.PI * 2);
        ctx.fillStyle = dotGrad;
        ctx.fill();
      }

      ctx.font = `${s(36)}px GeistMedium`;
      ctx.fillStyle = tc.primary;
      drawText(ctx, data.bullets[i], pad + s(36), dotY - s(6), bulletMaxW, s(46), 2, true);
    }
  }

  ctx.textBaseline = "alphabetic";
}

// # CTA — Call-to-action with centered card, logo, and gradient button
async function drawCta(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const isSolid = !!data.backgroundColor;
  const pad = isSolid ? s(40) : s(56);
  const tc = textColors(isSolid);
  await drawBackground(ctx, data, w, h);
  drawChrome(ctx, w, h, pad, s, isSolid, data.slideNumber, data.totalSlides);

  const area = contentArea(pad, s, h, isSolid);
  const cx = w / 2;

  const cardW = Math.min(w * 0.82, s(780));
  const cardH = Math.min(area.h * 0.65, s(500));
  const cardX = cx - cardW / 2;
  const cardY = area.cy - cardH / 2;
  if (isSolid) drawSolidCard(ctx, cardX, cardY, cardW, cardH, s(24));
  else drawCard(ctx, cardX, cardY, cardW, cardH, s(24), { glow: true, accentTop: ACCENT_1 });

  const inner = s(40);

  // # Logo
  const logoY = cardY + inner;
  const logoSize = s(56);
  if (isSolid) {
    fillRR(ctx, cx - logoSize / 2, logoY, logoSize, logoSize, s(16), "rgba(255,255,255,0.18)");
  } else {
    const logoGrad = dGrad(ctx, cx - logoSize / 2, logoY, logoSize, logoSize, [ACCENT_1, ACCENT_2]);
    fillRR(ctx, cx - logoSize / 2, logoY, logoSize, logoSize, s(16), logoGrad);
  }
  ctx.font = `${s(26)}px GeistBold`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("J", cx, logoY + logoSize / 2 + 1);

  // # CTA headline
  const headFs = s(42);
  ctx.font = `${headFs}px GeistBold`;
  ctx.fillStyle = tc.primary;
  ctx.textBaseline = "top";
  const headMaxW = cardW - inner * 2;
  const lines = wrapText(ctx, data.headline, headMaxW);
  const headY = logoY + logoSize + s(24);
  lines.slice(0, 3).forEach((line, i) => {
    ctx.fillText(line, cx, headY + i * Math.round(headFs * 1.25));
  });

  let bodyEndY = headY + Math.min(lines.length, 3) * Math.round(headFs * 1.25);
  if (data.body) {
    ctx.font = `${s(24)}px Geist`;
    ctx.fillStyle = tc.secondary;
    const bodyLines = wrapText(ctx, data.body, headMaxW);
    bodyEndY += s(12);
    bodyLines.slice(0, 3).forEach((line, i) => {
      ctx.fillText(line, cx, bodyEndY + i * s(34));
    });
    bodyEndY += Math.min(bodyLines.length, 3) * s(34);
  }

  // # CTA button
  const btnW = s(240);
  const btnH = s(54);
  const btnX = cx - btnW / 2;
  const btnY = bodyEndY + s(24);
  if (isSolid) {
    fillRR(ctx, btnX, btnY, btnW, btnH, s(14), "rgba(255,255,255,0.20)");
    strokeRR(ctx, btnX, btnY, btnW, btnH, s(14), "rgba(255,255,255,0.30)", 1.5);
  } else {
    const btnGrad = hGrad(ctx, btnX, btnX + btnW, 0, [ACCENT_1, ACCENT_2]);
    fillRR(ctx, btnX, btnY, btnW, btnH, s(14), btnGrad);
  }
  ctx.font = `${s(20)}px GeistSemiBold`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.fillText(BRAND_URL, cx, btnY + btnH / 2);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

// # BEFORE/AFTER — Side-by-side comparison
async function drawBeforeAfter(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const isSolid = !!data.backgroundColor;
  const pad = isSolid ? s(40) : s(56);
  const tc = textColors(isSolid);
  await drawBackground(ctx, data, w, h);
  drawChrome(ctx, w, h, pad, s, isSolid, data.slideNumber, data.totalSlides);

  const area = contentArea(pad, s, h, isSolid);

  if (data.headline) {
    ctx.font = `${s(60)}px GeistBlack`;
    ctx.fillStyle = tc.primary;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    drawText(ctx, data.headline, w / 2, area.top, w - pad * 2, s(70), 2, true);
    ctx.textAlign = "left";
  }

  const gap = s(20);
  const cardW = (w - pad * 2 - gap) / 2;
  const cardH = Math.min(area.h * 0.60, s(540));
  const cardY = area.cy - cardH / 2 + s(40);

  // # BEFORE card
  const beforeFill = isSolid ? "rgba(0,0,0,0.20)" : "rgba(239,68,68,0.06)";
  const beforeBorder = isSolid ? "rgba(255,100,100,0.30)" : "rgba(239,68,68,0.20)";
  const beforeAccent = isSolid ? "#ff8a8a" : "#ef4444";
  fillRR(ctx, pad, cardY, cardW, cardH, s(18), beforeFill);
  strokeRR(ctx, pad, cardY, cardW, cardH, s(18), beforeBorder, 1);
  ctx.save();
  roundedRect(ctx, pad, cardY, cardW, s(4), s(18));
  ctx.clip();
  ctx.fillStyle = beforeAccent;
  ctx.fillRect(pad, cardY, cardW, s(4));
  ctx.restore();
  ctx.font = `${s(22)}px GeistBold`;
  ctx.fillStyle = beforeAccent;
  ctx.textBaseline = "top";
  ctx.letterSpacing = `${s(3)}px`;
  ctx.fillText("BEFORE", pad + s(24), cardY + s(24));
  ctx.letterSpacing = "0px";
  ctx.font = `${s(34)}px GeistMedium`;
  ctx.fillStyle = isSolid ? SOLID_TEXT_DIM : TEXT_SECONDARY;
  drawText(ctx, data.beforeText || "", pad + s(24), cardY + s(64), cardW - s(48), s(46), 6, true);

  // # AFTER card
  const afterX = pad + cardW + gap;
  const afterFill = isSolid ? "rgba(0,0,0,0.20)" : "rgba(34,197,94,0.06)";
  const afterBorder = isSolid ? "rgba(100,255,100,0.30)" : "rgba(34,197,94,0.20)";
  const afterAccent = isSolid ? "#8aff8a" : "#22c55e";
  fillRR(ctx, afterX, cardY, cardW, cardH, s(18), afterFill);
  strokeRR(ctx, afterX, cardY, cardW, cardH, s(18), afterBorder, 1);
  ctx.save();
  roundedRect(ctx, afterX, cardY, cardW, s(4), s(18));
  ctx.clip();
  ctx.fillStyle = afterAccent;
  ctx.fillRect(afterX, cardY, cardW, s(4));
  ctx.restore();
  ctx.font = `${s(22)}px GeistBold`;
  ctx.fillStyle = afterAccent;
  ctx.letterSpacing = `${s(3)}px`;
  ctx.fillText("AFTER", afterX + s(24), cardY + s(24));
  ctx.letterSpacing = "0px";
  ctx.font = `${s(34)}px GeistSemiBold`;
  ctx.fillStyle = tc.primary;
  drawText(ctx, data.afterText || "", afterX + s(24), cardY + s(64), cardW - s(48), s(46), 6, true);

  // # VS divider
  const vsX = pad + cardW + gap / 2;
  const vsY = cardY + cardH / 2;
  ctx.beginPath();
  ctx.arc(vsX, vsY, s(20), 0, Math.PI * 2);
  ctx.fillStyle = isSolid ? "rgba(0,0,0,0.40)" : BG_ELEVATED;
  ctx.fill();
  strokeRR(ctx, vsX - s(20), vsY - s(20), s(40), s(40), s(20), isSolid ? "rgba(255,255,255,0.20)" : rgba(ACCENT_1, 0.25), 1);
  ctx.font = `${s(14)}px GeistBold`;
  ctx.fillStyle = tc.secondary;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("VS", vsX, vsY);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

// # SCREENSHOT — Fake tweet/DM/notification card
async function drawScreenshot(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const isSolid = !!data.backgroundColor;
  const pad = isSolid ? s(40) : s(56);
  const tc = textColors(isSolid);
  await drawBackground(ctx, data, w, h);
  drawChrome(ctx, w, h, pad, s, isSolid, data.slideNumber, data.totalSlides);

  const area = contentArea(pad, s, h, isSolid);
  const cx = w / 2;

  const cardW = Math.min(w * 0.85, s(820));
  const cardH = Math.min(area.h * 0.60, s(440));
  const cardX = cx - cardW / 2;
  const cardY = area.cy - cardH / 2;

  // # Drop shadow + card
  ctx.shadowColor = "rgba(0,0,0,0.30)";
  ctx.shadowBlur = s(32);
  ctx.shadowOffsetY = s(8);
  fillRR(ctx, cardX, cardY, cardW, cardH, s(20), isSolid ? "rgba(0,0,0,0.35)" : BG_CARD);
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  strokeRR(ctx, cardX, cardY, cardW, cardH, s(20), isSolid ? "rgba(255,255,255,0.10)" : rgba(ACCENT_1, 0.08), 1);

  // # Avatar
  const avSize = s(48);
  const avX = cardX + s(32);
  const avY = cardY + s(32);
  const avGrad = dGrad(ctx, avX, avY, avSize, avSize, [ACCENT_1, ACCENT_2]);
  ctx.beginPath();
  ctx.arc(avX + avSize / 2, avY + avSize / 2, avSize / 2, 0, Math.PI * 2);
  ctx.fillStyle = avGrad;
  ctx.fill();
  ctx.font = `${s(20)}px GeistBold`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText((data.screenshotAuthor || "U")[0].toUpperCase(), avX + avSize / 2, avY + avSize / 2 + 1);

  // # Author + type label
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = `${s(22)}px GeistSemiBold`;
  ctx.fillStyle = isSolid ? SOLID_TEXT : TEXT_PRIMARY;
  ctx.fillText(data.screenshotAuthor || "User", avX + avSize + s(14), avY + s(20));
  ctx.font = `${s(14)}px GeistMedium`;
  ctx.fillStyle = isSolid ? SOLID_TEXT_MUTED : TEXT_MUTED;
  const typeLabel = data.screenshotType === "dm" ? "Direct Message" : data.screenshotType === "email" ? "Email" : "Post";
  ctx.fillText(typeLabel, avX + avSize + s(14), avY + s(40));

  // # Message text
  ctx.font = `${s(26)}px Geist`;
  ctx.fillStyle = isSolid ? SOLID_TEXT : TEXT_PRIMARY;
  ctx.textBaseline = "top";
  drawText(ctx, data.headline, cardX + s(32), avY + avSize + s(22), cardW - s(64), s(36), 6, true);

  ctx.textBaseline = "alphabetic";
}

// # DATA CHART — Horizontal bar chart
async function drawDataChart(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const isSolid = !!data.backgroundColor;
  const pad = isSolid ? s(40) : s(56);
  const tc = textColors(isSolid);
  await drawBackground(ctx, data, w, h);
  drawChrome(ctx, w, h, pad, s, isSolid, data.slideNumber, data.totalSlides);

  const area = contentArea(pad, s, h, isSolid);
  const maxW = w - pad * 2;
  let y = area.top + s(8);

  if (data.headline) {
    ctx.font = `${s(44)}px GeistBold`;
    ctx.fillStyle = tc.primary;
    ctx.textBaseline = "top";
    y = drawText(ctx, data.headline, pad, y, maxW, s(54), 2, true);
    y += s(32);
  }

  const bars = data.bars || [];
  const barH = s(16);
  const maxBars = Math.min(bars.length, 7);
  const barSpacing = Math.min(s(62), (area.bot - y) / maxBars);

  for (let i = 0; i < maxBars; i++) {
    const bar = bars[i];
    ctx.font = `${s(20)}px GeistMedium`;
    ctx.fillStyle = tc.secondary;
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillText(bar.label, pad, y);
    ctx.textAlign = "right";
    ctx.font = `${s(20)}px GeistBold`;
    ctx.fillStyle = tc.primary;
    ctx.fillText(`${bar.value}%`, pad + maxW, y);
    ctx.textAlign = "left";

    y += s(12);
    fillRR(ctx, pad, y, maxW, barH, s(8), isSolid ? "rgba(255,255,255,0.10)" : rgba(ACCENT_1, 0.12));

    const fillW = (Math.min(bar.value, 100) / 100) * maxW;
    if (fillW > 0) {
      const barFill = isSolid
        ? hGrad(ctx, pad, pad + fillW, 0, ["rgba(255,255,255,0.50)", "rgba(255,255,255,0.25)"])
        : hGrad(ctx, pad, pad + fillW, 0, [bar.color || ACCENT_1, ACCENT_2]);
      fillRR(ctx, pad, y, fillW, barH, s(8), barFill);
    }

    y += barH + barSpacing - s(12);
  }
}

// # COMPARISON — Two-column layout
async function drawComparison(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const isSolid = !!data.backgroundColor;
  const pad = isSolid ? s(40) : s(56);
  const tc = textColors(isSolid);
  await drawBackground(ctx, data, w, h);
  drawChrome(ctx, w, h, pad, s, isSolid, data.slideNumber, data.totalSlides);

  const area = contentArea(pad, s, h, isSolid);

  if (data.headline) {
    ctx.font = `${s(44)}px GeistBold`;
    ctx.fillStyle = tc.primary;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    drawText(ctx, data.headline, w / 2, area.top, w - pad * 2, s(54), 2, true);
    ctx.textAlign = "left";
  }

  const gap = s(20);
  const colW = (w - pad * 2 - gap) / 2;
  const colH = Math.min(area.h * 0.66, s(580));
  const colY = area.cy - colH / 2 + s(22);

  // # Left column
  if (isSolid) drawSolidCard(ctx, pad, colY, colW, colH, s(18));
  else drawCard(ctx, pad, colY, colW, colH, s(18), { accentTop: ACCENT_1 });
  ctx.font = `${s(14)}px GeistBold`;
  ctx.fillStyle = isSolid ? SOLID_TEXT_DIM : ACCENT_1;
  ctx.textBaseline = "top";
  ctx.letterSpacing = `${s(3)}px`;
  ctx.fillText(data.leftLabel || "OPTION A", pad + s(24), colY + s(22));
  ctx.letterSpacing = "0px";

  let ly = colY + s(54);
  (data.leftColumn || []).slice(0, 6).forEach((item) => {
    ctx.beginPath();
    ctx.arc(pad + s(28), ly + s(5), s(4), 0, Math.PI * 2);
    ctx.fillStyle = isSolid ? SOLID_TEXT_DIM : ACCENT_1;
    ctx.fill();
    ctx.font = `${s(20)}px GeistMedium`;
    ctx.fillStyle = tc.secondary;
    ly = drawText(ctx, item, pad + s(48), ly, colW - s(72), s(28), 2) + s(12);
  });

  // # Right column
  const rx = pad + colW + gap;
  if (isSolid) drawSolidCard(ctx, rx, colY, colW, colH, s(18));
  else drawCard(ctx, rx, colY, colW, colH, s(18), { accentTop: ACCENT_3 });
  ctx.font = `${s(14)}px GeistBold`;
  ctx.fillStyle = isSolid ? SOLID_TEXT_DIM : ACCENT_3;
  ctx.letterSpacing = `${s(3)}px`;
  ctx.fillText(data.rightLabel || "OPTION B", rx + s(24), colY + s(22));
  ctx.letterSpacing = "0px";

  let ry = colY + s(54);
  (data.rightColumn || []).slice(0, 6).forEach((item) => {
    ctx.beginPath();
    ctx.arc(rx + s(28), ry + s(5), s(4), 0, Math.PI * 2);
    ctx.fillStyle = isSolid ? SOLID_TEXT_DIM : ACCENT_3;
    ctx.fill();
    ctx.font = `${s(20)}px GeistMedium`;
    ctx.fillStyle = tc.secondary;
    ry = drawText(ctx, item, rx + s(48), ry, colW - s(72), s(28), 2) + s(12);
  });

  ctx.textBaseline = "alphabetic";
}

// # NUMBERED STEPS — Step badges with titles and details
async function drawNumberedSteps(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const isSolid = !!data.backgroundColor;
  const pad = isSolid ? s(40) : s(56);
  const tc = textColors(isSolid);
  await drawBackground(ctx, data, w, h);
  drawChrome(ctx, w, h, pad, s, isSolid, data.slideNumber, data.totalSlides);

  const area = contentArea(pad, s, h, isSolid);
  const maxW = w - pad * 2;
  let y = area.top + s(8);

  if (data.headline) {
    ctx.font = `${s(44)}px GeistBold`;
    ctx.fillStyle = tc.primary;
    ctx.textBaseline = "top";
    y = drawText(ctx, data.headline, pad, y, maxW, s(54), 2, true);
    y += s(28);
  }

  const steps = data.steps || [];
  const maxSteps = Math.min(steps.length, 5);
  const stepSpace = Math.min(s(82), (area.bot - y) / maxSteps);
  const badgeSize = s(52);

  // # Connecting line
  if (maxSteps > 1) {
    const lineX = pad + badgeSize / 2;
    const lineTop = y + badgeSize;
    const lineBot = y + (maxSteps - 1) * stepSpace + badgeSize / 2;
    const lineColor = isSolid ? "rgba(255,255,255,0.12)" : rgba(ACCENT_1, 0.20);
    const lineColor2 = isSolid ? "rgba(255,255,255,0.04)" : rgba(ACCENT_2, 0.08);
    const lineGrad = vGrad(ctx, lineTop, lineBot, 0, [lineColor, lineColor2]);
    ctx.fillStyle = lineGrad;
    ctx.fillRect(lineX - 1, lineTop, 2, lineBot - lineTop);
  }

  for (let i = 0; i < maxSteps; i++) {
    const step = steps[i];
    const sy = y + i * stepSpace;

    if (isSolid) {
      fillRR(ctx, pad, sy, badgeSize, badgeSize, s(14), "rgba(255,255,255,0.15)");
    } else {
      const bGrad = dGrad(ctx, pad, sy, badgeSize, badgeSize, [ACCENT_1, ACCENT_2]);
      fillRR(ctx, pad, sy, badgeSize, badgeSize, s(14), bGrad);
    }
    ctx.font = `${s(22)}px GeistBold`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(step.number), pad + badgeSize / 2, sy + badgeSize / 2 + 1);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    const textX = pad + badgeSize + s(20);
    ctx.font = `${s(26)}px GeistSemiBold`;
    ctx.fillStyle = tc.primary;
    ctx.fillText(step.title, textX, sy + s(4));

    if (step.detail) {
      ctx.font = `${s(20)}px Geist`;
      ctx.fillStyle = tc.secondary;
      drawText(ctx, step.detail, textX, sy + s(36), maxW - badgeSize - s(20), s(28), 2, true);
    }
  }

  ctx.textBaseline = "alphabetic";
}

// # GRADIENT TEXT — Large gradient headline
async function drawGradientTextSlide(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const isSolid = !!data.backgroundColor;
  const pad = isSolid ? s(40) : s(56);
  await drawBackground(ctx, data, w, h);
  drawChrome(ctx, w, h, pad, s, isSolid, data.slideNumber, data.totalSlides);

  const area = contentArea(pad, s, h, isSolid);
  const cx = w / 2;
  const maxW = w * 0.85;

  // # Decorative ring
  ctx.beginPath();
  ctx.arc(cx, area.cy, s(190), 0, Math.PI * 2);
  ctx.strokeStyle = isSolid ? "rgba(255,255,255,0.06)" : rgba(ACCENT_1, 0.10);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // # Large headline
  const fs = s(72);
  ctx.font = `${fs}px GeistBlack`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const lines = wrapText(ctx, data.headline, maxW);
  const lh = Math.round(fs * 1.16);
  const totalH = Math.min(lines.length, 4) * lh;
  const startY = area.cy - totalH / 2;

  if (isSolid) {
    ctx.fillStyle = SOLID_TEXT;
  } else {
    const grad = dGrad(ctx, cx - maxW / 2, startY, maxW, totalH, [ACCENT_1, ACCENT_3, ACCENT_2]);
    ctx.fillStyle = grad;
  }
  lines.slice(0, 4).forEach((line, i) => {
    ctx.fillText(line, cx, startY + i * lh);
  });

  // # Gradient underline
  const ulY = startY + Math.min(lines.length, 4) * lh + s(12);
  const ulColor1 = isSolid ? "rgba(255,255,255,0.5)" : ACCENT_1;
  const ulColor2 = isSolid ? "rgba(255,255,255,0.1)" : ACCENT_2;
  const ulGrad = hGrad(ctx, cx - s(60), cx + s(60), 0, [ulColor1, ulColor2]);
  fillRR(ctx, cx - s(60), ulY, s(120), s(4), s(2), ulGrad);

  // # Subheadline
  if (data.subheadline) {
    ctx.font = `${s(28)}px GeistMedium`;
    ctx.fillStyle = isSolid ? SOLID_TEXT_DIM : TEXT_SECONDARY;
    const subLines = wrapText(ctx, data.subheadline, maxW * 0.85);
    subLines.slice(0, 3).forEach((line, i) => {
      ctx.fillText(line, cx, ulY + s(24) + i * s(38));
    });
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

// # HIGHLIGHT BOX — Key insight in a glowing accent card
async function drawHighlightBox(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const isSolid = !!data.backgroundColor;
  const pad = isSolid ? s(40) : s(56);
  const tc = textColors(isSolid);
  await drawBackground(ctx, data, w, h);
  drawChrome(ctx, w, h, pad, s, isSolid, data.slideNumber, data.totalSlides);

  const area = contentArea(pad, s, h, isSolid);
  const cx = w / 2;

  // # Label above box
  if (data.subheadline) {
    ctx.font = `${s(16)}px GeistSemiBold`;
    ctx.fillStyle = tc.muted;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.letterSpacing = `${s(3)}px`;
    ctx.fillText(data.subheadline.toUpperCase(), cx, area.cy - s(130));
    ctx.letterSpacing = "0px";
  }

  const boxW = Math.min(w * 0.82, s(780));
  const boxH = Math.min(area.h * 0.38, s(320));
  const boxX = cx - boxW / 2;
  const boxY = area.cy - boxH / 2;

  if (!isSolid) drawGlow(ctx, cx, boxY + boxH / 2, boxW * 0.40, ACCENT_1, 0.14);

  const bgFill = isSolid
    ? "rgba(255,255,255,0.10)"
    : dGrad(ctx, boxX, boxY, boxW, boxH, [rgba(ACCENT_1, 0.10), rgba(ACCENT_2, 0.10)]);
  fillRR(ctx, boxX, boxY, boxW, boxH, s(22), bgFill);
  strokeRR(ctx, boxX, boxY, boxW, boxH, s(22), isSolid ? "rgba(255,255,255,0.18)" : rgba(ACCENT_1, 0.28), 1.5);

  ctx.font = `${s(36)}px GeistSemiBold`;
  ctx.fillStyle = tc.primary;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const lines = wrapText(ctx, data.headline, boxW - s(60));
  const textStartY = boxY + (boxH - lines.length * s(48)) / 2;
  lines.slice(0, 4).forEach((line, i) => {
    ctx.fillText(line, cx, textStartY + i * s(48));
  });

  if (data.body) {
    ctx.font = `${s(24)}px Geist`;
    ctx.fillStyle = tc.secondary;
    const bodyLines = wrapText(ctx, data.body, w * 0.75);
    bodyLines.slice(0, 3).forEach((line, i) => {
      ctx.fillText(line, cx, boxY + boxH + s(28) + i * s(34));
    });
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

// # SPLIT IMAGE — Left gradient accent panel + right text content
async function drawSplitImage(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const isSolid = !!data.backgroundColor;
  const pad = isSolid ? s(40) : s(56);
  const tc = textColors(isSolid);
  await drawBackground(ctx, data, w, h);

  const splitW = w * 0.36;

  // # Left panel — gradient or lighter shade of background
  if (isSolid) {
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(0, 0, splitW, h);
    // # Subtle line separator
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(splitW - 1, h * 0.1, 1, h * 0.8);
  } else {
    const panelGrad = vGrad(ctx, 0, h, 0, [ACCENT_1, ACCENT_2]);
    ctx.fillStyle = panelGrad;
    ctx.fillRect(0, 0, splitW, h);
    for (let py = 0; py < h; py += s(24)) {
      if (Math.sin(py * 0.01) > 0.3) {
        ctx.fillStyle = "rgba(255,255,255,0.04)";
        ctx.fillRect(0, py, splitW, 1);
      }
    }
  }

  // # Stat or number on left panel
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (data.stat) {
    const vLen = data.stat.value.length;
    ctx.font = `${s(vLen > 4 ? 56 : 72)}px GeistBlack`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(data.stat.value, splitW / 2, h / 2 - s(16));
    ctx.font = `${s(20)}px GeistMedium`;
    ctx.fillStyle = "rgba(255,255,255,0.78)";
    const labels = wrapText(ctx, data.stat.label, splitW - s(40));
    labels.slice(0, 2).forEach((line, i) => {
      ctx.fillText(line, splitW / 2, h / 2 + s(32) + i * s(28));
    });
  } else if (data.slideNumber) {
    ctx.font = `${s(72)}px GeistBlack`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(String(data.slideNumber), splitW / 2, h / 2);
  }

  // # Right content
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const rightX = splitW + s(44);
  const rightMaxW = w - rightX - pad;

  ctx.font = `${s(44)}px GeistBold`;
  ctx.fillStyle = tc.primary;
  const headEnd = drawText(ctx, data.headline, rightX, h * 0.28, rightMaxW, s(54), 4, true);

  if (data.body) {
    ctx.font = `${s(26)}px Geist`;
    ctx.fillStyle = tc.secondary;
    drawText(ctx, data.body, rightX, headEnd + s(22), rightMaxW, s(36), 5, true);
  }

  // # Brand bar at bottom
  drawBrandBar(ctx, w, h, s, isSolid);

  ctx.textBaseline = "alphabetic";
}

// # PROGRESS BAR — Multiple progress bars with labels and percentages
async function drawProgressBar(ctx: SKRSContext2D, data: SlideData, w: number, h: number) {
  const s = createScale(w);
  const isSolid = !!data.backgroundColor;
  const pad = isSolid ? s(40) : s(56);
  const tc = textColors(isSolid);
  await drawBackground(ctx, data, w, h);
  drawChrome(ctx, w, h, pad, s, isSolid, data.slideNumber, data.totalSlides);

  const area = contentArea(pad, s, h, isSolid);
  const maxW = w - pad * 2;
  let y = area.top + s(8);

  if (data.headline) {
    ctx.font = `${s(44)}px GeistBold`;
    ctx.fillStyle = tc.primary;
    ctx.textBaseline = "top";
    y = drawText(ctx, data.headline, pad, y, maxW, s(54), 2, true);
    y += s(32);
  }

  const bars = data.bars || [];
  const barH = s(18);
  const maxBars = Math.min(bars.length, 6);
  const barSpacing = Math.min(s(66), (area.bot - y) / maxBars);

  for (let i = 0; i < maxBars; i++) {
    const bar = bars[i];
    ctx.font = `${s(22)}px GeistMedium`;
    ctx.fillStyle = tc.primary;
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillText(bar.label, pad, y);
    ctx.textAlign = "right";
    ctx.font = `${s(22)}px GeistBold`;
    ctx.fillStyle = isSolid ? SOLID_TEXT_DIM : ACCENT_3;
    ctx.fillText(`${bar.value}%`, pad + maxW, y);
    ctx.textAlign = "left";

    y += s(14);
    fillRR(ctx, pad, y, maxW, barH, s(9), isSolid ? "rgba(255,255,255,0.10)" : rgba(ACCENT_1, 0.10));

    const fillW = (Math.min(bar.value, 100) / 100) * maxW;
    if (fillW > 0) {
      const grad = isSolid
        ? hGrad(ctx, pad, pad + fillW, 0, ["rgba(255,255,255,0.50)", "rgba(255,255,255,0.25)"])
        : hGrad(ctx, pad, pad + fillW, 0, [ACCENT_1, bar.color || ACCENT_3]);
      fillRR(ctx, pad, y, fillW, barH, s(9), grad);
    }

    y += barH + barSpacing - s(14);
  }

  ctx.textBaseline = "alphabetic";
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
