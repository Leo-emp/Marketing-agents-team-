import React from "react";
import { Composition } from "remotion";
import { ReelComposition } from "./ReelComposition";
import type { ReelSceneData } from "../lib/visual/types";

// # Default test scenes for Remotion preview
const TEST_SCENES: ReelSceneData[] = [
  { sceneType: "brand_intro", headline: "", entrance: "fade_in", exit: "fade_out", durationInFrames: 60 },
  { sceneType: "hook", headline: "I reviewed 200 resumes last month. 80% were rejected in under 6 seconds.", entrance: "slide_up", exit: "fade_out", durationInFrames: 90 },
  { sceneType: "stat", headline: "", stat: { value: "75%", label: "of resumes are rejected by ATS before a human ever sees them" }, entrance: "scale_in", exit: "fade_out", durationInFrames: 90 },
  { sceneType: "tip", headline: "Lead every bullet point with a metric, not a verb", body: "Recruiters scan for 6 seconds. Numbers stop the scroll.", entrance: "slide_up", exit: "fade_out", durationInFrames: 120 },
  { sceneType: "list", headline: "What ATS actually filters for", bullets: ["Exact keyword matches from the job description", "Consistent formatting without tables or columns", "Standard section headers the parser expects"], entrance: "slide_left", exit: "fade_out", durationInFrames: 120 },
  { sceneType: "quote", headline: "The best resume is the one the algorithm never rejects", subheadline: "Senior Recruiter, Fortune 500", entrance: "fade_in", exit: "fade_out", durationInFrames: 90 },
  { sceneType: "cta", headline: "Stop guessing. Start landing interviews.", body: "Let AI optimize your resume for the algorithm.", entrance: "slide_up", exit: "none", durationInFrames: 90 },
];

const TOTAL_FRAMES = TEST_SCENES.reduce((sum, s) => sum + s.durationInFrames, 0);

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="JobPilotReel"
        component={ReelComposition as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ scenes: TEST_SCENES }}
        calculateMetadata={({ props }) => {
          const duration = (props.scenes as ReelSceneData[]).reduce((sum, s) => sum + s.durationInFrames, 0);
          return { durationInFrames: duration };
        }}
      />
    </>
  );
}
