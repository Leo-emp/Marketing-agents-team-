/* ============================================================
   PEXELS — Stock Photo Search for Visual Backgrounds
   ============================================================
   Fetches relevant, high-quality photos from Pexels based on
   topic keywords. Orientation-aware for portrait/landscape.
   Returns highest-resolution results.
   ============================================================ */

const PEXELS_BASE = "https://api.pexels.com/v1";

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    landscape: string;
  };
  alt: string;
  photographer: string;
}

// # Simple in-memory cache (1 hour TTL) to avoid hitting API for repeated topics
const cache = new Map<string, { photos: PexelsPhoto[]; ts: number }>();
const CACHE_TTL = 3600000;

// # Search Pexels for photos matching the given keywords
export async function searchPhotos(
  query: string,
  count = 5,
  orientation: "landscape" | "portrait" | "square" = "landscape"
): Promise<PexelsPhoto[]> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return [];

  const cacheKey = `${query}:${count}:${orientation}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.photos;

  try {
    const res = await fetch(
      `${PEXELS_BASE}/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=${orientation}`,
      { headers: { Authorization: key } },
    );

    if (!res.ok) return [];

    const data = await res.json();
    const photos: PexelsPhoto[] = data.photos || [];
    cache.set(cacheKey, { photos, ts: Date.now() });
    return photos;
  } catch {
    return [];
  }
}

// # Get the best-sized URL for a given photo and target dimensions
export function getPhotoUrl(photo: PexelsPhoto, width: number): string {
  if (width >= 1200) return photo.src.large2x;
  if (width >= 800) return photo.src.large;
  return photo.src.medium;
}

// # Fetch a single relevant photo URL for a topic, ready to use as a background
// # Picks highest-resolution photo instead of random, and uses AI keywords directly
export async function getBackgroundPhoto(
  topic: string,
  width: number,
  height: number = 0
): Promise<string | null> {
  // # Determine orientation from canvas dimensions
  const orientation: "landscape" | "portrait" | "square" =
    height > 0 && width > 0
      ? width / height > 1.2 ? "landscape"
        : width / height < 0.83 ? "portrait"
        : "square"
      : "landscape";

  // # Search with AI-provided keywords directly — no generic suffix
  const photos = await searchPhotos(topic, 5, orientation);
  if (photos.length === 0) return null;

  // # Pick the highest resolution photo (by pixel count)
  const best = photos.reduce((a, b) =>
    (a.width * a.height) >= (b.width * b.height) ? a : b
  );

  return getPhotoUrl(best, width);
}
