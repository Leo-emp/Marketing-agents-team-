/* ============================================================
   MARKETING HQ - Main Dashboard
   ============================================================
   Admin dashboard for the AI marketing agent team.
   Content queue, plan generation, visual preview, approval
   workflow, KPI tracking, and platform posting controls.
   ============================================================ */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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
  dataUrl: string;
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
  const [tab, setTab] = useState<"queue" | "agents" | "plans" | "kpi">("queue");
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

  /* ---- Video generation ---- */
  const [generatingVideo, setGeneratingVideo] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState<Record<string, number>>({});

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

  /* ---- Toast ---- */
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const toastTimeout = useRef<NodeJS.Timeout>(undefined);

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

  useEffect(() => {
    if (authed) { fetchContent(); fetchPlans(); }
  }, [authed, fetchContent, fetchPlans]);

  const goToPage = (p: number) => { setPage(p); fetchContent(p); };

  /* ---- Status counts ---- */
  const pendingCount = content.filter(c => c.status === "pending").length;

  /* ---- Content Actions ---- */
  const handleGenerate = async () => {
    if (!genTopic.trim()) return;
    setGenerating(true);
    setGenStep("Researching trends...");
    try {
      // # Step indicator updates while API does research + generation + visual design
      const stepTimer = setTimeout(() => setGenStep("Writing content..."), 8000);
      const stepTimer2 = setTimeout(() => setGenStep("Designing visuals..."), 18000);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: genAgent, topic: genTopic, contentType: genType, tone: genTone }),
      });
      clearTimeout(stepTimer);
      clearTimeout(stepTimer2);

      if (res.ok) {
        const data = await res.json();
        setGenTopic("");
        setNewContentId(data.id);
        setTimeout(() => setNewContentId(null), 5000);
        showToast(`${AGENT_META[genAgent]?.name || genAgent} generated content with visuals`, "success");
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
        body: JSON.stringify({ contentId: item.id, redesign }),
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

  const downloadVisual = (dataUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.click();
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
          {(["queue", "plans", "agents", "kpi"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20" : "text-text-secondary hover:text-text-primary hover:bg-space-700"
            }`}>
              {t === "queue" ? `Content${total ? ` (${total})` : ""}` : t === "plans" ? "Plans" : t === "kpi" ? "KPIs" : "Agents"}
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

                {/* Topic input */}
                <input
                  type="text"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  placeholder="Topic -- be specific (e.g. 'Why applying to 100 jobs a week actually hurts your chances')"
                  className="flex-1 min-w-[300px] px-4 py-2 bg-space-700 border border-card-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-indigo-500"
                />
                <button onClick={handleGenerate} disabled={generating || !genTopic.trim()} className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity">
                  {generating ? genStep || "Generating..." : "Generate"}
                </button>
              </div>
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

              <span className="text-text-muted text-sm ml-auto">{total} items</span>
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
                        {/* Card header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: agent.color }}>{agent.avatar}</div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm">{agent.name}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${PLATFORM_COLORS[item.platform] || "#666"}22`, color: PLATFORM_COLORS[item.platform] || "#999" }}>{item.platform}</span>
                                <span className="text-xs text-text-muted">{CONTENT_TYPE_LABELS[item.contentType] || item.contentType}</span>
                                {isNew && <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 font-medium">New</span>}
                                {hasVisuals && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20 font-medium">Visual</span>}
                              </div>
                              <p className="text-text-muted text-xs">{item.title}</p>
                            </div>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_STYLES[item.status] || ""}`}>{item.status}</span>
                        </div>

                        {/* Hook */}
                        {item.hook && <p className="text-indigo-400 text-sm font-medium mb-2 italic">&ldquo;{item.hook}&rdquo;</p>}

                        {/* Visual previews */}
                        {previews && previews.length > 0 && (
                          <div className="flex gap-3 mb-3 overflow-x-auto pb-2">
                            {previews.map((slide) => (
                              <div key={slide.index} className="shrink-0 relative group">
                                <img
                                  src={slide.dataUrl}
                                  alt={`Slide ${slide.index + 1}`}
                                  className="h-40 w-auto rounded-lg border border-card-border"
                                />
                                <button
                                  onClick={() => downloadVisual(slide.dataUrl, `jobpilot-${item.platform}-slide-${slide.index + 1}.png`)}
                                  className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  Download
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Video preview for reels */}
                        {item.videoUrl && (
                          <div className="mb-3">
                            <video
                              src={item.videoUrl}
                              controls
                              className="rounded-lg border border-card-border"
                              style={{ aspectRatio: "9/16", maxWidth: "240px", maxHeight: "320px" }}
                            />
                            <a
                              href={item.videoUrl}
                              download={`jobpilot-reel-${item.platform}.mp4`}
                              className="inline-block mt-2 px-3 py-1 bg-space-600 text-text-secondary text-xs rounded-lg hover:text-text-primary transition-colors"
                            >
                              Download MP4
                            </a>
                          </div>
                        )}

                        {/* Body */}
                        <pre className="text-text-secondary text-sm whitespace-pre-wrap font-sans leading-relaxed mb-3 max-h-48 overflow-y-auto">{item.body}</pre>

                        {/* Caption (separate from body for image/carousel posts) */}
                        {item.captionText && (
                          <div className="bg-space-700/50 rounded-lg px-3 py-2 mb-3">
                            <p className="text-text-muted text-xs mb-1">Caption:</p>
                            <p className="text-text-secondary text-sm">{item.captionText}</p>
                          </div>
                        )}

                        {/* Hashtags */}
                        {item.hashtags && <p className="text-indigo-500/50 text-xs mb-3">{item.hashtags.split(",").map((t) => `#${t.trim()}`).join(" ")}</p>}

                        {/* Media prompt */}
                        {item.mediaPrompt && (
                          <div className="bg-space-700 rounded-lg px-3 py-2 mb-3">
                            <p className="text-text-muted text-xs mb-0.5">Visual direction:</p>
                            <p className="text-text-secondary text-xs">{item.mediaPrompt}</p>
                          </div>
                        )}

                        {/* Notes */}
                        {item.notes && (
                          <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-lg px-3 py-2 mb-3">
                            <p className="text-yellow-400/70 text-xs">{item.notes}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2 border-t border-card-border flex-wrap">
                          {item.status === "pending" && (
                            <>
                              <button onClick={() => updateStatus(item.id, "approved")} className="px-3 py-1.5 bg-green-500/15 text-green-400 text-xs font-medium rounded-lg hover:bg-green-500/25 transition-colors">Approve</button>
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
                          {/* Visual generation / rendering button */}
                          {item.contentType !== "plain_text" && item.contentType !== "thread" && item.contentType !== "reel_script" && (
                            <button
                              onClick={() => handleGenerateVisual(item, hasVisuals)}
                              disabled={generatingVisual === item.id}
                              className="px-3 py-1.5 bg-purple-500/15 text-purple-400 text-xs font-medium rounded-lg hover:bg-purple-500/25 transition-colors disabled:opacity-50"
                            >
                              {generatingVisual === item.id ? "Creating Visual..." : hasDesignData ? "Render Visual" : hasVisuals ? "Redesign Visual" : "Generate Visual"}
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
                          src={slide.dataUrl}
                          alt={`Slide ${slide.index + 1}`}
                          className={`rounded-xl border border-card-border ${previewSlides.length === 1 ? "max-h-[400px] w-auto" : "h-52 w-auto"}`}
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); downloadVisual(slide.dataUrl, `jobpilot-${previewItem.platform}-slide-${slide.index + 1}.png`); }}
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
