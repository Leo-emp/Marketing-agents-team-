/* ============================================================
   SOCIAL POSTING TESTS
   ============================================================
   Tests for src/lib/social-posting.ts — the module that posts
   content to LinkedIn, X/Twitter, Instagram, and TikTok.

   # WHAT WE'RE TESTING:
   - LinkedIn posting builds the correct UGC request body
   - LinkedIn image upload flow (register + upload + post)
   - Twitter OAuth 2.0 text-only posting (no image support)
   - Instagram container creation + publish flow
   - TikTok video init upload flow
   - Error handling when platform APIs return non-200
   - Missing token returns a user-friendly error

   # MOCKING STRATEGY:
   - We mock the prisma module so getToken() returns controlled values
   - We mock global fetch so no real HTTP requests are made
   - Each test sets up its own fetch mock chain for the exact
     sequence of API calls that function makes
   ============================================================ */

import { describe, it, expect, vi, beforeEach } from "vitest";

// # Mock prisma so the social posting module can look up tokens
// # without hitting a real database
vi.mock("@/lib/prisma", () => ({
  prisma: {
    platformCredential: {
      // # findUnique is called by getToken() and getInstagramAccountId()
      // # We'll override the return value per test
      findUnique: vi.fn().mockResolvedValue(null),
    },
  },
}));

// # Import after mocking so the module picks up our mocked prisma
import {
  postToLinkedIn,
  postToTwitter,
  postToInstagram,
  postToTikTok,
  postToPlatform,
} from "@/lib/social-posting";
import { prisma } from "@/lib/prisma";

// # Type-cast the mocked function so TypeScript lets us call mockResolvedValue
const mockFindUnique = prisma.platformCredential.findUnique as ReturnType<typeof vi.fn>;

