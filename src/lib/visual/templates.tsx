/* ============================================================
   VISUAL TEMPLATES - Satori-Compatible Brand Templates
   ============================================================
   React components rendered by @vercel/og (Satori) into PNG.
   All styles must be inline, flexbox-only (no grid, no CSS vars).
   Brand theme: dark bg, indigo-to-purple gradients, clean type.
   ============================================================ */

import type { SlideData } from "./types";
import { BG, BG_CARD, BORDER, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, ACCENT_1, ACCENT_2, ACCENT_3, BRAND_NAME, BRAND_URL } from "./brand";

/* ---- Shared Components ---- */

/* # Wrapper that renders a stock photo background with dark overlay when available */
/* # Falls back to solid dark background when no photo is provided */
function SlideBackground({ data, width, height, children }: { data: SlideData; width: number; height: number; children: React.ReactNode }) {
  const hasPhoto = !!data.backgroundImageUrl;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      width: `${width}px`,
      height: `${height}px`,
      padding: "48px",
      fontFamily: "Geist",
      position: "relative",
      overflow: "hidden",
      background: BG,
    }}>
      {/* # Stock photo background layer */}
      {hasPhoto && (
        <img
          src={data.backgroundImageUrl}
          alt=""
          width={width}
          height={height}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: `${width}px`,
            height: `${height}px`,
            objectFit: "cover",
          }}
        />
      )}
      {/* # Dark overlay for text readability on photos */}
      {hasPhoto && (
        <div style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          width: `${width}px`,
          height: `${height}px`,
          background: "linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.72) 100%)",
        }} />
      )}
      {/* # Content layer (sits above the overlay) */}
      {children}
    </div>
  );
}

/* # Brand header bar at the top of every slide */
function SlideHeader({ slideNumber, totalSlides }: { slideNumber?: number; totalSlides?: number }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      paddingBottom: "24px",
    }}>
      {/* # Brand mark */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          background: `linear-gradient(135deg, ${ACCENT_1}, ${ACCENT_2})`,
        }}>
          <div style={{ display: "flex", color: "white", fontSize: "16px", fontWeight: 700 }}>J</div>
        </div>
        <div style={{ display: "flex", color: TEXT_SECONDARY, fontSize: "16px", fontWeight: 600 }}>{BRAND_NAME}</div>
      </div>
      {/* # Slide counter */}
      {slideNumber !== undefined && totalSlides !== undefined && (
        <div style={{
          display: "flex",
          color: TEXT_MUTED,
          fontSize: "14px",
        }}>
          {slideNumber}/{totalSlides}
        </div>
      )}
    </div>
  );
}

/* # Brand footer at the bottom of every slide */
function SlideFooter() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      paddingTop: "24px",
    }}>
      <div style={{ display: "flex", color: TEXT_MUTED, fontSize: "14px" }}>{BRAND_URL}</div>
      {/* # Gradient accent line */}
      <div style={{
        display: "flex",
        width: "60px",
        height: "3px",
        borderRadius: "2px",
        background: `linear-gradient(90deg, ${ACCENT_1}, ${ACCENT_2})`,
      }} />
    </div>
  );
}

/* ---- Template Components ---- */

/* # Hero: Full-width headline with gradient accent. First slide or single image. */
export function HeroSlide({ data, width, height }: { data: SlideData; width: number; height: number }) {
  return (
    <SlideBackground data={data} width={width} height={height}>
      <SlideHeader slideNumber={data.slideNumber} totalSlides={data.totalSlides} />
      <div style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        justifyContent: "center",
        gap: "24px",
      }}>
        {/* # Gradient accent bar */}
        <div style={{
          display: "flex",
          width: "80px",
          height: "4px",
          borderRadius: "2px",
          background: `linear-gradient(90deg, ${data.accentColor || ACCENT_1}, ${ACCENT_2})`,
        }} />
        {/* # Main headline */}
        <div style={{
          display: "flex",
          color: TEXT_PRIMARY,
          fontSize: width >= 1200 ? "48px" : "42px",
          fontWeight: 700,
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
        }}>
          {data.headline}
        </div>
        {/* # Subheadline */}
        {data.subheadline && (
          <div style={{
            display: "flex",
            color: TEXT_SECONDARY,
            fontSize: "22px",
            lineHeight: 1.5,
          }}>
            {data.subheadline}
          </div>
        )}
      </div>
      <SlideFooter />
    </SlideBackground>
  );
}

