/* ============================================================
   SOCIAL POSTING - Platform API Integrations
   ============================================================
   Posts content to LinkedIn, X/Twitter, Instagram, and TikTok.
   Each platform has its own posting function. Falls back to
   a "not configured" error if API keys aren't set.
   ============================================================ */

/* eslint-disable @typescript-eslint/no-explicit-any */

export type PostResult = {
  success: boolean;
  platformPostId?: string;
  error?: string;
};

/* ---- LinkedIn ---- */
/* Uses the LinkedIn Share API v2 */
/* Requires: LINKEDIN_ACCESS_TOKEN (OAuth 2.0 token with w_member_social scope) */
export async function postToLinkedIn(content: string): Promise<PostResult> {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!token) return { success: false, error: "LinkedIn not configured — set LINKEDIN_ACCESS_TOKEN" };

  try {
    /* First get the user's LinkedIn URN */
    const meRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!meRes.ok) return { success: false, error: `LinkedIn auth failed: ${meRes.status}` };
    const me = await meRes.json();
    const authorUrn = `urn:li:person:${me.sub}`;

    /* Create the share */
    const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: authorUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: content },
            shareMediaCategory: "NONE",
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      }),
    });

    if (!postRes.ok) {
      const err = await postRes.text();
      return { success: false, error: `LinkedIn post failed: ${err}` };
    }

    const data = await postRes.json();
    return { success: true, platformPostId: data.id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/* ---- X / Twitter ---- */
/* Uses the X API v2 tweets endpoint */
/* Requires: TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET */
export async function postToTwitter(content: string): Promise<PostResult> {
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_SECRET;

  if (!apiKey || !accessToken) {
    return { success: false, error: "X/Twitter not configured — set TWITTER_* env vars" };
  }

  try {
    /* OAuth 1.0a signing for X API v2 */
    const { createHmac, randomBytes } = await import("crypto");
    const url = "https://api.x.com/2/tweets";
    const method = "POST";
    const nonce = randomBytes(16).toString("hex");
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const params: Record<string, string> = {
      oauth_consumer_key: apiKey,
      oauth_nonce: nonce,
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: timestamp,
      oauth_token: accessToken,
      oauth_version: "1.0",
    };

    const paramString = Object.keys(params).sort()
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join("&");

    const baseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
    const signingKey = `${encodeURIComponent(apiSecret!)}&${encodeURIComponent(accessSecret!)}`;
    const signature = createHmac("sha1", signingKey).update(baseString).digest("base64");

    const authHeader = `OAuth oauth_consumer_key="${encodeURIComponent(apiKey)}", oauth_nonce="${encodeURIComponent(nonce)}", oauth_signature="${encodeURIComponent(signature)}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${timestamp}", oauth_token="${encodeURIComponent(accessToken)}", oauth_version="1.0"`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: content }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `X post failed: ${err}` };
    }

    const data = await res.json();
    return { success: true, platformPostId: data.data?.id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/* ---- Instagram ---- */
/* Uses the Instagram Graph API (requires Facebook Business account) */
/* Requires: INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_BUSINESS_ACCOUNT_ID */
export async function postToInstagram(content: string, imageUrl?: string): Promise<PostResult> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  if (!token || !accountId) {
    return { success: false, error: "Instagram not configured — set INSTAGRAM_* env vars" };
  }

  try {
    if (!imageUrl) {
      return { success: false, error: "Instagram requires an image URL for posts" };
    }

    /* Step 1: Create media container */
    const createRes = await fetch(
      `https://graph.facebook.com/v19.0/${accountId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: content,
          access_token: token,
        }),
      }
    );

    if (!createRes.ok) {
      const err = await createRes.text();
      return { success: false, error: `Instagram container failed: ${err}` };
    }

    const { id: containerId } = await createRes.json();

    /* Step 2: Publish */
    const publishRes = await fetch(
      `https://graph.facebook.com/v19.0/${accountId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: token,
        }),
      }
    );

    if (!publishRes.ok) {
      const err = await publishRes.text();
      return { success: false, error: `Instagram publish failed: ${err}` };
    }

    const data = await publishRes.json();
    return { success: true, platformPostId: data.id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/* ---- TikTok ---- */
/* Uses the TikTok Content Posting API */
/* Requires: TIKTOK_ACCESS_TOKEN */
export async function postToTikTok(content: string): Promise<PostResult> {
  const token = process.env.TIKTOK_ACCESS_TOKEN;

  if (!token) {
    return { success: false, error: "TikTok not configured — set TIKTOK_ACCESS_TOKEN. TikTok requires video upload via their Creator API." };
  }

  /* TikTok's Content Posting API requires video upload — text-only posts aren't supported. */
  /* This returns a placeholder since video creation needs to happen outside this system. */
  return {
    success: false,
    error: "TikTok requires video upload — use the script to create a video first, then upload via TikTok Creator Tools or their API.",
  };
}

/* ---- Unified Poster ---- */
export async function postToPlatform(platform: string, content: string, imageUrl?: string): Promise<PostResult> {
  switch (platform) {
    case "linkedin": return postToLinkedIn(content);
    case "twitter": return postToTwitter(content);
    case "instagram": return postToInstagram(content, imageUrl);
    case "tiktok": return postToTikTok(content);
    default: return { success: false, error: `Unknown platform: ${platform}` };
  }
}
