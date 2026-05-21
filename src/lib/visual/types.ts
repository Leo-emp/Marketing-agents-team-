/* ============================================================
   VISUAL SYSTEM TYPES
   ============================================================
   Type definitions for the branded visual generation pipeline.
   SlideData drives the template renderer, VisualRequest wraps
   the full generation request with platform dimensions.
   ============================================================ */

/* # Layout options for each slide/image */
export type SlideLayout =
  | "hero"       // # Full-width headline with gradient accent
  | "stat_card"  // # Large number/stat with label
  | "tip"        // # Numbered tip with body text
  | "quote"      // # Quote with attribution
  | "list"       // # Title + bullet items
  | "cta";       // # Call-to-action with brand URL

/* # Data for a single slide or image */
export interface SlideData {
  headline: string;
  subheadline?: string;
  body?: string;
  stat?: { value: string; label: string };
  bullets?: string[];
  footer?: string;
  layout: SlideLayout;
  accentColor?: string;
  slideNumber?: number;
  totalSlides?: number;
}

/* # Full request to the visual generation API */
export interface VisualRequest {
  type: "single_image" | "carousel" | "storyboard";
  platform: "linkedin" | "instagram" | "tiktok" | "twitter";
  slides: SlideData[];
  contentId?: string;
}

/* # Result from visual generation */
export interface VisualResult {
  slides: {
    index: number;
    width: number;
    height: number;
    visualId: string;
  }[];
}

/* # Platform-specific dimensions */
export const PLATFORM_DIMENSIONS: Record<string, { width: number; height: number }> = {
  // # Square for IG feed, carousel, TikTok images
  "instagram:carousel": { width: 1080, height: 1080 },
  "instagram:single_image": { width: 1080, height: 1080 },
  "instagram:storyboard": { width: 1080, height: 1920 },
  // # LinkedIn landscape for posts, square for carousel
  "linkedin:single_image": { width: 1200, height: 627 },
  "linkedin:carousel": { width: 1080, height: 1080 },
  // # Twitter/X landscape
  "twitter:single_image": { width: 1200, height: 675 },
  "twitter:carousel": { width: 1080, height: 1080 },
  // # TikTok
  "tiktok:carousel": { width: 1080, height: 1080 },
  "tiktok:single_image": { width: 1080, height: 1080 },
  "tiktok:storyboard": { width: 1080, height: 1920 },
};

/* # Get dimensions for a platform + content type combo */
export function getDimensions(platform: string, type: string): { width: number; height: number } {
  return PLATFORM_DIMENSIONS[`${platform}:${type}`] || { width: 1080, height: 1080 };
}
