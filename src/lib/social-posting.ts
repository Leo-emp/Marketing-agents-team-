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
/* # Uses the LinkedIn Posts API (rest/posts) and Images API (rest/images)
   # Migrated from deprecated v2/ugcPosts and v2/assets endpoints
   # API version: 202401 — passed via LinkedIn-Version header
   # Docs: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api */
export async function postToLinkedIn(content: string, imageUrl?: string): Promise<PostResult> {
  const token = await getToken("linkedin", "LINKEDIN_ACCESS_TOKEN");
  if (!token) return { success: false, error: "LinkedIn not connected — go to Settings tab to connect your account" };

  try {
    // # Post as the company page (LINKEDIN_ORG_ID) if set, otherwise fall back to personal profile
    const orgId = process.env.LINKEDIN_ORG_ID;
    let authorUrn: string;

    if (orgId) {
      // # Post as the JobPilot AI company page
      authorUrn = `urn:li:organization:${orgId}`;
    } else {
      // # Fallback: post as personal profile via OpenID userinfo
      const meRes = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!meRes.ok) return { success: false, error: `LinkedIn auth failed: ${meRes.status}` };
      const me = await meRes.json();
      authorUrn = `urn:li:person:${me.sub}`;
    }

    // # Track the image URN if we upload one — used in the post body later
    let imageUrn: string | undefined;

    /* # Upload image if provided — uses the new Images API (rest/images) */
    if (imageUrl) {
      // # Step 1: Initialize the upload — tells LinkedIn we want to upload an image
      // # Returns an uploadUrl (where to PUT bytes) and an image URN (to reference in the post)
      const initRes = await fetch("https://api.linkedin.com/rest/images?action=initializeUpload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "LinkedIn-Version": "202401",
        },
        body: JSON.stringify({
          initializeUploadRequest: {
            owner: authorUrn,
          },
        }),
      });

      if (!initRes.ok) {
        // # Non-fatal: if image upload init fails, we still post text-only
        const initErr = await initRes.text();
        console.error(`LinkedIn image init failed (posting text-only): ${initErr}`);
      } else {
        const initData = await initRes.json();
        // # Extract the upload URL and the image URN from the response
        const uploadUrl = initData.value.uploadUrl;
        imageUrn = initData.value.image; // # e.g. "urn:li:image:abc123"

        // # Step 2: Fetch the image from our URL and upload raw bytes to LinkedIn
        const imgResponse = await fetch(imageUrl);
        const imgBuffer = await imgResponse.arrayBuffer();

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/octet-stream",
          },
          body: Buffer.from(imgBuffer),
        });

        // # If the binary upload fails, clear the URN so we fall back to text-only
        if (!uploadRes.ok) {
          console.error(`LinkedIn image upload failed (posting text-only): ${uploadRes.status}`);
          imageUrn = undefined;
        }
      }
    }

    // # Build the post body — structure differs for text-only vs image posts
    // # Both use the same endpoint: POST /rest/posts
    const postBody: any = {
      author: authorUrn,
      // # commentary = the text content of the post (replaces shareCommentary)
      commentary: content,
      // # visibility is now a simple string, not a nested object
      visibility: "PUBLIC",
      // # distribution controls who sees it — MAIN_FEED = normal LinkedIn feed
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: "PUBLISHED",
    };

    // # If we successfully uploaded an image, attach it to the post via content.media
    if (imageUrn) {
      postBody.content = {
        media: {
          title: "Image",
          // # id references the image URN we got from initializeUpload
          id: imageUrn,
        },
      };
    }

    // # Create the post using the new Posts API endpoint
    const postRes = await fetch("https://api.linkedin.com/rest/posts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        // # LinkedIn-Version header is required for all /rest/ endpoints
        "LinkedIn-Version": "202401",
      },
      body: JSON.stringify(postBody),
    });

    if (!postRes.ok) {
      const err = await postRes.text();
      return { success: false, error: `LinkedIn post failed: ${err}` };
    }

    // # The Posts API returns the post URN in the x-restli-id header
    // # Response body may be empty on 201 Created, so we read the header
    const postId = postRes.headers.get("x-restli-id") || (await postRes.text());
    return { success: true, platformPostId: postId };
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
/* Uses the TikTok Content Posting API v2 */
/* Supports: video posts and photo/carousel posts */
export async function postToTikTok(content: string, mediaUrl?: string, mediaType?: "video" | "photo"): Promise<PostResult> {
  const token = await getToken("tiktok", "TIKTOK_ACCESS_TOKEN");

  if (!token) {
    return { success: false, error: "TikTok not connected — go to Settings tab to connect your account" };
  }

  try {
    // # Photo/carousel posts — upload individual images
    if (mediaType === "photo" && mediaUrl) {
      const imageUrls = mediaUrl.split(",").map((u) => u.trim()).filter(Boolean);
      if (imageUrls.length === 0) {
        return { success: false, error: "No images provided for TikTok carousel" };
      }

      // # Initialize photo post with image URLs
      const initRes = await fetch("https://open.tiktokapis.com/v2/post/publish/content/init/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          post_info: {
            title: content.slice(0, 150),
            privacy_level: "PUBLIC_TO_EVERYONE",
          },
          source_info: {
            source: "PULL_FROM_URL",
            photo_cover_index: 0,
            photo_images: imageUrls,
          },
          post_mode: "DIRECT_POST",
          media_type: "PHOTO",
        }),
      });

      if (!initRes.ok) {
        const err = await initRes.text();
        return { success: false, error: `TikTok photo init failed: ${err}` };
      }

      const initData = await initRes.json();
      return { success: true, platformPostId: initData.data?.publish_id };
    }

    // # Video posts — upload video from URL
    if (mediaUrl && (!mediaType || mediaType === "video")) {
      // # Initialize video upload by URL
      const initRes = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          post_info: {
            title: content.slice(0, 150),
            privacy_level: "PUBLIC_TO_EVERYONE",
          },
          source_info: {
            source: "PULL_FROM_URL",
            video_url: mediaUrl,
          },
          post_mode: "DIRECT_POST",
          media_type: "VIDEO",
        }),
      });

      if (!initRes.ok) {
        const err = await initRes.text();
        return { success: false, error: `TikTok video init failed: ${err}` };
      }

      const initData = await initRes.json();
      return { success: true, platformPostId: initData.data?.publish_id };
    }

    return { success: false, error: "TikTok requires a media URL (video or photo carousel)" };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/* ---- Unified Poster ---- */
export async function postToPlatform(
  platform: string,
  content: string,
  imageUrl?: string,
  mediaType?: "video" | "photo"
): Promise<PostResult> {
  switch (platform) {
    case "linkedin": return postToLinkedIn(content, imageUrl);
    case "twitter": return postToTwitter(content, imageUrl);
    case "instagram": return postToInstagram(content, imageUrl);
    case "tiktok": return postToTikTok(content, imageUrl, mediaType);
    default: return { success: false, error: `Unknown platform: ${platform}` };
  }
}
