/* ============================================================
   PEXELS API - Stock Video B-Roll for Reels
   ============================================================
   Searches Pexels for relevant stock video clips to use as
   B-roll backgrounds in Remotion reels. Free API with generous
   rate limits (200 requests/hour).

   Get your API key at: https://www.pexels.com/api/
   ============================================================ */

const PEXELS_BASE = "https://api.pexels.com";

export interface PexelsVideo {
  id: number;
  url: string;
  width: number;
  height: number;
  duration: number;
  videoFiles: {
    id: number;
    quality: string;
    width: number;
    height: number;
    link: string;
  }[];
  videoPictures: {
    id: number;
    picture: string;
  }[];
}

/* # Search for stock video clips matching a topic */
export async function searchVideos(
  query: string,
  options?: { perPage?: number; orientation?: "portrait" | "landscape" | "square" }
): Promise<PexelsVideo[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.warn("[pexels] PEXELS_API_KEY not configured, skipping B-roll");
    return [];
  }

  const params = new URLSearchParams({
    query,
    per_page: String(options?.perPage || 5),
    orientation: options?.orientation || "portrait",
    size: "medium",
  });

  try {
    const res = await fetch(`${PEXELS_BASE}/videos/search?${params}`, {
      headers: { Authorization: apiKey },
    });

    if (!res.ok) {
      console.error("[pexels] API error:", res.status);
      return [];
    }

    const data = await res.json();
    return (data.videos || []).map((v: Record<string, unknown>) => ({
      id: v.id,
      url: v.url,
      width: v.width,
      height: v.height,
      duration: v.duration,
      videoFiles: (v.video_files as Record<string, unknown>[]) || [],
      videoPictures: (v.video_pictures as Record<string, unknown>[]) || [],
    }));
  } catch (e) {
    console.error("[pexels] Failed to fetch videos:", e);
    return [];
  }
}

/* # Get the best quality video file URL for a given resolution */
export function getBestVideoFile(
  video: PexelsVideo,
  targetWidth: number = 1080,
  targetHeight: number = 1920
): string | null {
  if (!video.videoFiles || video.videoFiles.length === 0) return null;

  /* # Prefer portrait HD files closest to our target resolution */
  const sorted = [...video.videoFiles]
    .filter((f) => f.width > 0 && f.height > 0)
    .sort((a, b) => {
      const aDist = Math.abs(a.width - targetWidth) + Math.abs(a.height - targetHeight);
      const bDist = Math.abs(b.width - targetWidth) + Math.abs(b.height - targetHeight);
      return aDist - bDist;
    });

  return sorted[0]?.link || null;
}

/* # Curated search queries for common career content topics */
const TOPIC_KEYWORDS: Record<string, string[]> = {
  resume: ["person typing laptop", "office desk workspace", "professional writing"],
  interview: ["business meeting", "handshake professional", "office conversation"],
  career: ["professional working", "city skyline morning", "person walking office"],
  salary: ["business charts", "professional success", "calculator finance"],
  linkedin: ["social media phone", "professional networking", "typing smartphone"],
  remote: ["home office", "laptop coffee", "working from home"],
  motivation: ["sunrise city", "person running", "achievement celebration"],
  startup: ["team collaboration", "whiteboard planning", "modern office"],
  default: ["professional working", "modern office", "business technology"],
};

/* # Extract the best search query from a topic string */
export function getSearchQuery(topic: string): string {
  const lower = topic.toLowerCase();
  for (const [key, queries] of Object.entries(TOPIC_KEYWORDS)) {
    if (lower.includes(key)) {
      return queries[Math.floor(Math.random() * queries.length)];
    }
  }
  return TOPIC_KEYWORDS.default[Math.floor(Math.random() * TOPIC_KEYWORDS.default.length)];
}

/* # Fetch B-roll clips for a reel topic — returns URLs ready for Remotion */
export async function fetchBRollForTopic(
  topic: string,
  count: number = 3
): Promise<{ videoUrl: string; thumbnailUrl: string; duration: number }[]> {
  const query = getSearchQuery(topic);
  const videos = await searchVideos(query, { perPage: count, orientation: "portrait" });

  return videos
    .map((v) => {
      const url = getBestVideoFile(v);
      const thumb = v.videoPictures?.[0]?.picture || "";
      return url ? { videoUrl: url, thumbnailUrl: thumb, duration: v.duration } : null;
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);
}
