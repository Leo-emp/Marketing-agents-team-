import { useCurrentFrame, interpolate } from "remotion";
import { TEXT_PRIMARY, TEXT_MUTED, ACCENT_1, ACCENT_2 } from "../../lib/visual/brand";
import { TextReveal } from "../components/TextReveal";
import type { ReelSceneData } from "../../lib/visual/types";

export function QuoteScene({ data }: { data: ReelSceneData }) {
  const frame = useCurrentFrame();

  // # Quote mark scales in
  const quoteScale = interpolate(frame, [0, 15], [0.5, 1], { extrapolateRight: "clamp" });
  const quoteOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

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
      {/* # Large gradient quote mark */}
      <div style={{
        fontSize: 140,
        fontWeight: 700,
        lineHeight: 0.6,
        background: `linear-gradient(135deg, ${ACCENT_1}, ${ACCENT_2})`,
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        color: "transparent",
        transform: `scale(${quoteScale})`,
        opacity: quoteOpacity,
        fontFamily: "Geist",
      }}>
        &ldquo;
      </div>

      {/* # Quote text */}
      <TextReveal entrance={data.entrance} delay={10} style={{ marginTop: 24 }}>
        <div style={{
          fontSize: 30,
          fontWeight: 600,
          color: TEXT_PRIMARY,
          textAlign: "center",
          lineHeight: 1.5,
          maxWidth: "90%",
          fontFamily: "Geist",
        }}>
          {data.headline}
        </div>
      </TextReveal>

      {/* # Attribution */}
      {data.subheadline && (
        <TextReveal entrance="fade_in" delay={25}>
          <div style={{
            fontSize: 18,
            color: TEXT_MUTED,
            marginTop: 20,
            fontFamily: "Geist",
          }}>
            -- {data.subheadline}
          </div>
        </TextReveal>
      )}
    </div>
  );
}
