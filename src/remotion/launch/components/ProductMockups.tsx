/* # Realistic product UI mockups rendered directly in Remotion */

import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C, FONT, SPRING } from "../config";

/* # Score ring — animating circular progress indicator */
function ScoreRing({ score, delay = 0, size = 140, label }: { score: number; delay?: number; size?: number; label?: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const adjustedFrame = Math.max(0, frame - delay);

  const progress = spring({ frame: adjustedFrame, fps, config: { damping: 20, stiffness: 80, mass: 1.5 } });
  const currentScore = Math.round(score * progress);
  const circumference = Math.PI * (size - 12);
  const strokeOffset = circumference * (1 - (currentScore / 100));

  const scoreColor = currentScore >= 80 ? C.green : currentScore >= 60 ? C.amber : C.red;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={(size - 12) / 2} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
        <circle
          cx={size / 2} cy={size / 2} r={(size - 12) / 2}
          fill="none" stroke={scoreColor} strokeWidth={6}
          strokeDasharray={circumference} strokeDashoffset={strokeOffset}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${scoreColor}60)` }}
        />
      </svg>
      <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: size, height: size }}>
        <span style={{ fontSize: size * 0.3, fontWeight: 700, fontFamily: FONT.mono, color: scoreColor }}>{currentScore}</span>
        <span style={{ fontSize: size * 0.1, color: C.textMuted, fontFamily: FONT.body }}>/100</span>
      </div>
      {label && <span style={{ fontSize: 14, color: C.textSecondary, fontFamily: FONT.body }}>{label}</span>}
    </div>
  );
}

/* # Animated progress bar */
function ProgressBar({ label, value, delay = 0, color = C.indigo }: { label: string; value: number; delay?: number; color?: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const adjustedFrame = Math.max(0, frame - delay);
  const progress = spring({ frame: adjustedFrame, fps, config: SPRING.smooth });
  const width = value * progress;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, color: C.textSecondary, fontFamily: FONT.body }}>{label}</span>
        <span style={{ fontSize: 13, color, fontFamily: FONT.mono }}>{Math.round(width)}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${width}%`, borderRadius: 3, background: `linear-gradient(90deg, ${color}, ${C.purple})`, boxShadow: `0 0 12px ${color}40` }} />
      </div>
    </div>
  );
}

