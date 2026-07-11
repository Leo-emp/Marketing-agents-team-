/* ============================================================
   WEEKLY PIPELINE — /api/pipeline/weekly
   ============================================================
   GET: Cron-triggered Sunday 10 PM UTC. Generates a full
   week of content: pulls performance data, creates a plan via
   the strategist agent, generates all content, renders visuals,
   and queues everything with status "pending" for admin review.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { callGemini } from "@/lib/gemini";
import { generateWeeklyDigest } from "@/lib/performance-digest";
import { buildDynamicVoiceSamples } from "@/lib/dynamic-voice";
import { designVisual } from "@/lib/visual/designer-agent";
import { assembleCarouselPdf } from "@/lib/visual/pdf-carousel";
import { generateImage } from "@/lib/visual/openai-image";
import { uploadImage, uploadMedia } from "@/lib/blob-storage";
import { getDimensions } from "@/lib/visual/types";
import { reviewContent } from "@/lib/editorial";
import { notifyAdmin } from "@/lib/notify-admin";

// # Default calendar config — generates a balanced mix of content types
// # This can be overridden by a ContentPlan or dashboard settings
const DEFAULT_PLAN = [
  { platform: "linkedin", contentType: "carousel", day: "Monday" },
  { platform: "twitter", contentType: "single_image", day: "Monday" },
  { platform: "instagram", contentType: "single_image", day: "Tuesday" },
  { platform: "tiktok", contentType: "carousel", day: "Tuesday" },
  { platform: "linkedin", contentType: "single_image", day: "Wednesday" },
  { platform: "twitter", contentType: "post", day: "Wednesday" },
  { platform: "instagram", contentType: "carousel", day: "Thursday" },
  { platform: "tiktok", contentType: "single_image", day: "Thursday" },
  { platform: "linkedin", contentType: "single_image", day: "Friday" },
  { platform: "linkedin", contentType: "carousel", day: "Saturday" },
  { platform: "instagram", contentType: "single_image", day: "Sunday" },
];

export async function GET(req: NextRequest) {
  // # Cron auth
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not set" }, { status: 500 });
  }
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${cronSecret}`;
  if (
    !authHeader ||
    authHeader.length !== expected.length ||
    !timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: { title: string; platform: string; contentType: string; status: string; error?: string }[] = [];

  try {
    // # Step 1: Pull performance digest
    console.log("[Pipeline] Pulling performance digest...");
    const digest = await generateWeeklyDigest();

    // # Step 2: Check for a custom calendar config (ContentPlan with status "active")
    const activePlan = await prisma.contentPlan.findFirst({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
    });

    let calendarItems = DEFAULT_PLAN;
    if (activePlan?.plan) {
      try {
        const parsed = JSON.parse(activePlan.plan);
        if (Array.isArray(parsed) && parsed.length > 0) {
          calendarItems = parsed;
        }
      } catch { /* use default */ }
    }

    // # Step 3: Generate content for each calendar item
    for (const item of calendarItems) {
      try {
        console.log(`[Pipeline] Generating ${item.platform}/${item.contentType} for ${item.day}...`);

        // # Get dynamic voice samples for this platform
        const voiceSamples = await buildDynamicVoiceSamples(item.platform, item.contentType);

        // # Generate content via Gemini with performance context
        const contentPrompt = `You are a senior content strategist for JobPilot AI (jobpilotai.co), a premium career tech platform.

${digest}

${voiceSamples}

Create a ${item.contentType} post for ${item.platform}. Choose a topic that will perform well based on the performance data above. Write the content in the same voice and quality as the top performers.

RULES:
- Zero emojis
- Specific numbers, data, or scenarios — not generic advice
- One clear takeaway per piece
- If mentioning JobPilot, be natural (1-2x max, never the focus)
- ${item.contentType === "carousel" ? "Create content for a 4-6 slide carousel. Slide 1 is the hook, last slide is CTA." : ""}
- ${item.contentType === "post" ? "Plain text post, no image needed." : ""}

Return JSON:
{
  "title": "internal label for this content",
  "body": "the full post content",
  "hook": "the first line / scroll-stopper",
  "hashtags": "comma,separated,hashtags",
  "mediaPrompt": "brief description of what the accompanying image should show"
}

Return ONLY valid JSON.`;

        const raw = await callGemini(contentPrompt);
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON in response");
        const parsed = JSON.parse(jsonMatch[0]);

        // # Editorial review
        const review = await reviewContent(
          parsed.body,
          item.platform,
          item.contentType,
          parsed.hook || ""
        );

        const finalBody = review.passed ? review.revisedContent : parsed.body;
        const finalHook = review.passed ? review.revisedHook : (parsed.hook || "");

        // # Create Content record
        const content = await prisma.content.create({
          data: {
            agent: "pipeline",
            platform: item.platform,
            contentType: item.contentType,
            title: parsed.title || `${item.day} ${item.platform} ${item.contentType}`,
            body: finalBody,
            hook: finalHook,
            captionText: finalBody,
            hashtags: parsed.hashtags || null,
            mediaPrompt: parsed.mediaPrompt || null,
            status: "pending",
            editorialScore: review.score,
            editorialFeedback: review.feedback,
            editorialHookScore: review.hookScore,
            editorialSpecScore: review.specScore,
            editorialBrandScore: review.brandScore,
            editorialPlatformScore: review.platformScore,
            notes: JSON.stringify({ day: item.day, generatedBy: "weekly-pipeline" }),
          },
        });

        // # Render visuals for image-based content types
        if (item.contentType !== "post" && item.contentType !== "thread") {
          try {
            const design = await designVisual(
              finalBody,
              item.platform,
              item.contentType,
              parsed.mediaPrompt,
              parsed.title
            );

            const { width, height } = getDimensions(item.platform, item.contentType);
            const imageBuffers: Buffer[] = [];

            // # Render each slide via OpenAI
            for (const slide of design.slides) {
              if (slide.aiImagePrompt) {
                const imgBuffer = await generateImage(slide.aiImagePrompt, width, height, item.platform);
                if (imgBuffer) {
                  imageBuffers.push(imgBuffer);
                }
              }
            }

            if (imageBuffers.length > 0) {
              // # Upload images to Blob
              const imageUrls: string[] = [];
              for (let i = 0; i < imageBuffers.length; i++) {
                const url = await uploadImage(imageBuffers[i], `pipeline-${content.id}-slide-${i}.png`);
                imageUrls.push(url);
              }

              // # For carousels on LinkedIn, also create a PDF
              let pdfUrl: string | null = null;
              if (item.contentType === "carousel" && item.platform === "linkedin" && imageBuffers.length > 1) {
                const pdfBuffer = await assembleCarouselPdf(imageBuffers);
                pdfUrl = await uploadMedia(pdfBuffer, `pipeline-${content.id}-carousel.pdf`, "application/pdf");
              }

              // # Update Content record with image URLs
              await prisma.content.update({
                where: { id: content.id },
                data: {
                  imageUrl: imageUrls.join(","),
                  pdfUrl,
                  visualData: JSON.stringify(design.slides),
                  captionText: design.caption || finalBody,
                },
              });
            }
          } catch (vizErr) {
            console.warn(`[Pipeline] Visual generation failed for ${content.id}:`, vizErr);
          }
        }

        results.push({ title: parsed.title, platform: item.platform, contentType: item.contentType, status: "queued" });
      } catch (itemErr) {
        const msg = itemErr instanceof Error ? itemErr.message : "Unknown error";
        console.error(`[Pipeline] Failed to generate ${item.platform}/${item.contentType}:`, msg);
        results.push({ title: "FAILED", platform: item.platform, contentType: item.contentType, status: "error", error: msg });
      }
    }

    const queued = results.filter((r) => r.status === "queued").length;
    const errored = results.filter((r) => r.status === "error").length;

    return NextResponse.json({ queued, errored, results });
  } catch (e) {
    console.error("[Pipeline] Fatal error:", e);
    // # Alert admin about fatal pipeline failure via email
    await notifyAdmin("Weekly Pipeline", e, { resultsBeforeFailure: results });
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Pipeline failed" },
      { status: 500 }
    );
  }
}
