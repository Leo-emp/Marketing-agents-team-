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
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      width: `${width}px`,
      height: `${height}px`,
      background: BG,
      padding: "48px",
      fontFamily: "Geist",
    }}>
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
    </div>
  );
}

/* # StatCard: Large stat number with gradient color and label */
export function StatCard({ data, width, height }: { data: SlideData; width: number; height: number }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      width: `${width}px`,
      height: `${height}px`,
      background: BG,
      padding: "48px",
      fontFamily: "Geist",
    }}>
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
    </div>
  );
}

/* # TipSlide: Numbered tip with accent border, headline, and body */
export function TipSlide({ data, width, height }: { data: SlideData; width: number; height: number }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      width: `${width}px`,
      height: `${height}px`,
      background: BG,
      padding: "48px",
      fontFamily: "Geist",
    }}>
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
    </div>
  );
}

/* # QuoteCard: Large quote with attribution */
export function QuoteCard({ data, width, height }: { data: SlideData; width: number; height: number }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      width: `${width}px`,
      height: `${height}px`,
      background: BG,
      padding: "48px",
      fontFamily: "Geist",
    }}>
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
    </div>
  );
}

/* # ListSlide: Title + bullet items with indicators */
export function ListSlide({ data, width, height }: { data: SlideData; width: number; height: number }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      width: `${width}px`,
      height: `${height}px`,
      background: BG,
      padding: "48px",
      fontFamily: "Geist",
    }}>
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
    </div>
  );
}

/* # CTASlide: Call-to-action with gradient background */
export function CTASlide({ data, width, height }: { data: SlideData; width: number; height: number }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      width: `${width}px`,
      height: `${height}px`,
      background: BG,
      padding: "48px",
      fontFamily: "Geist",
    }}>
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
    </div>
  );
}

/* ---- Template Router ---- */

/* # Renders the appropriate template based on the layout field */
export function renderSlide(data: SlideData, width: number, height: number): React.ReactElement {
  const props = { data, width, height };

  switch (data.layout) {
    case "hero":      return <HeroSlide {...props} />;
    case "stat_card": return <StatCard {...props} />;
    case "tip":       return <TipSlide {...props} />;
    case "quote":     return <QuoteCard {...props} />;
    case "list":      return <ListSlide {...props} />;
    case "cta":       return <CTASlide {...props} />;
    default:          return <HeroSlide {...props} />;
  }
}
