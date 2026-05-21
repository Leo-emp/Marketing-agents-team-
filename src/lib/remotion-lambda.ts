/* ============================================================
   REMOTION LAMBDA — Video Rendering Client
   ============================================================
   Triggers video rendering on AWS Lambda via @remotion/lambda
   and polls for progress. Returns S3 URLs for finished videos.
   ============================================================ */

import type { ReelConfig, VideoRenderStatus } from "./visual/types";

// # Trigger a video render on Lambda
export async function triggerRender(
  reelConfig: ReelConfig,
  contentId: string
): Promise<{ renderId: string; bucketName: string }> {
  const region = process.env.REMOTION_AWS_REGION;
  const functionName = process.env.REMOTION_FUNCTION_NAME;
  const serveUrl = process.env.REMOTION_SERVE_URL;

  if (!region || !functionName || !serveUrl) {
    throw new Error("Remotion Lambda not configured -- set REMOTION_AWS_REGION, REMOTION_FUNCTION_NAME, and REMOTION_SERVE_URL");
  }

  // # Dynamic import to avoid bundling @remotion/lambda in the Next.js client build
  const { renderMediaOnLambda } = await import("@remotion/lambda/client");

  const result = await renderMediaOnLambda({
    region: region as "us-east-1",
    functionName,
    serveUrl,
    composition: "JobPilotReel",
    inputProps: { scenes: reelConfig.scenes },
    codec: "h264",
    imageFormat: "jpeg",
    framesPerLambda: 20,
    maxRetries: 1,
    privacy: "public",
    outName: `jobpilot-reel-${contentId}-${Date.now()}.mp4`,
  });

  return {
    renderId: result.renderId,
    bucketName: result.bucketName,
  };
}

// # Check render progress
export async function checkProgress(
  renderId: string,
  bucketName: string
): Promise<VideoRenderStatus> {
  const region = process.env.REMOTION_AWS_REGION;
  const functionName = process.env.REMOTION_FUNCTION_NAME;

  if (!region || !functionName) {
    return { renderId, status: "error", progress: 0, error: "Remotion Lambda not configured" };
  }

  const { getRenderProgress } = await import("@remotion/lambda/client");

  const progress = await getRenderProgress({
    renderId,
    bucketName,
    region: region as "us-east-1",
    functionName,
  });

  if (progress.fatalErrorEncountered) {
    return {
      renderId,
      status: "error",
      progress: 0,
      error: progress.errors?.[0]?.message || "Render failed",
    };
  }

  if (progress.done) {
    return {
      renderId,
      status: "done",
      progress: 100,
      videoUrl: progress.outputFile ?? undefined,
    };
  }

  return {
    renderId,
    status: "rendering",
    progress: Math.round((progress.overallProgress || 0) * 100),
  };
}
