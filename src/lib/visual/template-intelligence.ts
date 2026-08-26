/* ============================================================
   TEMPLATE INTELLIGENCE — AI-Powered Template Selection
   ============================================================
   # Picks the optimal HTML template (t1-t186) for each content
   # piece based on: platform, content style, mood, data fields,
   # past performance, and variety enforcement.
   #
   # Learning loop: tracks which templates get highest engagement
   # per platform and progressively favors top performers.
   # New templates start with a neutral score and earn their rank.
   ============================================================ */

import { prisma } from "../prisma";
import { callGemini } from "../gemini";
import type { TemplateId, TemplateContent } from "./templates/shared";
import type { SlideData } from "./types";

/* ---- Template Catalog ---- */
/* # Every template's metadata: what it looks like, what content it's best for.
   # The intelligence layer uses this to match content → template. */

export interface TemplateMeta {
  id: TemplateId;
  platform: "linkedin" | "tiktok" | "instagram";
  name: string;
  style: "dark" | "light" | "brand" | "gradient" | "warm" | "cream" | "pastel";
  mood: "authoritative" | "provocative" | "educational" | "motivational" | "data_driven" | "storytelling" | "casual" | "editorial";
  bestFor: string[];         // # Content types / pillar keywords this template excels at
  requiredFields: string[];  // # TemplateContent fields the template NEEDS (e.g., "stat", "bullets", "tips")
  optionalFields: string[];  // # Fields it can USE but doesn't require
  format: "feed" | "story" | "grid" | "reel" | "vertical";  // # Aspect ratio category
}

