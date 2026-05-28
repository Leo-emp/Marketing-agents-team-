/* # ACT I — THE VOID (Scenes 1-4): Darkness, struggle, the spark of hope */

import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C, FONT, SPRING } from "../config";
import { Particles } from "../components/Particles";
import { GlowOrb } from "../components/GlowOrb";

/* ================================================================
   SCENE 1 — THE VOID: Pure black, blinking cursor
   ================================================================ */
export function VoidScene() {
  const frame = useCurrentFrame();

  /* # Cursor blinks 3 times then fades */
  const blinkCycle = frame % 20;
  const cursorVisible = blinkCycle < 10 ? 1 : 0;
  const cursorFade = interpolate(frame, [60, 80], [1, 0], { extrapolateRight: "clamp" });

  return (
    <div style={{
      width: "100%", height: "100%", background: C.black,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        width: 2, height: 28, background: C.white,
        opacity: cursorVisible * cursorFade,
        boxShadow: `0 0 10px ${C.white}40`,
      }} />
    </div>
  );
}

/* ================================================================
   SCENE 2 — THE WEIGHT: Data fragments floating in void
   ================================================================ */
export function WeightScene() {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const fragments = [
    { text: "We've decided to move forward with other candidates.", x: 15, y: 20, size: 16, delay: 10 },
    { text: "Application #247", x: 65, y: 15, size: 14, delay: 20 },
    { text: "Unfortunately, your application was not selected.", x: 25, y: 45, size: 15, delay: 30 },
    { text: "Application #248", x: 70, y: 55, size: 14, delay: 40 },
    { text: "We will keep your resume on file.", x: 40, y: 70, size: 13, delay: 50 },
    { text: "No response", x: 10, y: 60, size: 18, delay: 15 },
    { text: "Application #249", x: 75, y: 80, size: 14, delay: 60 },
    { text: "Position has been filled.", x: 50, y: 35, size: 15, delay: 25 },
    { text: "Dear applicant,", x: 30, y: 85, size: 12, delay: 45 },
    { text: "Rejected", x: 80, y: 40, size: 20, delay: 35 },
  ];

  /* # Slow push forward */
  const pushScale = interpolate(frame, [0, 150], [1, 1.06], { extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", background: C.black, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${pushScale})` }}>
        {fragments.map((f, i) => {
          const adjustedFrame = Math.max(0, frame - f.delay);
          const opacity = interpolate(adjustedFrame, [0, 20], [0, 0.25 + (i % 3) * 0.08], { extrapolateRight: "clamp" });
          const drift = Math.sin(frame * 0.015 + i * 0.8) * 12;
          const yDrift = Math.cos(frame * 0.01 + i * 1.2) * 8;

          /* # Parallax depth — fragments at different "distances" */
          const depth = 0.5 + (i % 3) * 0.25;
          const parallaxDrift = drift * depth;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${f.x}%`,
                top: `${f.y}%`,
                fontSize: f.size,
                fontFamily: FONT.body,
                color: C.textMuted,
                opacity,
                transform: `translate(${parallaxDrift}px, ${yDrift}px)`,
                filter: depth < 0.7 ? "blur(1.5px)" : "none",
                whiteSpace: "nowrap",
              }}
            >
              {f.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================
   SCENE 3 — BREAKING POINT: Chaos accelerates, then freezes
   ================================================================ */
export function BreakingPointScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* # Phase 1 (0-80): chaos builds — fragments spin and multiply */
  /* # Phase 2 (80-90): FREEZE — everything stops */
  /* # Phase 3 (90-150): "What if the problem... was never you?" */
  const isChaos = frame < 80;
  const isFrozen = frame >= 80 && frame < 95;
  const isQuestion = frame >= 95;

  const chaosIntensity = isChaos ? interpolate(frame, [0, 80], [0.3, 1], { extrapolateRight: "clamp" }) : 1;

  /* # Chaos fragments */
  const chaosFragments = Array.from({ length: 20 }, (_, i) => {
    const angle = (i / 20) * Math.PI * 2;
    const chaosFrame = isChaos ? frame : 80;
    const radius = 50 + chaosFrame * chaosIntensity * 2 + i * 8;
    const spin = isChaos ? chaosFrame * 0.05 * (i % 2 === 0 ? 1 : -1) : 0;
    const x = 50 + Math.cos(angle + spin) * (radius / 10);
    const y = 50 + Math.sin(angle + spin) * (radius / 10);
    return { x, y, rotation: spin * 50, i };
  });

  /* # Question text */
  const q1Opacity = interpolate(frame, [95, 110], [0, 1], { extrapolateRight: "clamp" });
  const q2Opacity = interpolate(frame, [115, 130], [0, 1], { extrapolateRight: "clamp" });

  /* # Frozen fragments fade after question appears */
  const fragmentsFade = interpolate(frame, [95, 120], [1, 0], { extrapolateRight: "clamp" });

  return (
    <div style={{ width: "100%", height: "100%", background: C.black, position: "relative", overflow: "hidden" }}>
      {/* # Chaos / frozen fragments */}
      <div style={{ position: "absolute", inset: 0, opacity: fragmentsFade }}>
        {chaosFragments.map((f) => {
          const opacity = isFrozen ? 0.4 : chaosIntensity * 0.3;
          return (
            <div
              key={f.i}
              style={{
                position: "absolute",
                left: `${Math.min(95, Math.max(5, f.x))}%`,
                top: `${Math.min(95, Math.max(5, f.y))}%`,
                width: 60 + f.i * 3, height: 8,
                background: `${C.textMuted}${Math.round(opacity * 255).toString(16).padStart(2, "0")}`,
                borderRadius: 4,
                transform: `rotate(${f.rotation}deg)`,
              }}
            />
          );
        })}
      </div>

      {/* # The question */}
      {isQuestion && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
        }}>
          <span style={{
            fontSize: 40, fontWeight: 500, fontFamily: FONT.heading, color: C.textSecondary,
            opacity: q1Opacity, textAlign: "center", lineHeight: 1.4,
          }}>
            What if the problem
          </span>
          <span style={{
            fontSize: 48, fontWeight: 700, fontFamily: FONT.heading, color: C.white,
            opacity: q2Opacity, textAlign: "center",
            textShadow: `0 0 30px ${C.indigo}30`,
          }}>
            was never you?
          </span>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   SCENE 4 — THE SPARK: Indigo light emerges from darkness
   ================================================================ */
export function SparkScene() {
  const frame = useCurrentFrame();

  /* # Light grows from nothing */
  const orbSize = interpolate(frame, [0, 120], [20, 350], { extrapolateRight: "clamp" });
  const orbOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });

  /* # Particles begin to appear around the light */
  const particleOpacity = interpolate(frame, [40, 80], [0, 1], { extrapolateRight: "clamp" });

  /* # Slow zoom toward light */
  const zoom = interpolate(frame, [0, 150], [1, 1.03], { extrapolateRight: "clamp" });

  return (
    <div style={{
      width: "100%", height: "100%", background: C.black,
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden", transform: `scale(${zoom})`,
    }}>
      <GlowOrb size={orbSize} fadeIn={30} />

      {/* # Subtle particles emerging */}
      <div style={{ position: "absolute", inset: 0, opacity: particleOpacity }}>
        <Particles count={30} color={C.indigoLight} />
      </div>
    </div>
  );
}