/* # Resume bullet point with AI highlight */
function ResumeBullet({ text, isWeak, rewrittenText, delay = 0 }: { text: string; isWeak: boolean; rewrittenText?: string; delay?: number }) {
  const frame = useCurrentFrame();
  const adjustedFrame = Math.max(0, frame - delay);

  const showRewrite = rewrittenText && adjustedFrame > 30;
  const rewriteOpacity = rewrittenText ? interpolate(adjustedFrame, [30, 45], [0, 1], { extrapolateRight: "clamp" }) : 0;
  const originalOpacity = rewrittenText ? interpolate(adjustedFrame, [25, 40], [1, 0.3], { extrapolateRight: "clamp" }) : 1;

  const highlightColor = isWeak ? `${C.red}15` : `${C.green}15`;
  const dotColor = isWeak ? C.red : C.green;

  return (
    <div style={{ position: "relative" }}>
      <div style={{
        display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 12px",
        borderRadius: 8, background: highlightColor, opacity: originalOpacity,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, marginTop: 6, flexShrink: 0 }} />
        <span style={{ fontSize: 14, color: isWeak ? C.textMuted : C.white, fontFamily: FONT.body, lineHeight: 1.5,
          textDecoration: showRewrite ? "line-through" : "none", textDecorationColor: `${C.red}60`,
        }}>{text}</span>
      </div>
      {showRewrite && rewrittenText && (
        <div style={{
          display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 12px",
          borderRadius: 8, background: `${C.green}15`, opacity: rewriteOpacity, marginTop: 4,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, marginTop: 6, flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: C.white, fontFamily: FONT.body, lineHeight: 1.5 }}>{rewrittenText}</span>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   FULL PRODUCT DEMO MOCKUPS
   ================================================================ */

/* # Resume Intelligence demo panel */
export function ResumeDemoPanel({ delay = 0 }: { delay?: number }) {
  const frame = useCurrentFrame();
  const adjustedFrame = Math.max(0, frame - delay);

  return (
    <div style={{ display: "flex", gap: 24, width: "100%", height: "100%", padding: 28 }}>
      {/* # Left: Resume with AI highlights */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: C.white, fontFamily: FONT.heading }}>Resume Analysis</span>
          <div style={{ padding: "4px 12px", borderRadius: 20, background: `${C.indigo}20`, border: `1px solid ${C.indigo}40` }}>
            <span style={{ fontSize: 12, color: C.indigoLight, fontFamily: FONT.body }}>AI Optimizing...</span>
          </div>
        </div>
        <ResumeBullet
          text="Managed team responsibilities and daily operations"
          isWeak={true}
          rewrittenText="Led 12-person engineering team, reducing deployment time by 40% through CI/CD automation"
          delay={delay + 20}
        />
        <ResumeBullet
          text="Helped increase company revenue through sales initiatives"
          isWeak={true}
          rewrittenText="Drove $2.4M revenue growth (18% YoY) by launching AI-powered lead scoring pipeline"
          delay={delay + 35}
        />
        <ResumeBullet
          text="Implemented data-driven strategies to improve user retention by 34%"
          isWeak={false}
          delay={delay + 10}
        />
      </div>

      {/* # Right: Score panel */}
      <div style={{ width: 200, display: "flex", flexDirection: "column", alignItems: "center", gap: 24, justifyContent: "center" }}>
        <ScoreRing score={94} delay={delay + 15} label="ATS Score" />
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
          <ProgressBar label="Keywords" value={92} delay={delay + 25} color={C.green} />
          <ProgressBar label="Structure" value={88} delay={delay + 30} />
          <ProgressBar label="Impact" value={96} delay={delay + 35} color={C.green} />
        </div>
      </div>
    </div>
  );
}

/* # Job Matching demo panel */
export function JobMatchingPanel({ delay = 0 }: { delay?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const jobs = [
    { title: "Senior Product Manager", company: "Stripe", match: 94, salary: "$185K-$220K", location: "Remote", tags: ["AI/ML", "B2B SaaS", "Payments"] },
    { title: "Head of Growth", company: "Linear", match: 91, salary: "$170K-$210K", location: "San Francisco", tags: ["PLG", "Developer Tools", "Strategy"] },
    { title: "Product Lead, AI Platform", company: "Vercel", match: 87, salary: "$175K-$215K", location: "Remote", tags: ["AI", "Infrastructure", "React"] },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 28, width: "100%", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: C.white, fontFamily: FONT.heading }}>Smart Job Matches</span>
        <span style={{ fontSize: 13, color: C.textMuted, fontFamily: FONT.body }}>247 jobs analyzed</span>
      </div>

      {jobs.map((job, i) => {
        const cardDelay = delay + i * 12;
        const adjustedFrame = Math.max(0, frame - cardDelay);
        const entrance = spring({ frame: adjustedFrame, fps, config: SPRING.snappy });
        const slideX = interpolate(entrance, [0, 1], [40, 0]);
        const opacity = interpolate(entrance, [0, 1], [0, 1]);
        const matchColor = job.match >= 90 ? C.green : C.amber;

        return (
          <div
            key={i}
            style={{
              display: "flex", alignItems: "center", gap: 16,
              padding: "16px 20px", borderRadius: 14,
              background: i === 0 ? `${C.indigo}10` : "rgba(255,255,255,0.03)",
              border: `1px solid ${i === 0 ? C.indigo + "30" : "rgba(255,255,255,0.05)"}`,
              transform: `translateX(${slideX}px)`, opacity,
            }}
          >
            {/* # Company initial */}
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `linear-gradient(135deg, ${C.indigo}30, ${C.purple}30)`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: C.indigoLight, fontFamily: FONT.heading }}>{job.company[0]}</span>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: C.white, fontFamily: FONT.heading }}>{job.title}</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 13, color: C.textSecondary, fontFamily: FONT.body }}>{job.company}</span>
                <span style={{ fontSize: 11, color: C.textMuted }}>·</span>
                <span style={{ fontSize: 13, color: C.textMuted, fontFamily: FONT.body }}>{job.location}</span>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                {job.tags.map((tag, t) => (
                  <span key={t} style={{
                    fontSize: 10, color: C.textSecondary, fontFamily: FONT.body,
                    padding: "2px 8px", borderRadius: 10, background: "rgba(255,255,255,0.05)",
                  }}>{tag}</span>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: matchColor, fontFamily: FONT.mono }}>{job.match}%</span>
              <span style={{ fontSize: 12, color: C.textMuted, fontFamily: FONT.body }}>{job.salary}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* # Interview Prep demo panel */
export function InterviewPrepPanel({ delay = 0 }: { delay?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const adjustedFrame = Math.max(0, frame - delay);

  const questionOpacity = interpolate(adjustedFrame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const answerProgress = interpolate(adjustedFrame, [20, 80], [0, 1], { extrapolateRight: "clamp" });
  const feedbackEntrance = spring({ frame: Math.max(0, adjustedFrame - 90), fps, config: SPRING.smooth });

  const answerText = "In my previous role at a Series B startup, I led the migration from a monolithic architecture to microservices. The biggest challenge was maintaining uptime during the transition. I implemented a strangler fig pattern, which allowed us to gradually route traffic to new services while keeping the legacy system running. Within 6 months, we reduced deployment time from 4 hours to 12 minutes and improved system reliability by 99.9%.";
  const charsToShow = Math.floor(answerText.length * answerProgress);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: 28, width: "100%", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: C.white, fontFamily: FONT.heading }}>Mock Interview</span>
        <div style={{ display: "flex", gap: 8 }}>
          {["Communication", "Structure", "Depth"].map((label, i) => {
            const score = [8, 9, 8][i];
            const scoreOpacity = interpolate(feedbackEntrance, [0, 1], [0, 1]);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, opacity: scoreOpacity }}>
                <span style={{ fontSize: 11, color: C.textMuted, fontFamily: FONT.body }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.green, fontFamily: FONT.mono }}>{score}/10</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* # AI Question */}
      <div style={{
        padding: "16px 20px", borderRadius: 14, background: `${C.indigo}10`,
        border: `1px solid ${C.indigo}20`, opacity: questionOpacity,
      }}>
        <span style={{ fontSize: 12, color: C.indigoLight, fontFamily: FONT.body, fontWeight: 600 }}>AI Interviewer</span>
        <p style={{ fontSize: 15, color: C.white, fontFamily: FONT.body, lineHeight: 1.6, marginTop: 8 }}>
          Tell me about a time you led a complex technical migration. What was your approach and what were the results?
        </p>
      </div>

      {/* # User response (typing) */}
      <div style={{ padding: "16px 20px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", flex: 1 }}>
        <span style={{ fontSize: 12, color: C.textMuted, fontFamily: FONT.body, fontWeight: 600 }}>Your Response</span>
        <p style={{ fontSize: 14, color: C.textSecondary, fontFamily: FONT.body, lineHeight: 1.7, marginTop: 8 }}>
          {answerText.slice(0, charsToShow)}
          {charsToShow < answerText.length && (
            <span style={{ opacity: frame % 15 < 8 ? 1 : 0, color: C.indigo }}>|</span>
          )}
        </p>
      </div>

      {/* # AI Feedback */}
      <div style={{
        padding: "12px 20px", borderRadius: 14, background: `${C.green}08`,
        border: `1px solid ${C.green}20`,
        opacity: interpolate(feedbackEntrance, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(feedbackEntrance, [0, 1], [10, 0])}px)`,
      }}>
        <span style={{ fontSize: 13, color: C.green, fontFamily: FONT.body }}>
          Strong STAR framework usage. Specific metrics make this answer compelling. Consider adding the team size for more context.
        </span>
      </div>
    </div>
  );
}
