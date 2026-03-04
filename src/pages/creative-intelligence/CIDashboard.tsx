import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, GitBranch, Brain, Radar, TrendingUp, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const summaryCards = [
  { icon: Lightbulb, label: "Active Ideas", value: "12", change: "+3 this week", color: "text-amber-400" },
  { icon: GitBranch, label: "Active Workflows", value: "5", change: "2 in progress", color: "text-emerald-400" },
  { icon: Brain, label: "AI Recommendations", value: "8", change: "3 new today", color: "text-violet-400" },
  { icon: Radar, label: "Opportunity Alerts", value: "4", change: "1 high priority", color: "text-rose-400" },
];

const recentIdeas = [
  { title: "AI-Powered Content Pipeline", score: 87, status: "Analyzing", updated: "2h ago" },
  { title: "Automated Onboarding Flow", score: 72, status: "Draft", updated: "5h ago" },
  { title: "Social Commerce Integration", score: 93, status: "Ready", updated: "1d ago" },
  { title: "Voice-First Customer Support", score: 65, status: "Needs Review", updated: "2d ago" },
];

const aiInsights = [
  { title: "Workflow Bottleneck Detected", desc: "Production stage averaging 3x longer than expected. Consider parallelizing tasks.", type: "Warning" },
  { title: "High-Potential Opportunity", desc: "AI content tools market growing 340% YoY. Your pipeline idea aligns with this trend.", type: "Opportunity" },
  { title: "Strategy Optimization", desc: "Combining ideas #3 and #7 could increase projected ROI by 45%.", type: "Suggestion" },
];

const statusColor = (s: string) => {
  if (s === "Ready") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (s === "Analyzing") return "bg-violet-500/15 text-violet-400 border-violet-500/30";
  if (s === "Needs Review") return "bg-rose-500/15 text-rose-400 border-rose-500/30";
  return "bg-muted text-muted-foreground";
};

const CIDashboard = () => (
  <div className="space-y-8 animate-fade-in">
    <div>
      <h1 className="text-3xl font-bold text-foreground tracking-tight">Creative Intelligence Engine</h1>
      <p className="text-muted-foreground mt-1 text-sm">Turn ideas into strategies, workflows, and operational insights.</p>
    </div>

    {/* Summary Cards */}
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

    {/* Recent Ideas */}
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">Recent Ideas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recentIdeas.map((idea) => (
          <Card key={idea.title} className="bg-card/60 backdrop-blur border-border/50 hover:border-border/80 transition-all cursor-pointer group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{idea.title}</h3>
                <Badge variant="outline" className={statusColor(idea.status)}>{idea.status}</Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>AI Score</span>
                    <span className="font-mono font-semibold text-foreground">{idea.score}</span>
                  </div>
                  <Progress value={idea.score} className="h-1.5" />
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {idea.updated}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>

    {/* AI Insights */}
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">AI Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {aiInsights.map((ins) => (
          <Card key={ins.title} className="bg-card/60 backdrop-blur border-border/50">
            <CardContent className="p-5">
              <Badge variant="outline" className="mb-3 text-xs">{ins.type}</Badge>
              <h3 className="text-sm font-semibold text-foreground mb-2">{ins.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{ins.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

export default CIDashboard;