/* # Full catalog — 186 templates with structured metadata */
const TEMPLATE_CATALOG: TemplateMeta[] = [
  // ============ LINKEDIN (31 templates) ============
  { id: "t1", platform: "linkedin", name: "Hero Stat", style: "dark", mood: "data_driven", bestFor: ["stat", "data_story", "industry_insights"], requiredFields: ["stat"], optionalFields: ["body", "eyebrow"], format: "feed" },
  { id: "t2", platform: "linkedin", name: "Product In Action", style: "light", mood: "educational", bestFor: ["product_showcase", "before_after", "feature_demo"], requiredFields: ["headline"], optionalFields: ["body", "bullets", "stat"], format: "feed" },
  { id: "t3", platform: "linkedin", name: "Tip Card", style: "brand", mood: "educational", bestFor: ["career_tips", "quick_tip", "how_to"], requiredFields: ["headline"], optionalFields: ["body", "eyebrow"], format: "feed" },
  { id: "t4", platform: "linkedin", name: "Before/After", style: "dark", mood: "storytelling", bestFor: ["before_after", "transformation", "product_showcase"], requiredFields: ["beforeText", "afterText"], optionalFields: ["headline"], format: "feed" },
  { id: "t5", platform: "linkedin", name: "Testimonial", style: "light", mood: "storytelling", bestFor: ["social_proof", "testimonial", "user_story"], requiredFields: ["headline"], optionalFields: ["subheadline", "body"], format: "feed" },
  { id: "t6", platform: "linkedin", name: "Carousel Cover", style: "dark", mood: "authoritative", bestFor: ["carousel_cover", "hook_slide", "series_intro"], requiredFields: ["headline"], optionalFields: ["subheadline", "eyebrow"], format: "grid" },
  { id: "t7", platform: "linkedin", name: "Bold Statement", style: "gradient", mood: "provocative", bestFor: ["hot_take", "contrarian", "motivation"], requiredFields: ["headline"], optionalFields: ["body"], format: "feed" },
  { id: "t8", platform: "linkedin", name: "Myth vs Reality", style: "light", mood: "educational", bestFor: ["myth_busting", "comparison", "contrarian"], requiredFields: ["beforeText", "afterText"], optionalFields: ["headline"], format: "feed" },
  { id: "t9", platform: "linkedin", name: "Data Visual", style: "dark", mood: "data_driven", bestFor: ["data_chart", "industry_insights", "research"], requiredFields: ["bars"], optionalFields: ["headline"], format: "feed" },
  { id: "t10", platform: "linkedin", name: "Announcement", style: "brand", mood: "authoritative", bestFor: ["announcement", "product_launch", "milestone"], requiredFields: ["headline"], optionalFields: ["body", "subheadline"], format: "feed" },
  { id: "t11", platform: "linkedin", name: "Checklist", style: "light", mood: "educational", bestFor: ["checklist", "action_items", "how_to"], requiredFields: ["bullets"], optionalFields: ["headline"], format: "feed" },
  { id: "t12", platform: "linkedin", name: "Controversial Take", style: "dark", mood: "provocative", bestFor: ["hot_take", "contrarian", "debate"], requiredFields: ["headline"], optionalFields: ["body"], format: "feed" },
  { id: "t13", platform: "linkedin", name: "Social Proof Wall", style: "light", mood: "storytelling", bestFor: ["social_proof", "testimonial", "results"], requiredFields: ["items"], optionalFields: ["headline"], format: "feed" },
  { id: "t14", platform: "linkedin", name: "Hot Take Poll", style: "brand", mood: "provocative", bestFor: ["poll", "debate", "engagement"], requiredFields: ["headline"], optionalFields: ["items"], format: "feed" },
  { id: "t15", platform: "linkedin", name: "Step Process", style: "dark", mood: "educational", bestFor: ["step_by_step", "how_to", "framework"], requiredFields: ["steps"], optionalFields: ["headline"], format: "feed" },
  { id: "t65", platform: "linkedin", name: "Split Header", style: "dark", mood: "authoritative", bestFor: ["headline_statement", "bold_claim", "thought_leadership"], requiredFields: ["headline"], optionalFields: ["body", "eyebrow"], format: "feed" },
  { id: "t66", platform: "linkedin", name: "Annotation Card", style: "light", mood: "educational", bestFor: ["annotation", "breakdown", "analysis"], requiredFields: ["annotations"], optionalFields: ["headline"], format: "feed" },
  { id: "t67", platform: "linkedin", name: "Salary Range", style: "dark", mood: "data_driven", bestFor: ["salary", "compensation", "market_data"], requiredFields: ["stat"], optionalFields: ["bars", "headline"], format: "feed" },
  { id: "t68", platform: "linkedin", name: "Quick Win", style: "brand", mood: "educational", bestFor: ["quick_tip", "actionable", "career_tips"], requiredFields: ["headline"], optionalFields: ["body", "subheadline"], format: "feed" },
  { id: "t69", platform: "linkedin", name: "Stack Rank", style: "dark", mood: "data_driven", bestFor: ["ranking", "comparison", "list"], requiredFields: ["items"], optionalFields: ["headline"], format: "feed" },
  { id: "t70", platform: "linkedin", name: "Two-Number", style: "light", mood: "data_driven", bestFor: ["comparison_stat", "before_after_stat", "contrast"], requiredFields: ["stat"], optionalFields: ["headline", "body"], format: "feed" },
  { id: "t71", platform: "linkedin", name: "Framework", style: "dark", mood: "educational", bestFor: ["framework", "methodology", "mental_model"], requiredFields: ["steps"], optionalFields: ["headline", "eyebrow"], format: "feed" },
  { id: "t72", platform: "linkedin", name: "Industry Benchmark", style: "dark", mood: "data_driven", bestFor: ["benchmark", "industry_data", "research"], requiredFields: ["bars"], optionalFields: ["headline", "legend"], format: "feed" },
  { id: "t73", platform: "linkedin", name: "Red/Green Flag", style: "light", mood: "provocative", bestFor: ["red_flag", "green_flag", "dos_donts"], requiredFields: ["beforeText", "afterText"], optionalFields: ["headline"], format: "feed" },
  { id: "t74", platform: "linkedin", name: "Tool Stack", style: "light", mood: "educational", bestFor: ["tools", "resources", "tech_stack"], requiredFields: ["items"], optionalFields: ["headline"], format: "feed" },
  { id: "t75", platform: "linkedin", name: "Resume Breakdown", style: "dark", mood: "educational", bestFor: ["resume_tips", "annotation", "breakdown"], requiredFields: ["annotations"], optionalFields: ["headline", "score"], format: "feed" },
  { id: "t76", platform: "linkedin", name: "Hiring Manager POV", style: "light", mood: "storytelling", bestFor: ["pov", "insider", "recruiter_perspective"], requiredFields: ["headline"], optionalFields: ["body", "bullets"], format: "feed" },
  { id: "t77", platform: "linkedin", name: "Salary Negotiation", style: "dark", mood: "data_driven", bestFor: ["salary_negotiation", "compensation", "range"], requiredFields: ["stat"], optionalFields: ["bars", "headline"], format: "feed" },
  { id: "t78", platform: "linkedin", name: "Quick Stat Grid", style: "dark", mood: "data_driven", bestFor: ["stats_dashboard", "metrics", "overview"], requiredFields: ["items"], optionalFields: ["headline"], format: "feed" },
  { id: "t79", platform: "linkedin", name: "Day In The Life", style: "light", mood: "storytelling", bestFor: ["schedule", "routine", "behind_scenes"], requiredFields: ["steps"], optionalFields: ["headline"], format: "feed" },
  { id: "t80", platform: "linkedin", name: "Teal Hot Take", style: "gradient", mood: "provocative", bestFor: ["hot_take", "opinion", "thought_leadership"], requiredFields: ["headline"], optionalFields: ["body", "eyebrow"], format: "feed" },

  // ============ TIKTOK (29 templates) ============
  { id: "t16", platform: "tiktok", name: "Notes App Screenshot", style: "dark", mood: "casual", bestFor: ["notes", "list", "tips_dump"], requiredFields: ["headline"], optionalFields: ["body", "tips"], format: "story" },
  { id: "t17", platform: "tiktok", name: "Tier Ranking", style: "dark", mood: "provocative", bestFor: ["ranking", "tier_list", "comparison"], requiredFields: ["items"], optionalFields: ["headline"], format: "story" },
  { id: "t18", platform: "tiktok", name: "Text Message Thread", style: "light", mood: "casual", bestFor: ["conversation", "dm", "relatable"], requiredFields: ["headline"], optionalFields: ["body"], format: "story" },
  { id: "t19", platform: "tiktok", name: "Teal Statement", style: "gradient", mood: "provocative", bestFor: ["bold_statement", "hot_take", "impact", "statement", "attention_grab", "bold", "minimal", "pov", "relatable", "scenario", "truth_bomb", "key_message", "viral"], requiredFields: ["headline"], optionalFields: ["body", "eyebrow", "bullets", "cta"], format: "story" },
  { id: "t20", platform: "tiktok", name: "Swipe Carousel Card", style: "cream", mood: "educational", bestFor: ["carousel_slide", "tip_card", "educational"], requiredFields: ["headline"], optionalFields: ["body", "eyebrow"], format: "story" },
  { id: "t21", platform: "tiktok", name: "Bold Color Hot Take", style: "gradient", mood: "provocative", bestFor: ["hot_take", "contrarian", "opinion"], requiredFields: ["headline"], optionalFields: ["body"], format: "story" },
  { id: "t28", platform: "tiktok", name: "Bold Stat", style: "brand", mood: "data_driven", bestFor: ["stat", "data_point", "shocking_number"], requiredFields: ["stat"], optionalFields: ["headline", "body"], format: "story" },
  { id: "t29", platform: "tiktok", name: "Split Contrast", style: "dark", mood: "educational", bestFor: ["comparison", "before_after", "contrast"], requiredFields: ["headline"], optionalFields: ["beforeText", "afterText"], format: "story" },
  { id: "t30", platform: "tiktok", name: "Gradient Statement", style: "gradient", mood: "motivational", bestFor: ["motivation", "inspiration", "affirmation"], requiredFields: ["headline"], optionalFields: ["subheadline"], format: "story" },
  { id: "t31", platform: "tiktok", name: "Stacked Cards", style: "dark", mood: "educational", bestFor: ["list", "multiple_tips", "breakdown"], requiredFields: ["tips"], optionalFields: ["headline"], format: "story" },
  { id: "t32", platform: "tiktok", name: "Editorial Bold", style: "cream", mood: "editorial", bestFor: ["editorial", "thought_piece", "long_read"], requiredFields: ["headline"], optionalFields: ["body", "eyebrow"], format: "story" },
  { id: "t40", platform: "tiktok", name: "Brutalist Highlight", style: "cream", mood: "provocative", bestFor: ["highlight", "key_point", "emphasis"], requiredFields: ["headline"], optionalFields: ["body", "headlineHighlight"], format: "story" },
  { id: "t41", platform: "tiktok", name: "Keynote Slide", style: "dark", mood: "authoritative", bestFor: ["presentation", "keynote", "framework"], requiredFields: ["headline"], optionalFields: ["bullets", "body"], format: "story" },
  { id: "t42", platform: "tiktok", name: "Vertical Timeline", style: "dark", mood: "educational", bestFor: ["timeline", "process", "step_by_step"], requiredFields: ["steps"], optionalFields: ["headline"], format: "story" },
  { id: "t43", platform: "tiktok", name: "Quote Card", style: "warm", mood: "motivational", bestFor: ["quote", "inspiration", "wisdom"], requiredFields: ["headline"], optionalFields: ["subheadline"], format: "story" },
  { id: "t44", platform: "tiktok", name: "Metric Dashboard", style: "dark", mood: "data_driven", bestFor: ["dashboard", "metrics", "stats_overview"], requiredFields: ["items"], optionalFields: ["headline"], format: "story" },
  { id: "t50", platform: "tiktok", name: "Terminal", style: "dark", mood: "casual", bestFor: ["tech", "hacker", "code_aesthetic"], requiredFields: ["headline"], optionalFields: ["body", "bullets"], format: "story" },
  { id: "t51", platform: "tiktok", name: "Gradient Mesh", style: "gradient", mood: "motivational", bestFor: ["inspiration", "statement", "abstract"], requiredFields: ["headline"], optionalFields: ["subheadline"], format: "story" },
  { id: "t52", platform: "tiktok", name: "Number List", style: "dark", mood: "educational", bestFor: ["numbered_list", "tips", "ranking"], requiredFields: ["tips"], optionalFields: ["headline"], format: "story" },
  { id: "t82", platform: "tiktok", name: "Rate My Resume", style: "dark", mood: "educational", bestFor: ["scoring", "rating", "resume_review"], requiredFields: ["score"], optionalFields: ["headline", "annotations"], format: "story" },
  { id: "t83", platform: "tiktok", name: "Red Flag Bingo", style: "dark", mood: "casual", bestFor: ["bingo", "red_flags", "fun_list"], requiredFields: ["items"], optionalFields: ["headline"], format: "story" },
  { id: "t84", platform: "tiktok", name: "Storytime", style: "gradient", mood: "storytelling", bestFor: ["story", "anecdote", "experience"], requiredFields: ["headline"], optionalFields: ["body"], format: "story" },
  { id: "t85", platform: "tiktok", name: "Speed Tips", style: "dark", mood: "educational", bestFor: ["quick_tips", "rapid_fire", "list"], requiredFields: ["tips"], optionalFields: ["headline"], format: "story" },
  { id: "t86", platform: "tiktok", name: "Would You Rather", style: "dark", mood: "casual", bestFor: ["poll", "choice", "engagement"], requiredFields: ["beforeText", "afterText"], optionalFields: ["headline"], format: "story" },
  { id: "t87", platform: "tiktok", name: "Recruiter DM", style: "dark", mood: "casual", bestFor: ["dm", "message", "recruiter_perspective"], requiredFields: ["headline"], optionalFields: ["body"], format: "story" },
  { id: "t88", platform: "tiktok", name: "Salary Reveal", style: "dark", mood: "data_driven", bestFor: ["salary", "money", "dramatic_number"], requiredFields: ["stat"], optionalFields: ["headline", "body"], format: "story" },

  // ============ INSTAGRAM (36 templates) ============
  { id: "t22", platform: "instagram", name: "Editorial Carousel Cover", style: "cream", mood: "editorial", bestFor: ["carousel_cover", "series_intro", "editorial"], requiredFields: ["headline"], optionalFields: ["subheadline", "eyebrow"], format: "feed" },
  { id: "t23", platform: "instagram", name: "Save-Worthy Tip Card", style: "warm", mood: "educational", bestFor: ["tip", "save_worthy", "actionable"], requiredFields: ["headline"], optionalFields: ["body", "eyebrow"], format: "feed" },
  { id: "t24", platform: "instagram", name: "Story Poll", style: "brand", mood: "casual", bestFor: ["poll", "question", "engagement"], requiredFields: ["headline"], optionalFields: ["items"], format: "story" },
  { id: "t25", platform: "instagram", name: "Minimal Quote", style: "light", mood: "motivational", bestFor: ["quote", "inspiration", "minimal"], requiredFields: ["headline"], optionalFields: ["subheadline"], format: "grid" },
  { id: "t26", platform: "instagram", name: "Feature Breakdown", style: "cream", mood: "educational", bestFor: ["feature_list", "breakdown", "product_showcase"], requiredFields: ["tips"], optionalFields: ["headline", "eyebrow"], format: "feed" },
  { id: "t27", platform: "instagram", name: "Teal Reel", style: "gradient", mood: "casual", bestFor: ["reel_cover", "video_thumbnail", "hook"], requiredFields: ["headline"], optionalFields: ["body", "eyebrow"], format: "reel" },
  { id: "t34", platform: "instagram", name: "Grain Editorial", style: "warm", mood: "editorial", bestFor: ["editorial", "long_form", "thought_piece"], requiredFields: ["headline"], optionalFields: ["body", "eyebrow"], format: "feed" },
  { id: "t35", platform: "instagram", name: "Floating Cards", style: "pastel", mood: "educational", bestFor: ["tips_cards", "multi_tip", "floating_layout"], requiredFields: ["tips"], optionalFields: ["headline"], format: "feed" },
  { id: "t36", platform: "instagram", name: "Ring Chart", style: "dark", mood: "data_driven", bestFor: ["score", "percentage", "donut_chart"], requiredFields: ["score"], optionalFields: ["headline", "body"], format: "grid" },
  { id: "t37", platform: "instagram", name: "Minimal Bold", style: "light", mood: "authoritative", bestFor: ["bold_statement", "minimal", "clean"], requiredFields: ["headline"], optionalFields: ["body"], format: "grid" },
  { id: "t38", platform: "instagram", name: "Color Block", style: "gradient", mood: "educational", bestFor: ["grid_layout", "multi_point", "overview"], requiredFields: ["items"], optionalFields: ["headline"], format: "grid" },
  { id: "t39", platform: "instagram", name: "Textured Dark", style: "dark", mood: "authoritative", bestFor: ["luxury", "premium", "gold_accent"], requiredFields: ["headline"], optionalFields: ["body", "eyebrow"], format: "grid" },
  { id: "t45", platform: "instagram", name: "Clean Comparison", style: "light", mood: "educational", bestFor: ["comparison", "vs", "pros_cons"], requiredFields: ["beforeText", "afterText"], optionalFields: ["headline"], format: "feed" },
  { id: "t46", platform: "instagram", name: "Step Guide", style: "cream", mood: "educational", bestFor: ["step_by_step", "how_to", "guide"], requiredFields: ["steps"], optionalFields: ["headline"], format: "feed" },
  { id: "t47", platform: "instagram", name: "Testimonial", style: "warm", mood: "storytelling", bestFor: ["testimonial", "quote", "social_proof"], requiredFields: ["headline"], optionalFields: ["subheadline"], format: "grid" },
  { id: "t48", platform: "instagram", name: "Magazine Cover", style: "brand", mood: "editorial", bestFor: ["cover", "feature", "magazine_style"], requiredFields: ["headline"], optionalFields: ["subheadline", "eyebrow", "tags"], format: "feed" },
  { id: "t53", platform: "instagram", name: "Carousel Slide", style: "light", mood: "educational", bestFor: ["carousel_slide", "educational", "clean"], requiredFields: ["headline"], optionalFields: ["body", "eyebrow"], format: "feed" },
  { id: "t54", platform: "instagram", name: "Checklist", style: "cream", mood: "educational", bestFor: ["checklist", "action_items", "save_worthy"], requiredFields: ["bullets"], optionalFields: ["headline"], format: "feed" },
  { id: "t55", platform: "instagram", name: "Pull Quote", style: "warm", mood: "motivational", bestFor: ["quote", "pull_quote", "emphasis"], requiredFields: ["headline"], optionalFields: ["subheadline"], format: "grid" },
  { id: "t56", platform: "instagram", name: "Profile Card", style: "pastel", mood: "casual", bestFor: ["profile", "intro", "about"], requiredFields: ["headline"], optionalFields: ["body", "tags"], format: "grid" },
  { id: "t57", platform: "instagram", name: "Split Stat", style: "dark", mood: "data_driven", bestFor: ["stat_comparison", "two_numbers", "contrast"], requiredFields: ["stat"], optionalFields: ["headline"], format: "grid" },
  { id: "t58", platform: "instagram", name: "Myth vs Fact", style: "light", mood: "educational", bestFor: ["myth_busting", "fact_check", "comparison"], requiredFields: ["beforeText", "afterText"], optionalFields: ["headline"], format: "feed" },
  { id: "t59", platform: "instagram", name: "Editorial Series", style: "warm", mood: "editorial", bestFor: ["series", "editorial", "numbered"], requiredFields: ["headline"], optionalFields: ["body", "eyebrow"], format: "feed" },
  { id: "t60", platform: "instagram", name: "Pill Tags", style: "dark", mood: "casual", bestFor: ["skills", "tags", "keywords"], requiredFields: ["tags"], optionalFields: ["headline"], format: "grid" },
  { id: "t61", platform: "instagram", name: "Score Card", style: "pastel", mood: "data_driven", bestFor: ["score", "rating", "assessment"], requiredFields: ["score"], optionalFields: ["headline", "body"], format: "grid" },
  { id: "t62", platform: "instagram", name: "Data Table", style: "light", mood: "data_driven", bestFor: ["table", "data_comparison", "structured"], requiredFields: ["items"], optionalFields: ["headline"], format: "grid" },
  { id: "t63", platform: "instagram", name: "Gradient Quote", style: "pastel", mood: "motivational", bestFor: ["quote", "inspirational", "soft"], requiredFields: ["headline"], optionalFields: ["subheadline"], format: "grid" },
  { id: "t64", platform: "instagram", name: "Stat Bars", style: "dark", mood: "data_driven", bestFor: ["bar_chart", "stats", "comparison"], requiredFields: ["bars"], optionalFields: ["headline"], format: "grid" },
  { id: "t89", platform: "instagram", name: "Newsletter Preview", style: "cream", mood: "editorial", bestFor: ["newsletter", "preview", "text_card"], requiredFields: ["headline"], optionalFields: ["body", "eyebrow"], format: "feed" },
  { id: "t90", platform: "instagram", name: "Transformation Story", style: "light", mood: "storytelling", bestFor: ["before_after", "transformation", "timeline"], requiredFields: ["beforeText", "afterText"], optionalFields: ["headline", "steps"], format: "feed" },
  { id: "t91", platform: "instagram", name: "Infographic Mini", style: "dark", mood: "data_driven", bestFor: ["infographic", "data_story", "visual_data"], requiredFields: ["stat"], optionalFields: ["bars", "headline"], format: "feed" },
  { id: "t92", platform: "instagram", name: "Expert Panel", style: "cream", mood: "authoritative", bestFor: ["multi_quote", "panel", "expert_opinions"], requiredFields: ["items"], optionalFields: ["headline"], format: "grid" },
  { id: "t93", platform: "instagram", name: "Resource List", style: "light", mood: "educational", bestFor: ["resources", "tools", "curated_list"], requiredFields: ["items"], optionalFields: ["headline", "eyebrow"], format: "feed" },
  { id: "t94", platform: "instagram", name: "Weekly Recap", style: "cream", mood: "editorial", bestFor: ["recap", "digest", "weekly_summary"], requiredFields: ["items"], optionalFields: ["headline"], format: "grid" },
  { id: "t95", platform: "instagram", name: "AMA Response", style: "light", mood: "casual", bestFor: ["qa", "ama", "question_answer"], requiredFields: ["headline"], optionalFields: ["body"], format: "feed" },
  { id: "t96", platform: "instagram", name: "Achievement Unlocked", style: "dark", mood: "casual", bestFor: ["milestone", "achievement", "gamified"], requiredFields: ["headline"], optionalFields: ["stat", "body"], format: "grid" },
  // # Premium LinkedIn templates (T97-T102) — polished with prominent logo
  { id: "t97", platform: "linkedin", name: "Executive Insight", style: "dark", mood: "authoritative", bestFor: ["insight", "data", "statement", "executive"], requiredFields: ["headline"], optionalFields: ["stat", "body", "eyebrow"], format: "feed" },
  { id: "t98", platform: "linkedin", name: "Clean Authority", style: "light", mood: "educational", bestFor: ["how_to", "steps", "tips", "guide"], requiredFields: ["headline", "tips"], optionalFields: ["eyebrow"], format: "feed" },
  { id: "t99", platform: "linkedin", name: "Gradient Hero", style: "brand", mood: "data_driven", bestFor: ["metric", "stat", "data_point", "numbers"], requiredFields: ["headline"], optionalFields: ["stat", "body", "eyebrow"], format: "feed" },
  { id: "t100", platform: "linkedin", name: "Glass Card", style: "dark", mood: "educational", bestFor: ["takeaway", "key_point", "featured", "tip"], requiredFields: ["headline"], optionalFields: ["body", "bullets", "eyebrow"], format: "feed" },
  { id: "t101", platform: "linkedin", name: "Metric Grid", style: "dark", mood: "data_driven", bestFor: ["dashboard", "metrics", "comparison", "survey"], requiredFields: ["headline", "bars"], optionalFields: ["eyebrow"], format: "feed" },
  { id: "t102", platform: "linkedin", name: "Bold Question", style: "dark", mood: "provocative", bestFor: ["question", "myth", "hot_take", "engagement"], requiredFields: ["headline"], optionalFields: ["body", "cta", "eyebrow"], format: "feed" },
  // # Premium TikTok templates (T103-T108) — polished with clear brand bar
  { id: "t104", platform: "tiktok", name: "Stacked Cards", style: "dark", mood: "educational", bestFor: ["tips", "steps", "numbered_list", "advice"], requiredFields: ["headline", "tips"], optionalFields: ["eyebrow"], format: "vertical" },
  { id: "t106", platform: "tiktok", name: "Checklist", style: "dark", mood: "educational", bestFor: ["checklist", "action_items", "todo", "requirements"], requiredFields: ["headline", "bullets"], optionalFields: ["eyebrow"], format: "vertical" },
  { id: "t107", platform: "tiktok", name: "Quote Slide", style: "dark", mood: "motivational", bestFor: ["quote", "inspiration", "wisdom", "mindset"], requiredFields: ["headline"], optionalFields: ["subheadline", "eyebrow"], format: "vertical" },
  { id: "t108", platform: "tiktok", name: "Do vs Don't", style: "dark", mood: "educational", bestFor: ["comparison", "do_dont", "right_wrong", "before_after"], requiredFields: ["headline"], optionalFields: ["items", "bullets", "eyebrow"], format: "vertical" },
  // # Premium Instagram templates (T109-T114) — editorial with clear branding
  { id: "t109", platform: "instagram", name: "Magazine Editorial", style: "cream", mood: "authoritative", bestFor: ["insight", "thought_leadership", "carousel_cover"], requiredFields: ["headline"], optionalFields: ["subheadline", "body", "eyebrow"], format: "feed" },
  { id: "t110", platform: "instagram", name: "Minimal Tip", style: "light", mood: "educational", bestFor: ["single_tip", "daily_advice", "quick_win"], requiredFields: ["headline"], optionalFields: ["body", "cta", "eyebrow"], format: "grid" },
  { id: "t111", platform: "instagram", name: "Gradient Overlay", style: "brand", mood: "authoritative", bestFor: ["announcement", "feature", "key_message"], requiredFields: ["headline"], optionalFields: ["body", "eyebrow"], format: "feed" },
  { id: "t112", platform: "instagram", name: "Bold Statement", style: "brand", mood: "motivational", bestFor: ["quote", "bold_opinion", "mindset"], requiredFields: ["headline"], optionalFields: ["subheadline", "eyebrow"], format: "grid" },
  { id: "t113", platform: "instagram", name: "Data Bars", style: "light", mood: "data_driven", bestFor: ["survey", "ranking", "data", "comparison"], requiredFields: ["headline", "bars"], optionalFields: ["eyebrow"], format: "feed" },
  { id: "t114", platform: "instagram", name: "Story Card", style: "dark", mood: "educational", bestFor: ["story_tip", "announcement", "quick_advice"], requiredFields: ["headline"], optionalFields: ["body", "tips", "bullets", "eyebrow"], format: "story" },

  // ============ FRESH PRO LINKEDIN (T115-T120) ============
  { id: "t115", platform: "linkedin", name: "Clean Metrics", style: "light", mood: "data_driven", bestFor: ["stat", "dashboard", "key_metrics"], requiredFields: ["headline", "bars"], optionalFields: ["body", "eyebrow"], format: "feed" },
  { id: "t116", platform: "linkedin", name: "Professional Quote", style: "light", mood: "motivational", bestFor: ["quote", "inspiration", "thought_leadership"], requiredFields: ["headline"], optionalFields: ["body", "subheadline"], format: "feed" },
  { id: "t117", platform: "linkedin", name: "Feature Spotlight", style: "light", mood: "educational", bestFor: ["product_showcase", "feature_demo", "new_feature"], requiredFields: ["headline"], optionalFields: ["body", "tips", "eyebrow"], format: "feed" },
  { id: "t118", platform: "linkedin", name: "Comparison Table", style: "light", mood: "data_driven", bestFor: ["comparison", "before_after", "versus"], requiredFields: ["headline", "items"], optionalFields: ["eyebrow"], format: "feed" },
  { id: "t119", platform: "linkedin", name: "Insight Card", style: "light", mood: "educational", bestFor: ["insight", "tip", "analysis"], requiredFields: ["headline"], optionalFields: ["body", "stat", "tips", "eyebrow"], format: "feed" },
  { id: "t120", platform: "linkedin", name: "Action Steps", style: "light", mood: "educational", bestFor: ["how_to", "step_process", "action_plan"], requiredFields: ["headline", "steps"], optionalFields: ["eyebrow"], format: "feed" },

  // ============ FRESH PRO TIKTOK (T121-T126) ============
  { id: "t121", platform: "tiktok", name: "Clean Hook", style: "light", mood: "provocative", bestFor: ["hook", "hot_take", "controversial"], requiredFields: ["headline"], optionalFields: ["body", "bullets", "eyebrow"], format: "vertical" },
  { id: "t122", platform: "tiktok", name: "Stat Spotlight", style: "light", mood: "data_driven", bestFor: ["stat", "data_point", "surprising_number"], requiredFields: ["stat"], optionalFields: ["body", "eyebrow"], format: "vertical" },
  { id: "t123", platform: "tiktok", name: "Tip Stack", style: "light", mood: "educational", bestFor: ["career_tips", "quick_tip", "how_to"], requiredFields: ["headline", "tips"], optionalFields: ["eyebrow"], format: "vertical" },
  { id: "t124", platform: "tiktok", name: "Binary Choice", style: "light", mood: "educational", bestFor: ["comparison", "do_dont", "right_wrong"], requiredFields: ["headline", "items"], optionalFields: ["beforeText", "afterText", "eyebrow"], format: "vertical" },
  { id: "t125", platform: "tiktok", name: "Progress Tracker", style: "light", mood: "data_driven", bestFor: ["skill_progress", "benchmark", "data_visual"], requiredFields: ["headline", "bars"], optionalFields: ["eyebrow"], format: "vertical" },
  { id: "t126", platform: "tiktok", name: "Swipe Prompt", style: "light", mood: "provocative", bestFor: ["question", "poll", "engagement_hook"], requiredFields: ["headline"], optionalFields: ["body", "cta", "eyebrow"], format: "vertical" },

  // ============ FRESH PRO INSTAGRAM (T127-T132) ============
  { id: "t127", platform: "instagram", name: "Magazine Spread", style: "cream", mood: "editorial", bestFor: ["thought_leadership", "long_form", "deep_dive"], requiredFields: ["headline"], optionalFields: ["body", "bullets", "subheadline", "eyebrow"], format: "feed" },
  { id: "t128", platform: "instagram", name: "Minimal Grid", style: "light", mood: "data_driven", bestFor: ["stat", "dashboard", "key_metrics"], requiredFields: ["headline", "bars"], optionalFields: ["eyebrow"], format: "grid" },
  { id: "t129", platform: "instagram", name: "Gradient Soft", style: "pastel", mood: "motivational", bestFor: ["inspiration", "tip", "affirmation"], requiredFields: ["headline"], optionalFields: ["body", "bullets", "eyebrow"], format: "feed" },
  { id: "t130", platform: "instagram", name: "Typography Hero", style: "light", mood: "provocative", bestFor: ["hot_take", "bold_statement", "truth_bomb"], requiredFields: ["headline"], optionalFields: ["body", "eyebrow"], format: "grid" },
  { id: "t131", platform: "instagram", name: "Data Story", style: "light", mood: "data_driven", bestFor: ["data_visual", "benchmark", "industry_insights"], requiredFields: ["headline", "bars"], optionalFields: ["subheadline", "body", "eyebrow"], format: "feed" },
  { id: "t132", platform: "instagram", name: "Story Minimal", style: "light", mood: "motivational", bestFor: ["story_tip", "announcement", "cta"], requiredFields: ["headline"], optionalFields: ["body", "cta", "eyebrow"], format: "story" },

  // ============ PRO SET 3 LINKEDIN (T133-T138) ============
  { id: "t133", platform: "linkedin", name: "Split Card", style: "light", mood: "educational", bestFor: ["key_takeaway", "summary", "product_showcase"], requiredFields: ["headline"], optionalFields: ["body", "tips", "eyebrow"], format: "feed" },
  { id: "t134", platform: "linkedin", name: "Stat vs Stat", style: "light", mood: "data_driven", bestFor: ["comparison", "before_after", "head_to_head"], requiredFields: ["headline", "bars"], optionalFields: ["body", "eyebrow"], format: "feed" },
  { id: "t135", platform: "linkedin", name: "Icon Grid", style: "light", mood: "educational", bestFor: ["features", "product_showcase", "capabilities"], requiredFields: ["headline", "tips"], optionalFields: ["eyebrow"], format: "feed" },
  { id: "t136", platform: "linkedin", name: "Newsletter Card", style: "light", mood: "editorial", bestFor: ["weekly_roundup", "newsletter", "digest"], requiredFields: ["headline", "tips"], optionalFields: ["subheadline", "eyebrow"], format: "feed" },
  { id: "t137", platform: "linkedin", name: "Ranking Ladder", style: "light", mood: "data_driven", bestFor: ["ranking", "top_list", "leaderboard"], requiredFields: ["headline", "bars"], optionalFields: ["eyebrow"], format: "feed" },
  { id: "t138", platform: "linkedin", name: "Minimal Statement", style: "light", mood: "provocative", bestFor: ["bold_statement", "hot_take", "truth_bomb"], requiredFields: ["headline"], optionalFields: ["body", "cta"], format: "feed" },

  // ============ PRO SET 3 TIKTOK (T139-T144) ============
  { id: "t139", platform: "tiktok", name: "Countdown", style: "light", mood: "educational", bestFor: ["countdown", "ranking", "top_list"], requiredFields: ["headline", "tips"], optionalFields: ["eyebrow"], format: "vertical" },
  { id: "t140", platform: "tiktok", name: "Flashcard", style: "light", mood: "educational", bestFor: ["vocab", "definition", "concept"], requiredFields: ["headline"], optionalFields: ["body", "subheadline", "eyebrow"], format: "vertical" },
  { id: "t141", platform: "tiktok", name: "Myth Buster", style: "light", mood: "provocative", bestFor: ["myth_reality", "misconception", "correction"], requiredFields: ["headline", "beforeText", "afterText"], optionalFields: ["eyebrow"], format: "vertical" },
  { id: "t142", platform: "tiktok", name: "Hot Take", style: "light", mood: "provocative", bestFor: ["hot_take", "controversial", "bold_statement"], requiredFields: ["headline"], optionalFields: ["body", "eyebrow"], format: "vertical" },
  { id: "t143", platform: "tiktok", name: "Poll Style", style: "light", mood: "casual", bestFor: ["poll", "question", "engagement_hook"], requiredFields: ["headline", "items"], optionalFields: ["eyebrow"], format: "vertical" },
  { id: "t144", platform: "tiktok", name: "Score Card", style: "light", mood: "data_driven", bestFor: ["score", "assessment", "rating"], requiredFields: ["headline"], optionalFields: ["score", "bars", "eyebrow"], format: "vertical" },

  // ============ PRO SET 3 INSTAGRAM (T145-T150) ============
  { id: "t145", platform: "instagram", name: "Polaroid", style: "light", mood: "casual", bestFor: ["quote", "moment", "story"], requiredFields: ["headline"], optionalFields: ["stat", "eyebrow", "subheadline"], format: "feed" },
  { id: "t146", platform: "instagram", name: "Split Editorial", style: "light", mood: "editorial", bestFor: ["insight", "thought_leadership", "analysis"], requiredFields: ["headline"], optionalFields: ["body", "eyebrow"], format: "grid" },
  { id: "t147", platform: "instagram", name: "Infographic", style: "light", mood: "educational", bestFor: ["how_to", "step_process", "workflow"], requiredFields: ["headline", "steps"], optionalFields: ["eyebrow"], format: "feed" },
  { id: "t148", platform: "instagram", name: "Duo-Tone", style: "brand", mood: "authoritative", bestFor: ["announcement", "feature_demo", "launch"], requiredFields: ["headline"], optionalFields: ["body", "tags", "eyebrow"], format: "grid" },
  { id: "t149", platform: "instagram", name: "Card Stack", style: "cream", mood: "educational", bestFor: ["career_tips", "quick_tip", "how_to"], requiredFields: ["headline", "tips"], optionalFields: ["eyebrow"], format: "feed" },
  { id: "t150", platform: "instagram", name: "Clean Story CTA", style: "light", mood: "motivational", bestFor: ["cta", "announcement", "launch"], requiredFields: ["headline"], optionalFields: ["body", "cta", "stat", "eyebrow"], format: "story" },

  // ============ FRESH LINKEDIN (12 templates: T151-T162) ============
  { id: "t151", platform: "linkedin", name: "Gradient Authority", style: "gradient", mood: "authoritative", bestFor: ["thought_leadership", "bold_claim", "industry_insights"], requiredFields: ["headline"], optionalFields: ["body", "bodyBold", "headlineHighlight", "eyebrow"], format: "feed" },
  { id: "t152", platform: "linkedin", name: "Teal Metrics", style: "dark", mood: "data_driven", bestFor: ["data_chart", "resume_score", "benchmark", "survey"], requiredFields: ["headline"], optionalFields: ["bars", "eyebrow"], format: "feed" },
  { id: "t153", platform: "linkedin", name: "Navy Split", style: "dark", mood: "provocative", bestFor: ["bold_statement", "truth_bomb", "hot_take"], requiredFields: ["headline"], optionalFields: ["body", "bodyBold", "headlineHighlight", "eyebrow"], format: "feed" },
  { id: "t154", platform: "linkedin", name: "Rose Hot Take", style: "dark", mood: "provocative", bestFor: ["hot_take", "contrarian", "controversial", "debate"], requiredFields: ["headline"], optionalFields: ["body", "bodyBold", "headlineHighlight", "eyebrow"], format: "feed" },
  { id: "t155", platform: "linkedin", name: "Cream Editorial", style: "cream", mood: "editorial", bestFor: ["quote", "wisdom", "insight", "thought_leadership"], requiredFields: ["headline"], optionalFields: ["body", "headlineHighlight", "eyebrow"], format: "feed" },
  { id: "t156", platform: "linkedin", name: "Minimal Checklist", style: "light", mood: "educational", bestFor: ["checklist", "pre_apply", "action_items", "how_to"], requiredFields: ["headline"], optionalFields: ["items", "eyebrow"], format: "feed" },
  { id: "t157", platform: "linkedin", name: "Emerald Tips", style: "dark", mood: "educational", bestFor: ["career_tips", "quick_tip", "how_to", "power_moves"], requiredFields: ["headline"], optionalFields: ["tips", "headlineHighlight", "eyebrow"], format: "feed" },
  { id: "t158", platform: "linkedin", name: "Violet Big Stat", style: "dark", mood: "data_driven", bestFor: ["stat", "data_story", "shocking_number", "industry_insights"], requiredFields: ["stat"], optionalFields: ["body", "eyebrow"], format: "feed" },
  { id: "t159", platform: "linkedin", name: "Dark Do vs Don't", style: "dark", mood: "educational", bestFor: ["do_dont", "comparison", "right_wrong", "before_after"], requiredFields: ["headline"], optionalFields: ["beforeText", "afterText", "eyebrow"], format: "feed" },
  { id: "t160", platform: "linkedin", name: "Brand Announcement", style: "brand", mood: "authoritative", bestFor: ["announcement", "product_launch", "new_feature", "milestone"], requiredFields: ["headline"], optionalFields: ["body", "bullets", "headlineHighlight", "eyebrow"], format: "feed" },
  { id: "t161", platform: "linkedin", name: "Light Salary Data", style: "light", mood: "data_driven", bestFor: ["salary", "compensation", "market_data", "range"], requiredFields: ["headline"], optionalFields: ["bars", "headlineHighlight", "eyebrow"], format: "feed" },
  { id: "t162", platform: "linkedin", name: "Dark Social Proof", style: "dark", mood: "storytelling", bestFor: ["social_proof", "traction", "results", "metrics"], requiredFields: ["stat"], optionalFields: ["headline", "subheadline", "eyebrow"], format: "feed" },

  // ============ FRESH TIKTOK (12 templates: T163-T174) ============
  { id: "t163", platform: "tiktok", name: "Neon Countdown", style: "dark", mood: "educational", bestFor: ["countdown", "ranking", "top_list", "mistakes"], requiredFields: ["headline"], optionalFields: ["items", "headlineHighlight", "eyebrow"], format: "vertical" },
  { id: "t164", platform: "tiktok", name: "Teal Terminal", style: "dark", mood: "data_driven", bestFor: ["product_showcase", "live_demo", "scan", "tech"], requiredFields: ["headline"], optionalFields: ["stat", "eyebrow"], format: "vertical" },
  { id: "t165", platform: "tiktok", name: "Rose POV", style: "dark", mood: "storytelling", bestFor: ["pov", "relatable", "emotional", "transformation"], requiredFields: ["headline"], optionalFields: ["headlineHighlight", "eyebrow"], format: "vertical" },
  { id: "t166", platform: "tiktok", name: "Amber Flashcard", style: "dark", mood: "educational", bestFor: ["vocab", "definition", "concept", "career_vocab"], requiredFields: ["headline"], optionalFields: ["body", "subheadline", "eyebrow"], format: "vertical" },
  { id: "t167", platform: "tiktok", name: "Gradient CTA", style: "gradient", mood: "motivational", bestFor: ["cta", "hook", "engagement", "sign_up"], requiredFields: ["headline"], optionalFields: ["body", "cta", "headlineHighlight"], format: "vertical" },
  { id: "t168", platform: "tiktok", name: "Slate Would You Rather", style: "dark", mood: "casual", bestFor: ["poll", "engagement_hook", "would_you_rather", "debate"], requiredFields: ["headline"], optionalFields: ["beforeText", "afterText", "body", "subheadline", "eyebrow"], format: "vertical" },
  { id: "t169", platform: "tiktok", name: "Cyan Score Ring", style: "dark", mood: "data_driven", bestFor: ["score", "assessment", "rate_my_resume", "rating"], requiredFields: ["stat"], optionalFields: ["body", "eyebrow"], format: "vertical" },
  { id: "t170", platform: "tiktok", name: "Emerald Myth Buster", style: "dark", mood: "educational", bestFor: ["myth_reality", "misconception", "correction", "truth"], requiredFields: ["beforeText", "afterText"], optionalFields: ["eyebrow"], format: "vertical" },
  { id: "t171", platform: "tiktok", name: "Violet Storytime", style: "dark", mood: "storytelling", bestFor: ["storytime", "personal_story", "journey", "transformation"], requiredFields: ["headline"], optionalFields: ["subheadline", "body", "headlineHighlight"], format: "vertical" },
  { id: "t172", platform: "tiktok", name: "Cream iMessage", style: "cream", mood: "casual", bestFor: ["text_conversation", "relatable", "viral", "social_proof"], requiredFields: ["bullets"], optionalFields: ["eyebrow"], format: "vertical" },
  { id: "t173", platform: "tiktok", name: "Navy Tier List", style: "dark", mood: "provocative", bestFor: ["tier_list", "ranking", "comparison", "hot_take"], requiredFields: ["headline"], optionalFields: ["items", "headlineHighlight", "eyebrow"], format: "vertical" },
  { id: "t174", platform: "tiktok", name: "Dark Recruiter DMs", style: "dark", mood: "storytelling", bestFor: ["recruiter_dm", "social_proof", "results", "transformation"], requiredFields: ["headline"], optionalFields: ["beforeText", "afterText", "eyebrow"], format: "vertical" },

  // ============ FRESH INSTAGRAM (12 templates: T175-T186) ============
  { id: "t175", platform: "instagram", name: "Emerald Authority", style: "dark", mood: "authoritative", bestFor: ["thought_leadership", "career_intel", "industry_insights"], requiredFields: ["headline"], optionalFields: ["body", "bodyBold", "headlineHighlight", "eyebrow"], format: "feed" },
  { id: "t176", platform: "instagram", name: "Cream Serif Quote", style: "cream", mood: "editorial", bestFor: ["quote", "wisdom", "insight", "inspiration"], requiredFields: ["headline"], optionalFields: ["body", "headlineHighlight", "eyebrow"], format: "feed" },
  { id: "t177", platform: "instagram", name: "Navy Before/After", style: "dark", mood: "data_driven", bestFor: ["before_after", "transformation", "comparison", "results"], requiredFields: ["headline"], optionalFields: ["beforeText", "afterText", "headlineHighlight", "eyebrow"], format: "feed" },
  { id: "t178", platform: "instagram", name: "Violet Carousel Cover", style: "dark", mood: "authoritative", bestFor: ["carousel_cover", "hook_slide", "deep_dive", "series_intro"], requiredFields: ["headline"], optionalFields: ["stat", "subheadline", "body", "eyebrow"], format: "feed" },
  { id: "t179", platform: "instagram", name: "Minimal Big Stat", style: "light", mood: "data_driven", bestFor: ["stat", "shocking_number", "data_story"], requiredFields: ["stat"], optionalFields: ["eyebrow"], format: "grid" },
  { id: "t180", platform: "instagram", name: "Teal Tip Trio", style: "dark", mood: "educational", bestFor: ["quick_tip", "career_tips", "how_to", "quick_wins"], requiredFields: ["headline"], optionalFields: ["tips", "headlineHighlight", "eyebrow"], format: "grid" },
  { id: "t181", platform: "instagram", name: "Rose Bold Take", style: "dark", mood: "provocative", bestFor: ["hot_take", "bold_statement", "contrarian", "truth_bomb"], requiredFields: ["headline"], optionalFields: ["bodyBold", "headlineHighlight"], format: "grid" },
  { id: "t182", platform: "instagram", name: "Dark Feature Grid", style: "dark", mood: "authoritative", bestFor: ["product_showcase", "features", "capabilities", "what_we_do"], requiredFields: ["headline"], optionalFields: ["eyebrow"], format: "grid" },
  { id: "t183", platform: "instagram", name: "Gradient Story CTA", style: "gradient", mood: "motivational", bestFor: ["cta", "sign_up", "free_tool", "story_promo"], requiredFields: ["headline"], optionalFields: ["cta", "headlineHighlight", "eyebrow"], format: "story" },
  { id: "t184", platform: "instagram", name: "Amber Poll Story", style: "dark", mood: "casual", bestFor: ["poll", "engagement_hook", "question", "quiz"], requiredFields: ["headline"], optionalFields: ["items", "headlineHighlight", "eyebrow"], format: "story" },
  { id: "t185", platform: "instagram", name: "Light Steps Story", style: "light", mood: "educational", bestFor: ["step_by_step", "how_it_works", "onboarding", "tutorial"], requiredFields: ["headline"], optionalFields: ["steps", "headlineHighlight", "eyebrow"], format: "story" },
  { id: "t186", platform: "instagram", name: "Gradient Salary Reveal", style: "gradient", mood: "data_driven", bestFor: ["salary", "compensation", "salary_reveal", "market_data"], requiredFields: ["stat"], optionalFields: ["subheadline", "body", "cta", "eyebrow"], format: "story" },
];

