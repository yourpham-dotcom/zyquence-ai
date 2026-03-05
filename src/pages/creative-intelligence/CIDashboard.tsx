import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, GitBranch, Brain, Radar, Clock, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useCreativeIdeas } from "@/hooks/useCreativeIdeas";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const statusColor = (s: string) => {
  if (s === "analyzed" || s === "strategy ready") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (s === "analyzing" || s === "generating strategy") return "bg-violet-500/15 text-violet-400 border-violet-500/30";
  return "bg-muted text-muted-foreground";
};

const CIDashboard = () => {
  const { ideas, isLoading } = useCreativeIdeas();
  const navigate = useNavigate();

  const activeIdeas = ideas.length;
  const analyzed = ideas.filter(i => i.ai_analysis).length;
  const strategies = ideas.filter(i => i.ai_strategy).length;
  const drafts = ideas.filter(i => i.status === "draft").length;

  const summaryCards = [
    { icon: Lightbulb, label: "Total Ideas", value: String(activeIdeas), change: `${drafts} drafts`, color: "text-amber-400" },
    { icon: Brain, label: "Analyzed", value: String(analyzed), change: `${analyzed} completed`, color: "text-violet-400" },
    { icon: GitBranch, label: "Strategies", value: String(strategies), change: `${strategies} generated`, color: "text-emerald-400" },
    { icon: Radar, label: "Drafts", value: String(drafts), change: "awaiting analysis", color: "text-rose-400" },
  ];

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
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Creative Intelligence Engine</h1>
        <p className="text-muted-foreground mt-1 text-sm">Turn ideas into strategies, workflows, and operational insights.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((c) => (
          <Card key={c.label} className="bg-card/60 backdrop-blur border-border/50 hover:border-border transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <c.icon className={`h-5 w-5 ${c.color}`} />
                <span className="text-2xl font-bold text-foreground">{c.value}</span>
              </div>
              <p className="text-sm font-medium text-foreground">{c.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{c.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Ideas</h2>
        {ideas.length === 0 ? (
          <Card className="bg-card/60 backdrop-blur border-border/50">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground text-sm">No ideas yet. Start by capturing one!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ideas.slice(0, 6).map((idea) => (
              <Card
                key={idea.id}
                className="bg-card/60 backdrop-blur border-border/50 hover:border-border/80 transition-all cursor-pointer group"
                onClick={() => idea.ai_analysis ? navigate("/creative-intelligence/analysis") : navigate("/creative-intelligence/capture")}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{idea.title}</h3>
                    <Badge variant="outline" className={statusColor(idea.status)}>{idea.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>AI Score</span>
                        <span className="font-mono font-semibold text-foreground">{idea.idea_score ?? "–"}</span>
                      </div>
                      <Progress value={idea.idea_score ?? 0} className="h-1.5" />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(idea.updated_at), { addSuffix: true })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CIDashboard;
