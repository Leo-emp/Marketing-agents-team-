/* # Animated number counter with overshoot */

import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { SPRING } from "../config";

interface CountUpProps {
  target: number;
  suffix?: string;
  prefix?: string;
  delay?: number;
  duration?: number;
  style?: React.CSSProperties;
}

export function CountUp({ target, suffix = "", prefix = "", delay = 0, duration = 20, style }: CountUpProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const adjustedFrame = Math.max(0, frame - delay);

  const progress = spring({ frame: adjustedFrame, fps, config: SPRING.snappy });
  const value = Math.round(interpolate(progress, [0, 1], [0, target]));

  const opacity = interpolate(adjustedFrame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  return (
    <span style={{ opacity, ...style }}>
      {prefix}{value}{suffix}
    </span>
  );
}
