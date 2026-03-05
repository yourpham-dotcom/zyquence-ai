import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, Users, Zap, ClipboardList, Loader2 } from "lucide-react";
import { useCreativeIdeas } from "@/hooks/useCreativeIdeas";

const defaultStages = [
  { name: "Idea", color: "from-amber-500 to-orange-500" },
  { name: "Research", color: "from-blue-500 to-cyan-500" },
  { name: "Design", color: "from-violet-500 to-purple-500" },
  { name: "Production", color: "from-emerald-500 to-teal-500" },
  { name: "Launch", color: "from-rose-500 to-pink-500" },
  { name: "Analytics", color: "from-indigo-500 to-blue-500" },
];

const CIWorkflowBuilder = () => {
  const { ideas, isLoading } = useCreativeIdeas();

  // Derive stage counts from real idea data
  const drafts = ideas.filter(i => i.status === "draft").length;
  const analyzing = ideas.filter(i => i.status === "analyzing").length;
  const analyzed = ideas.filter(i => i.status === "analyzed" && !i.ai_strategy).length;
  const strategizing = ideas.filter(i => i.status === "generating strategy").length;
  const strategized = ideas.filter(i => i.status === "strategy ready").length;
  const total = ideas.length;

  const stages = [
    { ...defaultStages[0], tasks: drafts + analyzing, automations: 0, team: drafts },
    { ...defaultStages[1], tasks: analyzing, automations: 1, team: analyzing },
    { ...defaultStages[2], tasks: analyzed, automations: analyzed, team: analyzed },
    { ...defaultStages[3], tasks: strategizing, automations: strategizing, team: strategizing },
    { ...defaultStages[4], tasks: strategized, automations: strategized, team: strategized },
    { ...defaultStages[5], tasks: total > 0 ? 1 : 0, automations: total > 0 ? 1 : 0, team: 0 },
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
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Workflow Builder</h1>
        <p className="text-muted-foreground mt-1 text-sm">Visual pipeline for your strategy execution.</p>
      </div>

      <div className="flex flex-col items-center gap-2">
        {stages.map((stage, i) => (
          <div key={stage.name} className="flex flex-col items-center w-full max-w-lg">
            <Card className="bg-card/60 backdrop-blur border-border/50 hover:border-primary/40 transition-all w-full cursor-pointer group">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${stage.color}`} />
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {stage.name}
                    </h3>
                  </div>
                  <Badge variant="outline" className="text-xs">Stage {i + 1}</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><ClipboardList className="h-3 w-3" /> {stage.tasks} tasks</span>
                  <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {stage.automations} automations</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {stage.team} assigned</span>
                </div>
              </CardContent>
            </Card>
            {i < stages.length - 1 && (
              <div className="py-1">
                <ArrowDown className="h-5 w-5 text-muted-foreground/50" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CIWorkflowBuilder;
