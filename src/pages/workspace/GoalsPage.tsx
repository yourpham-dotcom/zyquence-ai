import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Plus, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const goals = [
  { id: 1, title: "Run 100 miles this month", progress: 68, milestones: 4, completed: 2, color: "bg-blue-500" },
  { id: 2, title: "Save $2,000 emergency fund", progress: 76, milestones: 5, completed: 3, color: "bg-emerald-500" },
  { id: 3, title: "Complete music production course", progress: 40, milestones: 8, completed: 3, color: "bg-purple-500" },
  { id: 4, title: "Read 4 books", progress: 25, milestones: 4, completed: 1, color: "bg-orange-500" },
];

const GoalsPage = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Goals</h1>
        <Button size="sm" className="rounded-xl">
          <Plus className="h-4 w-4 mr-1.5" />
          New Goal
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {goals.map((goal) => (
          <Card key={goal.id} className="border-border/50 hover:border-primary/30 transition-all">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <Target className={cn("h-5 w-5 mt-0.5 shrink-0", goal.color.replace("bg-", "text-"))} />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">{goal.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {goal.completed}/{goal.milestones} milestones
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Progress</span>
                  <span className="text-xs font-medium text-foreground">{goal.progress}%</span>
                </div>
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", goal.color)}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GoalsPage;
