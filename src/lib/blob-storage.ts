/* ============================================================
   VERCEL BLOB STORAGE — Media Upload Utilities
   ============================================================
   Uploads generated images and videos to Vercel Blob for
   proper HTTPS URLs. Replaces base64 data URLs that social
   platforms reject in OG tags and link previews.
   ============================================================ */

import { put } from "@vercel/blob";

// # Upload a buffer (image or video) to Vercel Blob
// # Returns the public HTTPS URL for the uploaded file
// # filename should include extension (e.g. "cover-abc123.png")
export async function uploadMedia(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  // # Vercel Blob requires BLOB_READ_WRITE_TOKEN env var
  // # The token is created automatically when you add Blob to your Vercel project
  const { url } = await put(filename, buffer, {
    access: "public",
    contentType,
    // # addRandomSuffix prevents filename collisions across uploads
    addRandomSuffix: true,
  });

  console.log(`[Blob] Uploaded ${filename} (${(buffer.length / 1024).toFixed(0)}KB) → ${url}`);
  return url;
}

// # Upload an image buffer — convenience wrapper with PNG content type
export async function uploadImage(buffer: Buffer, filename: string): Promise<string> {
  return uploadMedia(buffer, filename, "image/png");
}

// # Upload a video buffer — convenience wrapper with MP4 content type
export async function uploadVideo(buffer: Buffer, filename: string): Promise<string> {
  return uploadMedia(buffer, filename, "video/mp4");
}

// # Download a file from a remote URL and re-upload to Vercel Blob
// # Useful for HeyGen/fal.ai results that return temporary URLs
export async function uploadFromUrl(url: string, filename: string): Promise<string> {
  // # Fetch the remote file
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download from ${url}: ${res.status}`);
  }

  // # Read as buffer
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // # Detect content type from response headers or filename extension
  const ext = filename.split(".").pop()?.toLowerCase();
  const contentType =
    res.headers.get("content-type") ||
    (ext === "mp4" ? "video/mp4" : ext === "webm" ? "video/webm" : "image/png");

  return uploadMedia(buffer, filename, contentType);
}
