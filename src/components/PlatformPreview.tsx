/* ============================================================
   PLATFORM PREVIEW — Renders posts exactly as they appear
   on LinkedIn, X/Twitter, Instagram, and TikTok.
   ============================================================ */

"use client";

import { type ReactNode, useState } from "react";

/* ---- Shared types ---- */
interface PreviewItem {
  id: string;
  agent: string;
  platform: string;
  contentType: string;
  title: string;
  body: string;
  captionText: string | null;
  hashtags: string | null;
  hook: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  notes: string | null;
  editorialScore: number | null;
  createdAt: string;
}

interface VisualSlide {
  index: number;
  visualId: string;
  dataUrl?: string;
  imageUrl?: string;
  width: number;
  height: number;
}

interface AgentMeta {
  name: string;
  role: string;
  avatar: string;
  color: string;
}

interface PlatformPreviewProps {
  item: PreviewItem;
  slides: VisualSlide[];
  agent: AgentMeta;
}

/* ---- SVG Icons (inline, no external deps) ---- */

// # LinkedIn icons
function LiLikeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}
function LiCommentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function LiRepostIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}
function LiSendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

// # X/Twitter icons
function XReplyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}
function XRetweetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}
function XHeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function XViewIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function XBookmarkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function XShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

// # Instagram icons
function IgHeartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function IgCommentIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}
function IgShareIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function IgBookmarkIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

// # TikTok icons
function TkHeartIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="none">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function TkCommentIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="none">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function TkBookmarkIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="none">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function TkShareIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="none">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
    </svg>
  );
}
function TkMusicIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none">
      <path d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
  );
}

// # Three-dot menu icon (shared)
function MoreDotsIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={color}>
      <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}

// # Globe icon for LinkedIn
function GlobeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

// # Verified badge for X
function VerifiedBadge() {
  return (
    <svg width="16" height="16" viewBox="0 0 22 22" fill="#1d9bf0">
      <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.69-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.636.433 1.221.878 1.69.47.446 1.055.752 1.69.883.635.13 1.294.083 1.902-.143.271.586.702 1.084 1.24 1.438.54.354 1.167.551 1.813.568.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.225 1.261.276 1.894.146.633-.13 1.217-.435 1.69-.878.445-.47.749-1.055.878-1.69.13-.634.075-1.294-.148-1.9.587-.27 1.087-.7 1.443-1.242.355-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
    </svg>
  );
}

/* ---- Helper: parse imageUrl (may be comma-separated) into array ---- */
// # Data URLs contain commas (data:image/png;base64,XXX) so naive split breaks them
// # This regex correctly tokenises both HTTPS and data URLs
function getImageUrls(item: PreviewItem, slides: VisualSlide[]): string[] {
  // # slides may come from the API with imageUrl or from local renders with dataUrl
  if (slides.length > 0) {
    const urls = slides.map(s => s.dataUrl || s.imageUrl).filter(Boolean) as string[];
    if (urls.length > 0) return urls;
  }
  if (!item.imageUrl) return [];
  const urls = item.imageUrl.match(/(?:https?:\/\/[^,\s]+|data:[^,]+,[^,\s]*)/g);
  return urls ? urls.map(u => u.trim()).filter(Boolean) : [item.imageUrl.trim()];
}

/* ---- Helper: get first image from slides or imageUrl ---- */
function getFirstImage(item: PreviewItem, slides: VisualSlide[]): string | null {
  const urls = getImageUrls(item, slides);
  return urls.length > 0 ? urls[0] : null;
}

/* ---- Helper: format body text with truncation ---- */
function formatBody(body: string, maxLines: number): { text: string; truncated: boolean } {
  const lines = body.split("\n");
  if (lines.length > maxLines) {
    return { text: lines.slice(0, maxLines).join("\n"), truncated: true };
  }
  return { text: body, truncated: false };
}

/* ---- Helper: format hashtags ---- */
function formatHashtags(hashtags: string | null): string {
  if (!hashtags) return "";
  return hashtags.split(",").map(t => {
    const tag = t.trim();
    return tag.startsWith("#") ? tag : `#${tag}`;
  }).join(" ");
}

/* ================================================================
   LINKEDIN PREVIEW
   ================================================================ */
