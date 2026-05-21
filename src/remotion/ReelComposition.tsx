import { Series, useVideoConfig } from "remotion";
import { AnimatedBackground } from "./components/AnimatedBackground";
import { BrandIntro } from "./scenes/BrandIntro";
import { HookScene } from "./scenes/HookScene";
import { TipScene } from "./scenes/TipScene";
import { StatScene } from "./scenes/StatScene";
import { ListScene } from "./scenes/ListScene";
import { QuoteScene } from "./scenes/QuoteScene";
import { CTAScene } from "./scenes/CTAScene";
import { BRAND_NAME, BRAND_URL, TEXT_MUTED, TEXT_SECONDARY } from "../lib/visual/brand";
import type { ReelCompositionProps } from "./types";
import type { ReelSceneData } from "../lib/visual/types";

// # Maps scene type to the correct React component
function SceneRenderer({ data }: { data: ReelSceneData }) {
  switch (data.sceneType) {
    case "brand_intro": return <BrandIntro />;
    case "hook":        return <HookScene data={data} />;
    case "tip":         return <TipScene data={data} />;
    case "stat":        return <StatScene data={data} />;
    case "list":        return <ListScene data={data} />;
    case "quote":       return <QuoteScene data={data} />;
    case "cta":         return <CTAScene data={data} />;
    default:            return <HookScene data={data} />;
  }
}

export function ReelComposition({ scenes }: ReelCompositionProps) {
  const { width, height } = useVideoConfig();

  return (
    <div style={{
      width,
      height,
      position: "relative",
      overflow: "hidden",
      fontFamily: "Geist, sans-serif",
    }}>
      {/* # Animated gradient background behind everything */}
      <AnimatedBackground />

      {/* # Brand header overlay */}
      <div style={{
        position: "absolute",
        top: 40,
        left: 48,
        right: 48,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{ color: "white", fontSize: 14, fontWeight: 700 }}>J</span>
          </div>
          <span style={{ color: TEXT_SECONDARY, fontSize: 15, fontWeight: 600 }}>{BRAND_NAME}</span>
        </div>
      </div>

      {/* # Scene sequence */}
      <div style={{ position: "relative", width: "100%", height: "100%", zIndex: 5 }}>
        <Series>
          {scenes.map((scene, i) => (
            <Series.Sequence key={i} durationInFrames={scene.durationInFrames}>
              <SceneRenderer data={scene} />
            </Series.Sequence>
          ))}
        </Series>
      </div>

      {/* # Brand footer overlay */}
      <div style={{
        position: "absolute",
        bottom: 40,
        left: 48,
        right: 48,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 10,
      }}>
        <span style={{ color: TEXT_MUTED, fontSize: 14 }}>{BRAND_URL}</span>
        <div style={{
          width: 60,
          height: 3,
          borderRadius: 2,
          background: "linear-gradient(90deg, #6366f1, #a855f7)",
        }} />
      </div>
    </div>
  );
}
