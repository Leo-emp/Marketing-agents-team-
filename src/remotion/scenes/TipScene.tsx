import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { TEXT_PRIMARY, TEXT_SECONDARY, ACCENT_1 } from "../../lib/visual/brand";
import { TextReveal } from "../components/TextReveal";
import type { ReelSceneData } from "../../lib/visual/types";

export function TipScene({ data }: { data: ReelSceneData }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // # Animated border height
  const borderHeight = spring({ frame, fps, config: { damping: 20, mass: 1 } });
  const accent = data.accentColor || ACCENT_1;

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
      <div style={{ display: "flex", position: "relative" }}>
        {/* # Animated left accent border */}
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 4,
          height: `${borderHeight * 100}%`,
          background: accent,
          borderRadius: 2,
        }} />

        <div style={{ paddingLeft: 32, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* # Tip number badge */}
          <TextReveal entrance="scale_in" delay={0}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: `${accent}22`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: accent,
              fontSize: 22,
              fontWeight: 700,
              fontFamily: "Geist",
            }}>
              {data.sceneType === "tip" ? "#" : ""}
            </div>
          </TextReveal>

          {/* # Headline */}
          <TextReveal entrance={data.entrance} delay={8}>
            <div style={{
              fontSize: 38,
              fontWeight: 700,
              color: TEXT_PRIMARY,
              lineHeight: 1.3,
              fontFamily: "Geist",
            }}>
              {data.headline}
            </div>
          </TextReveal>

          {/* # Body */}
          {data.body && (
            <TextReveal entrance="fade_in" delay={18}>
              <div style={{
                fontSize: 22,
                color: TEXT_SECONDARY,
                lineHeight: 1.6,
                fontFamily: "Geist",
              }}>
                {data.body}
              </div>
            </TextReveal>
          )}
        </div>
      </div>
    </div>
  );
}