describe("Social Posting", () => {
  // # Before each test, reset all mocks to a clean slate
  // # This prevents one test's setup from leaking into another
  beforeEach(() => {
    vi.restoreAllMocks();
    // # Re-set the default: no token found in DB
    mockFindUnique.mockResolvedValue(null);
  });

  /* ============================================================
     LinkedIn Tests
     ============================================================ */
  describe("postToLinkedIn", () => {
    it("should return error when no token is available", async () => {
      // # When both DB lookup returns null AND no env var is set,
      // # the function should return a helpful "not connected" message
      mockFindUnique.mockResolvedValue(null);
      delete process.env.LINKEDIN_ACCESS_TOKEN;

      const result = await postToLinkedIn("Hello LinkedIn!");

      // # Verify it failed gracefully with user-friendly guidance
      expect(result.success).toBe(false);
      expect(result.error).toContain("not connected");
    });

    it("should construct correct Posts API request body for text-only post", async () => {
      // # Simulate: DB has a LinkedIn token, so getToken() returns it
      mockFindUnique.mockResolvedValue({ accessToken: "fake-li-token" });

      // # Track all fetch calls to verify the exact request bodies
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      // # Mock the sequence of LinkedIn API calls (Posts API v2):
      // # 1. GET /v2/userinfo -> returns user's sub (person ID)
      // # 2. POST /rest/posts -> creates the post (returns 201 with x-restli-id header)
      fetchSpy
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ sub: "abc123" }), { status: 200 })
        )
        .mockResolvedValueOnce(
          new Response(null, {
            status: 201,
            headers: { "x-restli-id": "urn:li:share:999" },
          })
        );

      const result = await postToLinkedIn("Test post content");

      // # Verify the post was successful
      expect(result.success).toBe(true);
      expect(result.platformPostId).toBe("urn:li:share:999");

      // # Verify the Posts API request body structure
      // # The second fetch call (index 1) is the actual /rest/posts call
      const postCall = fetchSpy.mock.calls[1];
      const postBody = JSON.parse(postCall[1]?.body as string);

      // # Check the author URN uses the sub from userinfo
      expect(postBody.author).toBe("urn:li:person:abc123");
      // # Check it's set to PUBLISHED (not DRAFT)
      expect(postBody.lifecycleState).toBe("PUBLISHED");
      // # Posts API uses flat "PUBLIC" string, not nested UGC visibility object
      expect(postBody.visibility).toBe("PUBLIC");
      // # Posts API uses "commentary" field instead of nested shareCommentary
      expect(postBody.commentary).toBe("Test post content");
      // # Text-only post should NOT have a content.media field
      expect(postBody.content).toBeUndefined();
      // # Verify LinkedIn-Version header is set (required for /rest/ endpoints)
      expect(postCall[1]?.headers).toHaveProperty("LinkedIn-Version", "202401");
    });

    it("should handle LinkedIn image upload flow via Images API", async () => {
      // # This test verifies the full image posting flow using the new APIs:
      // # 1. GET /v2/userinfo (get person ID)
      // # 2. POST /rest/images?action=initializeUpload (get upload URL + image URN)
      // # 3. GET imageUrl (fetch our image bytes)
      // # 4. PUT uploadUrl (upload raw bytes to LinkedIn CDN)
      // # 5. POST /rest/posts (create post with image URN in content.media)
      mockFindUnique.mockResolvedValue({ accessToken: "fake-li-token" });

      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy
        // # 1) userinfo — returns person ID
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ sub: "person1" }), { status: 200 })
        )
        // # 2) initializeUpload — returns uploadUrl and image URN
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              value: {
                uploadUrl: "https://upload.linkedin.com/upload/123",
                image: "urn:li:image:C123",
              },
            }),
            { status: 200 }
          )
        )
        // # 3) fetch the image bytes from our URL
        .mockResolvedValueOnce(
          new Response(new ArrayBuffer(10), { status: 200 })
        )
        // # 4) PUT upload to LinkedIn CDN — 201 Created
        .mockResolvedValueOnce(new Response(null, { status: 201 }))
        // # 5) create post with image — 201 with x-restli-id header
        .mockResolvedValueOnce(
          new Response(null, {
            status: 201,
            headers: { "x-restli-id": "urn:li:share:img-post" },
          })
        );

      const result = await postToLinkedIn("Post with image", "https://example.com/img.png");

      expect(result.success).toBe(true);
      expect(result.platformPostId).toBe("urn:li:share:img-post");

      // # Verify the post body includes the image in content.media
      const postCall = fetchSpy.mock.calls[4];
      const postBody = JSON.parse(postCall[1]?.body as string);
      expect(postBody.content.media.id).toBe("urn:li:image:C123");
      expect(postBody.commentary).toBe("Post with image");
    });
  });

  /* ============================================================
     Twitter / X Tests
     ============================================================ */
  describe("postToTwitter", () => {
    it("should post text-only via OAuth 2.0 when DB token exists", async () => {
      // # When a Twitter token is stored in the DB (via the Connect flow),
      // # it should use the simpler OAuth 2.0 Bearer token path.
      // # OAuth 2.0 doesn't support image upload, so imageUrl is ignored.
      mockFindUnique.mockResolvedValue({ accessToken: "tw-oauth2-token" });

      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ data: { id: "tweet-123" } }),
          { status: 200 }
        )
      );

      // # Even though we pass an imageUrl, OAuth 2.0 path ignores it
      const result = await postToTwitter("Hello X!", "https://example.com/img.png");

      expect(result.success).toBe(true);
      expect(result.platformPostId).toBe("tweet-123");

      // # Verify the tweet body is text-only (no media field)
      const tweetCall = fetchSpy.mock.calls[0];
      const tweetBody = JSON.parse(tweetCall[1]?.body as string);
      expect(tweetBody.text).toBe("Hello X!");
      // # OAuth 2.0 path does NOT include media — verify it's absent
      expect(tweetBody.media).toBeUndefined();
    });

    it("should return error when no Twitter credentials exist", async () => {
      // # No DB token and no env vars = can't post
      mockFindUnique.mockResolvedValue(null);
      delete process.env.TWITTER_API_KEY;
      delete process.env.TWITTER_ACCESS_TOKEN;

      const result = await postToTwitter("Test tweet");

      expect(result.success).toBe(false);
      expect(result.error).toContain("not connected");
    });
  });

  /* ============================================================
     Instagram Tests
     ============================================================ */
  describe("postToInstagram", () => {
    it("should create container and publish image post", async () => {
      // # Instagram posting is a 2-step flow:
      // # 1. POST /{accountId}/media -> create a media container
      // # 2. POST /{accountId}/media_publish -> publish the container
      // # We need both a token AND a business account ID
      mockFindUnique.mockImplementation(async (args: { where: { platform: string } }) => {
        if (args.where.platform === "instagram") {
          return {
            accessToken: "ig-token",
            metadata: JSON.stringify({ businessAccountId: "ig-biz-123" }),
          };
        }
        return null;
      });

      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy
        // # Step 1: container creation returns a container ID
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ id: "container-456" }), { status: 200 })
        )
        // # Step 2: publishing returns the final media ID
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ id: "media-789" }), { status: 200 })
        );

      const result = await postToInstagram("Caption text", "https://example.com/photo.jpg");

      expect(result.success).toBe(true);
      expect(result.platformPostId).toBe("media-789");

      // # Verify the container creation request includes image_url and caption
      const createCall = fetchSpy.mock.calls[0];
      expect(createCall[0]).toContain("/media");
      const createBody = JSON.parse(createCall[1]?.body as string);
      expect(createBody.image_url).toBe("https://example.com/photo.jpg");
      expect(createBody.caption).toBe("Caption text");
    });

    it("should return error when no image URL is provided", async () => {
      // # Instagram REQUIRES an image — text-only posts aren't supported
      mockFindUnique.mockImplementation(async (args: { where: { platform: string } }) => {
        if (args.where.platform === "instagram") {
          return {
            accessToken: "ig-token",
            metadata: JSON.stringify({ businessAccountId: "ig-biz-123" }),
          };
        }
        return null;
      });

      const result = await postToInstagram("Just text, no image");

      expect(result.success).toBe(false);
      expect(result.error).toContain("requires an image");
    });
  });

  /* ============================================================
     TikTok Tests
     ============================================================ */
  describe("postToTikTok", () => {
    it("should init video upload from URL", async () => {
      // # TikTok video posting uses the Content Posting API v2
      // # It sends a PULL_FROM_URL request so TikTok fetches the video
      mockFindUnique.mockResolvedValue({ accessToken: "tt-token" });

      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ data: { publish_id: "tiktok-pub-1" } }),
          { status: 200 }
        )
      );

      const result = await postToTikTok("My video", "https://example.com/video.mp4", "video");

      expect(result.success).toBe(true);
      expect(result.platformPostId).toBe("tiktok-pub-1");

      // # Verify the request body matches TikTok's expected format
      const initCall = fetchSpy.mock.calls[0];
      expect(initCall[0]).toContain("video/init");
      const initBody = JSON.parse(initCall[1]?.body as string);
      expect(initBody.source_info.video_url).toBe("https://example.com/video.mp4");
      expect(initBody.media_type).toBe("VIDEO");
      expect(initBody.post_info.privacy_level).toBe("PUBLIC_TO_EVERYONE");
    });

    it("should return error when TikTok token is missing", async () => {
      // # No token in DB and no env var
      mockFindUnique.mockResolvedValue(null);
      delete process.env.TIKTOK_ACCESS_TOKEN;

      const result = await postToTikTok("Test", "https://example.com/vid.mp4");

      expect(result.success).toBe(false);
      expect(result.error).toContain("not connected");
    });
  });

  /* ============================================================
     API Error Handling Tests
     ============================================================ */
  describe("Error handling", () => {
    it("should return error details when LinkedIn API returns non-200", async () => {
      // # When the LinkedIn post endpoint returns an error status,
      // # the function should capture the error text and return it
      mockFindUnique.mockResolvedValue({ accessToken: "bad-token" });

      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy
        // # userinfo succeeds
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ sub: "user1" }), { status: 200 })
        )
        // # ugcPosts fails with 403
        .mockResolvedValueOnce(
          new Response("Forbidden - insufficient permissions", { status: 403 })
        );

      const result = await postToLinkedIn("Fail post");

      expect(result.success).toBe(false);
      expect(result.error).toContain("LinkedIn post failed");
    });
  });

  /* ============================================================
     Unified Platform Router Tests
     ============================================================ */
  describe("postToPlatform", () => {
    it("should route to the correct platform handler", async () => {
      // # postToPlatform is a router that dispatches to platform-specific functions
      // # An unknown platform should return an error
      const result = await postToPlatform("unknown_platform", "test");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unknown platform");
    });
  });
});
