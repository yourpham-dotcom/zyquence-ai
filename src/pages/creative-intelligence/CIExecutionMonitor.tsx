import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, Clock, Users, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";

const metrics = [
  { icon: CheckCircle2, label: "Workflow Completion", value: "73%", num: 73, color: "text-emerald-400" },
  { icon: Users, label: "Team Productivity", value: "89%", num: 89, color: "text-blue-400" },
  { icon: Clock, label: "Automation Hours Saved", value: "142h", num: 71, color: "text-violet-400" },
  { icon: AlertTriangle, label: "Delays Detected", value: "3", num: 15, color: "text-amber-400" },
];

const tasks = [
  { name: "Content Brief Generation", progress: 100, status: "Complete" },
  { name: "Design Review Pipeline", progress: 68, status: "In Progress" },
  { name: "A/B Testing Setup", progress: 35, status: "In Progress" },
  { name: "Distribution Automation", progress: 0, status: "Queued" },
];

const CIExecutionMonitor = () => (
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
      <div className="space-y-3">
        {tasks.map((t) => (
          <Card key={t.name} className="bg-card/60 backdrop-blur border-border/50">
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
    </div>
  </div>
);

export default CIExecutionMonitor;
