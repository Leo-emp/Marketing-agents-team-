import { interpolate, useCurrentFrame } from "remotion";
import { TEXT_PRIMARY, TEXT_SECONDARY, ACCENT_1, ACCENT_2 } from "../../lib/visual/brand";
import { TextReveal } from "../components/TextReveal";
import type { ReelSceneData } from "../../lib/visual/types";

export function HookScene({ data }: { data: ReelSceneData }) {
  const frame = useCurrentFrame();
  const barWidth = interpolate(frame, [0, 20], [0, 80], { extrapolateRight: "clamp" });

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      width: "100%",
      height: "100%",
      padding: "60px 56px",
      position: "relative",
    }}>
      {/* # Gradient accent bar */}
      <TextReveal entrance="fade_in" delay={0}>
        <div style={{
          width: barWidth,
          height: 5,
          borderRadius: 3,
          background: `linear-gradient(90deg, ${data.accentColor || ACCENT_1}, ${ACCENT_2})`,
          marginBottom: 32,
        }} />
      </TextReveal>

      {/* # Main headline */}
      <TextReveal entrance={data.entrance} delay={5}>
        <div style={{
          fontSize: 52,
          fontWeight: 700,
          color: TEXT_PRIMARY,
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
          fontFamily: "Geist",
        }}>
          {data.headline}
        </div>
      </TextReveal>

      {/* # Subheadline */}
      {data.subheadline && (
        <TextReveal entrance="fade_in" delay={20}>
          <div style={{
            fontSize: 24,
            color: TEXT_SECONDARY,
            lineHeight: 1.5,
            marginTop: 24,
            fontFamily: "Geist",
          }}>
            {data.subheadline}
          </div>
        </TextReveal>
      )}
    </div>
  );
}