/* ---- Performance Cache ---- */
/* # In-memory cache of template engagement scores, refreshed every 2 hours */
let performanceCache: Map<string, { avgScore: number; useCount: number; lastUsed: Date | null }> | null = null;
let performanceCacheTime = 0;
const PERF_CACHE_TTL = 2 * 60 * 60 * 1000;

/* # Load template performance data from the Visual + Content tables */
async function loadPerformanceData(): Promise<Map<string, { avgScore: number; useCount: number; lastUsed: Date | null }>> {
  if (performanceCache && Date.now() - performanceCacheTime < PERF_CACHE_TTL) {
    return performanceCache;
  }

  const perf = new Map<string, { avgScore: number; useCount: number; lastUsed: Date | null }>();

  try {
    // # Join Visual → Content to get engagement scores per template
    const visuals = await prisma.visual.findMany({
      where: { contentId: { not: null } },
      select: {
        templateId: true,
        contentId: true,
        createdAt: true,
      },
    });

    // # Group by template ID
    const templateGroups: Record<string, { contentIds: string[]; lastUsed: Date }> = {};
    for (const v of visuals) {
      if (!templateGroups[v.templateId]) {
        templateGroups[v.templateId] = { contentIds: [], lastUsed: v.createdAt };
      }
      templateGroups[v.templateId].contentIds.push(v.contentId!);
      if (v.createdAt > templateGroups[v.templateId].lastUsed) {
        templateGroups[v.templateId].lastUsed = v.createdAt;
      }
    }

    // # Fetch engagement scores for all content IDs
    for (const [templateId, group] of Object.entries(templateGroups)) {
      const contents = await prisma.content.findMany({
        where: {
          id: { in: group.contentIds },
          engagementScore: { not: null, gt: 0 },
        },
        select: { engagementScore: true },
      });

      const scores = contents.map((c) => c.engagementScore!).filter((s) => s > 0);
      perf.set(templateId, {
        avgScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
        useCount: group.contentIds.length,
        lastUsed: group.lastUsed,
      });
    }
  } catch (e) {
    console.warn("[TemplateIntelligence] Performance data load failed:", e);
  }

  performanceCache = perf;
  performanceCacheTime = Date.now();
  return perf;
}

