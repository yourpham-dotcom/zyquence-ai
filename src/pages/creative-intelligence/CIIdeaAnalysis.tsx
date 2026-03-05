import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Shield, Target, BarChart3, Zap, Loader2, Trash2 } from "lucide-react";
import { useCreativeIdeas, CIIdea } from "@/hooks/useCreativeIdeas";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const metricConfig = [
  { key: "idea_score", icon: Target, label: "Idea Score", color: "text-emerald-400" },
  { key: "market_potential", icon: TrendingUp, label: "Market Potential", color: "text-blue-400" },
  { key: "execution_complexity", icon: BarChart3, label: "Execution Complexity", color: "text-amber-400" },
  { key: "risk_level", icon: Shield, label: "Risk Level", color: "text-rose-400" },
  { key: "trend_alignment", icon: Zap, label: "Trend Alignment", color: "text-violet-400" },
];

const CIIdeaAnalysis = () => {
  const { ideas, isLoading, generateStrategy, deleteIdea } = useCreativeIdeas();
  const navigate = useNavigate();
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const analyzedIdeas = ideas.filter((i) => i.ai_analysis);

  const handleGenerateStrategy = (idea: CIIdea) => {
    setGeneratingId(idea.id);
    generateStrategy.mutate(idea, {
      onSuccess: () => { setGeneratingId(null); navigate("/creative-intelligence/strategy"); },
      onSettled: () => setGeneratingId(null),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Idea Analysis</h1>
        <p className="text-muted-foreground mt-1 text-sm">AI-powered evaluation of your ideas.</p>
      </div>

      {analyzedIdeas.length === 0 ? (
        <Card className="bg-card/60 backdrop-blur border-border/50">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground text-sm">No analyzed ideas yet. Go to Idea Capture and analyze an idea.</p>
          </CardContent>
        </Card>
      ) : (
        analyzedIdeas.map((idea) => (
          <Card key={idea.id} className="bg-card/60 backdrop-blur border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{idea.title}</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Analyzed {formatDistanceToNow(new Date(idea.updated_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${(idea.idea_score || 0) >= 70 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : (idea.idea_score || 0) >= 40 ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-rose-500/15 text-rose-400 border-rose-500/30"}`}>
                    {(idea.idea_score || 0) >= 70 ? "High Potential" : (idea.idea_score || 0) >= 40 ? "Moderate" : "Needs Work"}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteIdea.mutate(idea.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {metricConfig.map((m) => {
                  const value = (idea as any)[m.key] as number | null;
                  return (
                    <div key={m.key} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <m.icon className={`h-4 w-4 ${m.color}`} />
                          <span className="text-sm font-medium text-foreground">{m.label}</span>
                        </div>
                        <span className="text-sm font-mono font-semibold text-foreground">{value ?? "–"}/100</span>
                      </div>
                      <Progress value={value ?? 0} className="h-2" />
                    </div>
                  );
                })}
              </div>

              {idea.ai_analysis?.summary && (
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{idea.ai_analysis.summary}</p>
              )}

              {idea.ai_analysis?.strengths && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  {["strengths", "weaknesses", "recommendations"].map((section) => (
                    idea.ai_analysis?.[section] && (
                      <div key={section} className="space-y-1">
                        <p className="text-xs font-semibold text-foreground capitalize">{section}</p>
                        {(idea.ai_analysis[section] as string[]).map((item, i) => (
                          <p key={i} className="text-xs text-muted-foreground">• {item}</p>
                        ))}
                      </div>
                    )
                  ))}
                </div>
              )}

              <Button
                onClick={() => handleGenerateStrategy(idea)}
                disabled={generatingId === idea.id}
                className="gap-2"
              >
                {generatingId === idea.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                Generate Strategy
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default CIIdeaAnalysis;
