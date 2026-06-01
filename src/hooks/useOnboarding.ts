import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface UserProfile {
  id: string;
  user_id: string;
  account_type: string | null;
  industry: string | null;
  description: string | null;
  problems: string | null;
  workflows: string | null;
  desired_features: string | null;
  interests: string | null;
  onboarding_completed: boolean;
  created_at: string;
}

export interface OnboardingAnswers {
  account_type: string;
  industry: string;
  description: string;
  problems: string;
  workflows: string;
  desired_features: string;
  interests: string;
}

export interface Recommendation {
  title: string;
  description: string;
  path: string;
  color: string;
  tag: string;
}

const KEYWORD_MAP: { keywords: string[]; recommendations: Recommendation[] }[] = [
  {
    keywords: ["sports", "nba", "nfl", "athlete", "athletes", "player", "players", "coach", "team", "agency", "relocation", "sponsorship", "contract", "draft"],
    recommendations: [
      { title: "Athlete Dashboard", description: "Manage player profiles, contracts & performance", path: "/gaming-intelligence", color: "from-blue-500 to-cyan-500", tag: "Sports" },
      { title: "Player CRM", description: "Track relationships, deals & player pipeline", path: "/dashboard/workspace", color: "from-sky-500 to-blue-500", tag: "Sports" },
      { title: "Sponsorship Tracker", description: "Manage brand deals and sponsorship pipelines", path: "/dashboard/ops", color: "from-indigo-500 to-violet-500", tag: "Sports" },
      { title: "Gantt Chart & DFD", description: "Visual workflows for relocation and ops", path: "/dashboard/workspace", color: "from-violet-500 to-purple-500", tag: "Sports" },
    ],
  },
  {
    keywords: ["music", "artist", "rapper", "record label", "album", "studio", "tour", "release", "producer", "song", "track", "beat", "singer"],
    recommendations: [
      { title: "Artist Intelligence", description: "AI-powered music identity, branding & strategy", path: "/artist-intelligence", color: "from-fuchsia-500 to-rose-500", tag: "Music" },
      { title: "Release Planner", description: "Plan album drops, campaigns & release timelines", path: "/dashboard/creator-productivity", color: "from-pink-500 to-fuchsia-500", tag: "Music" },
      { title: "Music Studio", description: "Collaborate, record & produce in-browser", path: "/studio", color: "from-orange-500 to-red-500", tag: "Music" },
      { title: "Campaign Tracker", description: "Track marketing campaigns for releases", path: "/dashboard/ops", color: "from-rose-500 to-pink-500", tag: "Music" },
    ],
  },
  {
    keywords: ["restaurant", "food", "menu", "chef", "dining", "catering", "kitchen", "delivery", "hospitality", "cafe", "bar"],
    recommendations: [
      { title: "Operations Dashboard", description: "Manage your restaurant ops end-to-end", path: "/dashboard/ops", color: "from-amber-500 to-orange-500", tag: "Food & Bev" },
      { title: "Staff Scheduling", description: "Schedule shifts and manage your team", path: "/dashboard/calendar", color: "from-yellow-500 to-amber-500", tag: "Food & Bev" },
      { title: "Inventory Workflow", description: "Track stock, orders and vendor coordination", path: "/dashboard/workspace", color: "from-lime-500 to-green-500", tag: "Food & Bev" },
      { title: "Finance Tracker", description: "Monitor revenue, costs and margins", path: "/dashboard/finance", color: "from-emerald-500 to-teal-500", tag: "Food & Bev" },
    ],
  },
  {
    keywords: ["software", "developer", "developer", "code", "app", "startup", "tech", "saas", "engineering", "build", "product", "api", "web"],
    recommendations: [
      { title: "AI Builder", description: "Build custom AI tools without code", path: "/ai-builder", color: "from-indigo-500 to-violet-500", tag: "Tech" },
      { title: "Code Studio", description: "AI-powered code editor and assistant", path: "/code-studio", color: "from-blue-500 to-indigo-500", tag: "Tech" },
      { title: "Data Intelligence", description: "SQL lab, datasets and visualizations", path: "/data-intelligence", color: "from-cyan-500 to-blue-500", tag: "Tech" },
      { title: "Project Manager", description: "Track tasks, sprints and deliverables", path: "/gaming-intelligence/projects", color: "from-violet-500 to-purple-500", tag: "Tech" },
    ],
  },
  {
    keywords: ["creative", "design", "content", "brand", "marketing", "social media", "influencer", "creator", "video", "photo", "media"],
    recommendations: [
      { title: "Creative Intelligence", description: "AI creative tools and content generation", path: "/creative-intelligence", color: "from-emerald-500 to-teal-500", tag: "Creative" },
      { title: "Studio", description: "Music, photo, video & creative tools", path: "/studio", color: "from-orange-500 to-red-500", tag: "Creative" },
      { title: "Creator Productivity", description: "AI productivity coach for creators", path: "/dashboard/creator-productivity", color: "from-violet-500 to-fuchsia-500", tag: "Creative" },
      { title: "Campaign Tracker", description: "Manage content calendars and campaigns", path: "/dashboard/ops", color: "from-pink-500 to-rose-500", tag: "Creative" },
    ],
  },
  {
    keywords: ["finance", "trading", "investment", "stocks", "crypto", "portfolio", "forex", "hedge fund", "equity", "wealth"],
    recommendations: [
      { title: "Trading Journal", description: "Log trades, analyze performance & patterns", path: "/dashboard/trading", color: "from-green-500 to-emerald-500", tag: "Finance" },
      { title: "Finance Dashboard", description: "Track spending, income and financial goals", path: "/dashboard/finance", color: "from-emerald-500 to-teal-500", tag: "Finance" },
      { title: "Data Intelligence", description: "Visualize financial data and run SQL queries", path: "/data-intelligence", color: "from-blue-500 to-cyan-500", tag: "Finance" },
      { title: "Goals Tracker", description: "Set and monitor financial milestones", path: "/dashboard/goals", color: "from-amber-500 to-orange-500", tag: "Finance" },
    ],
  },
];

export function getRecommendations(profile: UserProfile | null): Recommendation[] {
  if (!profile) return [];

  const combined = [
    profile.account_type,
    profile.industry,
    profile.description,
    profile.problems,
    profile.workflows,
    profile.desired_features,
    profile.interests,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const matched: Recommendation[] = [];
  const seen = new Set<string>();

  for (const category of KEYWORD_MAP) {
    const hit = category.keywords.some((kw) => combined.includes(kw));
    if (hit) {
      for (const rec of category.recommendations) {
        if (!seen.has(rec.title)) {
          seen.add(rec.title);
          matched.push(rec);
        }
      }
    }
  }

  return matched.slice(0, 6);
}

export function useOnboarding() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setProfile(data as UserProfile | null);
        setLoading(false);
      });
  }, [user]);

  const saveProfile = async (answers: OnboardingAnswers) => {
    if (!user) return { error: "Not authenticated" };

    const payload = {
      user_id: user.id,
      ...answers,
      onboarding_completed: true,
    };

    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select()
      .single();

    if (!error) setProfile(data as UserProfile);
    return { error };
  };

  return { profile, loading, saveProfile };
}
