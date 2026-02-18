import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FolderKanban, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const sampleProjects = [
  { id: 1, name: "Album Release Plan", updated: "2 hours ago", color: "bg-purple-500" },
  { id: 2, name: "Fitness Program", updated: "Yesterday", color: "bg-blue-500" },
  { id: 3, name: "Budget Tracker Setup", updated: "3 days ago", color: "bg-emerald-500" },
];

const aiSuggestions = [
  "Create a weekly meal prep plan",
  "Set up a 30-day fitness challenge",
  "Plan your next creative project",
];

const WorkspacePage = () => {
  const [projects, setProjects] = useState(sampleProjects);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Workspace</h1>
        <Button size="sm" className="rounded-xl">
          <Plus className="h-4 w-4 mr-1.5" />
          New Project
        </Button>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Projects */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Recent Projects</h2>
          <div className="space-y-3">
            {projects.map((proj) => (
              <Card key={proj.id} className="border-border/50 hover:border-primary/30 transition-all cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={cn("w-3 h-10 rounded-full shrink-0", proj.color)} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{proj.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {proj.updated}
                    </div>
                  </div>
                  <FolderKanban className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Suggestions */}
        <Card className="border-border/50 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              AI Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {aiSuggestions.map((suggestion, i) => (
              <button
                key={i}
                className="w-full text-left text-xs p-3 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors text-foreground"
              >
                {suggestion}
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkspacePage;
