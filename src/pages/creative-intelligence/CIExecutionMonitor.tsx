import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, Clock, Users, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useCreativeIdeas } from "@/hooks/useCreativeIdeas";

const CIExecutionMonitor = () => {
  const { ideas, isLoading } = useCreativeIdeas();

  const total = ideas.length || 1;
  const analyzed = ideas.filter(i => i.ai_analysis).length;
  const strategized = ideas.filter(i => i.ai_strategy).length;
  const drafts = ideas.filter(i => i.status === "draft").length;

  const completionRate = Math.round((strategized / total) * 100);
  const analysisRate = Math.round((analyzed / total) * 100);
  const automationHours = strategized * 12 + analyzed * 4;

  const metrics = [
    { icon: CheckCircle2, label: "Workflow Completion", value: `${completionRate}%`, num: completionRate, color: "text-emerald-400" },
    { icon: Users, label: "Ideas Analyzed", value: `${analysisRate}%`, num: analysisRate, color: "text-blue-400" },
    { icon: Clock, label: "Est. Hours Saved", value: `${automationHours}h`, num: Math.min(automationHours, 100), color: "text-violet-400" },
    { icon: AlertTriangle, label: "Drafts Pending", value: String(drafts), num: Math.min(drafts * 20, 100), color: "text-amber-400" },
  ];

  const tasks = ideas.map(idea => ({
    name: idea.title,
    progress: idea.ai_strategy ? 100 : idea.ai_analysis ? 60 : idea.status === "analyzing" ? 30 : 0,
    status: idea.ai_strategy ? "Strategy Ready" : idea.ai_analysis ? "Analyzed" : idea.status === "analyzing" ? "Analyzing..." : "Draft",
  }));

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
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Execution Monitor</h1>
        <p className="text-muted-foreground mt-1 text-sm">Live operational dashboard for all active workflows.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.label} className="bg-card/60 backdrop-blur border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <m.icon className={`h-5 w-5 ${m.color}`} />
                <span className="text-2xl font-bold text-foreground">{m.value}</span>
              </div>
              <p className="text-sm font-medium text-foreground mb-2">{m.label}</p>
              <Progress value={m.num} className="h-1.5" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Active Tasks</h2>
        {tasks.length === 0 ? (
          <Card className="bg-card/60 backdrop-blur border-border/50">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground text-sm">No ideas to track yet. Capture and analyze some ideas first.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tasks.map((t, i) => (
              <Card key={i} className="bg-card/60 backdrop-blur border-border/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.status}</p>
                  </div>
                  <div className="w-32 shrink-0">
                    <Progress value={t.progress} className="h-1.5" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-10 text-right">{t.progress}%</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CIExecutionMonitor;
