/* # Cinematic text reveal — Apple-style scale + fade + glow */

import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C, FONT, SPRING } from "../config";

interface CinematicTextProps {
  text: string;
  delay?: number;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  glow?: boolean;
  style?: React.CSSProperties;
}

export function CinematicText({
  text,
  delay = 0,
  fontSize = 64,
  fontWeight = 700,
  color = C.white,
  glow = false,
  style,
}: CinematicTextProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const adjustedFrame = Math.max(0, frame - delay);

  const entrance = spring({ frame: adjustedFrame, fps, config: SPRING.gentle });
  const scale = interpolate(entrance, [0, 1], [0.97, 1]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  return (
    <div
      style={{
        fontSize,
        fontWeight,
        fontFamily: FONT.heading,
        color,
        letterSpacing: "0.02em",
        textAlign: "center",
        transform: `scale(${scale})`,
        opacity,
        textShadow: glow ? `0 0 40px ${C.indigo}50, 0 0 80px ${C.indigo}20` : "none",
        lineHeight: 1.2,
        ...style,
      }}
    >
      {text}
    </div>
  );
}

/* # Word-by-word reveal — each word fades in sequentially */
interface WordByWordProps {
  text: string;
  delay?: number;
  wordGap?: number;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  glow?: boolean;
  style?: React.CSSProperties;
}

export function WordByWord({
  text,
  delay = 0,
  wordGap = 6,
  fontSize = 64,
  fontWeight = 700,
  color = C.white,
  glow = false,
  style,
}: WordByWordProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: fontSize * 0.3,
        ...style,
      }}
    >
      {words.map((word, i) => {
        const wordDelay = delay + i * wordGap;
        const adjustedFrame = Math.max(0, frame - wordDelay);
        const entrance = spring({ frame: adjustedFrame, fps, config: SPRING.gentle });
        const scale = interpolate(entrance, [0, 1], [0.95, 1]);
        const opacity = interpolate(entrance, [0, 1], [0, 1]);

        return (
          <span
            key={i}
            style={{
              fontSize,
              fontWeight,
              fontFamily: FONT.heading,
              color,
              transform: `scale(${scale})`,
              opacity,
              textShadow: glow ? `0 0 40px ${C.indigo}50` : "none",
              lineHeight: 1.2,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}

/* # Strikethrough text animation */
interface StrikethroughTextProps {
  text: string;
  delay?: number;
  strikeDelay?: number;
  fontSize?: number;
  style?: React.CSSProperties;
}

export function StrikethroughText({
  text,
  delay = 0,
  strikeDelay = 20,
  fontSize = 56,
  style,
}: StrikethroughTextProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const adjustedFrame = Math.max(0, frame - delay);

  const textEntrance = spring({ frame: adjustedFrame, fps, config: SPRING.gentle });
  const textOpacity = interpolate(textEntrance, [0, 1], [0, 1]);

  const strikeFrame = Math.max(0, adjustedFrame - strikeDelay);
  const strikeProgress = interpolate(strikeFrame, [0, 15], [0, 100], { extrapolateRight: "clamp" });

  /* # Fade out original text as strikethrough completes */
  const textFade = interpolate(strikeFrame, [10, 25], [1, 0.35], { extrapolateRight: "clamp" });

  return (
    <div style={{ position: "relative", display: "inline-block", ...style }}>
      <span
        style={{
          fontSize,
          fontWeight: 400,
          fontFamily: FONT.heading,
          color: C.textSecondary,
          opacity: textOpacity * textFade,
          lineHeight: 1.2,
        }}
      >
        {text}
      </span>
      {/* # Animated strikethrough line */}
      <div
        style={{
          position: "absolute",
          top: "52%",
          left: 0,
          height: 2,
          width: `${strikeProgress}%`,
          background: `linear-gradient(90deg, ${C.indigo}, ${C.purple})`,
          boxShadow: `0 0 10px ${C.indigo}80`,
        }}
      />
    </div>
  );
}
