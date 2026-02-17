import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Loader2, MessageSquare, Sparkles, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SCORE_LABELS = [
  { key: "flow_score", label: "Flow" },
  { key: "authenticity_score", label: "Authenticity" },
  { key: "energy_score", label: "Energy" },
  { key: "commercial_appeal_score", label: "Commercial Appeal" },
];

const FeedbackCoach = ({ profile }: { profile: any }) => {
  const [lyrics, setLyrics] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const analyze = async () => {
    if (!lyrics.trim()) { toast.error("Paste some lyrics first"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("artist-intelligence", {
        body: { module: "feedback", profile, input: lyrics },
      });
      if (error) throw error;
      setResult(data);
    } catch (e: any) { toast.error(e.message || "Failed"); } finally { setLoading(false); }
  };

  const save = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      await supabase.from("feedback_sessions").insert({
        user_id: user.id, profile_id: profile?.id || null,
        lyrics_input: lyrics, feedback_type: "lyrics",
        flow_score: result.flow_score, authenticity_score: result.authenticity_score,
        energy_score: result.energy_score, commercial_appeal_score: result.commercial_appeal_score,
        improvement_suggestions: result.improvement_suggestions, full_feedback: result,
      });
      toast.success("Feedback session saved");
    } catch (e: any) { toast.error(e.message || "Save failed"); } finally { setSaving(false); }
  };

  if (!result && !loading) {
    return (
      <div className="p-6 space-y-6 max-w-2xl mx-auto overflow-y-auto max-h-full">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">AI Feedback Coach</h2>
          <p className="text-sm text-muted-foreground">Get professional-grade feedback on your lyrics</p>
        </div>
        <div className="space-y-4">
          <Textarea value={lyrics} onChange={e => setLyrics(e.target.value)} placeholder="Paste your lyrics here..." rows={12} className="font-mono text-sm" />
          <Button onClick={analyze} className="w-full" size="lg" disabled={!lyrics.trim()}>
            <Sparkles className="h-4 w-4 mr-2" /> Analyze Lyrics
          </Button>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Analyzing your lyrics...</p>
    </div>
  );

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Feedback Results</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setResult(null)}>New Analysis</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Save
          </Button>
        </div>
      </div>

      {/* Scores */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Performance Scores</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {SCORE_LABELS.map(s => {
            const val = result[s.key] || 0;
            return (
              <div key={s.key} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/80">{s.label}</span>
                  <span className="font-medium text-foreground">{val}/100</span>
                </div>
                <Progress value={val} className="h-2.5" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Overall */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Overall Feedback</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-foreground/80">{result.overall_feedback}</p></CardContent>
      </Card>

      {/* Strengths */}
      {result.strengths?.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Strengths</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {result.strengths.map((s: string, i: number) => (
                <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                  <span className="text-primary mt-1">✦</span>{s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {result.improvement_suggestions?.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Improvement Suggestions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {result.improvement_suggestions.map((s: any, i: number) => (
              <div key={i} className="border-l-2 border-primary/30 pl-3">
                <p className="text-sm font-medium text-foreground">{s.area}</p>
                <p className="text-sm text-muted-foreground">{s.suggestion}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FeedbackCoach;
