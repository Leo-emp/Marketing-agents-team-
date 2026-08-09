/* # Generates the launch video voiceover using ElevenLabs and saves to public/ */

import { generateVoiceover } from "../../lib/elevenlabs";
import * as fs from "fs";
import * as path from "path";

const LAUNCH_SCRIPT = `You've sent hundreds of applications.

And heard nothing back.

What if the problem... was never you?

Introducing JobPilot AI.

Your career. Co-piloted.

One intelligent platform. Every tool you need. From resume, to interview, to offer.

AI that reads your resume the way recruiters do. Then makes it impossible to ignore.

Thousands of jobs. Ranked by one metric. How perfectly they fit you.

Practice with AI that coaches like a human. Feedback that makes you unshakable.

Not another tool. Your entire career operating system.

Stop searching. Start engineering your future.

JobPilot AI. Your career co-pilot is ready.`;

async function main() {
  console.log("[launch-vo] Generating voiceover...");

  const result = await generateVoiceover(LAUNCH_SCRIPT, undefined, "male_professional");

  if (!result) {
    console.error("[launch-vo] Failed to generate voiceover. Check ELEVENLABS_API_KEY.");
    process.exit(1);
  }

  /* # Save as MP3 file in public/ for Remotion to access */
  const base64Data = result.audioUrl.replace("data:audio/mpeg;base64,", "");
  const buffer = Buffer.from(base64Data, "base64");

  const outDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(outDir, "launch-voiceover.mp3");
  fs.writeFileSync(outPath, buffer);

  console.log(`[launch-vo] Saved to ${outPath} (${(buffer.length / 1024).toFixed(0)} KB)`);
  console.log(`[launch-vo] Estimated duration: ${result.durationEstimate}s`);
  console.log("[launch-vo] Use in Remotion Studio: set voiceoverUrl to '/launch-voiceover.mp3'");
}

main().catch(console.error);
