import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface CommunityProfile {
  id: string;
  user_id: string;
  avatar_url: string | null;
  display_name: string;
  bio: string;
  interests: string[];
  skills: string[];
  goals: string;
  location: string;
  social_links: Record<string, string>;
  currently_working_on: string;
  is_online: boolean;
  last_seen_at: string;
}

export const useCommunityProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("community_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setProfile(data as CommunityProfile | null);
    setLoading(false);
  };

  const ensureProfile = async () => {
    if (!user) return null;
    const { data: existing } = await supabase
      .from("community_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (existing) return existing as CommunityProfile;

    const { data: prof } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
    const displayName = prof ? `${prof.first_name || ""} ${prof.last_name || ""}`.trim() : user.email?.split("@")[0] || "User";

    const { data: created } = await supabase
      .from("community_profiles")
      .insert({ user_id: user.id, display_name: displayName })
      .select()
      .single();
    setProfile(created as CommunityProfile);
    return created as CommunityProfile;
  };

  const updateProfile = async (updates: Partial<CommunityProfile>) => {
    if (!user) return;
    const { data } = await supabase
      .from("community_profiles")
      .update(updates)
      .eq("user_id", user.id)
      .select()
      .single();
    if (data) setProfile(data as CommunityProfile);
  };

  useEffect(() => { fetchProfile(); }, [user]);

  return { profile, loading, ensureProfile, updateProfile, refetch: fetchProfile };
};
