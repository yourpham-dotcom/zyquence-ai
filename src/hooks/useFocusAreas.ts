import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const FOCUS_AREA_OPTIONS = [
  { id: "athlete", label: "Athlete Tools", icon: "🏆", description: "Sports training & performance" },
  { id: "finance", label: "Finance", icon: "💰", description: "Budgeting & investing" },
  { id: "productivity", label: "Productivity", icon: "⚡", description: "Task management & focus" },
  { id: "career", label: "Career", icon: "💼", description: "Job prep & growth" },
  { id: "students", label: "Students", icon: "📚", description: "Study tools & academics" },
  { id: "business", label: "Business / Startup", icon: "🚀", description: "Entrepreneurship" },
  { id: "creators", label: "Creators", icon: "🎨", description: "Content & design" },
  { id: "music", label: "Music", icon: "🎵", description: "Production & artistry" },
  { id: "health", label: "Health & Fitness", icon: "💪", description: "Wellness & nutrition" },
  { id: "ai-tech", label: "AI / Tech", icon: "🤖", description: "Coding & AI tools" },
  { id: "networking", label: "Networking", icon: "🤝", description: "Community & connections" },
  { id: "travel", label: "Travel", icon: "✈️", description: "Explore & plan trips" },
  { id: "lifestyle", label: "Lifestyle", icon: "🌟", description: "Daily life & style" },
  { id: "education", label: "Education", icon: "🎓", description: "Learning & courses" },
  { id: "trading", label: "Trading", icon: "📈", description: "Trade journaling & analytics" },
] as const;

export type FocusAreaId = (typeof FOCUS_AREA_OPTIONS)[number]["id"];

// Maps focus areas to dashboard tool/module keys
export const FOCUS_AREA_TOOL_MAP: Record<FocusAreaId, string[]> = {
  athlete: ["Studio", "Goals", "Zyquence Atlas"],
  finance: ["Finance", "Goals"],
  productivity: ["Calendar", "Goals", "AI Suggestions"],
  career: ["AI Suggestions", "Goals"],
  students: ["AI Suggestions", "Goals", "Data Intelligence"],
  business: ["AI Builder", "Goals"],
  creators: ["Studio", "Artist Intelligence"],
  music: ["Studio", "Artist Intelligence"],
  health: ["Goals", "Zyquence Atlas"],
  "ai-tech": ["AI Builder", "Data Intelligence", "AI Suggestions"],
  networking: ["Community"],
  travel: ["Zyquence Atlas"],
  lifestyle: ["Zyquence Atlas", "Calendar"],
  education: ["Data Intelligence", "AI Suggestions", "Gaming Engine"],
  trading: ["Trading Journal"],
};

export function useFocusAreas() {
  const { user } = useAuth();
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchAreas = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("user_focus_areas")
      .select("focus_areas")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (data?.focus_areas) setFocusAreas(data.focus_areas);
    else setFocusAreas([]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  // Listen for cross-component updates
  useEffect(() => {
    const handler = () => { fetchAreas(); };
    window.addEventListener("focus-areas-updated", handler);
    return () => window.removeEventListener("focus-areas-updated", handler);
  }, [fetchAreas]);

  const saveFocusAreas = useCallback(async (areas: string[]) => {
    if (!user) return;
    setSaving(true);
    setFocusAreas(areas);

    const { data: existing } = await supabase
      .from("user_focus_areas")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("user_focus_areas")
        .update({ focus_areas: areas, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("user_focus_areas")
        .insert({ user_id: user.id, focus_areas: areas });
    }
    setSaving(false);
    window.dispatchEvent(new Event("focus-areas-updated"));
  }, [user]);

  const toggleFocusArea = useCallback((areaId: string) => {
    const next = focusAreas.includes(areaId)
      ? focusAreas.filter((a) => a !== areaId)
      : [...focusAreas, areaId];
    saveFocusAreas(next);
  }, [focusAreas, saveFocusAreas]);

  // Get visible tool titles based on selected focus areas
  const getVisibleTools = useCallback((): Set<string> | null => {
    if (focusAreas.length === 0) return null; // show all if none selected
    const visible = new Set<string>();
    focusAreas.forEach((area) => {
      const tools = FOCUS_AREA_TOOL_MAP[area as FocusAreaId];
      if (tools) tools.forEach((t) => visible.add(t));
    });
    return visible;
  }, [focusAreas]);

  return { focusAreas, loading, saving, toggleFocusArea, saveFocusAreas, getVisibleTools };
}
