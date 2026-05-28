/* # ACT IV — THE FUTURE (Scenes 12-14): Transformation, proof, CTA */

import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C, FONT, SPRING } from "../config";
import { Particles } from "../components/Particles";
import { GlowOrb } from "../components/GlowOrb";
import { StrikethroughText, CinematicText } from "../components/CinematicText";
import { CountUp } from "../components/CountUp";

/* ================================================================
   SCENE 12 — TRANSFORMATION: "Job searching" → "Career engineering"
   ================================================================ */
export function TransformationScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* # "Career engineering." appears after strikethrough */
  const newTextDelay = 60;
  const newEntrance = spring({ frame: Math.max(0, frame - newTextDelay), fps, config: SPRING.gentle });
  const newScale = interpolate(newEntrance, [0, 1], [0.95, 1]);
  const newOpacity = interpolate(newEntrance, [0, 1], [0, 1]);

  return (
    <div style={{
      width: "100%", height: "100%", background: C.black,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 20, position: "relative",
    }}>
      {/* # Old way — strikethrough */}
      <StrikethroughText text="Job searching." delay={10} strikeDelay={25} fontSize={52} />

      {/* # New way — bold with glow */}
      <span style={{
        fontSize: 62, fontWeight: 700, fontFamily: FONT.heading, color: C.white,
        transform: `scale(${newScale})`, opacity: newOpacity,
        textShadow: `0 0 40px ${C.indigo}50, 0 0 80px ${C.indigo}20`,
        letterSpacing: "0.02em",
      }}>
        Career engineering.
      </span>
    </div>
  );
}

/* ================================================================
   SCENE 13 — SOCIAL PROOF: Stats flash with impact
   ================================================================ */
