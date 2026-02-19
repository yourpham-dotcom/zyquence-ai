import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AcademicSetup from "@/components/student-hub/AcademicSetup";
import AcademicRoadmap from "@/components/student-hub/AcademicRoadmap";

export default function AcademicBlueprint() {
  const { user } = useAuth();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkProfile = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("academic_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    setProfileId(data?.id || null);
    setLoading(false);
  }, [user]);

  useEffect(() => { checkProfile(); }, [checkProfile]);

  if (loading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  if (!profileId) return <AcademicSetup onComplete={checkProfile} />;
  return <AcademicRoadmap profileId={profileId} onReset={() => setProfileId(null)} />;
}
