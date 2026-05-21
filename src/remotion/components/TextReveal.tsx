import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import type { SceneEntrance } from "../../lib/visual/types";

interface TextRevealProps {
  children: React.ReactNode;
  entrance: SceneEntrance;
  delay?: number;
  style?: React.CSSProperties;
}

export function TextReveal({ children, entrance, delay = 0, style }: TextRevealProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const adjustedFrame = Math.max(0, frame - delay);

  let opacity = 1;
  let transform = "none";

  switch (entrance) {
    case "fade_in": {
      opacity = interpolate(adjustedFrame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
      break;
    }
    case "slide_up": {
      const progress = spring({ frame: adjustedFrame, fps, config: { damping: 20, mass: 0.8 } });
      opacity = progress;
      transform = `translateY(${interpolate(progress, [0, 1], [40, 0])}px)`;
      break;
    }
    case "slide_left": {
      const progress = spring({ frame: adjustedFrame, fps, config: { damping: 20, mass: 0.8 } });
      opacity = progress;
      transform = `translateX(${interpolate(progress, [0, 1], [60, 0])}px)`;
      break;
    }
    case "scale_in": {
      const progress = spring({ frame: adjustedFrame, fps, config: { damping: 15, mass: 0.6 } });
      opacity = progress;
      transform = `scale(${interpolate(progress, [0, 1], [0.8, 1])})`;
      break;
    }
    case "typewriter": {
      opacity = 1;
      break;
    }
  }

  return (
    <div style={{ opacity, transform, ...style }}>
      {children}
    </div>
  );
}

// # Typewriter wrapper: reveals text character by character
export function TypewriterText({ text, delay = 0, style }: { text: string; delay?: number; style?: React.CSSProperties }) {
  const frame = useCurrentFrame();
  const adjustedFrame = Math.max(0, frame - delay);
  const charsToShow = Math.min(text.length, Math.floor(adjustedFrame / 2));

  return (
    <span style={style}>
      {text.slice(0, charsToShow)}
      {charsToShow < text.length && (
        <span style={{ opacity: frame % 10 < 5 ? 1 : 0 }}>|</span>
      )}
    </span>
  );
}
