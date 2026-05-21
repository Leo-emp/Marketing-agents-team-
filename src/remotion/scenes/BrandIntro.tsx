import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { ACCENT_1, ACCENT_2, TEXT_SECONDARY, BRAND_NAME, BRAND_URL } from "../../lib/visual/brand";

export function BrandIntro() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12, mass: 0.5 } });
  const nameOpacity = interpolate(frame, [15, 30], [0, 1], { extrapolateRight: "clamp" });
  const nameY = interpolate(frame, [15, 35], [20, 0], { extrapolateRight: "clamp" });
  const urlOpacity = interpolate(frame, [30, 45], [0, 1], { extrapolateRight: "clamp" });
  const lineWidth = interpolate(frame, [25, 50], [0, 120], { extrapolateRight: "clamp" });

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "100%",
      position: "relative",
    }}>
      {/* # Animated logo mark */}
      <div style={{
        width: 96,
        height: 96,
        borderRadius: 28,
        background: `linear-gradient(135deg, ${ACCENT_1}, ${ACCENT_2})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${logoScale})`,
        boxShadow: `0 0 60px ${ACCENT_1}40`,
      }}>
        <span style={{ color: "white", fontSize: 48, fontWeight: 700, fontFamily: "Geist" }}>J</span>
      </div>

      {/* # Brand name */}
      <div style={{
        marginTop: 32,
        fontSize: 42,
        fontWeight: 700,
        color: "white",
        fontFamily: "Geist",
        opacity: nameOpacity,
        transform: `translateY(${nameY}px)`,
        letterSpacing: "-0.02em",
      }}>
        {BRAND_NAME}
      </div>

      {/* # Gradient line */}
      <div style={{
        marginTop: 20,
        height: 3,
        borderRadius: 2,
        width: lineWidth,
        background: `linear-gradient(90deg, ${ACCENT_1}, ${ACCENT_2})`,
      }} />

      {/* # URL */}
      <div style={{
        marginTop: 16,
        fontSize: 18,
        color: TEXT_SECONDARY,
        fontFamily: "Geist",
        opacity: urlOpacity,
      }}>
        {BRAND_URL}
      </div>
    </div>
  );
}
