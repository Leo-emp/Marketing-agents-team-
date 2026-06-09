/* ============================================================
   SOCIAL POSTING - Platform API Integrations
   ============================================================
   Posts content to LinkedIn, X/Twitter, Instagram, and TikTok.
   Reads OAuth tokens from the PlatformCredential DB table first,
   falls back to env vars for backwards compatibility.
   ============================================================ */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { prisma } from "@/lib/prisma";

export type PostResult = {
  success: boolean;
  platformPostId?: string;
  error?: string;
};

// # Load token from DB, fall back to env var
async function getToken(platform: string, envKey: string): Promise<string | null> {
  try {
    const cred = await prisma.platformCredential.findUnique({ where: { platform } });
    if (cred?.accessToken) return cred.accessToken;
  } catch { /* DB not available — fall back to env */ }
  return process.env[envKey] || null;
}

// # Load Instagram business account ID from DB metadata or env var
async function getInstagramAccountId(): Promise<string | null> {
  try {
    const cred = await prisma.platformCredential.findUnique({ where: { platform: "instagram" } });
    if (cred?.metadata) {
      const meta = JSON.parse(cred.metadata);
      if (meta.businessAccountId) return meta.businessAccountId;
    }
  } catch { /* fall back */ }
  return process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || null;
}

/* ---- LinkedIn ---- */
/* Uses the LinkedIn Share API v2 */
export async function postToLinkedIn(content: string, imageUrl?: string): Promise<PostResult> {
  const token = await getToken("linkedin", "LINKEDIN_ACCESS_TOKEN");
  if (!token) return { success: false, error: "LinkedIn not connected — go to Settings tab to connect your account" };

  try {
    const meRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!meRes.ok) return { success: false, error: `LinkedIn auth failed: ${meRes.status}` };
    const me = await meRes.json();
    const authorUrn = `urn:li:person:${me.sub}`;

    let shareMedia: any[] = [];
    let shareMediaCategory = "NONE";

    /* # Upload image if provided */
    if (imageUrl) {
      /* Step 1: Register upload */
      const registerRes = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registerUploadRequest: {
            recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
            owner: authorUrn,
            serviceRelationships: [{ relationshipType: "OWNER", identifier: "urn:li:userGeneratedContent" }],
          },
        }),
      });

      if (registerRes.ok) {
        const registerData = await registerRes.json();
        const uploadUrl = registerData.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl;
        const asset = registerData.value.asset;

        /* Step 2: Upload the image bytes */
        const imgResponse = await fetch(imageUrl);
        const imgBuffer = await imgResponse.arrayBuffer();

        await fetch(uploadUrl, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: imgBuffer,
        });

        shareMedia = [{ status: "READY", media: asset, description: { text: "Generated visual" } }];
        shareMediaCategory = "IMAGE";
      }
    }

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
            shareMediaCategory,
            ...(shareMedia.length > 0 ? { media: shareMedia } : {}),
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
/* Uses X API v2 with OAuth 2.0 bearer token (from DB) or OAuth 1.0a (from env vars) */
export async function postToTwitter(content: string, imageUrl?: string): Promise<PostResult> {
  // # Try OAuth 2.0 token from DB first (set via Connect flow)
  const oauth2Token = await getToken("twitter", "");
  if (oauth2Token) {
    return postToTwitterOAuth2(content, oauth2Token, imageUrl);
  }

  // # Fall back to OAuth 1.0a env vars for backwards compatibility
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_SECRET;

  if (!apiKey || !accessToken) {
    return { success: false, error: "X/Twitter not connected — go to Settings tab to connect your account" };
  }

  try {
    const { createHmac, randomBytes } = await import("crypto");

    /* # Helper: generate OAuth 1.0a header for a given URL */
    const oauthHeader = (method: string, url: string, extraParams?: Record<string, string>) => {
      const nonce = randomBytes(16).toString("hex");
      const timestamp = Math.floor(Date.now() / 1000).toString();

      const oauthParams: Record<string, string> = {
        oauth_consumer_key: apiKey!,
        oauth_nonce: nonce,
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp: timestamp,
        oauth_token: accessToken!,
        oauth_version: "1.0",
        ...extraParams,
      };

      const paramString = Object.keys(oauthParams).sort()
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(oauthParams[k])}`)
        .join("&");

      const baseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
      const signingKey = `${encodeURIComponent(apiSecret!)}&${encodeURIComponent(accessSecret!)}`;
      const signature = createHmac("sha1", signingKey).update(baseString).digest("base64");

      return `OAuth oauth_consumer_key="${encodeURIComponent(apiKey!)}", oauth_nonce="${encodeURIComponent(nonce)}", oauth_signature="${encodeURIComponent(signature)}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${timestamp}", oauth_token="${encodeURIComponent(accessToken!)}", oauth_version="1.0"`;
    };

    /* # Upload image if provided */
    let mediaId: string | undefined;
    if (imageUrl) {
      const imgResponse = await fetch(imageUrl);
      const imgBuffer = Buffer.from(await imgResponse.arrayBuffer());
      const base64Data = imgBuffer.toString("base64");

      const mediaUrl = "https://upload.twitter.com/1.1/media/upload.json";
      const formBody = `media_data=${encodeURIComponent(base64Data)}`;

      const uploadRes = await fetch(mediaUrl, {
        method: "POST",
        headers: {
          Authorization: oauthHeader("POST", mediaUrl),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody,
      });

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        mediaId = uploadData.media_id_string;
      }
    }

    const tweetUrl = "https://api.x.com/2/tweets";
    const tweetBody: any = { text: content };
    if (mediaId) {
      tweetBody.media = { media_ids: [mediaId] };
    }

    const res = await fetch(tweetUrl, {
      method: "POST",
      headers: {
        Authorization: oauthHeader("POST", tweetUrl),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tweetBody),
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

// # Post via OAuth 2.0 bearer token (from the Connect flow)
async function postToTwitterOAuth2(content: string, token: string, imageUrl?: string): Promise<PostResult> {
  try {
    const tweetBody: any = { text: content };
    // # OAuth 2.0 user tokens don't support v1.1 media upload — text-only for now
    // # Image posting requires OAuth 1.0a credentials in env vars

    const res = await fetch("https://api.x.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tweetBody),
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
export async function postToInstagram(content: string, imageUrl?: string): Promise<PostResult> {
  const token = await getToken("instagram", "INSTAGRAM_ACCESS_TOKEN");
  const accountId = await getInstagramAccountId();

  if (!token || !accountId) {
    return { success: false, error: "Instagram not connected — go to Settings tab to connect your account" };
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
    case "linkedin": return postToLinkedIn(content, imageUrl);
    case "twitter": return postToTwitter(content, imageUrl);
    case "instagram": return postToInstagram(content, imageUrl);
    case "tiktok": return postToTikTok(content);
    default: return { success: false, error: `Unknown platform: ${platform}` };
  }
}