/* ---- Recently Used Tracker ---- */
/* # Prevents the same template from being used twice in 7 days */
async function getRecentlyUsedTemplates(platform: string, daysBack: number = 7): Promise<Set<string>> {
  const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  try {
    const recent = await prisma.visual.findMany({
      where: {
        createdAt: { gte: since },
        contentId: { not: null },
      },
      select: { templateId: true, contentId: true },
    });

    // # Only count templates that were actually used for this platform
    const contentIds = recent.map((r) => r.contentId!);
    const contents = await prisma.content.findMany({
      where: { id: { in: contentIds }, platform },
      select: { id: true },
    });
    const validContentIds = new Set(contents.map((c) => c.id));

    return new Set(
      recent
        .filter((r) => validContentIds.has(r.contentId!))
        .map((r) => r.templateId)
    );
  } catch {
    return new Set();
  }
}

/* ---- Content Analysis ---- */
/* # Analyzes content text to determine what data fields are available */
function analyzeContentFields(content: string): {
  hasStat: boolean;
  hasBullets: boolean;
  hasComparison: boolean;
  hasSteps: boolean;
  hasQuote: boolean;
  keywords: string[];
} {
  const lower = content.toLowerCase();
  return {
    hasStat: /\d+%|\d+x|\$[\d,]+|\d+ out of \d+/i.test(content),
    hasBullets: (content.match(/^[-•→]\s/gm) || []).length >= 2 || (content.match(/^\d+\.\s/gm) || []).length >= 2,
    hasComparison: /before|after|vs\.?|versus|instead of|don't.*do/i.test(content),
    hasSteps: /step \d|first.*then|phase \d/i.test(content),
    hasQuote: /[""].*[""]|said|according to/i.test(content),
    keywords: extractKeywords(lower),
  };
}

