/* # Reusable glassmorphic floating panel — the core UI container */

import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { C, SPRING } from "../config";

interface GlassmorphicPanelProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
  delay?: number;
  rotateY?: number;
  glowColor?: string;
  style?: React.CSSProperties;
}

export function GlassmorphicPanel({
  children,
  width = 800,
  height = 500,
  delay = 0,
  rotateY = 0,
  glowColor = C.indigo,
  style,
}: GlassmorphicPanelProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const adjustedFrame = Math.max(0, frame - delay);

  const entrance = spring({ frame: adjustedFrame, fps, config: SPRING.smooth });

  const scale = interpolate(entrance, [0, 1], [0.9, 1]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const yOffset = interpolate(entrance, [0, 1], [30, 0]);
  const rotY = interpolate(entrance, [0, 1], [rotateY + 5, rotateY]);

  /* # Subtle breathing glow */
  const glowIntensity = 0.15 + Math.sin(frame * 0.04) * 0.05;

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 20,
        background: C.panelBg,
        border: `1px solid ${C.panelBorder}`,
        boxShadow: `0 25px 50px rgba(0,0,0,0.5), 0 0 80px ${glowColor}${Math.round(glowIntensity * 255).toString(16).padStart(2, "0")}`,
        transform: `scale(${scale}) translateY(${yOffset}px) perspective(1200px) rotateY(${rotY}deg)`,
        opacity,
        overflow: "hidden",
        position: "relative",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
