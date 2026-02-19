import { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle2, Clock, AlertTriangle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  estimated_hours: number | null;
  notes: string | null;
  created_at: string;
}

export default function AssignmentPlanner() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", subject: "", priority: "medium",
    due_date: "", estimated_hours: "", notes: "",
  });

  const fetchAssignments = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("assignments")
      .select("*")
      .eq("user_id", user.id)
      .order("due_date", { ascending: true, nullsFirst: false });
    if (data) setAssignments(data);
  };

  useEffect(() => { fetchAssignments(); }, [user]);

  const handleCreate = async () => {
    if (!user || !form.title.trim()) return;
    const { error } = await supabase.from("assignments").insert({
      user_id: user.id,
      title: form.title.trim(),
      description: form.description || null,
      subject: form.subject || null,
      priority: form.priority,
      due_date: form.due_date || null,
      estimated_hours: form.estimated_hours ? Number(form.estimated_hours) : null,
      notes: form.notes || null,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Assignment added!" });
    setForm({ title: "", description: "", subject: "", priority: "medium", due_date: "", estimated_hours: "", notes: "" });
    setOpen(false);
    fetchAssignments();
  };

  const toggleStatus = async (id: string, current: string) => {
    const next = current === "completed" ? "pending" : "completed";
    await supabase.from("assignments").update({ status: next }).eq("id", id);
    fetchAssignments();
  };

  const deleteAssignment = async (id: string) => {
    await supabase.from("assignments").delete().eq("id", id);
    fetchAssignments();
  };

  const filtered = assignments.filter((a) => {
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (filterPriority !== "all" && a.priority !== filterPriority) return false;
    return true;
  });

  const priorityColor: Record<string, string> = {
    low: "bg-muted text-muted-foreground",
    medium: "bg-yellow-500/20 text-yellow-500",
    high: "bg-orange-500/20 text-orange-500",
    urgent: "bg-red-500/20 text-red-500",
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assignment Planner</h1>
          <p className="text-muted-foreground text-sm">Track deadlines and stay organized</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Assignment</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>New Assignment</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Math Homework Ch. 5" /></div>
              <div><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Mathematics" /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Details..." rows={2} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Est. Hours</Label><Input type="number" value={form.estimated_hours} onChange={(e) => setForm({ ...form, estimated_hours: e.target.value })} placeholder="2" /></div>
              </div>
              <div><Label>Due Date</Label><Input type="datetime-local" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." rows={2} /></div>
              <Button onClick={handleCreate} className="w-full">Create Assignment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36"><Filter className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <Card className="bg-card border-border"><CardContent className="p-8 text-center text-muted-foreground">No assignments yet. Add one to get started!</CardContent></Card>
        )}
        {filtered.map((a) => {
          const isOverdue = a.status !== "completed" && a.due_date && new Date(a.due_date) < new Date();
          return (
            <Card key={a.id} className={`bg-card border-border ${a.status === "completed" ? "opacity-60" : ""}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <button onClick={() => toggleStatus(a.id, a.status)} className="shrink-0">
                  <CheckCircle2 className={`h-5 w-5 ${a.status === "completed" ? "text-emerald-500" : "text-muted-foreground/40 hover:text-emerald-500"} transition-colors`} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-medium text-foreground ${a.status === "completed" ? "line-through" : ""}`}>{a.title}</span>
                    <Badge variant="secondary" className={priorityColor[a.priority]}>{a.priority}</Badge>
                    {a.subject && <Badge variant="outline" className="text-xs">{a.subject}</Badge>}
                    {isOverdue && <Badge variant="destructive" className="text-xs">Overdue</Badge>}
                  </div>
                  {a.due_date && (
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" />Due: {format(new Date(a.due_date), "MMM d, yyyy h:mm a")}
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteAssignment(a.id)} className="shrink-0 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
