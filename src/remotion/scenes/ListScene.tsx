import { TEXT_PRIMARY, TEXT_SECONDARY, ACCENT_1 } from "../../lib/visual/brand";
import { TextReveal } from "../components/TextReveal";
import type { ReelSceneData } from "../../lib/visual/types";

export function ListScene({ data }: { data: ReelSceneData }) {
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
      {/* # Section title */}
      <TextReveal entrance={data.entrance} delay={0}>
        <div style={{
          fontSize: 36,
          fontWeight: 700,
          color: TEXT_PRIMARY,
          lineHeight: 1.3,
          marginBottom: 36,
          fontFamily: "Geist",
        }}>
          {data.headline}
        </div>
      </TextReveal>

      {/* # Bullet list — each item appears with staggered delay */}
      {data.bullets && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {data.bullets.map((bullet, i) => (
            <TextReveal key={i} entrance="slide_left" delay={12 + i * 8}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <span style={{
                  color: accent,
                  fontSize: 22,
                  fontWeight: 700,
                  flexShrink: 0,
                  marginTop: 2,
                  fontFamily: "Geist",
                }}>
                  &rarr;
                </span>
                <span style={{
                  color: TEXT_SECONDARY,
                  fontSize: 22,
                  lineHeight: 1.5,
                  fontFamily: "Geist",
                }}>
                  {bullet}
                </span>
              </div>
            </TextReveal>
          ))}
        </div>
      )}
    </div>
  );
}
