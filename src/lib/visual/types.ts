/* ============================================================
   VISUAL SYSTEM TYPES
   ============================================================
   Type definitions for the branded visual generation pipeline.
   SlideData drives the template renderer, VisualRequest wraps
   the full generation request with platform dimensions.
   ============================================================ */

/* # Layout options for each slide/image */
export type SlideLayout =
  | "hero"           // # Full-width headline with gradient accent
  | "stat_card"      // # Large number/stat with label
  | "tip"            // # Numbered tip with body text
  | "quote"          // # Quote with attribution
  | "list"           // # Title + bullet items
  | "cta"            // # Call-to-action with brand URL
  | "before_after"   // # Side-by-side comparison (bad vs good)
  | "screenshot"     // # Fake tweet/DM/notification style card
  | "data_chart"     // # Horizontal bar chart with percentages
  | "comparison"     // # Two-column pros/cons or vs layout
  | "numbered_steps" // # Step-by-step with large step numbers
  | "gradient_text"  // # Large gradient headline, minimal layout
  | "highlight_box"  // # Key insight in a highlighted card
  | "split_image"    // # Left accent + right text panel
  | "progress_bar";  // # Multiple progress bars with labels

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
  /* # Stock photo background — fetched from Pexels based on AI-chosen keywords */
  backgroundImageUrl?: string;
  photoKeywords?: string;
  /* # Extended fields for new layouts */
  beforeText?: string;
  afterText?: string;
  screenshotType?: "tweet" | "dm" | "notification" | "email";
  screenshotAuthor?: string;
  bars?: { label: string; value: number; color?: string }[];
  steps?: { number: number; title: string; detail?: string }[];
  leftColumn?: string[];
  rightColumn?: string[];
  leftLabel?: string;
  rightLabel?: string;
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

/* # Platform-specific dimensions — correct per each platform's 2026 specs */
export const PLATFORM_DIMENSIONS: Record<string, { width: number; height: number }> = {
  // # Instagram — portrait 4:5 for feed posts/carousels, 9:16 for stories/reels
  "instagram:carousel": { width: 1080, height: 1350 },
  "instagram:single_image": { width: 1080, height: 1350 },
  "instagram:post": { width: 1080, height: 1350 },
  "instagram:storyboard": { width: 1080, height: 1920 },
  "instagram:reel_script": { width: 1080, height: 1920 },
  // # LinkedIn — landscape 1.91:1 for single posts, portrait 4:5 for carousel documents
  "linkedin:single_image": { width: 1200, height: 627 },
  "linkedin:post": { width: 1200, height: 627 },
  "linkedin:carousel": { width: 1080, height: 1350 },
  // # Twitter/X — landscape 16:9 for single images, square for carousels
  "twitter:single_image": { width: 1200, height: 675 },
  "twitter:post": { width: 1200, height: 675 },
  "twitter:carousel": { width: 1080, height: 1080 },
  // # TikTok — portrait 9:16 for everything (full-screen native format)
  "tiktok:carousel": { width: 1080, height: 1920 },
  "tiktok:single_image": { width: 1080, height: 1920 },
  "tiktok:post": { width: 1080, height: 1920 },
  "tiktok:storyboard": { width: 1080, height: 1920 },
  "tiktok:reel_script": { width: 1080, height: 1920 },
};

/* # Get dimensions for a platform + content type combo */
export function getDimensions(platform: string, type: string): { width: number; height: number } {
  return PLATFORM_DIMENSIONS[`${platform}:${type}`] || { width: 1080, height: 1080 };
}

/* ============================================================
   REEL / VIDEO TYPES
   ============================================================ */

// # Animation entrance styles for video scenes
export type SceneEntrance = "fade_in" | "slide_up" | "slide_left" | "scale_in" | "typewriter";
export type SceneExit = "fade_out" | "slide_down" | "none";
export type SceneType = "brand_intro" | "hook" | "tip" | "stat" | "list" | "quote" | "cta";

// # Data for a single video scene
export interface ReelSceneData {
  sceneType: SceneType;
  headline: string;
  subheadline?: string;
  body?: string;
  stat?: { value: string; label: string };
  bullets?: string[];
  entrance: SceneEntrance;
  exit: SceneExit;
  durationInFrames: number;
  accentColor?: string;
  /* # B-roll video URL for background (from Pexels) */
  backgroundVideoUrl?: string;
  /* # Subtitle text to burn into this scene */
  subtitleText?: string;
}

// # Music mood options for background audio
export type MusicMood = "energetic" | "chill" | "corporate" | "dramatic" | "inspirational";

// # Full reel configuration produced by the designer agent
export interface ReelConfig {
  scenes: ReelSceneData[];
  fps: number;
  width: number;
  height: number;
  totalDurationInFrames: number;
  /* # Background music */
  musicMood?: MusicMood;
  musicUrl?: string;
  /* # Voiceover audio (ElevenLabs TTS) */
  voiceoverUrl?: string;
  /* # B-roll clips fetched for this reel */
  bRollClips?: { videoUrl: string; thumbnailUrl: string; duration: number }[];
}

// # Video render status from Lambda
export interface VideoRenderStatus {
  renderId: string;
  status: "rendering" | "done" | "error";
  progress: number;
  videoUrl?: string;
  error?: string;
}