/* # Extract content keywords for template matching */
function extractKeywords(text: string): string[] {
  const kw: string[] = [];
  if (/resume|cv|ats/i.test(text)) kw.push("resume_tips");
  if (/interview|behavioral|star method/i.test(text)) kw.push("interview_prep");
  if (/salary|compensation|negotiate|offer/i.test(text)) kw.push("salary");
  if (/linkedin/i.test(text)) kw.push("linkedin");
  if (/recruiter|hiring manager/i.test(text)) kw.push("recruiter_perspective");
  if (/myth|actually|wrong|stop doing/i.test(text)) kw.push("myth_busting", "contrarian");
  if (/\d+%|\d+ out of|data|study|research/i.test(text)) kw.push("data_story", "research");
  if (/tip|trick|hack|how to|guide/i.test(text)) kw.push("career_tips", "how_to");
  if (/story|experience|happened|journey/i.test(text)) kw.push("storytelling");
  if (/tool|app|resource|platform/i.test(text)) kw.push("tools", "resources");
  if (/jobpilot|feature|product/i.test(text)) kw.push("product_showcase");
  if (/motivation|keep going|don.t give up/i.test(text)) kw.push("motivation");
  if (/hot take|unpopular|controversial/i.test(text)) kw.push("hot_take", "provocative");
  return [...new Set(kw)];
}

