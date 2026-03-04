import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, Users, Zap, ClipboardList } from "lucide-react";

const stages = [
  { name: "Idea", tasks: 3, automations: 1, team: 2, color: "from-amber-500 to-orange-500" },
  { name: "Research", tasks: 5, automations: 2, team: 3, color: "from-blue-500 to-cyan-500" },
  { name: "Design", tasks: 4, automations: 1, team: 2, color: "from-violet-500 to-purple-500" },
  { name: "Production", tasks: 8, automations: 4, team: 5, color: "from-emerald-500 to-teal-500" },
  { name: "Launch", tasks: 6, automations: 3, team: 4, color: "from-rose-500 to-pink-500" },
  { name: "Analytics", tasks: 3, automations: 5, team: 2, color: "from-indigo-500 to-blue-500" },
];

const CIWorkflowBuilder = () => (
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

export default CIWorkflowBuilder;
