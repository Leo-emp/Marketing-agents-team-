/* ============================================================
   PEXELS — Stock Photo Search for Visual Backgrounds
   ============================================================
   Fetches relevant, high-quality photos from Pexels based on
   topic keywords. Returns landscape-cropped URLs sized for
   social media slides. Caches results to avoid repeat API calls.
   ============================================================ */

const PEXELS_BASE = "https://api.pexels.com/v1";

interface PexelsPhoto {
  id: number;
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
export async function searchPhotos(query: string, count = 5): Promise<PexelsPhoto[]> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return [];

  const cacheKey = `${query}:${count}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.photos;

  try {
    const res = await fetch(`${PEXELS_BASE}/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`, {
      headers: { Authorization: key },
    });

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
export async function getBackgroundPhoto(topic: string, width: number): Promise<string | null> {
  // # Build a search query that gets professional, abstract, mood-appropriate photos
  const searchTerms = `${topic} professional modern`;
  const photos = await searchPhotos(searchTerms, 5);
  if (photos.length === 0) return null;

  // # Pick a random photo from results to add variety across slides
  const photo = photos[Math.floor(Math.random() * photos.length)];
  return getPhotoUrl(photo, width);
}
