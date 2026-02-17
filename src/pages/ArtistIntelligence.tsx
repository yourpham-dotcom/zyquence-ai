import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import ProGate from "@/components/ProGate";
import AISidebar, { type AIModule } from "@/components/artist-intelligence/AISidebar";
import Overview from "@/components/artist-intelligence/Overview";
import CreatorProfile from "@/components/artist-intelligence/CreatorProfile";
import IdentityAnalyzer from "@/components/artist-intelligence/IdentityAnalyzer";
import SoundDirection from "@/components/artist-intelligence/SoundDirection";
import ArtistTranslator from "@/components/artist-intelligence/ArtistTranslator";
import ReadinessScore from "@/components/artist-intelligence/ReadinessScore";
import StrategyDashboard from "@/components/artist-intelligence/StrategyDashboard";
import FeedbackCoach from "@/components/artist-intelligence/FeedbackCoach";

const ArtistIntelligence = () => {
  const navigate = useNavigate();
  const { isPro, loading: subLoading } = useSubscription();
  const [activeModule, setActiveModule] = useState<AIModule>("overview");
  const [profile, setProfile] = useState<any>(null);
  const [identity, setIdentity] = useState<any>(null);
  const [readiness, setReadiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }

      const { data: profileData } = await supabase
        .from("artist_profiles").select("*")
        .eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (profileData) setProfile(profileData);

      if (profileData?.id) {
        const [identityRes, readinessRes] = await Promise.all([
          supabase.from("identity_results").select("*").eq("profile_id", profileData.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
          supabase.from("readiness_scores").select("*").eq("profile_id", profileData.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        ]);
        if (identityRes.data) setIdentity(identityRes.data);
        if (readinessRes.data) setReadiness(readinessRes.data);
      }
    } finally { setLoading(false); }
  };

  const handleProfileComplete = (profileId: string) => {
    loadData();
    setActiveModule("overview");
  };

  if (subLoading || loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>;
  }

  if (!isPro) return <ProGate />;

  const renderModule = () => {
    switch (activeModule) {
      case "overview": return <Overview profile={profile} identity={identity} readiness={readiness} onNavigate={setActiveModule} />;
      case "profile": return <CreatorProfile onComplete={handleProfileComplete} existingProfile={profile} />;
      case "identity": return <IdentityAnalyzer profile={profile} />;
      case "sound": return <SoundDirection profile={profile} />;
      case "translator": return <ArtistTranslator profile={profile} />;
      case "readiness": return <ReadinessScore profile={profile} />;
      case "strategy": return <StrategyDashboard profile={profile} />;
      case "feedback": return <FeedbackCoach profile={profile} />;
      default: return null;
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-12 border-b border-border flex items-center px-4 gap-3 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-bold text-foreground">Artist Intelligence Engine</span>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <AISidebar active={activeModule} onNavigate={setActiveModule} hasProfile={!!profile} />
        </div>

        {/* Mobile nav */}
        <div className="md:hidden border-b border-border overflow-x-auto flex shrink-0 absolute top-12 left-0 right-0 bg-background z-10">
          {(["overview", "profile", "identity", "sound", "translator", "readiness", "strategy", "feedback"] as AIModule[]).map(m => (
            <button key={m} onClick={() => setActiveModule(m)}
              className={`px-3 py-2 text-xs whitespace-nowrap ${activeModule === m ? "text-foreground border-b-2 border-primary" : "text-muted-foreground"}`}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        {/* Main */}
        <main className="flex-1 overflow-hidden md:mt-0 mt-10">
          {renderModule()}
        </main>
      </div>
    </div>
  );
};

export default ArtistIntelligence;