export function SocialProofScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stats = [
    { value: 14000, suffix: "+", label: "resumes optimized", delay: 0 },
    { value: 94, suffix: "%", label: "avg ATS score improvement", delay: 50 },
    { value: 30, suffix: "+", label: "countries worldwide", delay: 100 },
  ];

  /* # Determine which stat is currently showing */
  const statDuration = 50;

  return (
    <div style={{
      width: "100%", height: "100%", background: C.black,
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      <Particles count={25} color={C.indigoLight} />

      {stats.map((stat, i) => {
        const startFrame = stat.delay;
        const endFrame = startFrame + statDuration;
        const isActive = frame >= startFrame && frame < endFrame;
        const localFrame = frame - startFrame;

        if (!isActive && frame < startFrame) return null;
        if (frame >= endFrame + 5) return null;

        /* # Punch-in entrance */
        const entrance = spring({ frame: Math.max(0, localFrame), fps, config: SPRING.snappy });
        const scale = interpolate(entrance, [0, 1], [0.92, 1]);
        const opacity = frame >= endFrame
          ? interpolate(frame - endFrame, [0, 5], [1, 0], { extrapolateRight: "clamp" })
          : interpolate(entrance, [0, 1], [0, 1]);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
              transform: `scale(${scale})`, opacity,
            }}
          >
            {/* # Big number */}
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <CountUp
                target={stat.value}
                suffix={stat.suffix}
                delay={startFrame}
                style={{
                  fontSize: 96, fontWeight: 700, fontFamily: FONT.mono, color: C.white,
                  textShadow: `0 0 30px ${C.indigo}40`,
                }}
              />
            </div>

            {/* # Label */}
            <span style={{
              fontSize: 22, fontWeight: 500, color: C.textSecondary, fontFamily: FONT.heading,
              letterSpacing: "0.03em",
            }}>
              {stat.label}
            </span>

            {/* # Subtle line beneath */}
            <div style={{
              width: 60, height: 2, borderRadius: 1,
              background: `linear-gradient(90deg, transparent, ${C.indigo}, transparent)`,
              marginTop: 4,
            }} />
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================
   SCENE 14 — FINAL BRAND: Logo + tagline + CTA
   ================================================================ */
export function FinalBrandScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* # Staggered entrances: logo → URL → tagline → CTA */
  const logoEntrance = spring({ frame: Math.max(0, frame - 10), fps, config: SPRING.gentle });
  const urlEntrance = spring({ frame: Math.max(0, frame - 40), fps, config: SPRING.gentle });
  const taglineEntrance = spring({ frame: Math.max(0, frame - 65), fps, config: SPRING.gentle });
  const ctaEntrance = spring({ frame: Math.max(0, frame - 90), fps, config: SPRING.smooth });

  /* # Imperceptible zoom pull toward CTA */
  const zoom = interpolate(frame, [0, 210], [1, 1.015], { extrapolateRight: "clamp" });

  /* # CTA button pulse */
  const ctaPulse = 1 + Math.sin(frame * 0.06) * 0.015;

  return (
    <div style={{
      width: "100%", height: "100%", background: C.black,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 0, position: "relative", overflow: "hidden",
      transform: `scale(${zoom})`,
    }}>
      {/* # Background glow — brighter than earlier scenes */}
      <div style={{ position: "absolute", top: "35%", left: "50%", transform: "translate(-50%, -50%)" }}>
        <GlowOrb size={500} fadeIn={20} />
      </div>

      <Particles count={35} color={C.indigoLight} fadeIn={15} />

      {/* # Logo */}
      <div style={{
        width: 96, height: 96, borderRadius: 26,
        background: `linear-gradient(135deg, ${C.indigo}, ${C.purple})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: `scale(${interpolate(logoEntrance, [0, 1], [0.9, 1])})`,
        opacity: interpolate(logoEntrance, [0, 1], [0, 1]),
        boxShadow: `0 0 60px ${C.indigo}40, 0 0 120px ${C.indigo}15`,
      }}>
        <span style={{ color: C.white, fontSize: 48, fontWeight: 700, fontFamily: FONT.heading }}>J</span>
      </div>

      {/* # Brand name */}
      <div style={{
        marginTop: 24, display: "flex", alignItems: "baseline", gap: 10,
        opacity: interpolate(logoEntrance, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(logoEntrance, [0, 1], [10, 0])}px)`,
      }}>
        <span style={{ fontSize: 42, fontWeight: 700, color: C.white, fontFamily: FONT.heading, letterSpacing: "0.02em" }}>
          JobPilot
        </span>
        <span style={{ fontSize: 42, fontWeight: 300, color: C.textSecondary, fontFamily: FONT.heading }}>
          AI
        </span>
      </div>

      {/* # URL */}
      <span style={{
        marginTop: 20, fontSize: 20, color: C.textMuted, fontFamily: FONT.body,
        letterSpacing: "0.05em",
        opacity: interpolate(urlEntrance, [0, 1], [0, 1]),
      }}>
        jobpilotai.co
      </span>

      {/* # Tagline */}
      <span style={{
        marginTop: 28, fontSize: 26, fontWeight: 500, color: C.textSecondary,
        fontFamily: FONT.heading, letterSpacing: "0.02em",
        opacity: interpolate(taglineEntrance, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(taglineEntrance, [0, 1], [8, 0])}px)`,
      }}>
        Your career co-pilot is ready.
      </span>

      {/* # CTA Button */}
      <div style={{
        marginTop: 40,
        padding: "16px 40px", borderRadius: 50,
        background: `linear-gradient(135deg, ${C.indigo}, ${C.purple})`,
        boxShadow: `0 0 30px ${C.indigo}40, 0 4px 20px rgba(0,0,0,0.3)`,
        opacity: interpolate(ctaEntrance, [0, 1], [0, 1]),
        transform: `scale(${interpolate(ctaEntrance, [0, 1], [0.9, 1]) * ctaPulse})`,
      }}>
        <span style={{
          fontSize: 18, fontWeight: 600, color: C.white,
          fontFamily: FONT.heading, letterSpacing: "0.03em",
        }}>
          Get Started — Free
        </span>
      </div>
    </div>
  );
}
