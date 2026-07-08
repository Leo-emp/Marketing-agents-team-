/* ============================================================
   BRAND CONSTANTS — Shared Visual Identity
   ============================================================
   Single source of truth for brand colors, fonts, and names.
   Used by canvas renderer and visual designer agent.
   ============================================================ */

// # Background colors — deep dark with subtle warmth
export const BG = "#09090b";
export const BG_CARD = "#111113";
export const BG_ELEVATED = "#18181b";
export const BORDER = "rgba(255,255,255,0.08)";
export const BORDER_STRONG = "rgba(255,255,255,0.15)";

// # Text colors — high contrast for readability
export const TEXT_PRIMARY = "#f4f4f5";
export const TEXT_SECONDARY = "#a1a1aa";
export const TEXT_MUTED = "#71717a";

// # Text for colored/solid backgrounds — white for max contrast
export const SOLID_TEXT = "#ffffff";
export const SOLID_TEXT_DIM = "rgba(255,255,255,0.78)";
export const SOLID_TEXT_MUTED = "rgba(255,255,255,0.50)";

// # Accent colors — blue premium palette (matches jobpilotai.co website)
export const ACCENT_1 = "#3b82f6"; // # Primary blue (brand color)
export const ACCENT_2 = "#60a5fa"; // # Light blue (gradient pair)
export const ACCENT_3 = "#93c5fd"; // # Pale blue (highlights)
export const ACCENT_GLOW = "#38bdf8"; // # Sky blue glow (special accents)
export const ACCENT_WARM = "#f59e0b"; // # Amber (contrast accent for special moments)

// # Brand mascot — white pilot robot
// # Used contextually in OpenAI image generation, not forced into every image
export const MASCOT_DESCRIPTION = "A friendly white robot with a blue (#3b82f6) pilot cap featuring a wing emblem, blue screen-eyes showing a friendly expression, and a wing badge on its chest. Professional, approachable, clean design. No goggles.";

// # Brand identity
export const BRAND_NAME = "JobPilot AI";
export const BRAND_URL = "jobpilotai.co";
export const BRAND_TAGLINE = "Your AI Career Co-Pilot";
export const FONT_FAMILY = "Geist";

// # Bold slide background palette — vibrant, WCAG AA white-text-safe (contrast 4.5:1+)
export const SLIDE_PALETTE = [
  "#1e3a5f",  // # Deep navy
  "#1e40af",  // # Bold blue (brand-adjacent)
  "#1d4ed8",  // # Royal blue
  "#164e63",  // # Cyan dark
  "#065f46",  // # Emerald dark
  "#7c2d12",  // # Burnt sienna
  "#831843",  // # Magenta dark
  "#854d0e",  // # Amber dark
  "#1f2937",  // # Gunmetal
  "#0c4a6e",  // # Sky dark blue
];
