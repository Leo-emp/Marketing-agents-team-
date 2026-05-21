import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { TEXT_PRIMARY, TEXT_SECONDARY, BG_CARD, BORDER, ACCENT_1, ACCENT_2, BRAND_URL } from "../../lib/visual/brand";
import { TextReveal } from "../components/TextReveal";
import type { ReelSceneData } from "../../lib/visual/types";

export function CTAScene({ data }: { data: ReelSceneData }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardScale = spring({ frame, fps, config: { damping: 14, mass: 0.6 } });
  // # Pulsing glow on the CTA button
  const pulseOpacity = interpolate(frame % 60, [0, 30, 60], [0.3, 0.7, 0.3]);

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
      {/* # CTA card */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        padding: "56px 48px",
        borderRadius: 24,
        background: BG_CARD,
        border: `1px solid ${BORDER}`,
        width: "85%",
        transform: `scale(${cardScale})`,
        boxShadow: `0 0 40px ${ACCENT_1}15`,
      }}>
        {/* # Brand logo */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: `linear-gradient(135deg, ${ACCENT_1}, ${ACCENT_2})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <span style={{ color: "white", fontSize: 28, fontWeight: 700, fontFamily: "Geist" }}>J</span>
        </div>

        {/* # CTA headline */}
        <TextReveal entrance="slide_up" delay={10}>
          <div style={{
            fontSize: 30,
            fontWeight: 700,
            color: TEXT_PRIMARY,
            textAlign: "center",
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
              fontSize: 20,
              color: TEXT_SECONDARY,
              textAlign: "center",
              lineHeight: 1.5,
              fontFamily: "Geist",
            }}>
              {data.body}
            </div>
          </TextReveal>
        )}

        {/* # URL button with pulse */}
        <TextReveal entrance="scale_in" delay={22}>
          <div style={{
            padding: "16px 36px",
            borderRadius: 14,
            background: `linear-gradient(135deg, ${ACCENT_1}, ${ACCENT_2})`,
            color: "white",
            fontSize: 20,
            fontWeight: 600,
            fontFamily: "Geist",
            boxShadow: `0 0 30px ${ACCENT_1}${Math.round(pulseOpacity * 255).toString(16).padStart(2, "0")}`,
          }}>
            {BRAND_URL}
          </div>
        </TextReveal>
      </div>
    </div>
  );
}
