/* # Ambient floating particles — subtle background atmosphere */

import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C } from "../config";

interface ParticleData {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  phase: number;
}

/* # Deterministic pseudo-random for Remotion (must be frame-reproducible) */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function generateParticles(count: number): ParticleData[] {
  return Array.from({ length: count }, (_, i) => ({
    x: seededRandom(i * 7 + 1) * 100,
    y: seededRandom(i * 13 + 2) * 100,
    size: 1 + seededRandom(i * 3 + 3) * 2.5,
    speed: 0.15 + seededRandom(i * 5 + 4) * 0.35,
    opacity: 0.08 + seededRandom(i * 11 + 5) * 0.22,
    phase: seededRandom(i * 17 + 6) * Math.PI * 2,
  }));
}

interface ParticlesProps {
  count?: number;
  color?: string;
  fadeIn?: number;
}

export function Particles({ count = 50, color = C.white, fadeIn = 0 }: ParticlesProps) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const particles = generateParticles(count);

  const globalOpacity = fadeIn > 0
    ? interpolate(frame, [0, fadeIn], [0, 1], { extrapolateRight: "clamp" })
    : 1;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: globalOpacity }}>
      {particles.map((p, i) => {
        const drift = Math.sin(frame * 0.02 * p.speed + p.phase) * 20;
        const yDrift = Math.cos(frame * 0.015 * p.speed + p.phase * 0.7) * 15;
        const sizeBreathing = p.size + Math.sin(frame * 0.03 + p.phase) * 0.5;
        const opacityPulse = p.opacity + Math.sin(frame * 0.025 + p.phase) * 0.05;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: sizeBreathing,
              height: sizeBreathing,
              borderRadius: "50%",
              backgroundColor: color,
              opacity: opacityPulse,
              transform: `translate(${drift}px, ${yDrift}px)`,
            }}
          />
        );
      })}
    </div>
  );
}