/* # StatCard: Large stat number with gradient color and label */
export function StatCard({ data, width, height }: { data: SlideData; width: number; height: number }) {
  return (
    <SlideBackground data={data} width={width} height={height}>
      <SlideHeader slideNumber={data.slideNumber} totalSlides={data.totalSlides} />
      <div style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: "16px",
      }}>
        {/* # Large stat with gradient text */}
        {data.stat && (
          <>
            <div style={{
              display: "flex",
              fontSize: "96px",
              fontWeight: 700,
              background: `linear-gradient(135deg, ${ACCENT_1}, ${ACCENT_3})`,
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: "-0.03em",
            }}>
              {data.stat.value}
            </div>
            <div style={{
              display: "flex",
              color: TEXT_SECONDARY,
              fontSize: "20px",
              textAlign: "center",
              maxWidth: "80%",
            }}>
              {data.stat.label}
            </div>
          </>
        )}
        {/* # Headline below stat */}
        {data.headline && !data.stat && (
          <div style={{
            display: "flex",
            color: TEXT_PRIMARY,
            fontSize: "36px",
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.3,
          }}>
            {data.headline}
          </div>
        )}
        {data.body && (
          <div style={{
            display: "flex",
            color: TEXT_MUTED,
            fontSize: "18px",
            textAlign: "center",
            maxWidth: "85%",
            lineHeight: 1.5,
          }}>
            {data.body}
          </div>
        )}
      </div>
      <SlideFooter />
    </SlideBackground>
  );
}

/* # TipSlide: Numbered tip with accent border, headline, and body */
export function TipSlide({ data, width, height }: { data: SlideData; width: number; height: number }) {
  return (
    <SlideBackground data={data} width={width} height={height}>
      <SlideHeader slideNumber={data.slideNumber} totalSlides={data.totalSlides} />
      <div style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        justifyContent: "center",
        gap: "20px",
      }}>
        {/* # Tip container with left accent border */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          borderLeft: `4px solid ${data.accentColor || ACCENT_1}`,
          paddingLeft: "28px",
        }}>
          {/* # Tip number badge */}
          {data.slideNumber && (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: `${ACCENT_1}22`,
              color: ACCENT_1,
              fontSize: "18px",
              fontWeight: 700,
            }}>
              {data.slideNumber}
            </div>
          )}
          {/* # Tip headline */}
          <div style={{
            display: "flex",
            color: TEXT_PRIMARY,
            fontSize: "32px",
            fontWeight: 700,
            lineHeight: 1.3,
          }}>
            {data.headline}
          </div>
          {/* # Tip body */}
          {data.body && (
            <div style={{
              display: "flex",
              color: TEXT_SECONDARY,
              fontSize: "20px",
              lineHeight: 1.6,
            }}>
              {data.body}
            </div>
          )}
        </div>
      </div>
      <SlideFooter />
    </SlideBackground>
  );
}

/* # QuoteCard: Large quote with attribution */
export function QuoteCard({ data, width, height }: { data: SlideData; width: number; height: number }) {
  return (
    <SlideBackground data={data} width={width} height={height}>
      <SlideHeader slideNumber={data.slideNumber} totalSlides={data.totalSlides} />
      <div style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: "24px",
        padding: "0 24px",
      }}>
        {/* # Large quote mark */}
        <div style={{
          display: "flex",
          fontSize: "120px",
          fontWeight: 700,
          lineHeight: 0.6,
          background: `linear-gradient(135deg, ${ACCENT_1}, ${ACCENT_2})`,
          backgroundClip: "text",
          color: "transparent",
        }}>
          &ldquo;
        </div>
        {/* # Quote text */}
        <div style={{
          display: "flex",
          color: TEXT_PRIMARY,
          fontSize: "28px",
          fontWeight: 600,
          textAlign: "center",
          lineHeight: 1.5,
          maxWidth: "90%",
        }}>
          {data.headline}
        </div>
        {/* # Attribution */}
        {data.subheadline && (
          <div style={{
            display: "flex",
            color: TEXT_MUTED,
            fontSize: "16px",
          }}>
            -- {data.subheadline}
          </div>
        )}
      </div>
      <SlideFooter />
    </SlideBackground>
  );
}

