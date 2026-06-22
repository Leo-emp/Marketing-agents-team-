/* ============================================================
   AMBASSADOR VIDEO PIPELINE
   ============================================================
   Orchestrates the full AI brand ambassador video workflow:
   1. Topic discovery (or use provided topic)
   2. Script generation via Gemini (30-60s speaking script)
   3. Avatar video via HeyGen (lip sync + gestures)
   4. Queue as Content record for admin approval

   Runs automatically via cron (Tue/Thu 7 AM) and on-demand
   from the dashboard. ~2 videos/week fits within HeyGen's
   15 min/month Creator plan quota.
   ============================================================ */

import { callGemini } from "./gemini";
import { discoverTopic } from "./research";
import { generateAvatarVideo } from "./visual/heygen-avatar";
import { prisma } from "./prisma";

// # Generate a complete ambassador video from topic to queued content
export async function generateAmbassadorVideo(
  topic?: string,
  platform?: string
): Promise<{
  contentId: string;
  videoUrl: string;
  script: string;
  duration: number;
} | null> {
  const targetPlatform = platform || "tiktok";

  // # Step 1: Discover a topic if none was provided
  let videoTopic = topic || "";
  let topicReasoning = "";

  if (!videoTopic) {
    console.log("[Ambassador] Discovering trending topic...");
    const discovery = await discoverTopic(
      "video",
      "ambassador_tip",
      "career advice expert"
    );
    videoTopic = discovery.topic;
    topicReasoning = discovery.reasoning;
  }

  // # Step 2: Generate a 30-60 second speaking script via Gemini
  console.log(`[Ambassador] Writing script for: ${videoTopic}`);

  const scriptPrompt = `You are the AI brand ambassador for JobPilot AI (jobpilotai.co), a premium career tech platform. Write a speaking script for a short video.

TOPIC: ${videoTopic}
${topicReasoning ? `REASONING: ${topicReasoning}` : ""}

SCRIPT REQUIREMENTS:
1. LENGTH: 30-60 seconds when spoken (approximately 75-150 words)
2. TONE: Professional, warm, confident — like a trusted career advisor sharing insider knowledge
3. STRUCTURE:
   - Hook (first 3 seconds): A surprising insight or bold statement that grabs attention
   - Body (20-45 seconds): 2-3 actionable tips or insights with specific details
   - CTA (last 5-10 seconds): Natural mention of JobPilot AI as a tool that helps with this
4. STYLE:
   - Speak directly to the viewer ("you", "your")
   - Use conversational language — not formal or stiff
   - Include at least one specific number, stat, or example
   - No emojis, no hashtags — this is spoken word
   - No "Hey everyone" or "What's up" openers — start with the hook immediately
5. The script is read directly by an AI avatar — write exactly what should be spoken

Return ONLY the script text. No stage directions, no formatting, no labels. Just the words to be spoken.`;

  const script = await callGemini(scriptPrompt);
  const trimmedScript = script.trim();

  // # Validate script length — should be 50-200 words
  const wordCount = trimmedScript.split(/\s+/).length;
  if (wordCount < 20) {
    console.error(`[Ambassador] Script too short (${wordCount} words)`);
    return null;
  }

  // # Step 3: Generate the avatar video via HeyGen
  console.log(`[Ambassador] Generating avatar video (${wordCount} words)...`);

  const avatarResult = await generateAvatarVideo(trimmedScript, {
    // # Use default avatar and voice from env vars
    // # 9:16 vertical format for TikTok/Instagram/LinkedIn video
    resolution: "1080p",
  });

  if (!avatarResult) {
    console.error("[Ambassador] HeyGen video generation failed");
    return null;
  }

  // # Step 4: Generate a caption for social posting
  const captionPrompt = `Write a short social media caption for a ${targetPlatform} video. The video is an AI career advisor giving tips about: ${videoTopic}.

Rules:
- ${targetPlatform === "linkedin" ? "2-3 professional sentences" : "1-2 punchy sentences"}
- Include a call-to-action to follow or visit jobpilotai.co
- No emojis
- Do NOT include hashtags (those are added separately)

Return ONLY the caption text.`;

  const caption = await callGemini(captionPrompt);

  // # Step 5: Queue as Content record for admin approval
  const content = await prisma.content.create({
    data: {
      agent: "ambassador",
      platform: targetPlatform,
      contentType: "ambassador_video",
      title: `[Ambassador] ${videoTopic}`,
      body: trimmedScript,
      captionText: caption.trim(),
      mediaPrompt: videoTopic,
      imageUrl: null,
      videoUrl: avatarResult.videoUrl,
      status: "pending",
      notes: JSON.stringify({
        duration: avatarResult.duration,
        wordCount,
        topic: videoTopic,
      }),
    },
  });

  console.log(`[Ambassador] Video queued: ${content.id} (${avatarResult.duration}s)`);

  return {
    contentId: content.id,
    videoUrl: avatarResult.videoUrl,
    script: trimmedScript,
    duration: avatarResult.duration,
  };
}
