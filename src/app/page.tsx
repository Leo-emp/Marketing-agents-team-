/* ============================================================
   MARKETING HQ - Main Dashboard
   ============================================================
   Admin dashboard for the AI marketing agent team.
   Content queue, plan generation, approval workflow,
   agent roster, and platform posting controls.
   ============================================================ */

"use client";

import { useState, useEffect, useCallback } from "react";

/* ---- Types ---- */
interface ContentItem {
  id: string;
  agent: string;
  platform: string;
  contentType: string;
  title: string;
  body: string;
  hashtags: string | null;
  mediaPrompt: string | null;
  hook: string | null;
  status: string;
  scheduledFor: string | null;
  postedAt: string | null;
  notes: string | null;
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

/* ---- Agent display info (matches server-side agents) ---- */
const AGENT_META: Record<string, { name: string; role: string; avatar: string; color: string }> = {
  strategist: { name: "Maya Chen", role: "Content Strategist", avatar: "MC", color: "#8b5cf6" },
  linkedin:   { name: "James Crawford", role: "LinkedIn Specialist", avatar: "JC", color: "#0a66c2" },
  twitter:    { name: "Zara Knight", role: "X/Twitter Specialist", avatar: "ZK", color: "#14171a" },
  instagram:  { name: "Sofia Reyes", role: "Instagram Specialist", avatar: "SR", color: "#e1306c" },
  tiktok:     { name: "Marcus Lee", role: "TikTok Specialist", avatar: "ML", color: "#ff0050" },
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

export default function Dashboard() {
  /* ---- Auth ---- */
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  /* ---- Tabs & data ---- */
  const [tab, setTab] = useState<"queue" | "agents" | "plans">("queue");
  const [content, setContent] = useState<ContentItem[]>([]);
  const [plans, setPlans] = useState<ContentPlan[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  /* ---- Generation ---- */
  const [generating, setGenerating] = useState(false);
  const [genAgent, setGenAgent] = useState("linkedin");
  const [genTopic, setGenTopic] = useState("");
  const [genType, setGenType] = useState("post");
  const [planWeek, setPlanWeek] = useState("");

  /* ---- Edit modal ---- */
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [editBody, setEditBody] = useState("");
  const [editNotes, setEditNotes] = useState("");

  /* ---- Posting ---- */
  const [posting, setPosting] = useState<string | null>(null);

  /* ---- Auth check on mount ---- */
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

  /* ---- Data fetching ---- */
  const fetchContent = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterPlatform) params.set("platform", filterPlatform);
    if (filterStatus) params.set("status", filterStatus);
    const res = await fetch(`/api/content?${params}`);
    if (res.ok) {
      const data = await res.json();
      setContent(data.items);
      setTotal(data.total);
    }
    setLoading(false);
  }, [filterPlatform, filterStatus]);

  const fetchPlans = useCallback(async () => {
    const res = await fetch("/api/plan");
    if (res.ok) setPlans(await res.json());
  }, []);

  useEffect(() => {
    if (authed) { fetchContent(); fetchPlans(); }
  }, [authed, fetchContent, fetchPlans]);

