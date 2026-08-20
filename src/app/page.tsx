/* ============================================================
   MARKETING HQ - Main Dashboard
   ============================================================
   Admin dashboard for the AI marketing agent team.
   Content queue, plan generation, visual preview, approval
   workflow, KPI tracking, and platform posting controls.
   ============================================================ */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
// # PlatformPreview component available but not used — content cards show caption + full-size images directly

/* ---- Types ---- */
interface ContentItem {
  id: string;
  agent: string;
  platform: string;
  contentType: string;
  title: string;
  body: string;
  captionText: string | null;
  hashtags: string | null;
  mediaPrompt: string | null;
  hook: string | null;
  status: string;
  scheduledFor: string | null;
  postedAt: string | null;
  notes: string | null;
  researchBrief: string | null;
  visualData: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  videoRenderId: string | null;
  editorialScore: number | null;
  editorialFeedback: string | null;
  variationGroup: string | null;
  engagementLikes: number | null;
  engagementComments: number | null;
  engagementShares: number | null;
  engagementSaves: number | null;
  engagementImpressions: number | null;
  engagementScore: number | null;
  createdAt: string;
}

interface PlanItem {
  day: string;
  platform: string;
  pillar: string;
  contentType: string;
  topic: string;
  hook: string;
  reasoning: string;
}

interface ContentPlan {
  id: string;
  weekOf: string;
  plan: PlanItem[];
  status: string;
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

interface KpiSummary {
  platform: string;
  period: string;
  metrics: Record<string, { current: number; previous: number; change: number; changePercent: number }>;
  totalPosts: number;
}

interface KpiAnalysis {
  insights: string[];
  recommendations: string[];
  goalProgress: { metricType: string; platform: string; current: number; target: number; percent: number }[];
}

/* ---- Agent display info ---- */
const AGENT_META: Record<string, { name: string; role: string; avatar: string; color: string; contentTypes: string[]; description: string }> = {
  strategist: { name: "Maya Chen", role: "Content Strategist", avatar: "MC", color: "#8b5cf6", contentTypes: [], description: "Plans weekly content calendars using real-time research. Identifies trending angles, assigns themes, and ensures variety across channels." },
  linkedin:   { name: "James Crawford", role: "LinkedIn Specialist", avatar: "JC", color: "#0a66c2", contentTypes: ["post", "carousel"], description: "Writes professional thought leadership posts and carousels. Expert at LinkedIn algorithm — hooks, storytelling, and engagement." },
  twitter:    { name: "Zara Knight", role: "X/Twitter Specialist", avatar: "ZK", color: "#14171a", contentTypes: ["post", "thread", "carousel", "plain_text"], description: "Creates punchy, viral short-form content. Threads, contrarian takes, carousels, and tweets that spark conversation." },
  instagram:  { name: "Sofia Reyes", role: "Instagram Specialist", avatar: "SR", color: "#e1306c", contentTypes: ["carousel", "reel_script", "single_image"], description: "Designs carousel posts, Reel scripts, and single image posts. Optimizes for saves and shares with visual-first content." },
  tiktok:     { name: "Marcus Lee", role: "TikTok Specialist", avatar: "ML", color: "#ff0050", contentTypes: ["reel_script", "single_image", "carousel"], description: "Scripts short-form videos, carousel posts, and single images. Native TikTok voice with 3-second hook mastery." },
  research:   { name: "Research Agent", role: "Trend Analyst", avatar: "RA", color: "#10b981", contentTypes: [], description: "Conducts real-time web research before every content generation. Finds trending topics, industry news, data points, and competitor angles." },
  visual:     { name: "Visual Designer", role: "Brand Designer", avatar: "VD", color: "#a855f7", contentTypes: [], description: "Transforms text content into branded visual slides. Dark premium theme, indigo-purple gradients, clean typography." },
  kpi:        { name: "KPI Analyst", role: "Performance Tracker", avatar: "KA", color: "#f59e0b", contentTypes: [], description: "Tracks engagement, reach, and traffic across platforms. AI-powered insights and goal progress monitoring." },
  // # Ambassador AI — generates talking-head career tip videos using HeyGen lip-sync
  ambassador: { name: "Ambassador AI", role: "Brand Spokesperson", avatar: "AM", color: "#06b6d4", contentTypes: ["ambassador_video"], description: "AI brand ambassador that creates talking-head career tip videos. Professional lip sync, natural gestures, consistent brand identity." },
};

const PLATFORM_COLORS: Record<string, string> = {
  linkedin: "#0a66c2",
  twitter: "#1d9bf0",
  instagram: "#e1306c",
  tiktok: "#ff0050",
};

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  approved:  "bg-green-500/15 text-green-400 border-green-500/30",
  scheduled: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  posted:    "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  rejected:  "bg-red-500/15 text-red-400 border-red-500/30",
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  post: "Post",
  thread: "Thread",
  carousel: "Carousel",
  reel_script: "Reel / Script",
  single_image: "Single Image",
  plain_text: "Plain Text",
  story: "Story",
  // # Ambassador videos are HeyGen-generated talking-head videos
  ambassador_video: "Ambassador Video",
};

const TONE_OPTIONS = [
  { value: "default", label: "Auto" },
  { value: "educational", label: "Educational" },
  { value: "provocative", label: "Provocative" },
  { value: "storytelling", label: "Storytelling" },
  { value: "data_driven", label: "Data-Driven" },
  { value: "motivational", label: "Motivational" },
];

const METRIC_TYPES = [
  { value: "impressions", label: "Impressions" },
  { value: "reach", label: "Reach" },
  { value: "engagement", label: "Engagement" },
  { value: "clicks", label: "Link Clicks" },
  { value: "followers", label: "Followers Gained" },
  { value: "saves", label: "Saves" },
  { value: "shares", label: "Shares" },
];

