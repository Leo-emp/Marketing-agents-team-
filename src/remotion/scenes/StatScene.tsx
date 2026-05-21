import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, ACCENT_1, ACCENT_3 } from "../../lib/visual/brand";
import { TextReveal } from "../components/TextReveal";
import type { ReelSceneData } from "../../lib/visual/types";

export function StatScene({ data }: { data: ReelSceneData }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // # Animate the stat number counting up
  const progress = spring({ frame, fps, config: { damping: 30, mass: 1.2 } });

  // # Parse numeric value from stat for counter animation
  const statValue = data.stat?.value || data.headline;
  const numericMatch = statValue.match(/[\d.]+/);
  const targetNum = numericMatch ? parseFloat(numericMatch[0]) : 0;
  const currentNum = Math.round(targetNum * progress);
  const displayValue = numericMatch
    ? statValue.replace(numericMatch[0], currentNum.toString())
    : statValue;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: "100%",
      padding: "60px 56px",
      position: "relative",
    }}>
      {/* # Large stat with gradient */}
      <TextReveal entrance="scale_in" delay={0}>
        <div style={{
          fontSize: 108,
          fontWeight: 700,
          background: `linear-gradient(135deg, ${ACCENT_1}, ${ACCENT_3})`,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          letterSpacing: "-0.03em",
          fontFamily: "Geist",
          textAlign: "center",
        }}>
          {displayValue}
        </div>
      </TextReveal>

      {/* # Stat label */}
      {data.stat?.label && (
        <TextReveal entrance="fade_in" delay={15}>
          <div style={{
            fontSize: 22,
            color: TEXT_SECONDARY,
            textAlign: "center",
            maxWidth: "80%",
            marginTop: 16,
            fontFamily: "Geist",
          }}>
            {data.stat.label}
          </div>
        </TextReveal>
      )}

      {/* # Body text below stat */}
      {data.body && (
        <TextReveal entrance="fade_in" delay={25}>
          <div style={{
            fontSize: 18,
            color: TEXT_MUTED,
            textAlign: "center",
            maxWidth: "85%",
            marginTop: 20,
            lineHeight: 1.5,
            fontFamily: "Geist",
          }}>
            {data.body}
          </div>
        </TextReveal>
      )}
    </div>
  );
}