/* ---- Scoring Algorithm ---- */
/* # Scores each template candidate based on multiple factors */
function scoreTemplate(
  template: TemplateMeta,
  contentKeywords: string[],
  contentFields: ReturnType<typeof analyzeContentFields>,
  pillar: string | undefined,
  perfData: Map<string, { avgScore: number; useCount: number; lastUsed: Date | null }>,
  recentlyUsed: Set<string>,
): number {
  let score = 0;

  // # 1. Keyword overlap (0-30 points)
  const keywordOverlap = template.bestFor.filter((bf) => contentKeywords.includes(bf)).length;
  score += Math.min(keywordOverlap * 10, 30);

  // # 2. Required fields match (0 or -100 penalty)
  // # Templates missing required fields get eliminated
  for (const field of template.requiredFields) {
    if (field === "stat" && !contentFields.hasStat) score -= 100;
    if (field === "bullets" && !contentFields.hasBullets) score -= 100;
    if (field === "steps" && !contentFields.hasSteps) score -= 100;
    if (field === "beforeText" && !contentFields.hasComparison) score -= 100;
    if (field === "afterText" && !contentFields.hasComparison) score -= 100;
    // # Fields like "headline", "items", "tips" are always available from content
  }

  // # 3. Performance bonus (0-25 points)
  const perf = perfData.get(template.id);
  if (perf && perf.avgScore > 0) {
    score += Math.min(perf.avgScore * 5, 25);
  }

  // # 4. Variety penalty — recently used templates get demoted
  if (recentlyUsed.has(template.id)) {
    score -= 20;
  }

  // # 5. Mood-pillar alignment bonus (0-10 points)
  if (pillar) {
    const pillarLower = pillar.toLowerCase();
    if (pillarLower.includes("career tips") && template.mood === "educational") score += 10;
    if (pillarLower.includes("ai in hiring") && template.mood === "data_driven") score += 10;
    if (pillarLower.includes("product showcase") && template.mood === "educational") score += 10;
    if (pillarLower.includes("industry insights") && template.mood === "data_driven") score += 10;
    if (pillarLower.includes("motivation") && template.mood === "motivational") score += 10;
    if (pillarLower.includes("behind the scenes") && template.mood === "storytelling") score += 10;
  }

  // # 6. New template exploration bonus — untested templates get a small boost
  if (!perf || perf.useCount === 0) {
    score += 5;
  }

  return score;
}

