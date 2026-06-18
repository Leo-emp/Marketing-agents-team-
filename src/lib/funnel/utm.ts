/* ============================================================
   UTM UTILITIES - Auto-tag outbound links with tracking params
   ============================================================
   Appends UTM parameters to jobpilotai.co links in social
   posts so we can attribute signups to specific content.
   ============================================================ */

// # Append UTM params to a URL
export function appendUtm(
  url: string,
  source: string,
  medium: string,
  campaign: string
): string {
  // # Use & if URL already has query params, otherwise start with ?
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}utm_source=${enc(source)}&utm_medium=${enc(medium)}&utm_campaign=${enc(campaign)}`;
}

// # Find all jobpilotai.co links in a text body and append UTM params
export function tagContentLinks(
  body: string,
  platform: string,
  contentId: string
): string {
  // # Match URLs that point to jobpilotai.co
  const urlPattern = /(https?:\/\/(?:www\.)?jobpilotai\.co[^\s"'<>]*)/gi;

  return body.replace(urlPattern, (match) => {
    // # Don't double-tag URLs that already have utm params
    if (match.includes("utm_source=")) return match;
    return appendUtm(match, platform, "social", contentId);
  });
}

// # URL-encode a string for safe use in query params
function enc(s: string): string {
  return encodeURIComponent(s);
}
