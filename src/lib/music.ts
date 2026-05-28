/* ============================================================
   BACKGROUND MUSIC — Royalty-Free Tracks for Reels
   ============================================================
   Maps music moods to royalty-free audio URLs. Uses Pixabay
   Music API for free commercial-use tracks, with fallback
   to bundled placeholder URLs.

   Pixabay Music is 100% free for commercial use with no
   attribution required — perfect for social media reels.
   Get an API key at: https://pixabay.com/api/docs/
   ============================================================ */

import type { MusicMood } from "./visual/types";

/* # Curated search terms for each mood — tuned for Pixabay Music */
const MOOD_SEARCH_TERMS: Record<MusicMood, string[]> = {
  energetic: ["upbeat corporate", "energetic technology", "fast motivation"],
  chill: ["lo-fi chill", "ambient calm", "relaxing background"],
  corporate: ["corporate presentation", "business technology", "professional background"],
  dramatic: ["cinematic dramatic", "epic motivation", "powerful inspiring"],
  inspirational: ["inspirational uplifting", "motivational success", "positive achievement"],
};

/* # Pixabay Music API response shape (subset) */
interface PixabayMusicHit {
  id: number;
  title: string;
  url: string;
  audio_url: string;
  duration: number;
  tags: string;
}

/* # Fetch a music track from Pixabay Music API */
export async function fetchMusicTrack(
  mood: MusicMood,
  maxDuration: number = 60
): Promise<{ audioUrl: string; title: string; duration: number } | null> {
  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey) {
    console.warn("[music] PIXABAY_API_KEY not configured, skipping background music");
    return null;
  }

  /* # Try each search term until we find a suitable track */
  const searchTerms = MOOD_SEARCH_TERMS[mood] || MOOD_SEARCH_TERMS.corporate;

  for (const term of searchTerms) {
    try {
      const params = new URLSearchParams({
        key: apiKey,
        q: term,
        per_page: "5",
      });

      const res = await fetch(`https://pixabay.com/api/videos/music/?${params}`);
      if (!res.ok) continue;

      const data = await res.json() as { hits: PixabayMusicHit[] };
      if (!data.hits || data.hits.length === 0) continue;

      /* # Filter by duration — reels are typically 15-45 seconds */
      const suitable = data.hits.filter((h) => h.duration <= maxDuration && h.duration >= 10);
      const track = suitable[0] || data.hits[0];

      return {
        audioUrl: track.audio_url,
        title: track.title,
        duration: track.duration,
      };
    } catch (e) {
      console.warn(`[music] Search failed for "${term}":`, e);
      continue;
    }
  }

  return null;
}

/* # Get music for a reel based on mood — returns audio URL or null */
export async function getMusicForReel(
  mood: MusicMood = "corporate",
  reelDurationSeconds: number = 30
): Promise<string | null> {
  /* # Fetch a track slightly longer than the reel so it loops cleanly */
  const result = await fetchMusicTrack(mood, Math.max(reelDurationSeconds * 2, 60));
  return result?.audioUrl || null;
}