/* ---- Main Selection Function ---- */
/* # Selects the best template for a given content piece */
export async function selectTemplate(
  platform: string,
  contentType: string,
  content: string,
  pillar?: string,
  tone?: string,
): Promise<{ templateId: TemplateId; templateName: string; reasoning: string }> {
  // # Filter catalog to this platform
  const candidates = TEMPLATE_CATALOG.filter((t) => t.platform === platform);

  if (candidates.length === 0) {
    // # Platform not in catalog — return a generic fallback
    return { templateId: "t1" as TemplateId, templateName: "Fallback", reasoning: "No templates found for this platform" };
  }

  // # Analyze the content
  const contentFields = analyzeContentFields(content);

  // # Load performance data and recently used
  const [perfData, recentlyUsed] = await Promise.all([
    loadPerformanceData(),
    getRecentlyUsedTemplates(platform),
  ]);

  // # Score all candidates
  const scored = candidates.map((t) => ({
    template: t,
    score: scoreTemplate(t, contentFields.keywords, contentFields, pillar, perfData, recentlyUsed),
  }));

  // # Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // # Filter out templates with negative scores (missing required fields)
  const viable = scored.filter((s) => s.score >= 0);

  if (viable.length === 0) {
    // # All templates had missing required fields — use the first with just headline
    const fallback = candidates.find((t) => t.requiredFields.length === 1 && t.requiredFields[0] === "headline") || candidates[0];
    return { templateId: fallback.id, templateName: fallback.name, reasoning: "Fallback: no template matched content fields perfectly" };
  }

  // # Use Gemini for final selection among top 5 candidates
  const top5 = viable.slice(0, 5);
  const winner = await geminiPickBest(top5, content, platform, contentType, pillar, tone, perfData);

  return winner;
}

