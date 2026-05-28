/* # ACT III — THE POWER (Scenes 8-11): Feature demos + ecosystem constellation */

import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C, FONT, SPRING } from "../config";
import { Particles } from "../components/Particles";
import { GlowOrb } from "../components/GlowOrb";
import { GlassmorphicPanel } from "../components/GlassmorphicPanel";
import { ResumeDemoPanel, JobMatchingPanel, InterviewPrepPanel } from "../components/ProductMockups";

/* ================================================================
   SCENE 8 — RESUME INTELLIGENCE: Push into the resume AI demo
   ================================================================ */
export function ResumeIntelScene() {
  const frame = useCurrentFrame();

  /* # Zoom into the panel — starts at overview, pushes into detail */
  const zoom = interpolate(frame, [0, 210], [1, 1.35], { extrapolateRight: "clamp" });
  const panY = interpolate(frame, [0, 210], [0, -30], { extrapolateRight: "clamp" });

  /* # Subtle vignette intensifies as we push in */
  const vignetteOpacity = interpolate(frame, [60, 210], [0, 0.4], { extrapolateRight: "clamp" });

  return (
    <div style={{
      width: "100%", height: "100%", background: C.black,
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      <Particles count={20} color={C.indigoLight} />

      <div style={{
        transform: `scale(${zoom}) translateY(${panY}px)`,
        transition: "none",
      }}>
        <GlassmorphicPanel width={860} height={500} delay={0}>
          <ResumeDemoPanel delay={10} />
        </GlassmorphicPanel>
      </div>

      {/* # Vignette overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse at center, transparent 40%, ${C.black} 100%)`,
        opacity: vignetteOpacity,
      }} />
    </div>
  );
}

/* ================================================================
   SCENE 9 — JOB MATCHING: Cards sort and rank themselves
   ================================================================ */
export function JobMatchingScene() {
  const frame = useCurrentFrame();

  /* # Slight pull-back then track right */
  const pullBack = interpolate(frame, [0, 30], [1.05, 1], { extrapolateRight: "clamp" });
  const trackX = interpolate(frame, [30, 180], [0, -15], { extrapolateRight: "clamp" });

  /* # Neural network flash at frame 60-75 */
  const neuralOpacity = interpolate(frame, [55, 60, 70, 80], [0, 0.12, 0.12, 0], { extrapolateRight: "clamp" });

  return (
    <div style={{
      width: "100%", height: "100%", background: C.black,
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      <Particles count={25} color={C.indigoLight} />

      {/* # Neural network visualization (brief flash) */}
      <div style={{ position: "absolute", inset: 0, opacity: neuralOpacity }}>
        <svg width="100%" height="100%" style={{ position: "absolute" }}>
          {Array.from({ length: 12 }, (_, i) => {
            const x1 = 200 + (i % 4) * 200;
            const y1 = 300 + Math.floor(i / 4) * 200;
            const x2 = 300 + ((i + 2) % 4) * 200;
            const y2 = 400 + Math.floor((i + 1) / 4) * 200;
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={C.indigo} strokeWidth={0.5} opacity={0.3} />
            );
          })}
          {Array.from({ length: 8 }, (_, i) => {
            const x = 250 + (i % 4) * 180;
            const y = 350 + Math.floor(i / 4) * 220;
            return (
              <circle key={i} cx={x} cy={y} r={4}
                fill={C.indigo} opacity={0.5} />
            );
          })}
        </svg>
      </div>

      <div style={{
        transform: `scale(${pullBack}) translateX(${trackX}px)`,
      }}>
        <GlassmorphicPanel width={820} height={480} delay={0}>
          <JobMatchingPanel delay={8} />
        </GlassmorphicPanel>
      </div>
    </div>
  );
}

/* ================================================================
   SCENE 10 — INTERVIEW PREP: Warm, human moment with AI coaching
   ================================================================ */
export function InterviewPrepScene() {
  const frame = useCurrentFrame();

  /* # Gentle float — breathing animation */
  const floatY = Math.sin(frame * 0.04) * 4;
  const floatRotate = Math.sin(frame * 0.02) * 0.3;

  return (
    <div style={{
      width: "100%", height: "100%", background: C.black,
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      {/* # Warmer ambient — amber tint for human moment */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: 500, height: 500, borderRadius: "50%",
        background: `radial-gradient(circle, ${C.amber}08 0%, transparent 70%)`,
        transform: "translate(-50%, -50%)", filter: "blur(60px)",
      }} />

      <Particles count={20} color={C.indigoLight} />

      <div style={{ transform: `translateY(${floatY}px) rotate(${floatRotate}deg)` }}>
        <GlassmorphicPanel width={820} height={520} delay={0} glowColor={C.amber}>
          <InterviewPrepPanel delay={5} />
        </GlassmorphicPanel>
      </div>
    </div>
  );
}

/* ================================================================
   SCENE 11 — ECOSYSTEM: All features float as a constellation
   ================================================================ */
export function EcosystemScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const features = [
    { label: "Resume AI", icon: "R", x: 0, y: -180, delay: 0 },
    { label: "Job Matching", icon: "M", x: 200, y: -80, delay: 8 },
    { label: "Interview Prep", icon: "I", x: 200, y: 100, delay: 16 },
    { label: "Cover Letters", icon: "C", x: 0, y: 180, delay: 24 },
    { label: "Application Tracker", icon: "T", x: -200, y: 100, delay: 32 },
    { label: "LinkedIn Optimizer", icon: "L", x: -200, y: -80, delay: 40 },
  ];

  /* # Wide orbit */
  const orbitAngle = interpolate(frame, [0, 120], [0, 8], { extrapolateRight: "clamp" });
  const pullBack = interpolate(frame, [0, 40], [1.1, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{
      width: "100%", height: "100%", background: C.black,
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
      transform: `scale(${pullBack}) rotate(${orbitAngle * 0.1}deg)`,
    }}>
      <Particles count={40} color={C.indigoLight} fadeIn={10} />

      {/* # Central orb */}
      <div style={{ position: "absolute" }}>
        <GlowOrb size={200} fadeIn={10} />
      </div>

      {/* # Center logo */}
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: `linear-gradient(135deg, ${C.indigo}, ${C.purple})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 0 40px ${C.indigo}50`,
        zIndex: 10,
      }}>
        <span style={{ color: C.white, fontSize: 36, fontWeight: 700, fontFamily: FONT.heading }}>J</span>
      </div>

      {/* # Feature constellation */}
      {features.map((feat, i) => {
        const entrance = spring({ frame: Math.max(0, frame - feat.delay), fps, config: SPRING.smooth });
        const scale = interpolate(entrance, [0, 1], [0.5, 1]);
        const opacity = interpolate(entrance, [0, 1], [0, 1]);

        /* # Subtle floating per card */
        const float = Math.sin(frame * 0.03 + i * 1.2) * 5;

        return (
          <div key={i}>
            {/* # Connection line to center */}
            <svg style={{ position: "absolute", top: "50%", left: "50%", overflow: "visible", zIndex: 1, pointerEvents: "none" }}>
              <line x1={0} y1={0} x2={feat.x} y2={feat.y}
                stroke={C.indigo} strokeWidth={1} opacity={opacity * 0.15}
                strokeDasharray="4 4"
              />
              {/* # Traveling light particle */}
              <circle
                cx={feat.x * ((frame * 0.01 + i * 0.2) % 1)}
                cy={feat.y * ((frame * 0.01 + i * 0.2) % 1)}
                r={2} fill={C.indigoLight} opacity={opacity * 0.6}
              />
            </svg>

            {/* # Feature card */}
            <div style={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: `translate(calc(-50% + ${feat.x}px), calc(-50% + ${feat.y + float}px)) scale(${scale})`,
              opacity, zIndex: 5,
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "14px 22px", borderRadius: 16,
                background: C.panelBg, border: `1px solid ${C.panelBorder}`,
                boxShadow: `0 10px 30px rgba(0,0,0,0.4), 0 0 20px ${C.indigo}10`,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `linear-gradient(135deg, ${C.indigo}30, ${C.purple}30)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: C.indigoLight, fontFamily: FONT.heading }}>{feat.icon}</span>
                </div>
                <span style={{ fontSize: 15, fontWeight: 600, color: C.white, fontFamily: FONT.heading, whiteSpace: "nowrap" }}>
                  {feat.label}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
