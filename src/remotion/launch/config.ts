/* # Launch video timing, colors, and animation config */

export const FPS = 30;

/* # Scene durations in frames (30fps) */
export const SCENES = {
  void:           90,   // # 0:00-0:03 — Black, cursor blink
  weight:         150,  // # 0:03-0:08 — Data fragments
  breakingPoint:  150,  // # 0:08-0:13 — Chaos freeze
  spark:          150,  // # 0:13-0:18 — Indigo light
  brandReveal:    150,  // # 0:18-0:23 — Logo reveal
  tagline:        90,   // # 0:23-0:26 — "Your career. Co-piloted."
  productReveal:  270,  // # 0:26-0:35 — Dashboard emergence
  resumeIntel:    210,  // # 0:35-0:42 — Resume AI demo
  jobMatching:    180,  // # 0:42-0:48 — Job matching
  interviewPrep:  180,  // # 0:48-0:54 — Interview prep
  ecosystem:      120,  // # 0:54-0:58 — Full constellation
  transformation: 150,  // # 0:58-1:03 — Strikethrough text
  socialProof:    150,  // # 1:03-1:08 — Stats flash
  finalBrand:     210,  // # 1:08-1:15 — Logo + CTA
} as const;

export const TOTAL_FRAMES = Object.values(SCENES).reduce((a, b) => a + b, 0);

/* # Colors */
export const C = {
  black:          "#000000",
  nearBlack:      "#0A0A0F",
  white:          "#FFFFFF",
  textSecondary:  "#A1A1AA",
  textMuted:      "#52525B",
  indigo:         "#6366F1",
  indigoLight:    "#818CF8",
  purple:         "#A855F7",
  amber:          "#F59E0B",
  green:          "#22C55E",
  red:            "#EF4444",
  panelBg:        "rgba(10, 10, 15, 0.7)",
  panelBorder:    "rgba(99, 102, 241, 0.2)",
  glowIndigo:     "rgba(99, 102, 241, 0.15)",
  glowPurple:     "rgba(168, 85, 247, 0.10)",
} as const;

/* # Fonts */
export const FONT = {
  heading:  "Geist, 'Space Grotesk', sans-serif",
  body:     "Geist, Inter, sans-serif",
  mono:     "'JetBrains Mono', monospace",
} as const;

/* # Reusable spring configs */
export const SPRING = {
  smooth:   { damping: 18, stiffness: 140, mass: 1.2 },
  snappy:   { damping: 20, stiffness: 200, mass: 0.8 },
  gentle:   { damping: 25, stiffness: 100, mass: 1.5 },
  bouncy:   { damping: 12, stiffness: 180, mass: 0.6 },
} as const;