/* # ListSlide: Title + bullet items with indicators */
export function ListSlide({ data, width, height }: { data: SlideData; width: number; height: number }) {
  return (
    <SlideBackground data={data} width={width} height={height}>
      <SlideHeader slideNumber={data.slideNumber} totalSlides={data.totalSlides} />
      <div style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        justifyContent: "center",
        gap: "28px",
      }}>
        {/* # Section title */}
        <div style={{
          display: "flex",
          color: TEXT_PRIMARY,
          fontSize: "32px",
          fontWeight: 700,
          lineHeight: 1.3,
        }}>
          {data.headline}
        </div>
        {/* # Bullet list */}
        {data.bullets && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}>
            {data.bullets.map((bullet, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "14px",
              }}>
                {/* # Arrow indicator */}
                <div style={{
                  display: "flex",
                  color: ACCENT_1,
                  fontSize: "20px",
                  fontWeight: 700,
                  flexShrink: 0,
                  marginTop: "2px",
                }}>
                  &rarr;
                </div>
                <div style={{
                  display: "flex",
                  color: TEXT_SECONDARY,
                  fontSize: "20px",
                  lineHeight: 1.5,
                }}>
                  {bullet}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <SlideFooter />
    </SlideBackground>
  );
}

/* # CTASlide: Call-to-action with gradient background */
export function CTASlide({ data, width, height }: { data: SlideData; width: number; height: number }) {
  return (
    <SlideBackground data={data} width={width} height={height}>
      <SlideHeader slideNumber={data.slideNumber} totalSlides={data.totalSlides} />
      <div style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: "28px",
      }}>
        {/* # CTA card with subtle gradient border */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          padding: "48px 40px",
          borderRadius: "20px",
          background: BG_CARD,
          border: `1px solid ${BORDER}`,
          width: "85%",
        }}>
          {/* # Brand logo */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: `linear-gradient(135deg, ${ACCENT_1}, ${ACCENT_2})`,
          }}>
            <div style={{ display: "flex", color: "white", fontSize: "24px", fontWeight: 700 }}>J</div>
          </div>
          {/* # CTA headline */}
          <div style={{
            display: "flex",
            color: TEXT_PRIMARY,
            fontSize: "28px",
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.3,
          }}>
            {data.headline}
          </div>
          {/* # CTA body */}
          {data.body && (
            <div style={{
              display: "flex",
              color: TEXT_SECONDARY,
              fontSize: "18px",
              textAlign: "center",
              lineHeight: 1.5,
            }}>
              {data.body}
            </div>
          )}
          {/* # URL button */}
          <div style={{
            display: "flex",
            padding: "14px 32px",
            borderRadius: "12px",
            background: `linear-gradient(135deg, ${ACCENT_1}, ${ACCENT_2})`,
            color: "white",
            fontSize: "18px",
            fontWeight: 600,
          }}>
            {BRAND_URL}
          </div>
        </div>
      </div>
      <SlideFooter />
    </SlideBackground>
  );
}

/* ---- New Templates ---- */

/* # BeforeAfter: Side-by-side comparison (bad vs good) */
export function BeforeAfterSlide({ data, width, height }: { data: SlideData; width: number; height: number }) {
  return (
    <SlideBackground data={data} width={width} height={height}>
      <SlideHeader slideNumber={data.slideNumber} totalSlides={data.totalSlides} />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: "24px" }}>
        {data.headline && (
          <div style={{ display: "flex", color: TEXT_PRIMARY, fontSize: "28px", fontWeight: 700, textAlign: "center", lineHeight: 1.3, justifyContent: "center" }}>{data.headline}</div>
        )}
        <div style={{ display: "flex", gap: "16px", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "28px", borderRadius: "16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", gap: "12px" }}>
            <div style={{ display: "flex", color: "#ef4444", fontSize: "14px", fontWeight: 700, letterSpacing: "0.05em" }}>BEFORE</div>
            <div style={{ display: "flex", color: TEXT_SECONDARY, fontSize: "18px", lineHeight: 1.5 }}>{data.beforeText || ""}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "28px", borderRadius: "16px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", gap: "12px" }}>
            <div style={{ display: "flex", color: "#22c55e", fontSize: "14px", fontWeight: 700, letterSpacing: "0.05em" }}>AFTER</div>
            <div style={{ display: "flex", color: TEXT_PRIMARY, fontSize: "18px", lineHeight: 1.5, fontWeight: 500 }}>{data.afterText || ""}</div>
          </div>
        </div>
      </div>
      <SlideFooter />
    </SlideBackground>
  );
}

