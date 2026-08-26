/* ============================================================
   WEEKLY PIPELINE — /api/pipeline/weekly
   ============================================================
   # GET: Cron-triggered Sunday 10 PM UTC. Generates a full
   # week of content: pulls performance data, creates a plan via
   # the strategist agent, generates all content, renders visuals,
   # and queues everything with status "pending" for admin review.
   #
   # RENDER PRIORITY (social posts):
   #   1. HTML templates (Puppeteer) — primary, pixel-perfect
   #   2. OpenAI gpt-image-1 — fallback if Puppeteer fails
   #   3. Canvas 2D — last resort (always works, no API needed)
   #
   # RENDER PRIORITY (blog covers):
   #   1. fal.ai Flux Pro — photorealistic editorial imagery
   #   2. OpenAI gpt-image-1 — fallback
   #   3. Canvas 2D — last resort
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { callGemini } from "@/lib/gemini";
import { generateWeeklyDigest } from "@/lib/performance-digest";
import { buildDynamicVoiceSamples } from "@/lib/dynamic-voice";
import { designVisual } from "@/lib/visual/designer-agent";
import { assembleCarouselPdf } from "@/lib/visual/pdf-carousel";
import { generateFalImage } from "@/lib/visual/fal-image";
import { generateImage } from "@/lib/visual/openai-image";
import { renderSlideCanvas } from "@/lib/visual/canvas-renderer";
import { renderTemplateHTML } from "@/lib/visual/html-renderer";
import { getTemplateDimensions } from "@/lib/visual/templates/index";
import { uploadImage, uploadMedia } from "@/lib/blob-storage";
import { getDimensions, type SlideData } from "@/lib/visual/types";
import { applyBrandOverlay } from "@/lib/visual/brand-overlay";
import { reviewContent } from "@/lib/editorial";
import { notifyAdmin } from "@/lib/notify-admin";
import { getPlaybookForPrompt } from "@/lib/learning-loop";

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

  const results: { title: string; platform: string; contentType: string; status: string; renderer?: string; templateId?: string; error?: string }[] = [];

  try {
    // # Step 1: Pull performance digest + learning loop playbook
    console.log("[Pipeline] Pulling performance digest and playbook...");
    const [digest, playbook] = await Promise.all([
      generateWeeklyDigest(),
      getPlaybookForPrompt(),
    ]);

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

        // # Extract strategic context from the plan (pillar, topic angle, tone)
        const itemPillar = (item as any).pillar || "";
        const itemTopicAngle = (item as any).topicAngle || "";
        const itemTone = (item as any).tone || "";

        // # Generate content via Gemini with performance context + playbook + strategic direction
        const contentPrompt = `You are a senior content strategist for JobPilot AI (jobpilotai.co), a premium career tech platform.

${digest}

${playbook}

${voiceSamples}

${itemPillar ? `STRATEGIC DIRECTION FOR THIS PIECE:\n- Pillar: ${itemPillar}\n- Topic Angle: ${itemTopicAngle}\n- Tone: ${itemTone}\n` : ""}
Create a ${item.contentType} post for ${item.platform}. ${itemTopicAngle ? `Focus on this specific angle: ${itemTopicAngle}.` : "Choose a topic that will perform well based on the performance data above."} Write the content in the same voice and quality as the top performers.

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
            notes: JSON.stringify({ day: item.day, generatedBy: "weekly-pipeline", pillar: itemPillar || undefined, tone: itemTone || undefined, topicAngle: itemTopicAngle || undefined }),
          },
        });

        // # Track which renderer and template was used for this content piece
        let rendererUsed = "none";
        let templateIdUsed: string | undefined;

        // # Render visuals for image-based content types
        if (item.contentType !== "post" && item.contentType !== "thread") {
          try {
            const design = await designVisual(
              finalBody,
              item.platform,
              item.contentType,
              parsed.mediaPrompt,
              parsed.title,
              itemPillar,
            );

            const { width, height } = getDimensions(item.platform, item.contentType);
            const imageBuffers: Buffer[] = [];

            // # Render each slide with the correct priority chain
            for (let i = 0; i < design.slides.length; i++) {
              const slide = design.slides[i];
              const templateSelection = design.templateSelections[i];
              let imgBuffer: Buffer | null = null;

              // # ---- SOCIAL POSTS: HTML Template → OpenAI → Canvas 2D ----
              if (item.platform !== "blog") {
                // # Priority 1: HTML templates via Puppeteer
                if (templateSelection) {
                  try {
                    // # Use template's native dimensions to avoid clipping
                    const tDims = getTemplateDimensions(templateSelection.templateId);
                    const tW = tDims?.width ?? width;
                    const tH = tDims?.height ?? height;
                    imgBuffer = await renderTemplateHTML(
                      templateSelection.templateId,
                      templateSelection.templateContent,
                      tW,
                      tH,
                    );
                    rendererUsed = "html-template";
                    templateIdUsed = templateSelection.templateId;
                    console.log(`[Pipeline] Slide ${i + 1}: rendered with HTML template ${templateSelection.templateId} "${templateSelection.templateName}"`);
                  } catch (htmlErr) {
                    console.warn(`[Pipeline] HTML template render failed for slide ${i + 1}:`, htmlErr);
                    imgBuffer = null;
                  }
                }

                // # Priority 2: OpenAI gpt-image-1
                if (!imgBuffer && slide.aiImagePrompt) {
                  try {
                    imgBuffer = await generateImage(slide.aiImagePrompt, width, height, item.platform);
                    if (imgBuffer) {
                      rendererUsed = "openai";
                      console.log(`[Pipeline] Slide ${i + 1}: rendered with OpenAI gpt-image-1`);
                    }
                  } catch (oaiErr) {
                    console.warn(`[Pipeline] OpenAI render failed for slide ${i + 1}:`, oaiErr);
                  }
                }

                // # Priority 3: Canvas 2D (always works)
                if (!imgBuffer) {
                  console.log(`[Pipeline] Slide ${i + 1}: using Canvas 2D last resort`);
                  const slideData: SlideData = {
                    ...slide,
                    slideNumber: slide.slideNumber ?? i + 1,
                    totalSlides: slide.totalSlides ?? design.slides.length,
                  };
                  imgBuffer = await renderSlideCanvas(slideData, width, height);
                  rendererUsed = "canvas-2d";
                }
              } else {
                // # ---- BLOG COVERS: fal.ai → OpenAI → Canvas 2D ----

                // # Priority 1: fal.ai Flux Pro (best photorealistic quality)
                if (slide.aiImagePrompt) {
                  imgBuffer = await generateFalImage(slide.aiImagePrompt, width, height, { model: "flux-pro" });
                  if (imgBuffer) {
                    rendererUsed = "fal-flux-pro";
                    console.log(`[Pipeline] Blog cover: rendered with fal.ai Flux Pro`);
                  }
                }

                // # Priority 2: OpenAI gpt-image-1
                if (!imgBuffer && slide.aiImagePrompt) {
                  imgBuffer = await generateImage(slide.aiImagePrompt, width, height, item.platform);
                  if (imgBuffer) {
                    rendererUsed = "openai";
                    console.log(`[Pipeline] Blog cover: rendered with OpenAI`);
                  }
                }

                // # Priority 3: Canvas 2D
                if (!imgBuffer) {
                  console.log(`[Pipeline] Blog cover: using Canvas 2D last resort`);
                  const slideData: SlideData = { ...slide, slideNumber: 1, totalSlides: 1 };
                  imgBuffer = await renderSlideCanvas(slideData, width, height);
                  rendererUsed = "canvas-2d";
                }
              }

              // # Post-process: overlay logo + brand name (skip blog covers and HTML-templated slides)
              // # HTML templates already include built-in branding, so skip overlay
              if (item.platform !== "blog" && rendererUsed !== "html-template") {
                try {
                  imgBuffer = await applyBrandOverlay(imgBuffer, width, height);
                } catch (err) {
                  console.warn("[Pipeline] Brand overlay failed, using raw image:", err);
                }
              }

              imageBuffers.push(imgBuffer);

              // # Store the Visual record with templateId for performance tracking
              // # Use template-native dims when an HTML template was rendered
              const vizDims = (rendererUsed === "html-template" && templateIdUsed)
                ? (getTemplateDimensions(templateIdUsed) ?? { width, height })
                : { width, height };
              if (templateIdUsed || rendererUsed) {
                try {
                  await prisma.visual.create({
                    data: {
                      contentId: content.id,
                      type: item.contentType,
                      slideIndex: i,
                      templateId: templateIdUsed || rendererUsed,
                      data: JSON.stringify(templateSelection ? {
                        templateName: templateSelection.templateName,
                        reasoning: templateSelection.reasoning,
                        renderer: rendererUsed,
                      } : { renderer: rendererUsed }),
                      width: vizDims.width,
                      height: vizDims.height,
                    },
                  });
                } catch (vizRecErr) {
                  console.warn(`[Pipeline] Failed to store Visual record:`, vizRecErr);
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

        results.push({
          title: parsed.title,
          platform: item.platform,
          contentType: item.contentType,
          status: "queued",
          renderer: "html-template",
          templateId: templateIdUsed,
        });
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
