import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Target, Plus, Bookmark, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Goal {
  id: string;
  title: string;
  progress: number;
  milestones: number;
  completed: number;
  color: string;
}

const COLORS = [
  { label: "Blue", value: "bg-blue-500" },
  { label: "Green", value: "bg-emerald-500" },
  { label: "Purple", value: "bg-purple-500" },
  { label: "Orange", value: "bg-orange-500" },
  { label: "Red", value: "bg-red-500" },
  { label: "Pink", value: "bg-pink-500" },
];

const GoalsPage = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newMilestones, setNewMilestones] = useState("4");
  const [newColor, setNewColor] = useState("bg-blue-500");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setGoals(data);
    if (error) toast.error("Failed to load goals");
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) { toast.error("Enter a goal title"); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Please sign in"); return; }

    const { data, error } = await supabase.from("goals").insert({
      user_id: user.id,
      title: newTitle.trim(),
      milestones: parseInt(newMilestones) || 4,
      color: newColor,
    }).select().single();

    if (error) { toast.error("Failed to create goal"); return; }
    if (data) setGoals(prev => [data, ...prev]);
    setNewTitle("");
    setNewMilestones("4");
    setNewColor("bg-blue-500");
    setDialogOpen(false);
    toast.success("Goal created!");
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // Default goals shown when no saved goals exist
  const defaultGoals: Goal[] = [
    { id: "d1", title: "Run 100 miles this month", progress: 68, milestones: 4, completed: 2, color: "bg-blue-500" },
    { id: "d2", title: "Save $2,000 emergency fund", progress: 76, milestones: 5, completed: 3, color: "bg-emerald-500" },
    { id: "d3", title: "Complete music production course", progress: 40, milestones: 8, completed: 3, color: "bg-purple-500" },
    { id: "d4", title: "Read 4 books", progress: 25, milestones: 4, completed: 1, color: "bg-orange-500" },
  ];

  const displayGoals = showSaved ? goals : (goals.length > 0 ? goals : defaultGoals);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Goals</h1>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={showSaved ? "default" : "outline"}
            className="rounded-xl"
            onClick={() => setShowSaved(!showSaved)}
          >
            <Bookmark className="h-4 w-4 mr-1.5" />
            Saved Goals {goals.length > 0 && `(${goals.length})`}
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl">
                <Plus className="h-4 w-4 mr-1.5" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Goal Title</Label>
                  <Input placeholder="e.g. Run 100 miles this month" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Milestones</Label>
                  <Input type="number" min="1" max="20" value={newMilestones} onChange={e => setNewMilestones(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Select value={newColor} onValueChange={setNewColor}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COLORS.map(c => (
                        <SelectItem key={c.value} value={c.value}>
                          <div className="flex items-center gap-2">
                            <div className={cn("w-3 h-3 rounded-full", c.value)} />
                            {c.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleCreate}>Create Goal</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {showSaved && goals.length === 0 ? (
        <Card className="border-dashed border-2 border-border/50">
          <CardContent className="p-12 text-center">
            <Bookmark className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground mb-1">No saved goals yet</h3>
            <p className="text-xs text-muted-foreground">Click "New Goal" to create your first goal</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {displayGoals.map((goal) => (
            <Card key={goal.id} className="border-border/50 hover:border-primary/30 transition-all group relative">
              <CardContent className="p-5 space-y-4">
                {!goal.id.startsWith("d") && (
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
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
      )}
    </div>
  );
};

export default GoalsPage;