/* # Screenshot: Fake tweet/DM/notification card */
export function ScreenshotSlide({ data, width, height }: { data: SlideData; width: number; height: number }) {
  return (
    <SlideBackground data={data} width={width} height={height}>
      <SlideHeader slideNumber={data.slideNumber} totalSlides={data.totalSlides} />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", alignItems: "center", gap: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", width: "85%", padding: "28px", borderRadius: "16px", background: BG_CARD, border: `1px solid ${BORDER}`, gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", width: "40px", height: "40px", borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT_1}, ${ACCENT_2})`, alignItems: "center", justifyContent: "center" }}>
              <div style={{ display: "flex", color: "white", fontSize: "16px", fontWeight: 700 }}>{(data.screenshotAuthor || "U")[0]}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <div style={{ display: "flex", color: TEXT_PRIMARY, fontSize: "16px", fontWeight: 600 }}>{data.screenshotAuthor || "User"}</div>
              <div style={{ display: "flex", color: TEXT_MUTED, fontSize: "13px" }}>{data.screenshotType === "dm" ? "Direct Message" : data.screenshotType === "email" ? "Email" : "Post"}</div>
            </div>
          </div>
          <div style={{ display: "flex", color: TEXT_PRIMARY, fontSize: "20px", lineHeight: 1.6 }}>{data.headline}</div>
        </div>
        {data.subheadline && (
          <div style={{ display: "flex", color: TEXT_MUTED, fontSize: "16px", textAlign: "center" }}>{data.subheadline}</div>
        )}
      </div>
      <SlideFooter />
    </SlideBackground>
  );
}