/* ---- Gemini Final Picker ---- */
/* # Uses AI to make the final aesthetic call among top candidates */
async function geminiPickBest(
  candidates: { template: TemplateMeta; score: number }[],
  content: string,
  platform: string,
  contentType: string,
  pillar?: string,
  tone?: string,
  perfData?: Map<string, { avgScore: number; useCount: number; lastUsed: Date | null }>,
): Promise<{ templateId: TemplateId; templateName: string; reasoning: string }> {
  // # Build candidate descriptions for Gemini
  const candidateList = candidates.map((c, i) => {
    const perf = perfData?.get(c.template.id);
    const perfNote = perf && perf.avgScore > 0
      ? `Avg engagement: ${perf.avgScore.toFixed(1)}, used ${perf.useCount} times`
      : "No engagement data yet";
    return `${i + 1}. ${c.template.id} — "${c.template.name}" (${c.template.style} style, ${c.template.mood} mood). Best for: ${c.template.bestFor.slice(0, 4).join(", ")}. Score: ${c.score}. ${perfNote}.`;
  }).join("\n");

  const prompt = `You are a senior visual design director for JobPilot AI. Pick the BEST template for this content.

CONTENT (${platform}, ${contentType}):
${content.slice(0, 500)}

${pillar ? `PILLAR: ${pillar}` : ""}
${tone ? `TONE: ${tone}` : ""}

TOP TEMPLATE CANDIDATES (pre-scored by algorithm):
${candidateList}

SELECTION CRITERIA:
1. Does the template STYLE match the content's emotional register?
2. Does the template LAYOUT display this specific content well? (stats need stat templates, lists need list templates, etc.)
3. Would this template STOP THE SCROLL on ${platform}?
4. Does it match the ${tone || "professional"} tone?
5. Favor templates with higher engagement scores (proven performers)

Return a JSON object:
{
  "pick": 1,
  "reasoning": "One sentence explaining why this template is the best visual match for this content"
}

Return ONLY valid JSON.`;

  try {
    const raw = await callGemini(prompt);
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      const pickIndex = Math.max(0, Math.min((parsed.pick || 1) - 1, candidates.length - 1));
      const winner = candidates[pickIndex].template;
      return {
        templateId: winner.id,
        templateName: winner.name,
        reasoning: parsed.reasoning || `Selected ${winner.name} for ${platform}`,
      };
    }
  } catch (e) {
    console.warn("[TemplateIntelligence] Gemini pick failed, using top scorer:", e);
  }

  // # Fallback to highest algorithmic score
  const winner = candidates[0].template;
  return {
    templateId: winner.id,
    templateName: winner.name,
    reasoning: `Algorithm pick: highest score (${candidates[0].score}) based on content-template match`,
  };
}

/* ---- Content Mapper ---- */
/* # Converts SlideData (from designer agent) → TemplateContent (for HTML templates) */
export function slideToTemplateContent(slide: SlideData): TemplateContent {
  return {
    headline: slide.headline,
    headlineHighlight: undefined,
    subheadline: slide.subheadline,
    body: slide.body,
    stat: slide.stat,
    bullets: slide.bullets,
    eyebrow: undefined,
    tips: slide.bullets?.map((b, i) => ({ title: b, description: "" })),
    steps: slide.steps?.map((s) => ({ label: String(s.number), title: s.title, description: s.detail })),
    bars: slide.bars,
    items: slide.bullets?.map((b) => ({ text: b })),
    beforeText: slide.beforeText,
    afterText: slide.afterText,
    cta: slide.footer,
  };
}

/* ---- Get Template Catalog for a Platform ---- */
/* # Returns all template IDs for a given platform — used by the router */
export function getTemplateCatalog(platform: string): TemplateMeta[] {
  return TEMPLATE_CATALOG.filter((t) => t.platform === platform);
}

/* ---- Performance Summary ---- */
/* # Generates a human-readable summary of template performance for the strategy director */
export async function getTemplatePerformanceSummary(): Promise<string> {
  const perfData = await loadPerformanceData();

  if (perfData.size === 0) {
    return "TEMPLATE PERFORMANCE: No engagement data yet. Templates are being selected by content-match algorithm.";
  }

  // # Sort by avg engagement score descending
  const sorted = [...perfData.entries()]
    .filter(([, data]) => data.avgScore > 0)
    .sort(([, a], [, b]) => b.avgScore - a.avgScore);

  if (sorted.length === 0) {
    return "TEMPLATE PERFORMANCE: Templates have been used but no engagement data recorded yet.";
  }

  const top5 = sorted.slice(0, 5);
  const bottom3 = sorted.slice(-3).reverse();

  const topSection = top5.map(([id, data]) => {
    const meta = TEMPLATE_CATALOG.find((t) => t.id === id);
    return `  ${id} "${meta?.name || "Unknown"}" — avg ${data.avgScore.toFixed(1)}, used ${data.useCount}x`;
  }).join("\n");

  const bottomSection = bottom3.map(([id, data]) => {
    const meta = TEMPLATE_CATALOG.find((t) => t.id === id);
    return `  ${id} "${meta?.name || "Unknown"}" — avg ${data.avgScore.toFixed(1)}, used ${data.useCount}x`;
  }).join("\n");

  return `TEMPLATE PERFORMANCE (last 30 days):

TOP PERFORMERS:
${topSection}

LOWEST PERFORMERS:
${bottomSection}

Use top-performing template styles more. Deprioritize low performers unless content specifically requires their layout.`;
}
