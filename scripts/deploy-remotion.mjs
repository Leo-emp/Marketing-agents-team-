/* ============================================================
   DEPLOY REMOTION — AWS Lambda Setup
   ============================================================
   Bundles Remotion compositions, deploys to S3, and creates
   the Lambda rendering function. Run this once to set up,
   then again whenever you update compositions.

   Prerequisites:
   1. AWS account (free tier eligible)
   2. IAM user with Remotion Lambda permissions
      (see: https://www.remotion.dev/docs/lambda/permissions)
   3. Set these env vars before running:
      - AWS_ACCESS_KEY_ID
      - AWS_SECRET_ACCESS_KEY
      - REMOTION_AWS_REGION (default: us-east-1)

   Usage: node scripts/deploy-remotion.mjs
   ============================================================ */

import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

async function deploy() {
  const region = process.env.REMOTION_AWS_REGION || "us-east-1";

  // # Check for AWS credentials
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error("\n[deploy-remotion] Missing AWS credentials.\n");
    console.error("Set these environment variables:");
    console.error("  AWS_ACCESS_KEY_ID=AKIA...");
    console.error("  AWS_SECRET_ACCESS_KEY=...");
    console.error("  REMOTION_AWS_REGION=us-east-1 (optional, defaults to us-east-1)\n");
    console.error("Need an IAM policy? See: https://www.remotion.dev/docs/lambda/permissions");
    process.exit(1);
  }

  console.log(`\n[deploy-remotion] Deploying to AWS region: ${region}\n`);

  // # Step 1: Bundle the Remotion project
  console.log("[deploy-remotion] Step 1/4: Bundling Remotion compositions...");
  const { bundle } = await import("@remotion/bundler");
  const entryPoint = path.resolve(projectRoot, "src/remotion/index.ts");
  const bundleLocation = await bundle({
    entryPoint,
    publicDir: path.resolve(projectRoot, "public"),
  });
  console.log(`[deploy-remotion] Bundle created at: ${bundleLocation}`);

  // # Step 2: Get or create S3 bucket
  console.log("[deploy-remotion] Step 2/4: Setting up S3 bucket...");
  const { getOrCreateBucket } = await import("@remotion/lambda");
  const { bucketName } = await getOrCreateBucket({ region });
  console.log(`[deploy-remotion] Using bucket: ${bucketName}`);

  // # Step 3: Deploy the site to S3
  console.log("[deploy-remotion] Step 3/4: Deploying site to S3...");
  const { deploySite } = await import("@remotion/lambda");
  const { serveUrl } = await deploySite({
    bucketName,
    entryPoint,
    region,
    siteName: "jobpilot-marketing-reels",
  });
  console.log(`[deploy-remotion] Site deployed: ${serveUrl}`);

  // # Step 4: Deploy or find the Lambda function
  console.log("[deploy-remotion] Step 4/4: Deploying Lambda function...");
  const { deployFunction, getFunctions } = await import("@remotion/lambda");

  // # Check if function already exists
  const existingFunctions = await getFunctions({
    region,
    compatibleOnly: true,
  });

  let functionName;
  if (existingFunctions.length > 0) {
    functionName = existingFunctions[0].functionName;
    console.log(`[deploy-remotion] Reusing existing function: ${functionName}`);
  } else {
    const { functionName: newName } = await deployFunction({
      region,
      memorySizeInMb: 2048,
      diskSizeInMb: 2048,
      timeoutInSeconds: 240,
    });
    functionName = newName;
    console.log(`[deploy-remotion] New function deployed: ${functionName}`);
  }

  // # Print env vars to set
  console.log("\n========================================");
  console.log("  DEPLOYMENT COMPLETE");
  console.log("========================================\n");
  console.log("Add these environment variables to your .env.local and Vercel:\n");
  console.log(`REMOTION_AWS_REGION=${region}`);
  console.log(`REMOTION_FUNCTION_NAME=${functionName}`);
  console.log(`REMOTION_SERVE_URL=${serveUrl}`);
  console.log(`REMOTION_S3_BUCKET=${bucketName}`);
  console.log(`REMOTION_AWS_ACCESS_KEY_ID=${process.env.AWS_ACCESS_KEY_ID}`);
  console.log(`REMOTION_AWS_SECRET_ACCESS_KEY=<your secret key>`);
  console.log("\nCost estimate: ~$0.01-0.03 per 30-second video render");
  console.log("AWS Free Tier: first ~1000 renders free\n");
}

deploy().catch((e) => {
  console.error("[deploy-remotion] Failed:", e.message);
  process.exit(1);
});
