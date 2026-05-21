import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { BG, ACCENT_1, ACCENT_2, ACCENT_3 } from "../../lib/visual/brand";

export function AnimatedBackground() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // # Slow gradient rotation over the full video duration
  const angle = interpolate(frame, [0, durationInFrames], [0, 360]);

  // # Pulsing glow opacity
  const glowOpacity = interpolate(
    frame % 120,
    [0, 60, 120],
    [0.03, 0.08, 0.03]
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: BG,
        overflow: "hidden",
      }}
    >
      {/* # Rotating gradient orb */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          width: "800px",
          height: "800px",
          borderRadius: "50%",
          background: `conic-gradient(from ${angle}deg, ${ACCENT_1}${Math.round(glowOpacity * 255).toString(16).padStart(2, "0")}, ${ACCENT_2}${Math.round(glowOpacity * 255).toString(16).padStart(2, "0")}, ${ACCENT_3}${Math.round(glowOpacity * 255).toString(16).padStart(2, "0")}, ${ACCENT_1}${Math.round(glowOpacity * 255).toString(16).padStart(2, "0")})`,
          transform: "translate(-50%, -50%)",
          filter: "blur(120px)",
        }}
      />
    </div>
  );
}