/* # DataChart: Horizontal bar chart */
export function DataChartSlide({ data, width, height }: { data: SlideData; width: number; height: number }) {
  const bars = data.bars || [];
  return (
    <SlideBackground data={data} width={width} height={height}>
      <SlideHeader slideNumber={data.slideNumber} totalSlides={data.totalSlides} />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: "24px" }}>
        {data.headline && (
          <div style={{ display: "flex", color: TEXT_PRIMARY, fontSize: "28px", fontWeight: 700, lineHeight: 1.3 }}>{data.headline}</div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {bars.map((bar, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex", color: TEXT_SECONDARY, fontSize: "16px" }}>{bar.label}</div>
                <div style={{ display: "flex", color: TEXT_PRIMARY, fontSize: "16px", fontWeight: 600 }}>{bar.value}%</div>
              </div>
              <div style={{ display: "flex", width: "100%", height: "8px", borderRadius: "4px", background: `${ACCENT_1}22` }}>
                <div style={{ display: "flex", width: `${Math.min(bar.value, 100)}%`, height: "8px", borderRadius: "4px", background: `linear-gradient(90deg, ${bar.color || ACCENT_1}, ${ACCENT_2})` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <SlideFooter />
    </SlideBackground>
  );
}

/* # Comparison: Two-column layout */
export function ComparisonSlide({ data, width, height }: { data: SlideData; width: number; height: number }) {
  return (
    <SlideBackground data={data} width={width} height={height}>
      <SlideHeader slideNumber={data.slideNumber} totalSlides={data.totalSlides} />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: "24px" }}>
        {data.headline && (
          <div style={{ display: "flex", color: TEXT_PRIMARY, fontSize: "28px", fontWeight: 700, textAlign: "center", justifyContent: "center" }}>{data.headline}</div>
        )}
        <div style={{ display: "flex", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "24px", borderRadius: "16px", background: BG_CARD, border: `1px solid ${BORDER}`, gap: "14px" }}>
            <div style={{ display: "flex", color: ACCENT_1, fontSize: "14px", fontWeight: 700, letterSpacing: "0.05em" }}>{data.leftLabel || "OPTION A"}</div>
            {(data.leftColumn || []).map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <div style={{ display: "flex", color: ACCENT_1, fontSize: "16px", flexShrink: 0 }}>&rarr;</div>
                <div style={{ display: "flex", color: TEXT_SECONDARY, fontSize: "16px", lineHeight: 1.5 }}>{item}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "24px", borderRadius: "16px", background: BG_CARD, border: `1px solid ${BORDER}`, gap: "14px" }}>
            <div style={{ display: "flex", color: ACCENT_3, fontSize: "14px", fontWeight: 700, letterSpacing: "0.05em" }}>{data.rightLabel || "OPTION B"}</div>
            {(data.rightColumn || []).map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <div style={{ display: "flex", color: ACCENT_3, fontSize: "16px", flexShrink: 0 }}>&rarr;</div>
                <div style={{ display: "flex", color: TEXT_SECONDARY, fontSize: "16px", lineHeight: 1.5 }}>{item}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <SlideFooter />
    </SlideBackground>
  );
}

/* # NumberedSteps: Large step numbers with descriptions */
export function NumberedStepsSlide({ data, width, height }: { data: SlideData; width: number; height: number }) {
  const steps = data.steps || [];
  return (
    <SlideBackground data={data} width={width} height={height}>
      <SlideHeader slideNumber={data.slideNumber} totalSlides={data.totalSlides} />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: "24px" }}>
        {data.headline && (
          <div style={{ display: "flex", color: TEXT_PRIMARY, fontSize: "28px", fontWeight: 700, lineHeight: 1.3 }}>{data.headline}</div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", borderRadius: "12px", background: `linear-gradient(135deg, ${ACCENT_1}, ${ACCENT_2})`, flexShrink: 0 }}>
                <div style={{ display: "flex", color: "white", fontSize: "20px", fontWeight: 700 }}>{step.number}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingTop: "4px" }}>
                <div style={{ display: "flex", color: TEXT_PRIMARY, fontSize: "20px", fontWeight: 600 }}>{step.title}</div>
                {step.detail && (
                  <div style={{ display: "flex", color: TEXT_SECONDARY, fontSize: "16px", lineHeight: 1.5 }}>{step.detail}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <SlideFooter />
    </SlideBackground>
  );
}

/* # GradientText: Large gradient headline, minimal */
export function GradientTextSlide({ data, width, height }: { data: SlideData; width: number; height: number }) {
  return (
    <SlideBackground data={data} width={width} height={height}>
      <SlideHeader slideNumber={data.slideNumber} totalSlides={data.totalSlides} />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", alignItems: "center", gap: "24px", padding: "0 24px" }}>
        <div style={{ display: "flex", fontSize: width >= 1200 ? "56px" : "48px", fontWeight: 700, background: `linear-gradient(135deg, ${ACCENT_1}, ${ACCENT_3}, ${ACCENT_2})`, backgroundClip: "text", color: "transparent", textAlign: "center", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
          {data.headline}
        </div>
        {data.subheadline && (
          <div style={{ display: "flex", color: TEXT_SECONDARY, fontSize: "20px", textAlign: "center", lineHeight: 1.5, maxWidth: "85%" }}>{data.subheadline}</div>
        )}
      </div>
      <SlideFooter />
    </SlideBackground>
  );
}

/* # HighlightBox: Key insight in a highlighted card */
export function HighlightBoxSlide({ data, width, height }: { data: SlideData; width: number; height: number }) {
  return (
    <SlideBackground data={data} width={width} height={height}>
      <SlideHeader slideNumber={data.slideNumber} totalSlides={data.totalSlides} />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", alignItems: "center", gap: "20px" }}>
        {data.subheadline && (
          <div style={{ display: "flex", color: TEXT_MUTED, fontSize: "16px", fontWeight: 600, letterSpacing: "0.08em" }}>{data.subheadline}</div>
        )}
        <div style={{ display: "flex", padding: "36px 32px", borderRadius: "20px", background: `linear-gradient(135deg, ${ACCENT_1}15, ${ACCENT_2}15)`, border: `1px solid ${ACCENT_1}40`, width: "85%", justifyContent: "center" }}>
          <div style={{ display: "flex", color: TEXT_PRIMARY, fontSize: "26px", fontWeight: 600, textAlign: "center", lineHeight: 1.5 }}>{data.headline}</div>
        </div>
        {data.body && (
          <div style={{ display: "flex", color: TEXT_SECONDARY, fontSize: "18px", textAlign: "center", maxWidth: "80%", lineHeight: 1.5 }}>{data.body}</div>
        )}
      </div>
      <SlideFooter />
    </SlideBackground>
  );
}

/* # SplitImage: Left accent panel + right content */
export function SplitImageSlide({ data, width, height }: { data: SlideData; width: number; height: number }) {
  return (
    <SlideBackground data={data} width={width} height={height}>
      <div style={{ display: "flex", width: "40%", background: `linear-gradient(180deg, ${ACCENT_1}, ${ACCENT_2})`, alignItems: "center", justifyContent: "center", padding: "40px" }}>
        {data.stat ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", color: "white", fontSize: "72px", fontWeight: 700 }}>{data.stat.value}</div>
            <div style={{ display: "flex", color: "rgba(255,255,255,0.8)", fontSize: "16px", textAlign: "center" }}>{data.stat.label}</div>
          </div>
        ) : (
          <div style={{ display: "flex", color: "white", fontSize: "48px", fontWeight: 700, textAlign: "center", lineHeight: 1.2 }}>{data.slideNumber || ""}</div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", padding: "48px", gap: "16px" }}>
        <div style={{ display: "flex", color: TEXT_PRIMARY, fontSize: "28px", fontWeight: 700, lineHeight: 1.3 }}>{data.headline}</div>
        {data.body && (
          <div style={{ display: "flex", color: TEXT_SECONDARY, fontSize: "18px", lineHeight: 1.6 }}>{data.body}</div>
        )}
        <div style={{ display: "flex", color: TEXT_MUTED, fontSize: "14px", marginTop: "auto" }}>{BRAND_URL}</div>
      </div>
    </SlideBackground>
  );
}

/* # ProgressBar: Multiple progress bars */
export function ProgressBarSlide({ data, width, height }: { data: SlideData; width: number; height: number }) {
  const bars = data.bars || [];
  return (
    <SlideBackground data={data} width={width} height={height}>
      <SlideHeader slideNumber={data.slideNumber} totalSlides={data.totalSlides} />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: "28px" }}>
        {data.headline && (
          <div style={{ display: "flex", color: TEXT_PRIMARY, fontSize: "28px", fontWeight: 700, lineHeight: 1.3 }}>{data.headline}</div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {bars.map((bar, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", color: TEXT_PRIMARY, fontSize: "18px", fontWeight: 500 }}>{bar.label}</div>
                <div style={{ display: "flex", color: ACCENT_3, fontSize: "18px", fontWeight: 700 }}>{bar.value}%</div>
              </div>
              <div style={{ display: "flex", width: "100%", height: "12px", borderRadius: "6px", background: `${ACCENT_1}15` }}>
                <div style={{ display: "flex", width: `${Math.min(bar.value, 100)}%`, height: "12px", borderRadius: "6px", background: `linear-gradient(90deg, ${ACCENT_1}, ${bar.color || ACCENT_3})` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <SlideFooter />
    </SlideBackground>
  );
}

/* ---- Template Router ---- */

/* # Renders the appropriate template based on the layout field */
export function renderSlide(data: SlideData, width: number, height: number): React.ReactElement {
  const props = { data, width, height };

  switch (data.layout) {
    case "hero":           return <HeroSlide {...props} />;
    case "stat_card":      return <StatCard {...props} />;
    case "tip":            return <TipSlide {...props} />;
    case "quote":          return <QuoteCard {...props} />;
    case "list":           return <ListSlide {...props} />;
    case "cta":            return <CTASlide {...props} />;
    case "before_after":   return <BeforeAfterSlide {...props} />;
    case "screenshot":     return <ScreenshotSlide {...props} />;
    case "data_chart":     return <DataChartSlide {...props} />;
    case "comparison":     return <ComparisonSlide {...props} />;
    case "numbered_steps": return <NumberedStepsSlide {...props} />;
    case "gradient_text":  return <GradientTextSlide {...props} />;
    case "highlight_box":  return <HighlightBoxSlide {...props} />;
    case "split_image":    return <SplitImageSlide {...props} />;
    case "progress_bar":   return <ProgressBarSlide {...props} />;
    default:               return <HeroSlide {...props} />;
  }
}
