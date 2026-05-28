/* # ACT II — THE REVEAL (Scenes 5-7): Brand reveal, tagline, product emergence */

import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C, FONT, SPRING } from "../config";
import { Particles } from "../components/Particles";
import { GlowOrb } from "../components/GlowOrb";
import { CinematicText } from "../components/CinematicText";
import { GlassmorphicPanel } from "../components/GlassmorphicPanel";
import { ResumeDemoPanel } from "../components/ProductMockups";

/* ================================================================
   SCENE 5 — BRAND REVEAL: Logo materializes from the light
   ================================================================ */
export function BrandRevealScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* # Logo builds particle by particle */
  const logoEntrance = spring({ frame, fps, config: { damping: 15, stiffness: 100, mass: 1.5 } });
  const logoScale = interpolate(logoEntrance, [0, 1], [0.8, 1]);
  const logoOpacity = interpolate(logoEntrance, [0, 1], [0, 1]);

  /* # Brand name fades in after logo */
  const nameEntrance = spring({ frame: Math.max(0, frame - 25), fps, config: SPRING.gentle });
  const nameOpacity = interpolate(nameEntrance, [0, 1], [0, 1]);
  const nameY = interpolate(nameEntrance, [0, 1], [15, 0]);

  /* # Horizontal light line */
  const lineWidth = interpolate(frame, [40, 80], [0, 200], { extrapolateRight: "clamp" });
  const lineOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" });

  /* # Micro orbit */
  const orbit = Math.sin(frame * 0.01) * 0.3;

  return (
    <div style={{
      width: "100%", height: "100%", background: C.black,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
      transform: `rotate(${orbit}deg)`,
    }}>
      {/* # Background glow */}
      <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)" }}>
        <GlowOrb size={400} fadeIn={10} />
      </div>

      <Particles count={40} color={C.indigoLight} fadeIn={20} />

      {/* # Logo mark */}
      <div style={{
        width: 108, height: 108, borderRadius: 30,
        background: `linear-gradient(135deg, ${C.indigo}, ${C.purple})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: `scale(${logoScale})`, opacity: logoOpacity,
        boxShadow: `0 0 60px ${C.indigo}50, 0 0 120px ${C.indigo}20`,
      }}>
        <span style={{ color: C.white, fontSize: 54, fontWeight: 700, fontFamily: FONT.heading }}>J</span>
      </div>

      {/* # Brand name */}
      <div style={{
        marginTop: 28, display: "flex", alignItems: "baseline", gap: 10,
        opacity: nameOpacity, transform: `translateY(${nameY}px)`,
      }}>
        <span style={{ fontSize: 46, fontWeight: 700, color: C.white, fontFamily: FONT.heading, letterSpacing: "0.02em" }}>
          JobPilot
        </span>
        <span style={{ fontSize: 46, fontWeight: 300, color: C.textSecondary, fontFamily: FONT.heading, letterSpacing: "0.02em" }}>
          AI
        </span>
      </div>

      {/* # Light line */}
      <div style={{
        marginTop: 24, height: 2, width: lineWidth, opacity: lineOpacity,
        background: `linear-gradient(90deg, transparent, ${C.indigo}, ${C.purple}, transparent)`,
        borderRadius: 1,
      }} />
    </div>
  );
}

/* ================================================================
   SCENE 6 — TAGLINE: "Your career. Co-piloted."
   ================================================================ */
export function TaglineScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* # "Your career." appears first */
  const line1Entrance = spring({ frame: Math.max(0, frame - 5), fps, config: SPRING.gentle });
  const line1Scale = interpolate(line1Entrance, [0, 1], [0.97, 1]);
  const line1Opacity = interpolate(line1Entrance, [0, 1], [0, 1]);

  /* # "Co-piloted." appears after */
  const line2Entrance = spring({ frame: Math.max(0, frame - 25), fps, config: SPRING.gentle });
  const line2Scale = interpolate(line2Entrance, [0, 1], [0.97, 1]);
  const line2Opacity = interpolate(line2Entrance, [0, 1], [0, 1]);

  return (
    <div style={{
      width: "100%", height: "100%", background: C.black,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
      position: "relative",
    }}>
      <span style={{
        fontSize: 62, fontWeight: 600, fontFamily: FONT.heading, color: C.white,
        letterSpacing: "0.03em", transform: `scale(${line1Scale})`, opacity: line1Opacity,
      }}>
        Your career.
      </span>
      <span style={{
        fontSize: 62, fontWeight: 600, fontFamily: FONT.heading, color: C.white,
        letterSpacing: "0.03em", transform: `scale(${line2Scale})`, opacity: line2Opacity,
        textShadow: `0 0 60px ${C.indigo}40, 0 0 120px ${C.indigo}15`,
      }}>
        Co-piloted.
      </span>
    </div>
  );
}

/* ================================================================
   SCENE 7 — PRODUCT EMERGENCE: Dashboard floats into 3D space
   ================================================================ */
export function ProductRevealScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* # Main panel flies in from below with 3D rotation */
  const panelEntrance = spring({ frame: Math.max(0, frame - 15), fps, config: SPRING.smooth });
  const panelScale = interpolate(panelEntrance, [0, 1], [0.85, 1]);
  const panelY = interpolate(panelEntrance, [0, 1], [80, 0]);
  const panelOpacity = interpolate(panelEntrance, [0, 1], [0, 1]);
  const panelRotateY = interpolate(panelEntrance, [0, 1], [15, 8]);
  const panelRotateX = interpolate(panelEntrance, [0, 1], [8, 3]);

  /* # Second panel (resume) appears behind at deeper Z */
  const secondPanel = spring({ frame: Math.max(0, frame - 50), fps, config: SPRING.smooth });
  const secondOpacity = interpolate(secondPanel, [0, 1], [0, 0.6]);
  const secondScale = interpolate(secondPanel, [0, 1], [0.85, 0.88]);

  /* # Slow orbit */
  const orbit = interpolate(frame, [0, 270], [-3, 3], { extrapolateRight: "clamp" });

  return (
    <div style={{
      width: "100%", height: "100%", background: C.black,
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
      perspective: "1200px",
    }}>
      <Particles count={30} color={C.indigoLight} fadeIn={30} />

      {/* # Background glow beneath panels */}
      <div style={{
        position: "absolute", top: "55%", left: "50%",
        width: 600, height: 300, borderRadius: "50%",
        background: `radial-gradient(ellipse, ${C.indigo}15 0%, transparent 70%)`,
        transform: "translate(-50%, -50%)",
        filter: "blur(40px)",
      }} />

      {/* # Second panel (background) */}
      <div style={{
        position: "absolute",
        transform: `scale(${secondScale}) translateZ(-100px) rotateY(${panelRotateY + 5 + orbit}deg)`,
        opacity: secondOpacity,
      }}>
        <GlassmorphicPanel width={750} height={450} delay={50} rotateY={0}>
          <div style={{ padding: 24, opacity: 0.5 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} style={{ height: 12, borderRadius: 6, background: "rgba(255,255,255,0.04)", width: `${70 + i * 5}%` }} />
              ))}
            </div>
          </div>
        </GlassmorphicPanel>
      </div>

      {/* # Main dashboard panel */}
      <div style={{
        transform: `scale(${panelScale}) translateY(${panelY}px) rotateY(${panelRotateY + orbit}deg) rotateX(${panelRotateX}deg)`,
        opacity: panelOpacity,
      }}>
        <GlassmorphicPanel width={820} height={480} delay={15}>
          <ResumeDemoPanel delay={30} />
        </GlassmorphicPanel>
      </div>
    </div>
  );
}
