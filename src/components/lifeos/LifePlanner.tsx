import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import {
  Loader2, Sparkles, CheckCircle2, Circle, Clock, AlertTriangle,
  Heart, Zap, Target, Send, ChevronDown, ChevronUp,
} from "lucide-react";

interface PlanTask {
  title: string;
  suggested_time?: string;
  priority: string;
  notes?: string;
  estimated_minutes?: number;
  completed?: boolean;
}

interface PlanPhase {
  name: string;
  description?: string;
  tasks: PlanTask[];
}

interface PlanAnalysis {
  workload_assessment: string;
  stress_level: string;
  feasibility: string;
  encouragement: string;
}

interface LifePlan {
  analysis: PlanAnalysis;
  plan: {
    title: string;
    summary: string;
    timeline?: string;
    phases: PlanPhase[];
    risk_considerations?: string[];
    recovery_suggestions?: string[];
  };
}

const STRESS_COLORS: Record<string, string> = {
  low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  moderate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  very_high: "bg-red-500/20 text-red-400 border-red-500/30",
};

const FEASIBILITY_COLORS: Record<string, string> = {
  highly_feasible: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  feasible: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  challenging: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  needs_adjustment: "bg-red-500/20 text-red-400 border-red-500/30",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const LifePlanner = () => {
  const [goal, setGoal] = useState("");
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<LifePlan | null>(null);
  const [adjustMsg, setAdjustMsg] = useState("");
  const [adjusting, setAdjusting] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set());

  const generatePlan = async () => {
    if (!goal.trim()) return;
    setGenerating(true);
    setPlan(null);

    try {
      const { data, error } = await supabase.functions.invoke("life-planner", {
        body: { goal: goal.trim(), mode: "generate" },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setPlan(data);
      // Expand all phases by default
      setExpandedPhases(new Set(data.plan.phases.map((_: any, i: number) => i)));
      toast({ title: "Life plan generated" });
    } catch (e: any) {
      toast({ title: "Error generating plan", description: e.message, variant: "destructive" });
    }
    setGenerating(false);
  };

  const adjustPlan = async () => {
    if (!adjustMsg.trim() || !plan) return;
    setAdjusting(true);

    try {
      const { data, error } = await supabase.functions.invoke("life-planner", {
        body: { mode: "adjust", adjustment: adjustMsg.trim(), existingPlan: plan },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setPlan(data);
      setExpandedPhases(new Set(data.plan.phases.map((_: any, i: number) => i)));
      setAdjustMsg("");
      toast({ title: "Plan updated" });
    } catch (e: any) {
      toast({ title: "Error adjusting plan", description: e.message, variant: "destructive" });
    }
    setAdjusting(false);
  };

  const toggleTask = (phaseIdx: number, taskIdx: number) => {
    if (!plan) return;
    const updated = { ...plan };
    updated.plan.phases = updated.plan.phases.map((p, pi) => ({
      ...p,
      tasks: p.tasks.map((t, ti) =>
        pi === phaseIdx && ti === taskIdx ? { ...t, completed: !t.completed } : t
      ),
    }));
    setPlan(updated);
  };

  const togglePhase = (idx: number) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const totalTasks = plan?.plan.phases.reduce((a, p) => a + p.tasks.length, 0) || 0;
  const completedTasks = plan?.plan.phases.reduce((a, p) => a + p.tasks.filter(t => t.completed).length, 0) || 0;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Input view when no plan exists
  if (!plan) {
    return (
      <div className="space-y-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Life Planner AI
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Describe what you want to do or achieve and get a personalized action plan.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="Describe what you want to do or achieve..."
              rows={4}
              className="text-sm resize-none"
            />
            <div className="flex flex-wrap gap-2">
              {[
                "I want to go to the club but I've been working 7 days a week",
                "I want to start working out again",
                "I want to improve my sleep schedule",
                "I want to travel next month",
              ].map(ex => (
                <button
                  key={ex}
                  onClick={() => setGoal(ex)}
                  className="text-xs px-2.5 py-1.5 rounded-full bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
            <Button onClick={generatePlan} disabled={generating || !goal.trim()} className="w-full gap-2">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generating ? "Analyzing & Planning..." : "Create Life Plan"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Plan display
  return (
    <div className="space-y-4">
      {/* Analysis Card */}
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-foreground">{plan.plan.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{plan.plan.summary}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setPlan(null)} className="shrink-0 text-xs">
              New Plan
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className={STRESS_COLORS[plan.analysis.stress_level] || STRESS_COLORS.moderate}>
              <Zap className="h-3 w-3 mr-1" /> Stress: {plan.analysis.stress_level.replace("_", " ")}
            </Badge>
            <Badge className={FEASIBILITY_COLORS[plan.analysis.feasibility] || FEASIBILITY_COLORS.feasible}>
              <Target className="h-3 w-3 mr-1" /> {plan.analysis.feasibility.replace(/_/g, " ")}
            </Badge>
            {plan.plan.timeline && (
              <Badge variant="outline" className="text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" /> {plan.plan.timeline}
              </Badge>
            )}
          </div>

          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-start gap-2">
              <Heart className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{plan.analysis.encouragement}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{completedTasks}/{totalTasks} tasks ({progressPct}%)</span>
            </div>
            <Progress value={progressPct} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Phases */}
      <ScrollArea className="max-h-[50vh]">
        <div className="space-y-3 pr-2">
          {plan.plan.phases.map((phase, pi) => {
            const phaseCompleted = phase.tasks.filter(t => t.completed).length;
            const expanded = expandedPhases.has(pi);
            return (
              <Card key={pi} className="border-border/50">
                <button
                  className="w-full p-3 flex items-center justify-between text-left"
                  onClick={() => togglePhase(pi)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-semibold text-foreground">{phase.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {phaseCompleted}/{phase.tasks.length}
                    </span>
                  </div>
                  {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                </button>
                {expanded && (
                  <CardContent className="pt-0 pb-3 px-3 space-y-1.5">
                    {phase.description && (
                      <p className="text-xs text-muted-foreground mb-2">{phase.description}</p>
                    )}
                    {phase.tasks.map((task, ti) => (
                      <div
                        key={ti}
                        className={`flex items-start gap-2 p-2 rounded-lg transition-colors ${task.completed ? "bg-muted/30" : "bg-secondary/30"}`}
                      >
                        <button onClick={() => toggleTask(pi, ti)} className="mt-0.5 shrink-0">
                          {task.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {task.title}
                          </span>
                          {task.notes && <p className="text-xs text-muted-foreground mt-0.5">{task.notes}</p>}
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            <Badge className={`text-[10px] ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium}`}>
                              {task.priority}
                            </Badge>
                            {task.suggested_time && (
                              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                <Clock className="h-2.5 w-2.5 mr-0.5" /> {task.suggested_time}
                              </Badge>
                            )}
                            {task.estimated_minutes && (
                              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                {task.estimated_minutes}min
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Risk & Recovery */}
      {(plan.plan.risk_considerations?.length || plan.plan.recovery_suggestions?.length) ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {plan.plan.risk_considerations && plan.plan.risk_considerations.length > 0 && (
            <Card className="border-border/50">
              <CardContent className="p-3">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> Risk Considerations
                </h4>
                <ul className="space-y-1">
                  {plan.plan.risk_considerations.map((r, i) => (
                    <li key={i} className="text-xs text-muted-foreground">{r}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {plan.plan.recovery_suggestions && plan.plan.recovery_suggestions.length > 0 && (
            <Card className="border-border/50">
              <CardContent className="p-3">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
                  <Heart className="h-3.5 w-3.5 text-primary" /> Recovery Suggestions
                </h4>
                <ul className="space-y-1">
                  {plan.plan.recovery_suggestions.map((r, i) => (
                    <li key={i} className="text-xs text-muted-foreground">{r}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}

      {/* Adjust via chat */}
      <Card className="border-border/50">
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground mb-2">Adjust your plan with natural language</p>
          <div className="flex gap-2">
            <Input
              value={adjustMsg}
              onChange={e => setAdjustMsg(e.target.value)}
              placeholder="e.g. I can't go Friday anymore, add gym session..."
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && adjustPlan()}
              className="text-sm"
            />
            <Button size="icon" onClick={adjustPlan} disabled={adjusting || !adjustMsg.trim()}>
              {adjusting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LifePlanner;
