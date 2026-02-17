import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Fingerprint, Users, Eye, MessageCircle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface IdentityAnalyzerProps {
  profile: any;
}

const IdentityAnalyzer = ({ profile }: IdentityAnalyzerProps) => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState<any>(null);

  useEffect(() => {
    loadExisting();
  }, [profile?.id]);

  const loadExisting = async () => {
    if (!profile?.id) return;
    const { data } = await supabase.from("identity_results").select("*").eq("profile_id", profile.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (data) { setExisting(data); setResult(data); }
  };

  const analyze = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("artist-intelligence", {
        body: { module: "identity", profile },
      });
      if (error) throw error;
      setResult(data);
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const payload = {
        user_id: user.id,
        profile_id: profile.id,
        archetype: result.archetype,
        brand_personality: result.brand_personality,
        audience_profile: result.audience_profile,
        stage_name_suggestions: result.stage_name_suggestions,
        visual_aesthetic: result.visual_aesthetic,
        messaging_tone: result.messaging_tone,
        full_analysis: result,
      };
      if (existing?.id) {
        await supabase.from("identity_results").update(payload).eq("id", existing.id);
      } else {
        await supabase.from("identity_results").insert(payload);
      }
      toast.success("Identity profile saved");
      loadExisting();
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!result && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Fingerprint className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-foreground">Identity Analyzer</h2>
          <p className="text-sm text-muted-foreground max-w-md">AI-powered analysis of your creative identity, brand personality, and audience profile</p>
        </div>
        <Button onClick={analyze} size="lg">
          <Sparkles className="h-4 w-4 mr-2" /> Generate Identity Analysis
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Analyzing your creative identity...</p>
      </div>
    );
  }

  const cards = [
    { title: "Artist Archetype", icon: Fingerprint, content: result.archetype, accent: true },
    { title: "Brand Personality", icon: Sparkles, content: result.brand_personality },
    { title: "Audience Profile", icon: Users, content: result.audience_profile },
    { title: "Visual Aesthetic", icon: Eye, content: result.visual_aesthetic },
    { title: "Messaging Tone", icon: MessageCircle, content: result.messaging_tone },
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Identity Analysis</h2>
          <p className="text-sm text-muted-foreground">Your AI-generated creative identity</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={analyze} disabled={loading}>Regenerate</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((c) => (
          <Card key={c.title} className={c.accent ? "md:col-span-2 border-primary/20" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <c.icon className="h-4 w-4 text-primary" /> {c.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-foreground/80 ${c.accent ? "text-lg font-semibold" : "text-sm"}`}>{c.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {result.stage_name_suggestions?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Stage Name Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.stage_name_suggestions.map((name: string) => (
                <Badge key={name} variant="secondary" className="text-sm py-1 px-3">{name}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IdentityAnalyzer;