  /* ---- Actions ---- */
  const handleGenerate = async () => {
    if (!genTopic.trim()) return;
    setGenerating(true);
    try {
      await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: genAgent, topic: genTopic, contentType: genType }),
      });
      setGenTopic("");
      fetchContent();
    } finally { setGenerating(false); }
  };

  const handleGeneratePlan = async () => {
    if (!planWeek.trim()) return;
    setGenerating(true);
    try {
      await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekOf: planWeek }),
      });
      fetchPlans();
    } finally { setGenerating(false); }
  };

  const handleGenerateBatch = async (planId: string) => {
    setGenerating(true);
    try {
      await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      fetchContent();
      fetchPlans();
    } finally { setGenerating(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/content/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchContent();
  };

  const saveEdit = async () => {
    if (!editing) return;
    await fetch(`/api/content/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: editBody, notes: editNotes }),
    });
    setEditing(null);
    fetchContent();
  };

  const deleteContent = async (id: string) => {
    await fetch(`/api/content/${id}`, { method: "DELETE" });
    fetchContent();
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
      if (!data.success) alert(data.error || "Posting failed");
      fetchContent();
    } finally { setPosting(null); }
  };

  /* ============================================================
     LOGIN SCREEN
     ============================================================ */
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center mb-2">Marketing HQ</h1>
          <p className="text-text-secondary text-center text-sm mb-8">JobPilot AI Agent Dashboard</p>
          <div className="bg-card-bg border border-card-border rounded-xl p-6">
            <label className="block text-sm text-text-secondary mb-2">Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full px-4 py-3 bg-space-700 border border-card-border rounded-lg text-text-primary focus:outline-none focus:border-brand mb-4"
              placeholder="Enter password"
            />
            {authError && <p className="text-red-400 text-sm mb-3">{authError}</p>}
            <button onClick={handleLogin} className="w-full py-3 bg-brand text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors">
              Sign In
            </button>
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
      {/* ---- Header ---- */}
      <header className="border-b border-card-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Marketing HQ</h1>
          <p className="text-text-muted text-sm">JobPilot AI Agent Team</p>
        </div>
        <div className="flex items-center gap-2">
          {(["queue", "plans", "agents"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-brand/15 text-blue-400 border border-brand/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-space-700"
              }`}
            >
              {t === "queue" ? "Content Queue" : t === "plans" ? "Plans" : "Agents"}
            </button>
          ))}
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">

        {/* ==== CONTENT QUEUE TAB ==== */}
        {tab === "queue" && (
          <>
            {/* Generate single content */}
            <div className="bg-card-bg border border-card-border rounded-xl p-5 mb-6">
              <h2 className="font-semibold mb-3">Generate Content</h2>
              <div className="flex flex-wrap gap-3">
                <select value={genAgent} onChange={(e) => setGenAgent(e.target.value)} className="px-3 py-2 bg-space-700 border border-card-border rounded-lg text-sm text-text-primary">
                  <option value="linkedin">James - LinkedIn</option>
                  <option value="twitter">Zara - X/Twitter</option>
                  <option value="instagram">Sofia - Instagram</option>
                  <option value="tiktok">Marcus - TikTok</option>
                </select>
                <select value={genType} onChange={(e) => setGenType(e.target.value)} className="px-3 py-2 bg-space-700 border border-card-border rounded-lg text-sm text-text-primary">
                  <option value="post">Post</option>
                  <option value="thread">Thread</option>
                  <option value="carousel">Carousel</option>
                  <option value="reel_script">Reel / TikTok Script</option>
                  <option value="story">Story</option>
                </select>
                <input
                  type="text"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  placeholder="Topic (e.g. 'Why most resumes get rejected in 6 seconds')"
                  className="flex-1 min-w-[280px] px-4 py-2 bg-space-700 border border-card-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-brand"
                />
                <button
                  onClick={handleGenerate}
                  disabled={generating || !genTopic.trim()}
                  className="px-5 py-2 bg-brand text-white font-medium rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  {generating ? "Generating..." : "Generate"}
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-text-muted text-sm">Filter:</span>
              <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)} className="px-3 py-1.5 bg-space-700 border border-card-border rounded-lg text-sm text-text-secondary">
                <option value="">All Platforms</option>
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">X/Twitter</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-1.5 bg-space-700 border border-card-border rounded-lg text-sm text-text-secondary">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="scheduled">Scheduled</option>
                <option value="posted">Posted</option>
                <option value="rejected">Rejected</option>
              </select>
              <span className="text-text-muted text-sm ml-auto">{total} items</span>
              <button onClick={fetchContent} className="text-text-secondary text-sm hover:text-text-primary">Refresh</button>
            </div>

            {/* Content cards */}
            {loading ? (
              <p className="text-text-muted text-center py-12">Loading...</p>
            ) : content.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-text-muted mb-2">No content yet</p>
                <p className="text-text-muted text-sm">Generate content above or create a plan in the Plans tab</p>
              </div>
            ) : (
              <div className="space-y-4">
                {content.map((item) => {
                  const agent = AGENT_META[item.agent] || { name: item.agent, role: "", avatar: "?", color: "#666" };
                  return (
                    <div key={item.id} className="bg-card-bg border border-card-border rounded-xl p-5 hover:border-brand/20 transition-colors">
                      {/* Card header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: agent.color }}>
                            {agent.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{agent.name}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${PLATFORM_COLORS[item.platform] || "#666"}22`, color: PLATFORM_COLORS[item.platform] || "#999" }}>
                                {item.platform}
                              </span>
                              <span className="text-xs text-text-muted">{item.contentType}</span>
                            </div>
                            <p className="text-text-muted text-xs">{item.title}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_STYLES[item.status] || ""}`}>
                          {item.status}
                        </span>
                      </div>

                      {/* Hook */}
                      {item.hook && (
                        <p className="text-blue-400 text-sm font-medium mb-2 italic">&ldquo;{item.hook}&rdquo;</p>
                      )}

                      {/* Body */}
                      <pre className="text-text-secondary text-sm whitespace-pre-wrap font-sans leading-relaxed mb-3 max-h-48 overflow-y-auto">
                        {item.body}
                      </pre>

                      {/* Hashtags */}
                      {item.hashtags && (
                        <p className="text-blue-500/50 text-xs mb-3">
                          {item.hashtags.split(",").map((t) => `#${t.trim()}`).join(" ")}
                        </p>
                      )}

                      {/* Media prompt */}
                      {item.mediaPrompt && (
                        <div className="bg-space-700 rounded-lg px-3 py-2 mb-3">
                          <p className="text-text-muted text-xs mb-1">Visual asset needed:</p>
                          <p className="text-text-secondary text-xs">{item.mediaPrompt}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-card-border">
                        {item.status === "pending" && (
                          <>
                            <button onClick={() => updateStatus(item.id, "approved")} className="px-3 py-1.5 bg-green-500/15 text-green-400 text-xs font-medium rounded-lg hover:bg-green-500/25 transition-colors">
                              Approve
                            </button>
                            <button onClick={() => updateStatus(item.id, "rejected")} className="px-3 py-1.5 bg-red-500/15 text-red-400 text-xs font-medium rounded-lg hover:bg-red-500/25 transition-colors">
                              Reject
                            </button>
                          </>
                        )}
                        {(item.status === "approved" || item.status === "scheduled") && (
                          <button onClick={() => handlePost(item.id)} disabled={posting === item.id} className="px-3 py-1.5 bg-brand/15 text-blue-400 text-xs font-medium rounded-lg hover:bg-brand/25 transition-colors disabled:opacity-50">
                            {posting === item.id ? "Posting..." : "Post Now"}
                          </button>
                        )}
                        <button onClick={() => { setEditing(item); setEditBody(item.body); setEditNotes(item.notes || ""); }} className="px-3 py-1.5 bg-space-600 text-text-secondary text-xs font-medium rounded-lg hover:text-text-primary transition-colors">
                          Edit
                        </button>
                        <button onClick={() => deleteContent(item.id)} className="px-3 py-1.5 text-text-muted text-xs hover:text-red-400 transition-colors ml-auto">
                          Delete
                        </button>
                        <span className="text-text-muted text-xs">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ==== PLANS TAB ==== */}
        {tab === "plans" && (
          <>
            <div className="bg-card-bg border border-card-border rounded-xl p-5 mb-6">
              <h2 className="font-semibold mb-3">Generate Weekly Content Plan</h2>
              <p className="text-text-secondary text-sm mb-4">Maya (Content Strategist) creates a 12-15 piece content calendar for the week.</p>
              <div className="flex gap-3">
                <input type="date" value={planWeek} onChange={(e) => setPlanWeek(e.target.value)} className="px-4 py-2 bg-space-700 border border-card-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-brand" />
                <button onClick={handleGeneratePlan} disabled={generating || !planWeek} className="px-5 py-2 bg-brand text-white font-medium rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50 transition-colors">
                  {generating ? "Maya is thinking..." : "Generate Plan"}
                </button>
              </div>
            </div>

            {plans.length === 0 ? (
              <p className="text-text-muted text-center py-12">No plans yet. Generate one above.</p>
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
                        }`}>
                          {plan.status}
                        </span>
                        {plan.status === "draft" && (
                          <button onClick={() => handleGenerateBatch(plan.id)} disabled={generating} className="px-4 py-1.5 bg-brand text-white text-xs font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors">
                            {generating ? "Generating all posts..." : "Generate All Posts"}
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
                            <tr key={i} className="border-b border-card-border/50 hover:bg-space-700/50">
                              <td className="py-2.5 pr-4 text-text-primary whitespace-nowrap">{item.day}</td>
                              <td className="py-2.5 pr-4">
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${PLATFORM_COLORS[item.platform] || "#666"}22`, color: PLATFORM_COLORS[item.platform] || "#999" }}>
                                  {item.platform}
                                </span>
                              </td>
                              <td className="py-2.5 pr-4 text-text-secondary">{item.pillar}</td>
                              <td className="py-2.5 pr-4 text-text-muted">{item.contentType}</td>
                              <td className="py-2.5 pr-4 text-text-primary max-w-xs truncate">{item.topic}</td>
                              <td className="py-2.5 text-text-secondary italic max-w-xs truncate">{item.hook}</td>
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
            {Object.values(AGENT_META).map((agent) => (
              <div key={agent.avatar} className="bg-card-bg border border-card-border rounded-xl p-6 hover:border-brand/20 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: agent.color }}>
                    {agent.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold">{agent.name}</h3>
                    <p className="text-text-secondary text-sm">{agent.role}</p>
                  </div>
                </div>
                <p className="text-text-muted text-sm leading-relaxed">
                  {agent.role === "Content Strategist" && "Plans weekly content calendars across all platforms. Identifies trending topics, assigns themes, and ensures brand consistency across channels."}
                  {agent.role === "LinkedIn Specialist" && "Writes professional thought leadership posts. Expert at LinkedIn's algorithm — hooks, storytelling, and engagement-driving CTAs that build authority."}
                  {agent.role === "X/Twitter Specialist" && "Creates punchy, viral short-form content. Threads, hot takes, and tweets that spark conversation and drive profile visits."}
                  {agent.role === "Instagram Specialist" && "Designs carousel posts, Reel scripts, and visual-first content. Optimizes for saves and shares — Instagram's top engagement signals."}
                  {agent.role === "TikTok Specialist" && "Scripts short-form videos with 3-second hooks. Native TikTok voice, trending format adaptation, and maximum watch time optimization."}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==== EDIT MODAL ==== */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-space-800 border border-card-border rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="font-semibold text-lg mb-4">Edit Content</h2>
            <label className="block text-text-secondary text-sm mb-1">Content</label>
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 bg-space-700 border border-card-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-brand mb-4 font-mono"
            />
            <label className="block text-text-secondary text-sm mb-1">Notes (internal)</label>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-space-700 border border-card-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-brand mb-4"
              placeholder="Your feedback or edit notes..."
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-text-secondary text-sm hover:text-text-primary transition-colors">
                Cancel
              </button>
              <button onClick={saveEdit} className="px-5 py-2 bg-brand text-white font-medium rounded-lg text-sm hover:bg-blue-600 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
