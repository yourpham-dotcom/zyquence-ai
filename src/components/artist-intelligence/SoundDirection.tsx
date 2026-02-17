import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Save, Music2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SoundDirectionProps { profile: any; }

const SoundDirection = ({ profile }: SoundDirectionProps) => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.id) loadExisting();
  }, [profile?.id]);

  const loadExisting = async () => {
    const { data } = await supabase.from("sound_recommendations").select("*, full_analysis").eq("profile_id", profile.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (data?.full_analysis) setResult(data.full_analysis);
  };

  const analyze = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("artist-intelligence", { body: { module: "sound", profile } });
      if (error) throw error;
      setResult(data);
    } catch (e: any) { toast.error(e.message || "Failed"); } finally { setLoading(false); }
  };

  const save = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      await supabase.from("sound_recommendations").insert({
        user_id: user.id, profile_id: profile.id,
        genre_scores: result.genre_scores, bpm_range: result.bpm_range,
        beat_styles: result.beat_styles, vocal_guidance: result.vocal_guidance,
        flow_ideas: result.flow_ideas, comparable_artists: result.comparable_artists,
        music_lane_summary: result.music_lane_summary, full_analysis: result,
      });
      toast.success("Sound direction saved");
    } catch (e: any) { toast.error(e.message || "Save failed"); } finally { setSaving(false); }
  };

  if (!result && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Music2 className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-foreground">Sound & Style Direction</h2>
          <p className="text-sm text-muted-foreground max-w-md">AI analyzes your profile to recommend genres, BPM, vocal styles, and comparable artists</p>
        </div>
        <Button onClick={analyze} size="lg"><Sparkles className="h-4 w-4 mr-2" /> Generate Sound Direction</Button>
      </div>
    );
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Analyzing your sound profile...</p>
    </div>
  );

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Sound & Style Direction</h2>
          <p className="text-sm text-muted-foreground">Your personalized music lane</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={analyze}>Regenerate</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Save
          </Button>
        </div>
      </div>

      {/* Genre Scores */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Genre Compatibility</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {result.genre_scores && Object.entries(result.genre_scores).sort(([, a], [, b]) => (b as number) - (a as number)).map(([genre, score]) => (
            <div key={genre} className="space-y-1">
              <div className="flex justify-between text-sm"><span className="text-foreground/80">{genre}</span><span className="text-muted-foreground">{score as number}%</span></div>
              <Progress value={score as number} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BPM */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">BPM Range</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{result.bpm_range?.sweet_spot}</span>
              <span className="text-sm text-muted-foreground">sweet spot</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Range: {result.bpm_range?.min} — {result.bpm_range?.max} BPM</p>
          </CardContent>
        </Card>

        {/* Beat Styles */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Beat Styles</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.beat_styles?.map((s: string) => <Badge key={s} variant="secondary">{s}</Badge>)}
            </div>
          </CardContent>
        </Card>

        {/* Vocal Guidance */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Vocal Delivery</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-foreground/80">{result.vocal_guidance}</p></CardContent>
        </Card>

        {/* Comparable Artists */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Comparable Artists</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.comparable_artists?.map((a: string) => <Badge key={a} variant="outline">{a}</Badge>)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flow Ideas */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Flow & Cadence Ideas</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {result.flow_ideas?.map((f: string) => <Badge key={f} variant="secondary">{f}</Badge>)}
          </div>
        </CardContent>
      </Card>

      {/* Music Lane Summary */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Music Lane Summary</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-foreground/80">{result.music_lane_summary}</p></CardContent>
      </Card>
    </div>
  );
};

export default SoundDirection;
