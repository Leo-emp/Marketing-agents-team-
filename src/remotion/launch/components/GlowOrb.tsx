/* # Pulsing indigo glow orb — the brand light source */

import { useCurrentFrame, interpolate } from "remotion";
import { C } from "../config";

interface GlowOrbProps {
  size?: number;
  fadeIn?: number;
  color1?: string;
  color2?: string;
}

export function GlowOrb({ size = 300, fadeIn = 30, color1 = C.indigo, color2 = C.purple }: GlowOrbProps) {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, fadeIn], [0, 1], { extrapolateRight: "clamp" });
  const breathe = 1 + Math.sin(frame * 0.06) * 0.08;
  const innerGlow = 0.4 + Math.sin(frame * 0.04) * 0.15;

  return (
    <div
      style={{
        width: size * breathe,
        height: size * breathe,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color1}${Math.round(innerGlow * 255).toString(16).padStart(2, "0")} 0%, ${color2}20 40%, transparent 70%)`,
        filter: `blur(${size * 0.3}px)`,
        opacity,
        position: "absolute",
      }}
    />
  );
}
