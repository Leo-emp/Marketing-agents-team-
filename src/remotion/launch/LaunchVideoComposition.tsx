/* # JobPilot AI — Apple-style cinematic launch video composition */

import { Series, Audio } from "remotion";
import { SCENES, C, FONT } from "./config";

/* # Act I — The Void */
import { VoidScene, WeightScene, BreakingPointScene, SparkScene } from "./scenes/ActOne";
/* # Act II — The Reveal */
import { BrandRevealScene, TaglineScene, ProductRevealScene } from "./scenes/ActTwo";
/* # Act III — The Power */
import { ResumeIntelScene, JobMatchingScene, InterviewPrepScene, EcosystemScene } from "./scenes/ActThree";
/* # Act IV — The Future */
import { TransformationScene, SocialProofScene, FinalBrandScene } from "./scenes/ActFour";

export interface LaunchVideoProps {
  voiceoverUrl?: string;
  musicUrl?: string;
}

/* # Cross-fade wrapper — adds fade-in and fade-out to each scene */
function SceneFade({ children, fadeIn = 8, fadeOut = 8, duration }: {
  children: React.ReactNode;
  fadeIn?: number;
  fadeOut?: number;
  duration: number;
}) {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {children}
    </div>
  );
}

export function LaunchVideoComposition({ voiceoverUrl, musicUrl }: LaunchVideoProps) {
  return (
    <div style={{
      width: 1920, height: 1080,
      background: C.black,
      fontFamily: FONT.heading,
      position: "relative",
      overflow: "hidden",
    }}>
      <Series>
        {/* ======== ACT I — THE VOID ======== */}

        {/* # Scene 1: Pure black, blinking cursor */}
        <Series.Sequence durationInFrames={SCENES.void}>
          <VoidScene />
        </Series.Sequence>

        {/* # Scene 2: Rejection fragments drift in the void */}
        <Series.Sequence durationInFrames={SCENES.weight}>
          <WeightScene />
        </Series.Sequence>

        {/* # Scene 3: Chaos builds then freezes — "was never you?" */}
        <Series.Sequence durationInFrames={SCENES.breakingPoint}>
          <BreakingPointScene />
        </Series.Sequence>

        {/* # Scene 4: Indigo light spark emerges from darkness */}
        <Series.Sequence durationInFrames={SCENES.spark}>
          <SparkScene />
        </Series.Sequence>

        {/* ======== ACT II — THE REVEAL ======== */}

        {/* # Scene 5: JobPilot AI logo materializes from the light */}
        <Series.Sequence durationInFrames={SCENES.brandReveal}>
          <BrandRevealScene />
        </Series.Sequence>

        {/* # Scene 6: "Your career. Co-piloted." */}
        <Series.Sequence durationInFrames={SCENES.tagline}>
          <TaglineScene />
        </Series.Sequence>

        {/* # Scene 7: Dashboard floats into 3D space with resume demo */}
        <Series.Sequence durationInFrames={SCENES.productReveal}>
          <ProductRevealScene />
        </Series.Sequence>

        {/* ======== ACT III — THE POWER ======== */}

        {/* # Scene 8: Push into resume AI — scores climbing, bullets rewriting */}
        <Series.Sequence durationInFrames={SCENES.resumeIntel}>
          <ResumeIntelScene />
        </Series.Sequence>

        {/* # Scene 9: Job matching — cards sort by match percentage */}
        <Series.Sequence durationInFrames={SCENES.jobMatching}>
          <JobMatchingScene />
        </Series.Sequence>

        {/* # Scene 10: Interview prep — warm human moment with AI coaching */}
        <Series.Sequence durationInFrames={SCENES.interviewPrep}>
          <InterviewPrepScene />
        </Series.Sequence>

        {/* # Scene 11: Full ecosystem constellation — all features orbiting */}
        <Series.Sequence durationInFrames={SCENES.ecosystem}>
          <EcosystemScene />
        </Series.Sequence>

        {/* ======== ACT IV — THE FUTURE ======== */}

        {/* # Scene 12: "Job searching" struck through → "Career engineering" */}
        <Series.Sequence durationInFrames={SCENES.transformation}>
          <TransformationScene />
        </Series.Sequence>

        {/* # Scene 13: Stats flash — 14,000+ resumes, 94% improvement, 30+ countries */}
        <Series.Sequence durationInFrames={SCENES.socialProof}>
          <SocialProofScene />
        </Series.Sequence>

        {/* # Scene 14: Final brand — logo, tagline, CTA with glow */}
        <Series.Sequence durationInFrames={SCENES.finalBrand}>
          <FinalBrandScene />
        </Series.Sequence>
      </Series>

      {/* # Voiceover audio track */}
      {voiceoverUrl && (
        <Audio src={voiceoverUrl} volume={0.95} />
      )}

      {/* # Background music — low volume behind voiceover */}
      {musicUrl && (
        <Audio src={musicUrl} volume={voiceoverUrl ? 0.12 : 0.35} />
      )}
    </div>
  );
}
