import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Map, Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const StrategyDashboard = ({ profile }: { profile: any }) => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (profile?.id) loadExisting(); }, [profile?.id]);

  const loadExisting = async () => {
    const { data } = await supabase.from("strategy_plans").select("*").eq("profile_id", profile.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (data) setResult({
      content_strategy: data.content_strategy, release_roadmap: data.release_roadmap,
      brand_positioning: data.brand_positioning, growth_recommendations: data.growth_recommendations,
      next_steps: data.next_steps, priority_actions: data.priority_actions,
      long_term_strategy: data.long_term_strategy,
    });
  };

  const analyze = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("artist-intelligence", { body: { module: "strategy", profile } });
      if (error) throw error;
      setResult(data);
    } catch (e: any) { toast.error(e.message || "Failed"); } finally { setLoading(false); }
  };

  const save = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      await supabase.from("strategy_plans").insert({
        user_id: user.id, profile_id: profile.id,
        content_strategy: result.content_strategy, release_roadmap: result.release_roadmap,
        brand_positioning: result.brand_positioning, growth_recommendations: result.growth_recommendations,
        audience_conversion: [], next_steps: result.next_steps,
        priority_actions: result.priority_actions, long_term_strategy: result.long_term_strategy,
      });
      toast.success("Strategy saved");
    } catch (e: any) { toast.error(e.message || "Save failed"); } finally { setSaving(false); }
  };

  if (!result && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Map className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-foreground">Strategy Dashboard</h2>
          <p className="text-sm text-muted-foreground max-w-md">AI-generated career strategy with actionable steps and long-term vision</p>
        </div>
        <Button onClick={analyze} size="lg"><Sparkles className="h-4 w-4 mr-2" /> Generate Strategy</Button>
      </div>
    );
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Building your strategy...</p>
    </div>
  );

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Strategy Dashboard</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={analyze}>Regenerate</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Save
          </Button>
        </div>
      </div>

      {/* Priority Actions */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Priority Actions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {result.priority_actions?.map((a: any, i: number) => (
            <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50">
              <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div><p className="text-sm font-medium text-foreground">{a.action}</p><p className="text-xs text-muted-foreground">{a.impact}</p></div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Next Steps</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {result.next_steps?.map((s: any, i: number) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50">
              <span className="text-sm text-foreground">{s.step}</span>
              <Badge variant={s.priority === "high" ? "default" : s.priority === "medium" ? "secondary" : "outline"}>{s.priority}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Content Strategy */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Content Strategy</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {result.content_strategy?.map((c: any, i: number) => (
              <div key={i} className="border-l-2 border-primary/30 pl-3">
                <p className="text-sm font-medium text-foreground">{c.action}</p>
                <p className="text-xs text-muted-foreground">{c.details}</p>
                <Badge variant="outline" className="mt-1 text-[10px]">{c.timeline}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Release Roadmap */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Release Roadmap</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {result.release_roadmap?.map((r: any, i: number) => (
              <div key={i} className="border-l-2 border-primary/30 pl-3">
                <p className="text-sm font-medium text-foreground">{r.milestone}</p>
                <p className="text-xs text-muted-foreground">{r.description}</p>
                <Badge variant="outline" className="mt-1 text-[10px]">{r.timeline}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Brand Positioning */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Brand Positioning</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-foreground/80">{result.brand_positioning}</p></CardContent>
      </Card>

      {/* Growth */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Growth Recommendations</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {result.growth_recommendations?.map((g: any, i: number) => (
            <div key={i} className="border-l-2 border-primary/30 pl-3">
              <p className="text-sm font-medium text-foreground">{g.area}</p>
              <p className="text-xs text-muted-foreground">{g.suggestion}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Long Term */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Long Term Strategy</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-foreground/80">{result.long_term_strategy}</p></CardContent>
      </Card>
    </div>
  );
};

export default StrategyDashboard;
