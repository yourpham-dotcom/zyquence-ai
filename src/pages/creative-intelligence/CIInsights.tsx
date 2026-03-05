import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, AlertTriangle, TrendingUp, Zap, Target, Loader2, RefreshCw } from "lucide-react";
import { useCreativeIdeas } from "@/hooks/useCreativeIdeas";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Insight {
  title: string;
  description: string;
  type: string;
  priority: string;
}

const iconMap: Record<string, any> = {
  Bottleneck: AlertTriangle,
  Trend: TrendingUp,
  Optimization: Zap,
  Prediction: Target,
  Strategy: Brain,
  Suggestion: TrendingUp,
};

const colorMap: Record<string, string> = {
  Bottleneck: "text-amber-400",
  Trend: "text-emerald-400",
  Optimization: "text-violet-400",
  Prediction: "text-blue-400",
  Strategy: "text-rose-400",
  Suggestion: "text-teal-400",
};

const CIInsights = () => {
  const { ideas } = useCreativeIdeas();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const ideasContext = ideas.map(i => ({
        title: i.title,
        status: i.status,
        idea_score: i.idea_score,
        market_potential: i.market_potential,
      }));

      const { data, error } = await supabase.functions.invoke("creative-intelligence", {
        body: { action: "insights", idea: ideasContext },
      });
      if (error) throw error;
      setInsights(data.result?.insights || []);
      setGenerated(true);
      toast({ title: "Insights generated!" });
    } catch (e: any) {
      toast({ title: "Failed to generate insights", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Insights & Intelligence</h1>
          <p className="text-muted-foreground mt-1 text-sm">AI-generated insights to optimize your strategies and workflows.</p>
        </div>
        <Button onClick={generateInsights} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {generated ? "Refresh" : "Generate"} Insights
        </Button>
      </div>

      {!generated && !loading && (
        <Card className="bg-card/60 backdrop-blur border-border/50">
          <CardContent className="p-8 text-center">
            <Brain className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Click "Generate Insights" to get AI-powered analysis based on your ideas.</p>
          </CardContent>
        </Card>
      )}

      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((ins, i) => {
            const Icon = iconMap[ins.type] || Brain;
            const color = colorMap[ins.type] || "text-muted-foreground";
            return (
              <Card key={i} className="bg-card/60 backdrop-blur border-border/50 hover:border-border/80 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`h-4 w-4 ${color}`} />
                    <Badge variant="outline" className="text-xs">{ins.type}</Badge>
                    {ins.priority && (
                      <Badge variant="outline" className={`text-xs ml-auto ${ins.priority === "high" ? "text-rose-400 border-rose-500/30" : ins.priority === "medium" ? "text-amber-400 border-amber-500/30" : "text-muted-foreground"}`}>
                        {ins.priority}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">{ins.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ins.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CIInsights;
