import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Save, Gauge, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CATEGORIES = [
  { key: "brand_clarity", label: "Brand Clarity" },
  { key: "voice_potential", label: "Voice Potential" },
  { key: "consistency", label: "Consistency" },
  { key: "market_positioning", label: "Market Positioning" },
  { key: "story_authenticity", label: "Story Authenticity" },
];

const ReadinessScore = ({ profile }: { profile: any }) => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.id) loadExisting();
  }, [profile?.id]);

  const loadExisting = async () => {
    const { data } = await supabase.from("readiness_scores").select("*").eq("profile_id", profile.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (data) setResult(data);
  };

  const analyze = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("artist-intelligence", { body: { module: "readiness", profile } });
      if (error) throw error;
      setResult(data);
    } catch (e: any) { toast.error(e.message || "Failed"); } finally { setLoading(false); }
  };

  const save = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      await supabase.from("readiness_scores").insert({
        user_id: user.id, profile_id: profile.id,
        overall_score: result.overall_score, brand_clarity: result.brand_clarity,
        voice_potential: result.voice_potential, consistency: result.consistency,
        market_positioning: result.market_positioning, story_authenticity: result.story_authenticity,
        ai_explanation: result.explanation, recommendations: result.recommendations,
      });
      toast.success("Readiness score saved");
    } catch (e: any) { toast.error(e.message || "Save failed"); } finally { setSaving(false); }
  };

  if (!result && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Gauge className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-foreground">Artist Readiness Score</h2>
          <p className="text-sm text-muted-foreground max-w-md">Comprehensive evaluation of your readiness across five key dimensions</p>
        </div>
        <Button onClick={analyze} size="lg"><Sparkles className="h-4 w-4 mr-2" /> Calculate Score</Button>
      </div>
    );
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Evaluating your readiness...</p>
    </div>
  );

  const score = result.overall_score || 0;
  const circumference = 2 * Math.PI * 60;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Readiness Score</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={analyze}>Recalculate</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Save
          </Button>
        </div>
      </div>

      {/* Circular Score */}
      <Card className="border-primary/20">
        <CardContent className="flex flex-col items-center py-8">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="60" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
              <circle cx="70" cy="70" r="60" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
                strokeDasharray={circumference} strokeDashoffset={dashOffset}
                strokeLinecap="round" className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-foreground">{score}</span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center max-w-sm">{result.explanation}</p>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Category Breakdown</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {CATEGORIES.map(c => {
            const val = result[c.key] || 0;
            return (
              <div key={c.key} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/80">{c.label}</span>
                  <span className="text-muted-foreground">{val}/100</span>
                </div>
                <Progress value={val} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {result.recommendations?.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Improvement Recommendations</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {result.recommendations.map((r: any, i: number) => (
              <div key={i} className="border-l-2 border-primary/30 pl-3">
                <p className="text-sm font-medium text-foreground">{r.category}</p>
                <p className="text-sm text-muted-foreground">{r.suggestion}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReadinessScore;