export default function Dashboard() {
  /* ---- Auth ---- */
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  /* ---- Tabs & data ---- */
  const [tab, setTab] = useState<"queue" | "agents" | "plans" | "kpi" | "emails" | "funnel" | "settings">("queue");
  const [content, setContent] = useState<ContentItem[]>([]);
  const [plans, setPlans] = useState<ContentPlan[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  /* ---- Generation ---- */
  const [generating, setGenerating] = useState(false);
  const [genAgent, setGenAgent] = useState("linkedin");
  const [genTopic, setGenTopic] = useState("");
  const [genType, setGenType] = useState("post");
  const [genTone, setGenTone] = useState("default");
  const [genStep, setGenStep] = useState("");
  const [planWeek, setPlanWeek] = useState("");

  /* ---- Edit modal ---- */
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [editBody, setEditBody] = useState("");
  const [editNotes, setEditNotes] = useState("");

  /* ---- Schedule popover ---- */
  // # Tracks which content item has the schedule picker open and the selected date/time
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");

  /* ---- Plan item preview modal ---- */
  // # Shows production-ready post (image + caption) when clicking a plan item
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);
  const [previewSlides, setPreviewSlides] = useState<VisualSlide[]>([]);
  const [generatingPreview, setGeneratingPreview] = useState<number | null>(null);

  /* ---- Posting & regenerating ---- */
  const [posting, setPosting] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState<string | null>(null);

  /* ---- Visual generation ---- */
  const [generatingVisual, setGeneratingVisual] = useState<string | null>(null);
  const [visualPreviews, setVisualPreviews] = useState<Record<string, VisualSlide[]>>({});

  /* ---- Creative Studio ---- */
  // # Image model selection for visual generation (flux-pro, flux-schnell, openai, canvas)
  const [imageModel, setImageModel] = useState("flux-pro");
  // # Ambassador video generation loading state + topic input
  const [generatingAmbassador, setGeneratingAmbassador] = useState(false);
  const [ambassadorTopic, setAmbassadorTopic] = useState("");

  /* ---- Video generation ---- */
  const [generatingVideo, setGeneratingVideo] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState<Record<string, number>>({});

  /* ---- Engagement tracking ---- */
  const [engagementOpen, setEngagementOpen] = useState<string | null>(null);
  const [engagementValues, setEngagementValues] = useState<Record<string, string>>({});
  const [savingEngagement, setSavingEngagement] = useState(false);
  const [carouselSlides, setCarouselSlides] = useState<Record<string, number>>({});

  /* ---- KPI ---- */
  const [kpiPlatform, setKpiPlatform] = useState("all");
  const [kpiPeriod, setKpiPeriod] = useState<"week" | "month">("week");
  const [kpiSummary, setKpiSummary] = useState<KpiSummary | null>(null);
  const [kpiAnalysis, setKpiAnalysis] = useState<KpiAnalysis | null>(null);
  const [kpiLoading, setKpiLoading] = useState(false);
  const [kpiAnalyzing, setKpiAnalyzing] = useState(false);
  const [kpiMetricType, setKpiMetricType] = useState("impressions");
  const [kpiValue, setKpiValue] = useState("");
  const [kpiDate, setKpiDate] = useState(new Date().toISOString().split("T")[0]);

  /* ---- Email Nurture state ---- */
  const [sequences, setSequences] = useState<{ id: string; name: string; description: string | null; trigger: string; priority: number; status: string; steps: string; createdAt: string }[]>([]);
  const [emailSends, setEmailSends] = useState<{ id: string; sequenceId: string; recipientEmail: string; subject: string; status: string; sentAt: string | null; openedAt: string | null; clickedAt: string | null }[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(false);

  /* ---- Funnel state ---- */
  const [funnelData, setFunnelData] = useState<{ stages: { name: string; count: number; percent: number }[]; totalSignups: number } | null>(null);
  const [attribution, setAttribution] = useState<{ channel: string; signups: number; firstUse: number; proUpgrades: number; convRate: number; estRevenue: number }[]>([]);
  const [funnelInsights, setFunnelInsights] = useState<{ insights: string[]; recommendations: string[] } | null>(null);
  const [funnelLoading, setFunnelLoading] = useState(false);
  const [funnelAnalyzing, setFunnelAnalyzing] = useState(false);

  /* ---- Settings / Platform Connections ---- */
  const [platformStatus, setPlatformStatus] = useState<Record<string, { connected: boolean; expiresAt: string | null }>>({});
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

  /* ---- Toast ---- */
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const toastTimeout = useRef<NodeJS.Timeout>(undefined);

  /* ---- View mode: dashboard (raw) vs platform preview ---- */
  const [viewMode, setViewMode] = useState<"dashboard" | "preview">("preview");

  /* ---- New content highlight ---- */
  const [newContentId, setNewContentId] = useState<string | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast({ message, type });
    toastTimeout.current = setTimeout(() => setToast(null), 4000);
  };

  /* ---- Update content type when agent changes ---- */
  useEffect(() => {
    const types = AGENT_META[genAgent]?.contentTypes || [];
    if (types.length > 0 && !types.includes(genType)) {
      setGenType(types[0]);
    }
  }, [genAgent, genType]);

  /* ---- Auto-suggest next Monday for plan date ---- */
  useEffect(() => {
    if (!planWeek) {
      const now = new Date();
      const day = now.getDay();
      const daysUntilMonday = day === 0 ? 1 : (8 - day);
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + daysUntilMonday);
      setPlanWeek(nextMonday.toISOString().split("T")[0]);
    }
  }, [planWeek]);

  /* ---- Auth check ---- */
  useEffect(() => {
    fetch("/api/content?page=1").then((r) => { if (r.ok) setAuthed(true); }).catch(() => {});
  }, []);

  const handleLogin = async () => {
    setAuthError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) setAuthed(true);
    else setAuthError("Wrong password");
  };

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    setAuthed(false);
    setPassword("");
    setContent([]);
    setPlans([]);
  };

  /* ---- Data fetching ---- */
  const fetchContent = useCallback(async (p?: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterPlatform) params.set("platform", filterPlatform);
      if (filterStatus) params.set("status", filterStatus);
      params.set("page", String(p || page));
      const res = await fetch(`/api/content?${params}`);
      if (res.ok) {
        const data = await res.json();
        setContent(data.items);
        setTotal(data.total);
        setTotalPages(data.totalPages);

        // # Hydrate visualPreviews from persisted imageUrl so images show on page load
        setVisualPreviews(prev => {
          const merged = { ...prev };
          let changed = false;
          for (const item of data.items as ContentItem[]) {
            if (item.imageUrl && !merged[item.id]) {
              const urls = item.imageUrl.match(/(?:https?:\/\/[^,\s]+|data:[^,]+,[^,\s]*)/g);
              if (urls && urls.length > 0) {
                merged[item.id] = urls.map((url: string, i: number) => ({
                  index: i,
                  visualId: `persisted-${i}`,
                  imageUrl: url.trim(),
                  width: 0,
                  height: 0,
                }));
                changed = true;
              }
            }
          }
          return changed ? merged : prev;
        });
      }
    } catch {
      showToast("Failed to load content", "error");
    }
    setLoading(false);
  }, [filterPlatform, filterStatus, page]);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/plan");
      if (res.ok) setPlans(await res.json());
    } catch {
      showToast("Failed to load plans", "error");
    }
  }, []);

  const fetchPlatformStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/connect/status");
      if (res.ok) setPlatformStatus(await res.json());
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (authed) { fetchContent(); fetchPlans(); fetchPlatformStatus(); }
  }, [authed, fetchContent, fetchPlans, fetchPlatformStatus]);

  // # Listen for OAuth callback messages from popup windows
  useEffect(() => {
    const handleOAuthMessage = async (e: MessageEvent) => {
      // # Reject messages from other origins and validate platform value
      if (e.origin !== window.location.origin) return;
      if (e.data?.type !== "oauth-callback") return;
      const { platform, code, error, state } = e.data;
      if (!["linkedin", "twitter", "instagram"].includes(platform)) return;

      if (error) {
        showToast(`${platform} connection failed: ${error}`, "error");
        setConnectingPlatform(null);
        return;
      }

      // # Exchange the code for a token, forwarding state for CSRF verification
      try {
        const res = await fetch(`/api/connect/${platform}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, state }),
        });

        if (res.ok) {
          showToast(`${platform} connected!`, "success");
          fetchPlatformStatus();
        } else {
          const data = await res.json().catch(() => ({}));
          showToast(data.error || `${platform} connection failed`, "error");
        }
      } catch {
        showToast(`Failed to connect ${platform}`, "error");
      } finally {
        setConnectingPlatform(null);
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [fetchPlatformStatus]);

  const goToPage = (p: number) => { setPage(p); fetchContent(p); };

  // # Open OAuth popup for a platform
  const handleConnect = async (platform: string) => {
    setConnectingPlatform(platform);
    try {
      const res = await fetch(`/api/connect/${platform}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || `Cannot connect ${platform}`, "error");
        setConnectingPlatform(null);
        return;
      }
      const { url } = await res.json();
      // # Open the OAuth consent page in a popup
      window.open(url, `connect-${platform}`, "width=600,height=700,popup=yes");
    } catch {
      showToast(`Failed to start ${platform} connection`, "error");
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (platform: string) => {
    try {
      await fetch(`/api/connect/${platform}`, { method: "DELETE" });
      showToast(`${platform} disconnected`, "success");
      fetchPlatformStatus();
    } catch {
      showToast(`Failed to disconnect ${platform}`, "error");
    }
  };

  /* ---- Status counts ---- */
  const pendingCount = content.filter(c => c.status === "pending").length;

  /* ---- Content Actions ---- */
  // # Generate content — if no topic is provided, the agent auto-discovers a trending topic
  const handleGenerate = async () => {
    const isAuto = !genTopic.trim();
    setGenerating(true);
    setGenStep(isAuto ? "Discovering trending topics..." : "Researching trends...");
    try {
      // # Step indicator updates while API does research + generation + visual design
      // # Auto mode takes longer because it runs topic discovery first
      const stepTimer = setTimeout(() => setGenStep(isAuto ? "Picking the best angle..." : "Writing content..."), isAuto ? 12000 : 8000);
      const stepTimer2 = setTimeout(() => setGenStep("Writing content..."), isAuto ? 20000 : 99999);
      const stepTimer3 = setTimeout(() => setGenStep("Designing visuals..."), isAuto ? 32000 : 18000);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: genAgent,
          topic: genTopic.trim() || "",
          contentType: genType,
          tone: genTone,
        }),
      });
      clearTimeout(stepTimer);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      if (res.ok) {
        const data = await res.json();
        setGenTopic("");
        setNewContentId(data.id);
        setTimeout(() => setNewContentId(null), 5000);
        showToast(
          isAuto
            ? `${AGENT_META[genAgent]?.name || genAgent} found a trending topic and generated content`
            : `${AGENT_META[genAgent]?.name || genAgent} generated content with visuals`,
          "success"
        );
        fetchContent();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Generation failed", "error");
      }
    } catch {
      showToast("Network error -- check your connection", "error");
    } finally { setGenerating(false); setGenStep(""); }
  };

  const handleRegenerate = async (item: ContentItem) => {
    setRegenerating(item.id);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerateId: item.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewContentId(data.id);
        setTimeout(() => setNewContentId(null), 5000);
        showToast("New version generated", "success");
        fetchContent();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Regeneration failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally { setRegenerating(null); }
  };

  const handleGeneratePlan = async () => {
    if (!planWeek.trim()) return;
    setGenerating(true);
    setGenStep("Researching industry trends...");
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekOf: planWeek }),
      });
      if (res.ok) {
        showToast("Maya created your content plan", "success");
        fetchPlans();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Plan generation failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally { setGenerating(false); setGenStep(""); }
  };

  const handleGenerateBatch = async (planId: string) => {
    setGenerating(true);
    setGenStep("Researching and generating all posts...");
    showToast("Generating all posts -- this takes 60-120 seconds with research...", "success");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`Generated ${data.generated}/${data.total} posts`, "success");
        setTab("queue");
        setFilterStatus("pending");
        setPage(1);
        fetchContent(1);
        fetchPlans();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Batch generation failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally { setGenerating(false); setGenStep(""); }
  };

  /* ---- Visual Generation ---- */
  // # Generate visual using the AI designer agent — contentId triggers design mode on the backend
  const handleGenerateVisual = async (item: ContentItem, redesign = false) => {
    setGeneratingVisual(item.id);
    try {
      // # redesign=true forces a fresh AI design even if visualData already exists
      const res = await fetch("/api/visual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId: item.id, redesign, model: imageModel }),
      });

      if (res.ok) {
        const data = await res.json();
        setVisualPreviews(prev => ({ ...prev, [item.id]: data.slides }));
        showToast("Visual generated", "success");
        fetchContent();
      } else {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        showToast(err.error || "Visual generation failed", "error");
      }
    } catch {
      showToast("Visual generation error", "error");
    } finally { setGeneratingVisual(null); }
  };

  // # Generate video reel via Remotion Lambda — triggers render and polls for progress
  const handleGenerateVideo = async (item: ContentItem) => {
    setGeneratingVideo(item.id);
    setVideoProgress(prev => ({ ...prev, [item.id]: 0 }));
    try {
      const res = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId: item.id, redesign: !!item.videoUrl }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        showToast(err.error || "Video render failed", "error");
        return;
      }

      const { renderId } = await res.json();

      // # Poll for render progress every 3 seconds
      const poll = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/video/${renderId}`);
          if (!statusRes.ok) return;
          const status = await statusRes.json();
          setVideoProgress(prev => ({ ...prev, [item.id]: status.progress || 0 }));

          if (status.status === "done" || status.status === "error") {
            clearInterval(poll);
            setGeneratingVideo(null);
            if (status.status === "done") {
              showToast("Video rendered", "success");
              fetchContent();
            } else {
              showToast(`Video render failed: ${status.error}`, "error");
            }
          }
        } catch {
          clearInterval(poll);
          setGeneratingVideo(null);
          showToast("Lost connection to render", "error");
        }
      }, 3000);
    } catch {
      showToast("Video generation error", "error");
    } finally {
      if (generatingVideo === item.id) setGeneratingVideo(null);
    }
  };

  // # Generate an ambassador video — full pipeline from topic to queued content
  const handleGenerateAmbassador = async () => {
    setGeneratingAmbassador(true);
    try {
      const res = await fetch("/api/creative/generate-ambassador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: ambassadorTopic.trim() || undefined,
          platform: "tiktok",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAmbassadorTopic("");
        setNewContentId(data.contentId);
        setTimeout(() => setNewContentId(null), 5000);
        showToast(`Ambassador video generated (${data.duration}s)`, "success");
        fetchContent();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Ambassador generation failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setGeneratingAmbassador(false);
    }
  };

  const downloadVisual = (dataUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.click();
  };

  // # Download carousel slides as a PDF for LinkedIn posting
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);
  const downloadPdf = async (contentId: string, platform: string) => {
    setDownloadingPdf(contentId);
    try {
      const res = await fetch("/api/visual/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId }),
      });
      if (!res.ok) {
        showToast("PDF generation failed", "error");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `jobpilot-carousel-${platform}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      showToast("PDF downloaded", "success");
    } catch {
      showToast("PDF download error", "error");
    } finally {
      setDownloadingPdf(null);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchContent();
    } catch {
      showToast("Failed to update", "error");
    }
  };

  const bulkApprove = async () => {
    const pendingItems = content.filter(c => c.status === "pending");
    if (pendingItems.length === 0) return;
    for (const item of pendingItems) {
      await fetch(`/api/content/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      }).catch(() => {});
    }
    showToast(`Approved ${pendingItems.length} items`, "success");
    fetchContent();
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await fetch(`/api/content/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: editBody, notes: editNotes }),
      });
      setEditing(null);
      showToast("Saved", "success");
      fetchContent();
    } catch {
      showToast("Failed to save", "error");
    }
  };

  const deleteContent = async (id: string) => {
    await fetch(`/api/content/${id}`, { method: "DELETE" }).catch(() => {});
    fetchContent();
  };

  // # Set a post's scheduled time and change status to "scheduled"
  const handleSchedule = async (id: string) => {
    if (!scheduleDate || !scheduleTime) {
      showToast("Pick a date and time", "error");
      return;
    }
    const scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    try {
      await fetch(`/api/content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "scheduled", scheduledFor }),
      });
      setSchedulingId(null);
      showToast(`Scheduled for ${scheduleDate} at ${scheduleTime}`, "success");
      fetchContent();
    } catch {
      showToast("Failed to schedule", "error");
    }
  };

  // # Map platform name to the agent ID that handles it
  const PLATFORM_TO_AGENT: Record<string, string> = {
    linkedin: "linkedin",
    twitter: "twitter",
    instagram: "instagram",
    tiktok: "tiktok",
  };

  // # Generate a single post from a plan item, render its visuals, and open the preview modal
  const handlePlanItemClick = async (item: PlanItem, index: number) => {
    setGeneratingPreview(index);
    setPreviewItem(null);
    setPreviewSlides([]);

    try {
      // # Step 1: Generate the content using the platform-specific agent
      const agentId = PLATFORM_TO_AGENT[item.platform] || "linkedin";
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          topic: item.topic,
          contentType: item.contentType,
          context: `Content pillar: ${item.pillar}. Hook angle: ${item.hook}`,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Failed to generate post", "error");
        return;
      }

      const contentRecord: ContentItem = await res.json();
      setPreviewItem(contentRecord);
      fetchContent();

      // # Step 2: Render the visual (wait for auto-design to complete, then render)
      const visualTypes = ["post", "carousel", "single_image", "reel_script"];
      if (visualTypes.includes(contentRecord.contentType)) {
        const visualRes = await fetch("/api/visual", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentId: contentRecord.id }),
        });

        if (visualRes.ok) {
          const visualData = await visualRes.json();
          setPreviewSlides(visualData.slides || []);
          // # Also store in the global visual previews so the queue tab shows them
          setVisualPreviews(prev => ({ ...prev, [contentRecord.id]: visualData.slides || [] }));
          // # Refresh to get the updated caption
          const refreshRes = await fetch(`/api/content?page=1`);
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            const updated = refreshData.items.find((c: ContentItem) => c.id === contentRecord.id);
            if (updated) setPreviewItem(updated);
          }
        }
      }

      showToast(`${AGENT_META[agentId]?.name || agentId} generated your post`, "success");
    } catch {
      showToast("Network error generating post", "error");
    } finally {
      setGeneratingPreview(null);
    }
  };

  const handlePost = async (id: string) => {
    setPosting(id);
    try {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId: id }),
      });
      const data = await res.json();
      if (data.success) showToast("Posted!", "success");
      else showToast(data.error || "Posting failed", "error");
      fetchContent();
    } catch {
      showToast("Network error", "error");
    } finally { setPosting(null); }
  };

  /* ---- Engagement tracking ---- */
  const handleSaveEngagement = async (itemId: string) => {
    setSavingEngagement(true);
    try {
      const res = await fetch(`/api/content/${itemId}/engagement`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          likes: parseInt(engagementValues[`${itemId}_likes`] || "0") || 0,
          comments: parseInt(engagementValues[`${itemId}_comments`] || "0") || 0,
          shares: parseInt(engagementValues[`${itemId}_shares`] || "0") || 0,
          saves: parseInt(engagementValues[`${itemId}_saves`] || "0") || 0,
          impressions: parseInt(engagementValues[`${itemId}_impressions`] || "0") || 0,
        }),
      });
      if (res.ok) {
        showToast("Engagement saved", "success");
        setEngagementOpen(null);
        fetchContent();
      } else {
        showToast("Failed to save engagement", "error");
      }
    } catch {
      showToast("Failed to save engagement", "error");
    }
    setSavingEngagement(false);
  };

  const openEngagement = (item: ContentItem) => {
    setEngagementOpen(engagementOpen === item.id ? null : item.id);
    setEngagementValues((prev) => ({
      ...prev,
      [`${item.id}_likes`]: String(item.engagementLikes || 0),
      [`${item.id}_comments`]: String(item.engagementComments || 0),
      [`${item.id}_shares`]: String(item.engagementShares || 0),
      [`${item.id}_saves`]: String(item.engagementSaves || 0),
      [`${item.id}_impressions`]: String(item.engagementImpressions || 0),
    }));
  };

  const copyContent = (item: ContentItem) => {
    let text = item.body;
    if (item.hashtags && item.platform !== "twitter") {
      text += "\n\n" + item.hashtags.split(",").map((t) => `#${t.trim()}`).join(" ");
    }
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard", "success");
  };

  /* ---- KPI Actions ---- */
  const fetchKpi = useCallback(async () => {
    setKpiLoading(true);
    try {
      const res = await fetch(`/api/kpi?platform=${kpiPlatform}&period=${kpiPeriod}`);
      if (res.ok) {
        const data = await res.json();
        setKpiSummary(data.summary);
      }
    } catch {
      showToast("Failed to load KPIs", "error");
    }
    setKpiLoading(false);
  }, [kpiPlatform, kpiPeriod]);

  useEffect(() => {
    if (authed && tab === "kpi") fetchKpi();
  }, [authed, tab, fetchKpi]);

  /* # Fetch email sequences and recent sends */
  const fetchEmails = useCallback(async () => {
    setEmailsLoading(true);
    try {
      const [seqRes, sendsRes] = await Promise.all([
        fetch("/api/email/sequences"),
        fetch("/api/email/sends?limit=50"),
      ]);
      if (seqRes.ok) setSequences(await seqRes.json());
      if (sendsRes.ok) setEmailSends(await sendsRes.json());
    } catch (e) { console.error("Email fetch failed:", e); }
    setEmailsLoading(false);
  }, []);

  /* # Toggle a sequence between active and draft/paused states.
     # Sequences seed in "draft" and never send until activated here —
     # this is the switch that turns the email nurture engine on/off. */
  const toggleSequence = async (id: string, status: "active" | "paused") => {
    try {
      const res = await fetch("/api/email/sequences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        showToast(status === "active" ? "Sequence activated" : "Sequence paused", "success");
        fetchEmails();
      } else {
        showToast("Failed to update sequence", "error");
      }
    } catch {
      showToast("Failed to update sequence", "error");
    }
  };

  /* # Fetch funnel data and attribution */
  const fetchFunnel = useCallback(async () => {
    setFunnelLoading(true);
    try {
      const [funnelRes, attrRes] = await Promise.all([
        fetch("/api/funnel"),
        fetch("/api/funnel/attribution"),
      ]);
      if (funnelRes.ok) setFunnelData(await funnelRes.json());
      if (attrRes.ok) setAttribution(await attrRes.json());
    } catch (e) { console.error("Funnel fetch failed:", e); }
    setFunnelLoading(false);
  }, []);

  /* # Run AI funnel analysis */
  const analyzeFunnelData = useCallback(async () => {
    setFunnelAnalyzing(true);
    try {
      const res = await fetch("/api/funnel", { method: "POST" });
      if (res.ok) setFunnelInsights(await res.json());
    } catch (e) { console.error("Funnel analysis failed:", e); }
    setFunnelAnalyzing(false);
  }, []);

  useEffect(() => {
    if (authed && tab === "emails") fetchEmails();
    if (authed && tab === "funnel") fetchFunnel();
  }, [authed, tab, fetchEmails, fetchFunnel]);

  const handleAddMetric = async () => {
    if (!kpiValue.trim()) return;
    try {
      const res = await fetch("/api/kpi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "metric",
          platform: kpiPlatform === "all" ? "linkedin" : kpiPlatform,
          metricType: kpiMetricType,
          value: Number(kpiValue),
          date: kpiDate,
        }),
      });
      if (res.ok) {
        setKpiValue("");
        showToast("Metric added", "success");
        fetchKpi();
      }
    } catch {
      showToast("Failed to add metric", "error");
    }
  };

  const handleAnalyzeKpi = async () => {
    setKpiAnalyzing(true);
    try {
      const res = await fetch("/api/kpi/analyze", { method: "POST" });
      if (res.ok) {
        setKpiAnalysis(await res.json());
        showToast("Analysis complete", "success");
      }
    } catch {
      showToast("Analysis failed", "error");
    }
    setKpiAnalyzing(false);
  };

  /* ============================================================
     LOGIN SCREEN
     ============================================================ */
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Marketing HQ</h1>
            <p className="text-text-secondary text-sm mt-1">JobPilot AI Agent Dashboard</p>
          </div>
          <div className="bg-card-bg border border-card-border rounded-xl p-6">
            <label className="block text-sm text-text-secondary mb-2">Admin Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} className="w-full px-4 py-3 bg-space-700 border border-card-border rounded-lg text-text-primary focus:outline-none focus:border-indigo-500 mb-4" placeholder="Enter password" />
            {authError && <p className="text-red-400 text-sm mb-3">{authError}</p>}
            <button onClick={handleLogin} className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">Sign In</button>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     MAIN DASHBOARD
     ============================================================ */
  return (
    <div className="min-h-screen">
      {/* ---- Toast ---- */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg border text-sm font-medium shadow-lg animate-[fadeIn_0.2s] ${
          toast.type === "success" ? "bg-green-500/15 text-green-400 border-green-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"
        }`}>
          {toast.message}
        </div>
      )}

      {/* ---- Header ---- */}
      <header className="border-b border-card-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Marketing HQ</h1>
            <p className="text-text-muted text-xs">JobPilot AI Agent Team</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(["queue", "plans", "agents", "kpi", "emails", "funnel", "settings"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20" : "text-text-secondary hover:text-text-primary hover:bg-space-700"
            }`}>
              {t === "queue" ? `Content${total ? ` (${total})` : ""}` : t === "plans" ? "Plans" : t === "kpi" ? "KPIs" : t === "emails" ? "Emails" : t === "funnel" ? "Funnel" : t === "settings" ? "Settings" : "Agents"}
            </button>
          ))}
          <div className="w-px h-6 bg-card-border mx-1" />
          <button onClick={handleLogout} className="px-3 py-2 text-text-muted text-sm hover:text-red-400 transition-colors rounded-lg hover:bg-space-700">Logout</button>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">

        {/* ==== CONTENT QUEUE TAB ==== */}
        {tab === "queue" && (
          <>
            {/* Generate content */}
            <div className="bg-card-bg border border-card-border rounded-xl p-5 mb-6">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Generate Content
              </h2>
              <div className="flex flex-wrap gap-3">
                {/* Agent selector */}
                <select value={genAgent} onChange={(e) => setGenAgent(e.target.value)} className="px-3 py-2 bg-space-700 border border-card-border rounded-lg text-sm text-text-primary">
                  <option value="linkedin">James - LinkedIn</option>
                  <option value="twitter">Zara - X/Twitter</option>
                  <option value="instagram">Sofia - Instagram</option>
                  <option value="tiktok">Marcus - TikTok</option>
                </select>

                {/* Content type -- filtered by agent */}
                <select value={genType} onChange={(e) => setGenType(e.target.value)} className="px-3 py-2 bg-space-700 border border-card-border rounded-lg text-sm text-text-primary">
                  {(AGENT_META[genAgent]?.contentTypes || ["post"]).map((ct) => (
                    <option key={ct} value={ct}>{CONTENT_TYPE_LABELS[ct] || ct}</option>
                  ))}
                </select>

                {/* Tone selector */}
                <select value={genTone} onChange={(e) => setGenTone(e.target.value)} className="px-3 py-2 bg-space-700 border border-card-border rounded-lg text-sm text-text-primary">
                  {TONE_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>

                {/* Topic input — leave empty to let the agent auto-discover a trending topic */}
                <input
                  type="text"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  placeholder="Leave empty for auto-trending, or enter a specific topic"
                  className="flex-1 min-w-[300px] px-4 py-2 bg-space-700 border border-card-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-indigo-500"
                />
                <button onClick={handleGenerate} disabled={generating} className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity whitespace-nowrap">
                  {generating ? genStep || "Generating..." : genTopic.trim() ? "Generate" : "Auto Generate"}
                </button>
              </div>
            </div>

            {/* Ambassador Video Generation */}
            <div className="bg-card-bg border border-card-border rounded-xl p-5 mb-6">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                {/* # Cyan dot matches ambassador agent color */}
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                Ambassador Video
              </h2>
              <div className="flex flex-wrap gap-3">
                <input
                  type="text"
                  value={ambassadorTopic}
                  onChange={(e) => setAmbassadorTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerateAmbassador()}
                  placeholder="Leave empty for auto-trending, or enter a career tip topic"
                  className="flex-1 min-w-[300px] px-4 py-2 bg-space-700 border border-card-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleGenerateAmbassador}
                  disabled={generatingAmbassador}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity whitespace-nowrap"
                >
                  {generatingAmbassador ? "Generating Video..." : "Generate Ambassador Video"}
                </button>
              </div>
              {/* # HeyGen renders typically take ~60s; inform the user upfront */}
              <p className="text-text-muted text-xs mt-2">AI spokesperson presents career tips in a professional talking-head video. Uses HeyGen API (~60s to generate).</p>
            </div>

            {/* Filters + actions bar */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="text-text-muted text-sm">Filter:</span>
              <select value={filterPlatform} onChange={(e) => { setFilterPlatform(e.target.value); setPage(1); }} className="px-3 py-1.5 bg-space-700 border border-card-border rounded-lg text-sm text-text-secondary">
                <option value="">All Platforms</option>
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">X/Twitter</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
              </select>
              <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="px-3 py-1.5 bg-space-700 border border-card-border rounded-lg text-sm text-text-secondary">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="scheduled">Scheduled</option>
                <option value="posted">Posted</option>
                <option value="rejected">Rejected</option>
              </select>

              {pendingCount > 0 && (
                <button onClick={bulkApprove} className="px-3 py-1.5 bg-green-500/15 text-green-400 text-xs font-medium rounded-lg hover:bg-green-500/25 transition-colors border border-green-500/20">
                  Approve All ({pendingCount})
                </button>
              )}

              {/* # Bulk generate missing images via fal.ai */}
              {content.filter(c => !c.imageUrl && c.contentType !== "post" && c.contentType !== "thread").length > 0 && (
                <button
                  onClick={async () => {
                    const missing = content.filter(c => !c.imageUrl && c.contentType !== "post" && c.contentType !== "thread");
                    showToast(`Generating images for ${missing.length} posts...`, "success");
                    for (const item of missing) {
                      try {
                        await handleGenerateVisual(item, true);
                      } catch { /* individual errors handled by handleGenerateVisual */ }
                    }
                    showToast(`Done generating images`, "success");
                  }}
                  className="px-3 py-1.5 bg-purple-500/15 text-purple-400 text-xs font-medium rounded-lg hover:bg-purple-500/25 transition-colors border border-purple-500/20"
                >
                  Generate Missing Images ({content.filter(c => !c.imageUrl && c.contentType !== "post" && c.contentType !== "thread").length})
                </button>
              )}

              <span className="text-text-muted text-sm ml-auto">{total} items</span>

              {/* # View mode toggle: Dashboard (raw data) vs Preview (platform-faithful) */}
              <div className="flex items-center bg-space-700 rounded-lg border border-card-border p-0.5">
                <button
                  onClick={() => setViewMode("dashboard")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === "dashboard" ? "bg-indigo-500/20 text-indigo-400" : "text-text-muted hover:text-text-secondary"}`}
                >
                  <span className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    Dashboard
                  </span>
                </button>
                <button
                  onClick={() => setViewMode("preview")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === "preview" ? "bg-indigo-500/20 text-indigo-400" : "text-text-muted hover:text-text-secondary"}`}
                >
                  <span className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    Preview
                  </span>
                </button>
              </div>

              <button onClick={() => fetchContent()} className="text-text-secondary text-sm hover:text-text-primary transition-colors">Refresh</button>
            </div>

            {/* Content cards */}
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3">
                <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <span className="text-text-muted">Loading...</span>
              </div>
            ) : content.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-space-700 flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="18" x2="12" y2="12" strokeLinecap="round"/><line x1="9" y1="15" x2="15" y2="15" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-text-secondary mb-1">No content yet</p>
                <p className="text-text-muted text-sm">Generate content above or create a plan in the Plans tab</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {content.map((item) => {
                    const agent = AGENT_META[item.agent] || { name: item.agent, role: "", avatar: "?", color: "#666", contentTypes: [], description: "" };
                    const isNew = item.id === newContentId;
                    const previews = visualPreviews[item.id];
                    const hasVisuals = !!item.imageUrl || !!previews;
                    const hasDesignData = !!item.visualData && !item.imageUrl && !previews;

                    return (
                      <div key={item.id} className={`bg-card-bg border rounded-xl p-5 transition-all ${isNew ? "border-indigo-500/40 ring-1 ring-indigo-500/20" : "border-card-border hover:border-indigo-500/20"}`}>

                        {(() => {
                          // # Parse image URLs from comma-separated string or visual slides
                          const allImages: string[] = (() => {
                            if (previews && previews.length > 0) {
                              const urls = previews.map(s => s.dataUrl || s.imageUrl).filter(Boolean) as string[];
                              if (urls.length > 0) return urls;
                            }
                            if (!item.imageUrl) return [];
                            const urls = item.imageUrl.match(/(?:https?:\/\/[^,\s]+|data:[^,]+,[^,\s]*)/g);
                            return urls ? urls.map(u => u.trim()).filter(Boolean) : [item.imageUrl.trim()];
                          })();
                          const isCarousel = allImages.length > 1;
                          const carouselKey = `carousel_${item.id}`;

                          return (
                          <>
                            {/* ==== CONTENT CARD ==== */}
                            {/* # Header: agent, platform, type, score, status, date */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: agent.color }}>{agent.avatar}</div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium text-sm">{agent.name}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${PLATFORM_COLORS[item.platform] || "#666"}22`, color: PLATFORM_COLORS[item.platform] || "#999" }}>
                                      {item.platform === "twitter" ? "X / Twitter" : item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}
                                    </span>
                                    <span className="text-xs text-text-muted">{CONTENT_TYPE_LABELS[item.contentType] || item.contentType}</span>
                                    {isNew && <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 font-medium">New</span>}
                                    {item.editorialScore != null && item.editorialScore > 0 && (
                                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium cursor-help ${item.editorialScore >= 8 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : item.editorialScore >= 6 ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"}`} title={item.editorialFeedback || "Editorial review score"}>
                                        {item.editorialScore}/10
                                      </span>
                                    )}
                                    {item.variationGroup && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium" title={`Variation group: ${item.variationGroup}`}>A/B</span>
                                    )}
                                  </div>
                                  <p className="text-text-muted text-xs mt-0.5">{item.title}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_STYLES[item.status] || ""}`}>{item.status}</span>
                                <span className="text-text-muted text-xs">{new Date(item.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {/* # Hook */}
                            {item.hook && <p className="text-indigo-400 text-sm font-medium mb-2 italic">&ldquo;{item.hook}&rdquo;</p>}

                            {/* # Caption / Body text */}
                            <div className="mb-4">
                              <p className="text-text-muted text-xs font-medium mb-1 uppercase tracking-wider">Caption</p>
                              <pre className="text-text-secondary text-sm whitespace-pre-wrap font-sans leading-relaxed">{item.captionText || item.body}</pre>
                            </div>

                            {/* # Hashtags */}
                            {item.hashtags && (
                              <p className="text-indigo-400/60 text-xs mb-4">{item.hashtags.split(",").map((t: string) => `#${t.trim()}`).join(" ")}</p>
                            )}

                            {/* # Template image(s) — full size, carousel for multi-slide */}
                            {allImages.length > 0 && (
                              <div className="mb-4">
                                {isCarousel ? (
                                  <div>
                                    <div className="relative rounded-lg overflow-hidden border border-card-border bg-space-800">
                                      <img
                                        src={allImages[carouselSlides[item.id] || 0]}
                                        alt={`Slide ${(carouselSlides[item.id] || 0) + 1}`}
                                        style={{ width: "100%", height: "auto", display: "block" }}
                                      />
                                      {/* # Slide counter */}
                                      <div className="absolute top-3 right-3 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                                        {(carouselSlides[item.id] || 0) + 1} / {allImages.length}
                                      </div>
                                      {/* # Prev arrow */}
                                      {(carouselSlides[item.id] || 0) > 0 && (
                                        <button
                                          onClick={() => setCarouselSlides(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) - 1 }))}
                                          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-white/20 flex items-center justify-center text-gray-800 hover:bg-white transition-colors shadow-lg"
                                        >
                                          &#8249;
                                        </button>
                                      )}
                                      {/* # Next arrow */}
                                      {(carouselSlides[item.id] || 0) < allImages.length - 1 && (
                                        <button
                                          onClick={() => setCarouselSlides(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }))}
                                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-white/20 flex items-center justify-center text-gray-800 hover:bg-white transition-colors shadow-lg"
                                        >
                                          &#8250;
                                        </button>
                                      )}
                                    </div>
                                    {/* # Dot indicators */}
                                    <div className="flex justify-center gap-1.5 mt-2">
                                      {allImages.map((_, i) => (
                                        <button
                                          key={i}
                                          onClick={() => setCarouselSlides(prev => ({ ...prev, [item.id]: i }))}
                                          className={`w-2 h-2 rounded-full transition-colors ${i === (carouselSlides[item.id] || 0) ? "bg-indigo-500" : "bg-space-600 hover:bg-space-500"}`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="rounded-lg overflow-hidden border border-card-border">
                                    <img
                                      src={allImages[0]}
                                      alt="Post visual"
                                      style={{ width: "100%", height: "auto", display: "block" }}
                                    />
                                  </div>
                                )}
                                {/* # Download button */}
                                <button
                                  onClick={() => {
                                    const idx = isCarousel ? (carouselSlides[item.id] || 0) : 0;
                                    downloadVisual(allImages[idx], `jobpilot-${item.platform}-${isCarousel ? `slide-${idx + 1}` : "image"}.png`);
                                  }}
                                  className="mt-2 px-3 py-1 bg-space-600 text-text-secondary text-xs rounded-lg hover:text-text-primary transition-colors"
                                >
                                  Download {isCarousel ? `Slide ${(carouselSlides[item.id] || 0) + 1}` : "Image"}
                                </button>
                              </div>
                            )}

                            {/* # Video preview for reels */}
                            {item.videoUrl && (
                              <div className="mb-3">
                                <video src={item.videoUrl} controls className="rounded-lg border border-card-border w-full" style={{ maxWidth: "400px" }} />
                                <a href={item.videoUrl} download={`jobpilot-reel-${item.platform}.mp4`} className="inline-block mt-2 px-3 py-1 bg-space-600 text-text-secondary text-xs rounded-lg hover:text-text-primary transition-colors">Download MP4</a>
                              </div>
                            )}

                            {/* # Notes */}
                            {item.notes && (
                              <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-lg px-3 py-2 mb-3">
                                <p className="text-yellow-400/70 text-xs">{item.notes}</p>
                              </div>
                            )}

                            {/* # Engagement metrics */}
                            {item.engagementScore != null && item.engagementScore > 0 && (
                              <div className="bg-space-700/50 rounded-lg px-3 py-2 mb-3">
                                <div className="flex items-center gap-4 text-xs">
                                  <span className="text-text-muted">Performance:</span>
                                  {item.engagementImpressions != null && <span className="text-text-secondary">{item.engagementImpressions.toLocaleString()} views</span>}
                                  {item.engagementLikes != null && <span className="text-text-secondary">{item.engagementLikes} likes</span>}
                                  {item.engagementComments != null && <span className="text-text-secondary">{item.engagementComments} comments</span>}
                                  {item.engagementShares != null && <span className="text-text-secondary">{item.engagementShares} shares</span>}
                                  {item.engagementSaves != null && <span className="text-text-secondary">{item.engagementSaves} saves</span>}
                                  <span className="text-indigo-400 font-medium ml-auto">Score: {item.engagementScore.toFixed(0)}</span>
                                </div>
                              </div>
                            )}

                            {/* # Engagement input form */}
                            {engagementOpen === item.id && (
                              <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-lg px-3 py-3 mb-3">
                                <p className="text-text-muted text-xs mb-2">Enter engagement metrics from the platform:</p>
                                <div className="grid grid-cols-5 gap-2 mb-2">
                                  {(["impressions", "likes", "comments", "shares", "saves"] as const).map((metric) => (
                                    <div key={metric}>
                                      <label className="block text-text-muted text-xs mb-0.5 capitalize">{metric}</label>
                                      <input type="number" min="0" value={engagementValues[`${item.id}_${metric}`] || "0"} onChange={(e) => setEngagementValues((prev) => ({ ...prev, [`${item.id}_${metric}`]: e.target.value }))} className="w-full px-2 py-1 bg-space-700 border border-card-border rounded text-xs text-text-primary focus:outline-none focus:border-indigo-500" />
                                    </div>
                                  ))}
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => handleSaveEngagement(item.id)} disabled={savingEngagement} className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-medium rounded hover:bg-indigo-500/30 transition-colors disabled:opacity-50">
                                    {savingEngagement ? "Saving..." : "Save Metrics"}
                                  </button>
                                  <button onClick={() => setEngagementOpen(null)} className="text-text-muted text-xs hover:text-text-primary transition-colors">Cancel</button>
                                </div>
                              </div>
                            )}
                          </>
                          );
                        })()}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2 border-t border-card-border flex-wrap">
                          {item.status === "pending" && (
                            <>
                              {/* # Blog articles say "Approve & Publish" because the PATCH handler auto-publishes on approval */}
                              <button onClick={() => updateStatus(item.id, "approved")} className="px-3 py-1.5 bg-green-500/15 text-green-400 text-xs font-medium rounded-lg hover:bg-green-500/25 transition-colors">
                                {item.platform === "blog" && item.contentType === "blog_article" ? "Approve & Publish" : "Approve"}
                              </button>
                              <button onClick={() => updateStatus(item.id, "rejected")} className="px-3 py-1.5 bg-red-500/15 text-red-400 text-xs font-medium rounded-lg hover:bg-red-500/25 transition-colors">Reject</button>
                            </>
                          )}
                          {(item.status === "approved" || item.status === "scheduled") && (
                            <>
                              <button onClick={() => handlePost(item.id)} disabled={posting === item.id} className="px-3 py-1.5 bg-indigo-500/15 text-indigo-400 text-xs font-medium rounded-lg hover:bg-indigo-500/25 transition-colors disabled:opacity-50">
                                {posting === item.id ? "Posting..." : "Post Now"}
                              </button>
                              {item.status === "approved" && (
                                <button
                                  onClick={() => {
                                    // # Default to tomorrow at 9am when opening the scheduler
                                    const tomorrow = new Date();
                                    tomorrow.setDate(tomorrow.getDate() + 1);
                                    setScheduleDate(tomorrow.toISOString().split("T")[0]);
                                    setScheduleTime("09:00");
                                    setSchedulingId(schedulingId === item.id ? null : item.id);
                                  }}
                                  className="px-3 py-1.5 bg-blue-500/15 text-blue-400 text-xs font-medium rounded-lg hover:bg-blue-500/25 transition-colors"
                                >
                                  Schedule
                                </button>
                              )}
                              {item.status === "scheduled" && item.scheduledFor && (
                                <span className="text-xs text-blue-400/70 flex items-center gap-1">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                  {new Date(item.scheduledFor).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </span>
                              )}
                            </>
                          )}
                          {/* # Inline schedule picker — appears below the actions row */}
                          {schedulingId === item.id && (
                            <div className="w-full mt-2 flex items-center gap-2 bg-blue-500/5 border border-blue-500/15 rounded-lg px-3 py-2">
                              <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="px-2 py-1 bg-space-700 border border-card-border rounded text-xs text-text-primary focus:outline-none focus:border-blue-500" />
                              <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="px-2 py-1 bg-space-700 border border-card-border rounded text-xs text-text-primary focus:outline-none focus:border-blue-500" />
                              <button onClick={() => handleSchedule(item.id)} className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded hover:bg-blue-500/30 transition-colors">
                                Confirm
                              </button>
                              <button onClick={() => setSchedulingId(null)} className="text-text-muted text-xs hover:text-text-primary transition-colors">Cancel</button>
                            </div>
                          )}
                          {/* Model selector + visual generation button */}
                          {item.contentType !== "plain_text" && item.contentType !== "thread" && item.contentType !== "reel_script" && item.contentType !== "ambassador_video" && (
                            <>
                              {/* # Model dropdown — shared across all visual content items in the queue */}
                              <select
                                value={imageModel}
                                onChange={(e) => setImageModel(e.target.value)}
                                className="px-2 py-1.5 bg-space-700 border border-card-border rounded-lg text-xs text-text-secondary"
                              >
                                <option value="flux-pro">Flux Pro (best)</option>
                                <option value="flux-schnell">Flux Schnell (fast)</option>
                                <option value="openai">OpenAI</option>
                                <option value="canvas">Canvas 2D (free)</option>
                              </select>
                              <button
                                onClick={() => handleGenerateVisual(item, hasVisuals)}
                                disabled={generatingVisual === item.id}
                                className="px-3 py-1.5 bg-purple-500/15 text-purple-400 text-xs font-medium rounded-lg hover:bg-purple-500/25 transition-colors disabled:opacity-50"
                              >
                                {generatingVisual === item.id ? "Creating Visual..." : hasDesignData ? "Render Visual" : hasVisuals ? "Redesign Visual" : "Generate Visual"}
                              </button>
                            </>
                          )}
                          {/* PDF download for LinkedIn carousels */}
                          {item.contentType === "carousel" && item.visualData && (
                            <button
                              onClick={() => downloadPdf(item.id, item.platform)}
                              disabled={downloadingPdf === item.id}
                              className="px-3 py-1.5 bg-blue-500/15 text-blue-400 text-xs font-medium rounded-lg hover:bg-blue-500/25 transition-colors disabled:opacity-50"
                            >
                              {downloadingPdf === item.id ? "Creating PDF..." : "PDF Carousel"}
                            </button>
                          )}
                          {/* Video generation button for reels */}
                          {item.contentType === "reel_script" && (
                            <button
                              onClick={() => handleGenerateVideo(item)}
                              disabled={generatingVideo === item.id}
                              className="px-3 py-1.5 bg-cyan-500/15 text-cyan-400 text-xs font-medium rounded-lg hover:bg-cyan-500/25 transition-colors disabled:opacity-50"
                            >
                              {generatingVideo === item.id
                                ? `Rendering ${videoProgress[item.id] || 0}%...`
                                : item.videoUrl ? "Re-render Video" : "Generate Video"
                              }
                            </button>
                          )}
                          <button
                            onClick={() => handleRegenerate(item)}
                            disabled={regenerating === item.id}
                            className="px-3 py-1.5 bg-purple-500/15 text-purple-400 text-xs font-medium rounded-lg hover:bg-purple-500/25 transition-colors disabled:opacity-50"
                          >
                            {regenerating === item.id ? "Regenerating..." : "Regenerate"}
                          </button>
                          {/* # Track engagement button — only for posted content */}
                          {item.status === "posted" && (
                            <button onClick={() => openEngagement(item)} className="px-3 py-1.5 bg-emerald-500/15 text-emerald-400 text-xs font-medium rounded-lg hover:bg-emerald-500/25 transition-colors">
                              {item.engagementScore ? "Update Metrics" : "Track"}
                            </button>
                          )}
                          <button onClick={() => copyContent(item)} className="px-3 py-1.5 bg-space-600 text-text-secondary text-xs font-medium rounded-lg hover:text-text-primary transition-colors">Copy</button>
                          <button onClick={() => { setEditing(item); setEditBody(item.body); setEditNotes(item.notes || ""); }} className="px-3 py-1.5 bg-space-600 text-text-secondary text-xs font-medium rounded-lg hover:text-text-primary transition-colors">Edit</button>
                          <button onClick={() => deleteContent(item.id)} className="px-3 py-1.5 text-text-muted text-xs hover:text-red-400 transition-colors ml-auto">Delete</button>
                          <span className="text-text-muted text-xs">{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button onClick={() => goToPage(page - 1)} disabled={page <= 1} className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors">Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2)).map((p) => (
                      <button key={p} onClick={() => goToPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20" : "text-text-secondary hover:bg-space-700"}`}>{p}</button>
                    ))}
                    <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages} className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors">Next</button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ==== PLANS TAB ==== */}
        {tab === "plans" && (
          <>
            <div className="bg-card-bg border border-card-border rounded-xl p-5 mb-6">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Generate Weekly Content Plan
              </h2>
              <p className="text-text-secondary text-sm mb-4">Maya researches current trends then creates a 14-piece content calendar across all platforms.</p>
              <div className="flex gap-3 items-end">
                <div>
                  <label className="block text-text-muted text-xs mb-1">Week starting</label>
                  <input type="date" value={planWeek} onChange={(e) => setPlanWeek(e.target.value)} className="px-4 py-2 bg-space-700 border border-card-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-indigo-500" />
                </div>
                <button onClick={handleGeneratePlan} disabled={generating || !planWeek} className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity h-[38px]">
                  {generating ? genStep || "Maya is thinking..." : "Generate Plan"}
                </button>
              </div>
            </div>

            {plans.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-space-700 flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round"/><line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round"/><line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-text-secondary mb-1">No plans yet</p>
                <p className="text-text-muted text-sm">Pick a date and let Maya plan your week</p>
              </div>
            ) : (
              <div className="space-y-6">
                {plans.map((plan) => (
                  <div key={plan.id} className="bg-card-bg border border-card-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">Week of {plan.weekOf}</h3>
                        <p className="text-text-muted text-sm">{plan.plan.length} pieces planned</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                          plan.status === "active" ? "bg-green-500/15 text-green-400 border-green-500/30"
                          : plan.status === "completed" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                          : "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
                        }`}>{plan.status}</span>
                        {plan.status === "draft" && (
                          <button onClick={() => handleGenerateBatch(plan.id)} disabled={generating} className="px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity">
                            {generating ? genStep || "Generating..." : "Generate All Posts"}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-text-muted text-xs border-b border-card-border">
                            <th className="text-left py-2 pr-4">Day</th>
                            <th className="text-left py-2 pr-4">Platform</th>
                            <th className="text-left py-2 pr-4">Pillar</th>
                            <th className="text-left py-2 pr-4">Type</th>
                            <th className="text-left py-2 pr-4">Topic</th>
                            <th className="text-left py-2">Hook</th>
                          </tr>
                        </thead>
                        <tbody>
                          {plan.plan.map((item: PlanItem, i: number) => (
                            <tr
                              key={i}
                              className="border-b border-card-border/50 hover:bg-indigo-500/10 cursor-pointer transition-colors group"
                              onClick={() => handlePlanItemClick(item, i)}
                            >
                              <td className="py-2.5 pr-4 text-text-primary whitespace-nowrap">{item.day}</td>
                              <td className="py-2.5 pr-4">
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${PLATFORM_COLORS[item.platform] || "#666"}22`, color: PLATFORM_COLORS[item.platform] || "#999" }}>{item.platform}</span>
                              </td>
                              <td className="py-2.5 pr-4 text-text-secondary">{item.pillar}</td>
                              <td className="py-2.5 pr-4 text-text-muted">{CONTENT_TYPE_LABELS[item.contentType] || item.contentType}</td>
                              <td className="py-2.5 pr-4 text-text-primary max-w-xs">{item.topic}</td>
                              <td className="py-2.5 text-text-secondary italic max-w-xs">
                                <div className="flex items-center justify-between">
                                  <span>{item.hook}</span>
                                  {/* # Loading spinner when this specific item is generating */}
                                  {generatingPreview === i ? (
                                    <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin shrink-0 ml-2" />
                                  ) : (
                                    <span className="text-indigo-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">Preview</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ==== AGENTS TAB ==== */}
        {tab === "agents" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(AGENT_META).map(([id, agent]) => (
              <div key={id} className="bg-card-bg border border-card-border rounded-xl p-6 hover:border-indigo-500/20 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: agent.color }}>{agent.avatar}</div>
                  <div>
                    <h3 className="font-semibold">{agent.name}</h3>
                    <p className="text-text-secondary text-sm">{agent.role}</p>
                  </div>
                </div>
                <p className="text-text-muted text-sm leading-relaxed mb-3">{agent.description}</p>
                {agent.contentTypes.length > 0 && (
                  <div className="flex gap-1.5 mb-3 flex-wrap">
                    {agent.contentTypes.map(ct => (
                      <span key={ct} className="text-xs px-2 py-0.5 rounded bg-space-600 text-text-muted">{CONTENT_TYPE_LABELS[ct] || ct}</span>
                    ))}
                  </div>
                )}
                {["linkedin", "twitter", "instagram", "tiktok"].includes(id) && (
                  <button onClick={() => { setTab("queue"); setGenAgent(id); }} className="w-full py-2 text-xs font-medium text-indigo-400 bg-indigo-500/10 rounded-lg hover:bg-indigo-500/20 transition-colors">
                    Generate with {agent.name.split(" ")[0]}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ==== KPI TAB ==== */}
        {tab === "kpi" && (
          <>
            {/* KPI Controls */}
            <div className="bg-card-bg border border-card-border rounded-xl p-5 mb-6">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Performance Tracking
              </h2>
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="block text-text-muted text-xs mb-1">Platform</label>
                  <select value={kpiPlatform} onChange={(e) => setKpiPlatform(e.target.value)} className="px-3 py-2 bg-space-700 border border-card-border rounded-lg text-sm text-text-primary">
                    <option value="all">All Platforms</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">X/Twitter</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                </div>
                <div>
                  <label className="block text-text-muted text-xs mb-1">Period</label>
                  <select value={kpiPeriod} onChange={(e) => setKpiPeriod(e.target.value as "week" | "month")} className="px-3 py-2 bg-space-700 border border-card-border rounded-lg text-sm text-text-primary">
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
                <button onClick={fetchKpi} className="px-4 py-2 bg-space-700 text-text-secondary text-sm font-medium rounded-lg hover:text-text-primary transition-colors">Refresh</button>
                <button onClick={handleAnalyzeKpi} disabled={kpiAnalyzing} className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity">
                  {kpiAnalyzing ? "Analyzing..." : "AI Analysis"}
                </button>
              </div>
            </div>

            {/* Metric Entry */}
            <div className="bg-card-bg border border-card-border rounded-xl p-5 mb-6">
              <h3 className="font-medium text-sm mb-3 text-text-secondary">Add Metric</h3>
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="block text-text-muted text-xs mb-1">Metric</label>
                  <select value={kpiMetricType} onChange={(e) => setKpiMetricType(e.target.value)} className="px-3 py-2 bg-space-700 border border-card-border rounded-lg text-sm text-text-primary">
                    {METRIC_TYPES.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-text-muted text-xs mb-1">Value</label>
                  <input type="number" value={kpiValue} onChange={(e) => setKpiValue(e.target.value)} placeholder="0" className="w-28 px-3 py-2 bg-space-700 border border-card-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-text-muted text-xs mb-1">Date</label>
                  <input type="date" value={kpiDate} onChange={(e) => setKpiDate(e.target.value)} className="px-3 py-2 bg-space-700 border border-card-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-indigo-500" />
                </div>
                <button onClick={handleAddMetric} disabled={!kpiValue.trim()} className="px-4 py-2 bg-indigo-500/15 text-indigo-400 text-sm font-medium rounded-lg hover:bg-indigo-500/25 transition-colors disabled:opacity-50">
                  Add
                </button>
              </div>
            </div>

            {/* KPI Summary Cards */}
            {kpiLoading ? (
              <div className="flex items-center justify-center py-16 gap-3">
                <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                <span className="text-text-muted">Loading KPIs...</span>
              </div>
            ) : kpiSummary && Object.keys(kpiSummary.metrics).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {Object.entries(kpiSummary.metrics).map(([type, data]) => (
                  <div key={type} className="bg-card-bg border border-card-border rounded-xl p-4">
                    <p className="text-text-muted text-xs uppercase tracking-wider mb-1">{type}</p>
                    <p className="text-2xl font-bold text-text-primary">{data.current.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {data.changePercent > 0 ? (
                        <span className="text-green-400 text-xs font-medium">+{data.changePercent}%</span>
                      ) : data.changePercent < 0 ? (
                        <span className="text-red-400 text-xs font-medium">{data.changePercent}%</span>
                      ) : (
                        <span className="text-text-muted text-xs">--</span>
                      )}
                      <span className="text-text-muted text-xs">vs prev {kpiPeriod}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 w-full h-1.5 bg-space-600 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        style={{ width: `${Math.min(100, Math.max(5, data.current > 0 ? (data.current / (data.current + Math.abs(data.change || 1))) * 100 : 0))}%` }}
                      />
                    </div>
                  </div>
                ))}
                {/* Posts count */}
                <div className="bg-card-bg border border-card-border rounded-xl p-4">
                  <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Posts Published</p>
                  <p className="text-2xl font-bold text-text-primary">{kpiSummary.totalPosts}</p>
                  <p className="text-text-muted text-xs mt-1">this {kpiPeriod}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 mb-6">
                <p className="text-text-secondary mb-1">No metrics recorded yet</p>
                <p className="text-text-muted text-sm">Add metrics above to start tracking performance</p>
              </div>
            )}

            {/* AI Analysis */}
            {kpiAnalysis && (
              <div className="space-y-4">
                {/* Goal progress */}
                {kpiAnalysis.goalProgress.length > 0 && (
                  <div className="bg-card-bg border border-card-border rounded-xl p-5">
                    <h3 className="font-semibold mb-3 text-sm">Goal Progress</h3>
                    <div className="space-y-3">
                      {kpiAnalysis.goalProgress.map((goal, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-text-secondary">{goal.metricType} ({goal.platform})</span>
                            <span className="text-text-primary font-medium">{goal.current.toLocaleString()} / {goal.target.toLocaleString()}</span>
                          </div>
                          <div className="w-full h-2 bg-space-600 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                              style={{ width: `${Math.min(100, goal.percent)}%` }}
                            />
                          </div>
                          <p className="text-text-muted text-xs mt-0.5">{goal.percent}% complete</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Insights */}
                {kpiAnalysis.insights.length > 0 && (
                  <div className="bg-card-bg border border-card-border rounded-xl p-5">
                    <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Insights
                    </h3>
                    <div className="space-y-2">
                      {kpiAnalysis.insights.map((insight, i) => (
                        <p key={i} className="text-text-secondary text-sm leading-relaxed">{insight}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {kpiAnalysis.recommendations.length > 0 && (
                  <div className="bg-card-bg border border-card-border rounded-xl p-5">
                    <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Recommendations
                    </h3>
                    <div className="space-y-2">
                      {kpiAnalysis.recommendations.map((rec, i) => (
                        <p key={i} className="text-text-secondary text-sm leading-relaxed">{rec}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ---- EMAILS TAB ---- */}
        {tab === "emails" && (
          <div className="space-y-6">
            {/* # Sequences list */}
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-4">Email Sequences</h2>
              {emailsLoading ? (
                <p className="text-text-secondary">Loading...</p>
              ) : sequences.length === 0 ? (
                <div className="text-center py-12 text-text-secondary">
                  <p className="text-lg mb-2">No sequences yet</p>
                  <p className="text-sm">Run <code className="bg-space-700 px-2 py-1 rounded">node scripts/seed-sequences.mjs</code> to create the default Welcome + Pro drip sequences.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {sequences.map((seq) => {
                    // # Parse the JSON steps array stored as a string in the DB
                    const steps = JSON.parse(seq.steps) as { delayDays: number; subject: string }[];
                    return (
                      <div key={seq.id} className="bg-space-800 border border-space-600 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-text-primary">{seq.name}</h3>
                            <p className="text-sm text-text-secondary mt-1">{seq.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* # Status badge — color-coded by state */}
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                              seq.status === "active" ? "bg-green-500/15 text-green-400 border-green-500/30" :
                              seq.status === "paused" ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" :
                              "bg-zinc-500/15 text-zinc-400 border-zinc-500/30"
                            }`}>{seq.status}</span>
                            {/* # Activate / Pause toggle — flips the sequence between
                                # sending (active) and silent (paused). Draft sequences
                                # activate here for the first time. */}
                            {seq.status === "active" ? (
                              <button
                                onClick={() => toggleSequence(seq.id, "paused")}
                                className="px-3 py-1 rounded-full text-xs font-medium border bg-yellow-500/10 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20 transition-colors"
                              >
                                Pause
                              </button>
                            ) : (
                              <button
                                onClick={() => toggleSequence(seq.id, "active")}
                                className="px-3 py-1 rounded-full text-xs font-medium border bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20 transition-colors"
                              >
                                Activate
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-4 text-xs text-text-secondary mb-3">
                          <span>Trigger: <strong className="text-text-primary">{seq.trigger}</strong></span>
                          <span>Priority: <strong className="text-text-primary">{seq.priority}</strong></span>
                          <span>Steps: <strong className="text-text-primary">{steps.length}</strong></span>
                        </div>
                        {/* # Step timeline — shows each email in the drip sequence */}
                        <div className="space-y-2">
                          {steps.map((step, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm">
                              <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                              <span className="text-text-secondary">Day {step.delayDays}:</span>
                              <span className="text-text-primary">{step.subject}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* # Recent sends table */}
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-4">Recent Sends</h2>
              {emailSends.length === 0 ? (
                <p className="text-text-secondary text-sm">No emails sent yet. Activate a sequence and wait for the cron to run.</p>
              ) : (
                <div className="bg-space-800 border border-space-600 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-space-600 text-text-secondary">
                        <th className="text-left p-3">Recipient</th>
                        <th className="text-left p-3">Subject</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Sent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emailSends.map((send) => (
                        <tr key={send.id} className="border-b border-space-700 last:border-0">
                          <td className="p-3 text-text-primary">{send.recipientEmail}</td>
                          <td className="p-3 text-text-secondary">{send.subject}</td>
                          <td className="p-3">
                            {/* # Status badge — color shows delivery/engagement outcome */}
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              send.status === "clicked" ? "bg-green-500/15 text-green-400" :
                              send.status === "opened" ? "bg-blue-500/15 text-blue-400" :
                              send.status === "delivered" ? "bg-emerald-500/15 text-emerald-300" :
                              send.status === "sent" ? "bg-zinc-500/15 text-zinc-400" :
                              send.status === "bounced" || send.status === "failed" ? "bg-red-500/15 text-red-400" :
                              "bg-yellow-500/15 text-yellow-400"
                            }`}>{send.status}</span>
                          </td>
                          <td className="p-3 text-text-secondary">{send.sentAt ? new Date(send.sentAt).toLocaleDateString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---- FUNNEL TAB ---- */}
        {tab === "funnel" && (
          <div className="space-y-6">
            {funnelLoading ? (
              <p className="text-text-secondary">Loading funnel data...</p>
            ) : (
              <>
                {/* # Conversion funnel visualization */}
                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-4">Conversion Funnel</h2>
                  {!funnelData || funnelData.totalSignups === 0 ? (
                    <div className="text-center py-12 text-text-secondary">
                      <p className="text-lg mb-2">No funnel data yet</p>
                      <p className="text-sm">Configure <code className="bg-space-700 px-2 py-1 rounded">JOBPILOT_API_URL</code> and <code className="bg-space-700 px-2 py-1 rounded">JOBPILOT_API_SECRET</code> to start syncing.</p>
                    </div>
                  ) : (
                    <div className="bg-space-800 border border-space-600 rounded-xl p-6">
                      <div className="space-y-3">
                        {funnelData.stages.map((stage, i) => {
                          // # Human-readable labels for each funnel stage key
                          const labels: Record<string, string> = {
                            signup: "Signups",
                            first_ai_use: "First AI Use",
                            fifth_ai_use: "5th AI Use",
                            pro_upgrade: "Pro Upgrade",
                          };
                          // # Color gradient from indigo to green across stages
                          const colors = ["#6366f1", "#8b5cf6", "#a78bfa", "#10b981"];
                          return (
                            <div key={stage.name}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-text-primary font-medium">{labels[stage.name] || stage.name}</span>
                                <span className="text-text-secondary">{stage.count} ({stage.percent}%)</span>
                              </div>
                              <div className="h-8 bg-space-700 rounded-lg overflow-hidden">
                                <div
                                  className="h-full rounded-lg transition-all duration-500"
                                  style={{ width: `${Math.max(stage.percent, 2)}%`, backgroundColor: colors[i] || colors[0] }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* # Attribution table — shows which channel drives the most conversions */}
                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-4">Attribution by Channel</h2>
                  {attribution.length === 0 ? (
                    <p className="text-text-secondary text-sm">No attribution data yet.</p>
                  ) : (
                    <div className="bg-space-800 border border-space-600 rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-space-600 text-text-secondary">
                            <th className="text-left p-3">Channel</th>
                            <th className="text-right p-3">Signups</th>
                            <th className="text-right p-3">First Use</th>
                            <th className="text-right p-3">Pro</th>
                            <th className="text-right p-3">Conv. Rate</th>
                            <th className="text-right p-3">Est. Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attribution.map((row) => (
                            <tr key={row.channel} className="border-b border-space-700 last:border-0">
                              <td className="p-3 text-text-primary font-medium capitalize">{row.channel}</td>
                              <td className="p-3 text-right text-text-secondary">{row.signups}</td>
                              <td className="p-3 text-right text-text-secondary">{row.firstUse}</td>
                              <td className="p-3 text-right text-text-primary font-medium">{row.proUpgrades}</td>
                              <td className="p-3 text-right">
                                {/* # Color-code conversion rate: green >= 10%, yellow >= 5%, grey below */}
                                <span className={row.convRate >= 10 ? "text-green-400" : row.convRate >= 5 ? "text-yellow-400" : "text-text-secondary"}>
                                  {row.convRate}%
                                </span>
                              </td>
                              <td className="p-3 text-right text-emerald-400">£{row.estRevenue}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* # AI Insights panel — triggers Gemini analysis of funnel data */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-text-primary">AI Insights</h2>
                    <button
                      onClick={analyzeFunnelData}
                      disabled={funnelAnalyzing}
                      className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/25 transition-colors disabled:opacity-50"
                    >
                      {funnelAnalyzing ? "Analyzing..." : "Run Analysis"}
                    </button>
                  </div>
                  {funnelInsights ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-space-800 border border-space-600 rounded-xl p-5">
                        <h3 className="font-medium text-text-primary mb-3">Insights</h3>
                        <ul className="space-y-2">
                          {funnelInsights.insights.map((insight, i) => (
                            <li key={i} className="text-sm text-text-secondary flex gap-2">
                              <span className="text-indigo-400 mt-0.5">-</span>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-space-800 border border-space-600 rounded-xl p-5">
                        <h3 className="font-medium text-text-primary mb-3">Recommendations</h3>
                        <ul className="space-y-2">
                          {funnelInsights.recommendations.map((rec, i) => (
                            <li key={i} className="text-sm text-text-secondary flex gap-2">
                              <span className="text-green-400 mt-0.5">-</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-text-secondary text-sm">Click &quot;Run Analysis&quot; to get AI-powered insights on your funnel data.</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ==== SETTINGS TAB ==== */}
        {tab === "settings" && (
          <>
            <div className="bg-card-bg border border-card-border rounded-xl p-6 mb-6">
              <h2 className="font-semibold mb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Connected Accounts
              </h2>
              <p className="text-text-muted text-sm mb-5">Connect your social media accounts to enable auto-posting. Tokens are stored securely in the database.</p>

              <div className="space-y-3">
                {[
                  { id: "linkedin", name: "LinkedIn", color: "#0a66c2", icon: "in", envHint: "LINKEDIN_CLIENT_ID + LINKEDIN_CLIENT_SECRET" },
                  { id: "tiktok", name: "TikTok", color: "#000000", icon: "TT", envHint: "TIKTOK_CLIENT_KEY + TIKTOK_CLIENT_SECRET" },
                  { id: "twitter", name: "X / Twitter", color: "#1d9bf0", icon: "X", envHint: "TWITTER_CLIENT_ID (+ TWITTER_CLIENT_SECRET for confidential apps)" },
                  { id: "instagram", name: "Instagram", color: "#e1306c", icon: "IG", envHint: "FACEBOOK_APP_ID + FACEBOOK_APP_SECRET" },
                ].map((p) => {
                  const status = platformStatus[p.id];
                  const isConnected = status?.connected;
                  const isExpired = status?.expiresAt && new Date(status.expiresAt) < new Date();
                  const isConnecting = connectingPlatform === p.id;

                  return (
                    <div key={p.id} className="flex items-center justify-between bg-space-700/50 rounded-xl px-5 py-4 border border-card-border/50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: p.color }}>
                          {p.icon}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{p.name}</p>
                          {isConnected && !isExpired && (
                            <p className="text-green-400 text-xs flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                              Connected
                              {status?.expiresAt && (
                                <span className="text-text-muted ml-1">
                                  — expires {new Date(status.expiresAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                              )}
                            </p>
                          )}
                          {isConnected && isExpired && (
                            <p className="text-yellow-400 text-xs flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
                              Token expired — reconnect to continue posting
                            </p>
                          )}
                          {!isConnected && (
                            <p className="text-text-muted text-xs">Not connected — requires {p.envHint} in env vars</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isConnected && (
                          <button
                            onClick={() => handleDisconnect(p.id)}
                            className="px-3 py-1.5 text-red-400 text-xs font-medium rounded-lg hover:bg-red-500/10 transition-colors"
                          >
                            Disconnect
                          </button>
                        )}
                        <button
                          onClick={() => handleConnect(p.id)}
                          disabled={isConnecting}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            isConnected && !isExpired
                              ? "bg-space-600 text-text-secondary hover:text-text-primary"
                              : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90"
                          } disabled:opacity-50`}
                        >
                          {isConnecting ? "Connecting..." : isConnected && !isExpired ? "Reconnect" : isExpired ? "Reconnect" : "Connect"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* # How scheduling works info */}
            <div className="bg-card-bg border border-card-border rounded-xl p-6">
              <h2 className="font-semibold mb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Auto-Posting Schedule
              </h2>
              <p className="text-text-muted text-sm mb-4">How the automated posting pipeline works:</p>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-500/15 text-green-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                  <div>
                    <p className="text-text-primary font-medium">Approve content</p>
                    <p className="text-text-muted text-xs">Review generated posts in the Content tab and approve them</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                  <div>
                    <p className="text-text-primary font-medium">Schedule or post now</p>
                    <p className="text-text-muted text-xs">Click &quot;Schedule&quot; to pick a date/time, or &quot;Post Now&quot; for immediate publishing</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-500/15 text-purple-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                  <div>
                    <p className="text-text-primary font-medium">Auto-posting runs every 5 minutes</p>
                    <p className="text-text-muted text-xs">A cron job checks for scheduled posts whose time has arrived and publishes them automatically</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ==== PLAN ITEM PREVIEW MODAL ==== */}
      {/* # Production-ready post preview with image + caption + full content */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={(e) => { if (e.target === e.currentTarget) { setPreviewItem(null); setPreviewSlides([]); } }}>
          <div className="bg-space-800 border border-card-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* # Header with agent info and platform badge */}
            <div className="sticky top-0 bg-space-800 border-b border-card-border px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: AGENT_META[previewItem.agent]?.color || "#666" }}>
                  {AGENT_META[previewItem.agent]?.avatar || "?"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{AGENT_META[previewItem.agent]?.name || previewItem.agent}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${PLATFORM_COLORS[previewItem.platform] || "#666"}22`, color: PLATFORM_COLORS[previewItem.platform] || "#999" }}>{previewItem.platform}</span>
                    <span className="text-xs text-text-muted">{CONTENT_TYPE_LABELS[previewItem.contentType] || previewItem.contentType}</span>
                  </div>
                  <p className="text-text-muted text-xs">{previewItem.title}</p>
                </div>
              </div>
              <button onClick={() => { setPreviewItem(null); setPreviewSlides([]); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-space-600 text-text-muted hover:text-text-primary transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* # Visual slides — the actual generated images */}
              {previewSlides.length > 0 ? (
                <div>
                  <p className="text-text-muted text-xs mb-2 uppercase tracking-wider font-medium">Visual</p>
                  <div className={`${previewSlides.length === 1 ? "flex justify-center" : "flex gap-3 overflow-x-auto pb-2"}`}>
                    {previewSlides.map((slide) => (
                      <div key={slide.index} className="shrink-0 relative group">
                        <img
                          src={slide.dataUrl || slide.imageUrl}
                          alt={`Slide ${slide.index + 1}`}
                          className={`rounded-xl border border-card-border ${previewSlides.length === 1 ? "max-h-[400px] w-auto" : "h-52 w-auto"}`}
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); downloadVisual(slide.dataUrl || slide.imageUrl || "", `jobpilot-${previewItem.platform}-slide-${slide.index + 1}.png`); }}
                          className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/70 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : previewItem.visualData ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-text-muted text-sm">
                    <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    <span>Rendering visual...</span>
                  </div>
                </div>
              ) : null}

              {/* # Caption for image/carousel posts */}
              {previewItem.captionText && (
                <div>
                  <p className="text-text-muted text-xs mb-2 uppercase tracking-wider font-medium">Caption</p>
                  <div className="bg-space-700/60 rounded-xl px-4 py-3 border border-card-border/50">
                    <p className="text-text-primary text-sm leading-relaxed">{previewItem.captionText}</p>
                  </div>
                </div>
              )}

              {/* # Hook — the scroll-stopping opener */}
              {previewItem.hook && (
                <div>
                  <p className="text-text-muted text-xs mb-2 uppercase tracking-wider font-medium">Hook</p>
                  <p className="text-indigo-400 font-medium italic text-sm">&ldquo;{previewItem.hook}&rdquo;</p>
                </div>
              )}

              {/* # Full post body */}
              <div>
                <p className="text-text-muted text-xs mb-2 uppercase tracking-wider font-medium">Post Content</p>
                <pre className="text-text-secondary text-sm whitespace-pre-wrap font-sans leading-relaxed bg-space-700/40 rounded-xl px-4 py-3 border border-card-border/50 max-h-64 overflow-y-auto">{previewItem.body}</pre>
              </div>

              {/* # Hashtags */}
              {previewItem.hashtags && (
                <div>
                  <p className="text-text-muted text-xs mb-2 uppercase tracking-wider font-medium">Hashtags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {previewItem.hashtags.split(",").map((tag, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {tag.trim().startsWith("#") ? tag.trim() : `#${tag.trim()}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* # Action buttons */}
              <div className="flex gap-3 pt-2 border-t border-card-border">
                <button
                  onClick={() => { updateStatus(previewItem.id, "approved"); showToast("Approved!", "success"); setPreviewItem(null); setPreviewSlides([]); }}
                  className="flex-1 py-2.5 bg-green-500/15 text-green-400 text-sm font-medium rounded-lg hover:bg-green-500/25 transition-colors border border-green-500/20"
                >
                  Approve
                </button>
                <button
                  onClick={() => { setEditing(previewItem); setEditBody(previewItem.body); setEditNotes(previewItem.notes || ""); setPreviewItem(null); setPreviewSlides([]); }}
                  className="flex-1 py-2.5 bg-space-600 text-text-secondary text-sm font-medium rounded-lg hover:text-text-primary hover:bg-space-500 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => { copyContent(previewItem); }}
                  className="flex-1 py-2.5 bg-space-600 text-text-secondary text-sm font-medium rounded-lg hover:text-text-primary hover:bg-space-500 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={() => { handleRegenerate(previewItem); setPreviewItem(null); setPreviewSlides([]); }}
                  className="flex-1 py-2.5 bg-purple-500/15 text-purple-400 text-sm font-medium rounded-lg hover:bg-purple-500/25 transition-colors border border-purple-500/20"
                >
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==== EDIT MODAL ==== */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={(e) => { if (e.target === e.currentTarget) setEditing(null); }}>
          <div className="bg-space-800 border border-card-border rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Edit Content</h2>
              <span className="text-xs text-text-muted">{AGENT_META[editing.agent]?.name} / {editing.platform} / {CONTENT_TYPE_LABELS[editing.contentType] || editing.contentType}</span>
            </div>
            <label className="block text-text-secondary text-sm mb-1">Content</label>
            <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={12} className="w-full px-4 py-3 bg-space-700 border border-card-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-indigo-500 mb-4 font-mono" />
            <label className="block text-text-secondary text-sm mb-1">Notes (internal)</label>
            <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} className="w-full px-4 py-3 bg-space-700 border border-card-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-indigo-500 mb-4" placeholder="Your feedback or edit notes..." />
            <div className="flex gap-3 justify-between">
              <button onClick={() => { handleRegenerate(editing); setEditing(null); }} className="px-4 py-2 bg-purple-500/15 text-purple-400 text-sm font-medium rounded-lg hover:bg-purple-500/25 transition-colors">
                Regenerate
              </button>
              <div className="flex gap-3">
                <button onClick={() => setEditing(null)} className="px-4 py-2 text-text-secondary text-sm hover:text-text-primary transition-colors">Cancel</button>
                <button onClick={saveEdit} className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg text-sm hover:opacity-90 transition-opacity">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