function LinkedInPreview({ item, slides, agent }: PlatformPreviewProps) {
  const allImages = getImageUrls(item, slides);
  const image = allImages.length > 0 ? allImages[0] : null;
  const hasCarousel = allImages.length > 1;
  const { text, truncated } = formatBody(item.body, 5);
  const hashtags = formatHashtags(item.hashtags);
  const [expanded, setExpanded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <div style={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #e0e0e0", overflow: "hidden", maxWidth: "555px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* # Header: avatar, name, headline, time, globe */}
      <div style={{ padding: "12px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: agent.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "14px", flexShrink: 0 }}>
            {agent.avatar}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontWeight: 600, fontSize: "14px", color: "#000000e6" }}>{agent.name}</span>
              <span style={{ color: "#00000099", fontSize: "14px" }}>• 1st</span>
            </div>
            <p style={{ color: "#00000099", fontSize: "12px", margin: "0", lineHeight: "16px" }}>{agent.role} at JobPilot AI</p>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
              <span style={{ color: "#00000099", fontSize: "12px" }}>1h</span>
              <span style={{ color: "#00000099", fontSize: "12px" }}>•</span>
              <span style={{ color: "#00000099" }}><GlobeIcon /></span>
            </div>
          </div>
          <div style={{ cursor: "pointer", color: "#00000099", flexShrink: 0 }}><MoreDotsIcon color="#00000099" /></div>
        </div>
      </div>

      {/* # Post body */}
      <div style={{ padding: "12px 16px 8px" }}>
        <p style={{ fontSize: "14px", color: "#000000e6", lineHeight: "20px", whiteSpace: "pre-wrap", margin: 0, wordBreak: "break-word" }}>
          {expanded ? item.body : text}
          {truncated && !expanded && <span onClick={() => setExpanded(true)} style={{ color: "#0a66c2", cursor: "pointer", fontWeight: 500 }}>{" "}...see more</span>}
          {expanded && truncated && <span onClick={() => setExpanded(false)} style={{ color: "#0a66c2", cursor: "pointer", fontWeight: 500, display: "block", marginTop: "4px" }}>show less</span>}
        </p>
        {hashtags && (
          <p style={{ fontSize: "14px", color: "#0a66c2", margin: "6px 0 0", fontWeight: 500 }}>{hashtags}</p>
        )}
      </div>

      {/* # Image / Carousel — LinkedIn document-style one-at-a-time with nav */}
      {hasCarousel ? (
        <div style={{ position: "relative", background: "#f3f2ef", display: "flex", justifyContent: "center" }}>
          <img
            src={allImages[currentSlide]}
            alt={`Slide ${currentSlide + 1}`}
            style={{ width: "100%", height: "auto", display: "block" }}
          />
          {/* # Slide counter badge */}
          <div style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: "12px", fontWeight: 600, padding: "4px 10px", borderRadius: "12px" }}>
            {currentSlide + 1} / {allImages.length}
          </div>
          {/* # Left arrow */}
          {currentSlide > 0 && (
            <button
              onClick={() => setCurrentSlide(currentSlide - 1)}
              style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "1px solid #e0e0e0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "#333", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }}
            >
              &#8249;
            </button>
          )}
          {/* # Right arrow */}
          {currentSlide < allImages.length - 1 && (
            <button
              onClick={() => setCurrentSlide(currentSlide + 1)}
              style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "1px solid #e0e0e0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "#333", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }}
            >
              &#8250;
            </button>
          )}
        </div>
      ) : image ? (
        <div style={{ background: "#f3f2ef", display: "flex", justifyContent: "center" }}>
          <img src={image} alt="Post visual" style={{ width: "100%", height: "auto", display: "block" }} />
        </div>
      ) : null}

      {/* # Engagement counts */}
      <div style={{ padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e0e0e0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={{ display: "flex" }}>
            <span style={{ width: "18px", height: "18px", borderRadius: "50%", background: "#0a66c2", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff", marginRight: "-4px", zIndex: 2 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" /></svg>
            </span>
            <span style={{ width: "18px", height: "18px", borderRadius: "50%", background: "#df704d", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff", zIndex: 1 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
            </span>
          </div>
          <span style={{ color: "#00000099", fontSize: "12px", marginLeft: "4px" }}>24</span>
        </div>
        <span style={{ color: "#00000099", fontSize: "12px" }}>3 comments • 1 repost</span>
      </div>

      {/* # Action bar */}
      <div style={{ display: "flex", padding: "4px 8px" }}>
        {[
          { icon: <LiLikeIcon />, label: "Like" },
          { icon: <LiCommentIcon />, label: "Comment" },
          { icon: <LiRepostIcon />, label: "Repost" },
          { icon: <LiSendIcon />, label: "Send" },
        ].map(({ icon, label }) => (
          <button
            key={label}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", padding: "12px 8px", border: "none", background: "none", cursor: "pointer", borderRadius: "4px", color: "#00000099", fontSize: "13px", fontWeight: 600 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#0000000d"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   X / TWITTER PREVIEW
   ================================================================ */
function TwitterPreview({ item, slides, agent }: PlatformPreviewProps) {
  const allImages = getImageUrls(item, slides);
  const image = allImages.length > 0 ? allImages[0] : null;
  const hasMultipleImages = allImages.length > 1;
  const hashtags = formatHashtags(item.hashtags);
  const fullText = item.body + (hashtags ? `\n\n${hashtags}` : "");
  const { text: truncatedText, truncated } = formatBody(fullText, 6);
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ background: "#000000", borderRadius: "16px", border: "1px solid #2f3336", overflow: "hidden", maxWidth: "600px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', padding: "12px 16px" }}>
      {/* # Header row: avatar + name/handle + timestamp */}
      <div style={{ display: "flex", gap: "12px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: agent.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>
          {agent.avatar}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* # Name row */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "2px" }}>
            <span style={{ fontWeight: 700, fontSize: "15px", color: "#e7e9ea" }}>{agent.name}</span>
            <VerifiedBadge />
            <span style={{ color: "#71767b", fontSize: "15px" }}>@jobpilotai</span>
            <span style={{ color: "#71767b", fontSize: "15px" }}>·</span>
            <span style={{ color: "#71767b", fontSize: "15px" }}>2h</span>
          </div>

          {/* # Tweet body */}
          <p style={{ fontSize: "15px", color: "#e7e9ea", lineHeight: "20px", whiteSpace: "pre-wrap", margin: "0 0 12px", wordBreak: "break-word" }}>
            {expanded ? fullText : truncatedText}
            {truncated && !expanded && <span onClick={() => setExpanded(true)} style={{ color: "#1d9bf0", cursor: "pointer", fontWeight: 500 }}>{" "}...show more</span>}
            {expanded && truncated && <span onClick={() => setExpanded(false)} style={{ color: "#1d9bf0", cursor: "pointer", fontWeight: 500, display: "block", marginTop: "4px" }}>show less</span>}
          </p>

          {/* # Image(s) */}
          {hasMultipleImages ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px", borderRadius: "16px", overflow: "hidden", marginBottom: "12px", border: "1px solid #2f3336" }}>
              {allImages.slice(0, 4).map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Image ${i + 1}`}
                  style={{ width: "100%", height: "200px", objectFit: "cover", display: "block" }}
                />
              ))}
            </div>
          ) : image ? (
            <div style={{ borderRadius: "16px", overflow: "hidden", marginBottom: "12px", border: "1px solid #2f3336" }}>
              <img src={image} alt="Tweet image" style={{ width: "100%", height: "auto", display: "block" }} />
            </div>
          ) : null}

          {/* # Action bar */}
          <div style={{ display: "flex", justifyContent: "space-between", maxWidth: "425px", padding: "4px 0" }}>
            {[
              { icon: <XReplyIcon />, count: "5", hoverColor: "#1d9bf0" },
              { icon: <XRetweetIcon />, count: "12", hoverColor: "#00ba7c" },
              { icon: <XHeartIcon />, count: "47", hoverColor: "#f91880" },
              { icon: <XViewIcon />, count: "1.2K", hoverColor: "#1d9bf0" },
              { icon: <XBookmarkIcon />, count: "", hoverColor: "#1d9bf0" },
              { icon: <XShareIcon />, count: "", hoverColor: "#1d9bf0" },
            ].map(({ icon, count, hoverColor }, i) => (
              <button
                key={i}
                style={{ display: "flex", alignItems: "center", gap: "4px", border: "none", background: "none", cursor: "pointer", color: "#71767b", fontSize: "13px", padding: "0" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = hoverColor; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#71767b"; }}
              >
                {icon}
                {count && <span>{count}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   INSTAGRAM PREVIEW
   ================================================================ */
function InstagramPreview({ item, slides, agent }: PlatformPreviewProps) {
  const allImages = getImageUrls(item, slides);
  const image = allImages.length > 0 ? allImages[0] : null;
  const hasCarousel = allImages.length > 1;
  // # Guard against non-string caption (e.g. object from malformed AI output)
  const rawCaption = item.captionText || item.body;
  const caption = typeof rawCaption === "string" ? rawCaption : String(rawCaption ?? "");
  const hashtags = formatHashtags(item.hashtags);
  const truncatedCaption = caption.length > 125 ? caption.slice(0, 125) : caption;
  const isTruncated = caption.length > 125;
  const [expanded, setExpanded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <div style={{ background: "#000000", borderRadius: "8px", border: "1px solid #262626", overflow: "hidden", maxWidth: "470px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* # Header: avatar, username, more menu */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* # Story ring gradient around avatar */}
          <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)", padding: "2px", flexShrink: 0 }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: agent.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "10px", border: "2px solid #000" }}>
              {agent.avatar}
            </div>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontWeight: 600, fontSize: "13px", color: "#f5f5f5" }}>jobpilotai</span>
              <svg width="12" height="12" viewBox="0 0 22 22" fill="#3897f0"><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.69-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.636.433 1.221.878 1.69.47.446 1.055.752 1.69.883.635.13 1.294.083 1.902-.143.271.586.702 1.084 1.24 1.438.54.354 1.167.551 1.813.568.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.225 1.261.276 1.894.146.633-.13 1.217-.435 1.69-.878.445-.47.749-1.055.878-1.69.13-.634.075-1.294-.148-1.9.587-.27 1.087-.7 1.443-1.242.355-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" /></svg>
            </div>
            <span style={{ color: "#a8a8a8", fontSize: "11px" }}>Sponsored</span>
          </div>
        </div>
        <div style={{ cursor: "pointer", color: "#f5f5f5" }}><MoreDotsIcon color="#f5f5f5" /></div>
      </div>

      {/* # Image / Carousel with swipe-style nav */}
      {hasCarousel ? (
        <div style={{ position: "relative", background: "#000" }}>
          <img
            src={allImages[currentSlide]}
            alt={`Slide ${currentSlide + 1}`}
            style={{ width: "100%", height: "auto", display: "block" }}
          />
          {/* # Slide counter badge */}
          <div style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: "12px", fontWeight: 600, padding: "4px 10px", borderRadius: "12px" }}>
            {currentSlide + 1}/{allImages.length}
          </div>
          {/* # Left arrow */}
          {currentSlide > 0 && (
            <button
              onClick={() => setCurrentSlide(currentSlide - 1)}
              style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "#333", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
            >
              &#8249;
            </button>
          )}
          {/* # Right arrow */}
          {currentSlide < allImages.length - 1 && (
            <button
              onClick={() => setCurrentSlide(currentSlide + 1)}
              style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "#333", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
            >
              &#8250;
            </button>
          )}
          {/* # Carousel indicator dots */}
          <div style={{ position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "4px" }}>
            {allImages.map((_, i) => (
              <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: i === currentSlide ? "#3897f0" : "rgba(255,255,255,0.4)", transition: "background 0.2s" }} />
            ))}
          </div>
        </div>
      ) : image ? (
        <img src={image} alt="Post" style={{ width: "100%", height: "auto", display: "block" }} />
      ) : (
        <div style={{ width: "100%", aspectRatio: "4/5", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#555", fontSize: "14px" }}>No image</span>
        </div>
      )}

      {/* # Action icons row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px" }}>
        <div style={{ display: "flex", gap: "16px", color: "#f5f5f5" }}>
          <span style={{ cursor: "pointer" }}><IgHeartIcon /></span>
          <span style={{ cursor: "pointer" }}><IgCommentIcon /></span>
          <span style={{ cursor: "pointer" }}><IgShareIcon /></span>
        </div>
        <span style={{ cursor: "pointer", color: "#f5f5f5" }}><IgBookmarkIcon /></span>
      </div>

      {/* # Likes count */}
      <div style={{ padding: "0 12px 4px" }}>
        <span style={{ fontWeight: 600, fontSize: "13px", color: "#f5f5f5" }}>42 likes</span>
      </div>

      {/* # Caption */}
      <div style={{ padding: "0 12px 10px" }}>
        <p style={{ fontSize: "13px", color: "#f5f5f5", margin: 0, lineHeight: "18px", wordBreak: "break-word" }}>
          <span style={{ fontWeight: 600 }}>jobpilotai</span>{" "}
          {isTruncated && !expanded ? (
            <>{truncatedCaption}<span onClick={() => setExpanded(true)} style={{ color: "#a8a8a8", cursor: "pointer" }}>... more</span></>
          ) : (
            caption
          )}
        </p>
        {hashtags && (
          <p style={{ fontSize: "13px", color: "#3897f0", margin: "4px 0 0" }}>{hashtags}</p>
        )}
      </div>

      {/* # Comment input */}
      <div style={{ borderTop: "1px solid #262626", padding: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "20px" }}>😊</span>
        <span style={{ color: "#a8a8a8", fontSize: "13px", flex: 1 }}>Add a comment...</span>
      </div>
    </div>
  );
}

/* ================================================================
   TIKTOK PREVIEW
   ================================================================ */
function TikTokPreview({ item, slides, agent }: PlatformPreviewProps) {
  const allImages = getImageUrls(item, slides);
  const image = allImages.length > 0 ? allImages[0] : null;
  const hasCarousel = allImages.length > 1;
  // # Guard against non-string caption
  const rawCaption = item.captionText || item.body;
  const caption = typeof rawCaption === "string" ? rawCaption : String(rawCaption ?? "");
  const isTruncated = caption.length > 100;
  const truncatedCaption = isTruncated ? caption.slice(0, 100) + "..." : caption;
  const hashtags = formatHashtags(item.hashtags);
  const [expanded, setExpanded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const currentImage = hasCarousel ? allImages[currentSlide] : image;

  return (
    <div style={{ width: "320px", aspectRatio: "9/16", borderRadius: "12px", overflow: "hidden", position: "relative", background: "#000", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* # Background image/video */}
      {currentImage ? (
        <img src={currentImage} alt="TikTok post" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }} />
      )}

      {/* # Carousel slide counter + nav for photo mode */}
      {hasCarousel && (
        <>
          <div style={{ position: "absolute", top: "44px", right: "12px", background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "10px", zIndex: 3 }}>
            {currentSlide + 1}/{allImages.length}
          </div>
          {currentSlide > 0 && (
            <button
              onClick={() => setCurrentSlide(currentSlide - 1)}
              style={{ position: "absolute", left: "8px", top: "45%", transform: "translateY(-50%)", width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255,255,255,0.3)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "#fff", zIndex: 3 }}
            >
              &#8249;
            </button>
          )}
          {currentSlide < allImages.length - 1 && (
            <button
              onClick={() => setCurrentSlide(currentSlide + 1)}
              style={{ position: "absolute", right: "52px", top: "45%", transform: "translateY(-50%)", width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255,255,255,0.3)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "#fff", zIndex: 3 }}
            >
              &#8250;
            </button>
          )}
        </>
      )}

      {/* # Dark gradient overlay at bottom for text readability */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.85) 100%)" }} />

      {/* # Top bar */}
      <div style={{ position: "absolute", top: "12px", left: 0, right: 0, display: "flex", justifyContent: "center", gap: "16px", zIndex: 2 }}>
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "15px", fontWeight: 600 }}>Following</span>
        <span style={{ color: "#fff", fontSize: "15px", fontWeight: 700, borderBottom: "2px solid #fff", paddingBottom: "2px" }}>For You</span>
      </div>

      {/* # Right sidebar icons */}
      <div style={{ position: "absolute", right: "10px", bottom: "120px", display: "flex", flexDirection: "column", alignItems: "center", gap: "18px", zIndex: 2 }}>
        {/* # Profile avatar */}
        <div style={{ position: "relative", marginBottom: "8px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: agent.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "12px", border: "2px solid #fff" }}>
            {agent.avatar}
          </div>
          <div style={{ position: "absolute", bottom: "-6px", left: "50%", transform: "translateX(-50%)", width: "18px", height: "18px", borderRadius: "50%", background: "#fe2c55", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: "14px", fontWeight: 700, lineHeight: 1 }}>+</span>
          </div>
        </div>

        {/* # Heart */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <TkHeartIcon />
          <span style={{ color: "#fff", fontSize: "12px", marginTop: "2px", fontWeight: 600 }}>1.2K</span>
        </div>

        {/* # Comment */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <TkCommentIcon />
          <span style={{ color: "#fff", fontSize: "12px", marginTop: "2px", fontWeight: 600 }}>32</span>
        </div>

        {/* # Bookmark */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <TkBookmarkIcon />
          <span style={{ color: "#fff", fontSize: "12px", marginTop: "2px", fontWeight: 600 }}>18</span>
        </div>

        {/* # Share */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <TkShareIcon />
          <span style={{ color: "#fff", fontSize: "12px", marginTop: "2px", fontWeight: 600 }}>5</span>
        </div>

        {/* # Spinning music disc */}
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#333", border: "8px solid #1a1a1a", animation: "spin 3s linear infinite" }} />
      </div>

      {/* # Bottom text overlay */}
      <div style={{ position: "absolute", bottom: "16px", left: "12px", right: "60px", zIndex: 2 }}>
        <p style={{ color: "#fff", fontWeight: 700, fontSize: "14px", margin: "0 0 6px" }}>@jobpilotai</p>
        <p style={{ color: "#fff", fontSize: "13px", margin: "0 0 6px", lineHeight: "18px", wordBreak: "break-word" }}>
          {expanded ? caption : truncatedCaption}
          {isTruncated && !expanded && <span onClick={() => setExpanded(true)} style={{ color: "rgba(255,255,255,0.6)", cursor: "pointer", marginLeft: "4px" }}>more</span>}
        </p>
        {hashtags && (
          <p style={{ color: "#fff", fontSize: "13px", margin: "0 0 8px", fontWeight: 600 }}>{hashtags}</p>
        )}
        {/* # Music ticker */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <TkMusicIcon />
          <div style={{ overflow: "hidden", flex: 1 }}>
            <p style={{ color: "#fff", fontSize: "12px", margin: 0, whiteSpace: "nowrap" }}>
              Original sound - jobpilotai
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   BLOG POST PREVIEW — Matches jobpilotai.co/blog design
   ================================================================ */

const BLOG_CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Resume Tips": { bg: "rgba(59,130,246,0.15)", text: "#60a5fa", border: "rgba(59,130,246,0.3)" },
  "Interview Prep": { bg: "rgba(245,158,11,0.15)", text: "#fbbf24", border: "rgba(245,158,11,0.3)" },
  "LinkedIn": { bg: "rgba(6,182,212,0.15)", text: "#22d3ee", border: "rgba(6,182,212,0.3)" },
  "Cover Letters": { bg: "rgba(16,185,129,0.15)", text: "#34d399", border: "rgba(16,185,129,0.3)" },
  "Career Change": { bg: "rgba(14,165,233,0.15)", text: "#38bdf8", border: "rgba(14,165,233,0.3)" },
  "Job Search": { bg: "rgba(244,63,94,0.15)", text: "#fb7185", border: "rgba(244,63,94,0.3)" },
  "Career Advice": { bg: "rgba(139,92,246,0.15)", text: "#a78bfa", border: "rgba(139,92,246,0.3)" },
  "Networking": { bg: "rgba(20,184,166,0.15)", text: "#2dd4bf", border: "rgba(20,184,166,0.3)" },
};
const DEFAULT_CAT_COLOR = { bg: "rgba(99,102,241,0.15)", text: "#818cf8", border: "rgba(99,102,241,0.3)" };

function BlogPreview({ item, slides }: PlatformPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const image = getFirstImage(item, slides);

  let category = "Career Advice";
  let readTime = "3 min read";
  let slug = "";
  try {
    const meta = item.notes ? JSON.parse(item.notes) : {};
    if (meta.category) category = meta.category;
    if (meta.readTime) readTime = meta.readTime;
    if (meta.slug) slug = meta.slug;
  } catch { /* notes might not be JSON for blog posts */ }

  const catColor = BLOG_CATEGORY_COLORS[category] || DEFAULT_CAT_COLOR;
  const date = new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const bodyLines = item.body.split("\n");
  const truncatedBody = bodyLines.slice(0, 12).join("\n");
  const isTruncated = bodyLines.length > 12;

  const renderMarkdownLine = (line: string, i: number) => {
    if (line.startsWith("## ")) return <h2 key={i} style={{ fontSize: "20px", fontWeight: 700, color: "#fff", margin: "24px 0 12px" }}>{line.slice(3)}</h2>;
    if (line.startsWith("### ")) return <h3 key={i} style={{ fontSize: "17px", fontWeight: 700, color: "#fff", margin: "20px 0 8px" }}>{line.slice(4)}</h3>;
    if (line.startsWith("- ")) return <li key={i} style={{ color: "#a1a1aa", lineHeight: "24px", marginLeft: "20px", listStyleType: "disc" }}>{renderInline(line.slice(2))}</li>;
    if (line.trim() === "") return <div key={i} style={{ height: "8px" }} />;
    return <p key={i} style={{ color: "#a1a1aa", lineHeight: "24px", margin: "0 0 12px" }}>{renderInline(line)}</p>;
  };

  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} style={{ color: "#fff", fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div style={{ background: "#0c0e1a", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", maxWidth: "680px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* # Cover image */}
      {image && (
        <div style={{ width: "100%", overflow: "hidden" }}>
          <img src={image} alt="Cover" style={{ width: "100%", height: "220px", objectFit: "cover", display: "block" }} />
        </div>
      )}

      {/* # Article content */}
      <div style={{ padding: "28px 32px" }}>
        {/* # Meta row: category badge + read time + date */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <span style={{ padding: "4px 12px", fontSize: "11px", fontWeight: 600, borderRadius: "999px", border: `1px solid ${catColor.border}`, background: catColor.bg, color: catColor.text }}>{category}</span>
          <span style={{ fontSize: "12px", color: "#71717a" }}>{readTime}</span>
          <span style={{ fontSize: "12px", color: "#71717a" }}>{date}</span>
        </div>

        {/* # Title */}
        <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#fff", lineHeight: "32px", margin: "0 0 8px", letterSpacing: "-0.02em" }}>{item.title}</h1>

        {/* # Excerpt / meta description */}
        {item.captionText && (
          <p style={{ fontSize: "15px", color: "#71717a", lineHeight: "22px", margin: "0 0 20px", fontStyle: "italic" }}>{item.captionText}</p>
        )}

        {/* # Divider */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "0 0 20px" }} />

        {/* # Article body (rendered markdown) */}
        <div style={{ fontSize: "15px" }}>
          {(expanded ? bodyLines : bodyLines.slice(0, 12)).map(renderMarkdownLine)}
          {isTruncated && !expanded && (
            <div style={{ position: "relative", paddingTop: "8px" }}>
              <div style={{ position: "absolute", top: "-40px", left: 0, right: 0, height: "40px", background: "linear-gradient(transparent, #0c0e1a)" }} />
              <button onClick={() => setExpanded(true)} style={{ border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.1)", color: "#818cf8", padding: "8px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer", display: "block", margin: "0 auto" }}>
                Continue reading
              </button>
            </div>
          )}
          {expanded && isTruncated && (
            <button onClick={() => setExpanded(false)} style={{ border: "none", background: "none", color: "#71717a", fontSize: "12px", cursor: "pointer", marginTop: "12px", display: "block" }}>
              Collapse
            </button>
          )}
        </div>

        {/* # Tags */}
        {item.hashtags && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {item.hashtags.split(",").map((tag, i) => (
              <span key={i} style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "999px", background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}>
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* # URL preview */}
        {slug && (
          <div style={{ marginTop: "16px", fontSize: "12px", color: "#52525b" }}>
            jobpilotai.co/blog/{slug}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   MAIN EXPORT — Routes to the correct platform preview
   ================================================================ */
export default function PlatformPreview({ item, slides, agent }: PlatformPreviewProps) {
  switch (item.platform) {
    case "linkedin":
      return <LinkedInPreview item={item} slides={slides} agent={agent} />;
    case "twitter":
      return <TwitterPreview item={item} slides={slides} agent={agent} />;
    case "instagram":
      return <InstagramPreview item={item} slides={slides} agent={agent} />;
    case "tiktok":
      return <TikTokPreview item={item} slides={slides} agent={agent} />;
    case "blog":
      return <BlogPreview item={item} slides={slides} agent={agent} />;
    default:
      return <LinkedInPreview item={item} slides={slides} agent={agent} />;
  }
}

/* ---- Also export the platform label map ---- */
export const PLATFORM_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  twitter: "X / Twitter",
  instagram: "Instagram",
  tiktok: "TikTok",
  blog: "Blog",
};
