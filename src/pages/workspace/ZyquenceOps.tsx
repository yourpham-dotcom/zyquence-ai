import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  Plus, Loader2, Target, Calendar, AlertTriangle, CheckCircle2,
  Clock, Users, Zap, ChevronDown, ChevronRight, Trash2, BarChart3,
  Milestone, ListTodo, Pencil, X, Save
} from "lucide-react";
import { format, isPast, isToday, addDays } from "date-fns";

type OpsProject = {
  id: string;
  title: string;
  goal: string;
  deadline: string | null;
  team_members: string[];
  notes: string | null;
  phases: Phase[];
  status: string;
  progress: number;
  created_at: string;
};

type Phase = {
  name: string;
  tasks: GeneratedTask[];
};

type GeneratedTask = {
  title: string;
  description: string;
  assigned_to: string;
  priority: string;
  estimated_days: number;
  dependencies: string[];
};

type OpsTask = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  status: string;
  priority: string;
  deadline: string | null;
  phase: string | null;
  sort_order: number;
};

type OpsMilestone = {
  id: string;
  project_id: string;
  title: string;
  target_date: string | null;
  is_completed: boolean;
};

type View = "dashboard" | "create" | "project";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

type EditingTask = {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  priority: string;
  deadline: string;
};

export default function ZyquenceOps() {
  const { user } = useAuth();
  const [view, setView] = useState<View>("dashboard");
  const [projects, setProjects] = useState<OpsProject[]>([]);
  const [tasks, setTasks] = useState<OpsTask[]>([]);
  const [milestones, setMilestones] = useState<OpsMilestone[]>([]);
  const [selectedProject, setSelectedProject] = useState<OpsProject | null>(null);
  const [loading, setLoading] = useState(true);

  // Create form state
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [deadline, setDeadline] = useState("");
  const [teamInput, setTeamInput] = useState("");
  const [notes, setNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [editingTask, setEditingTask] = useState<EditingTask | null>(null);
  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    const [pRes, tRes, mRes] = await Promise.all([
      supabase.from("ops_projects").select("*").order("created_at", { ascending: false }),
      supabase.from("ops_tasks").select("*").order("sort_order"),
      supabase.from("ops_milestones").select("*").order("target_date"),
    ]);
    if (pRes.data) setProjects(pRes.data as unknown as OpsProject[]);
    if (tRes.data) setTasks(tRes.data as unknown as OpsTask[]);
    if (mRes.data) setMilestones(mRes.data as unknown as OpsMilestone[]);
    setLoading(false);
  };

  const handleGenerate = async () => {
    if (!title.trim() || !goal.trim()) {
      toast({ title: "Missing fields", description: "Title and goal are required.", variant: "destructive" });
      return;
    }
    setGenerating(true);
    try {
      const teamMembers = teamInput.split(",").map(s => s.trim()).filter(Boolean);

      const res = await fetch(`${SUPABASE_URL}/functions/v1/ops-generate-project`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_KEY}` },
        body: JSON.stringify({ title, goal, deadline: deadline || null, teamMembers, notes: notes || null }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }

      const plan = await res.json();
      if (plan.error) throw new Error(plan.error);

      // Save project
      const deadlineDate = deadline ? new Date(deadline).toISOString() : null;
      const { data: project, error: pErr } = await supabase.from("ops_projects").insert({
        user_id: user!.id,
        title,
        goal,
        deadline: deadlineDate,
        team_members: teamMembers,
        notes: notes || null,
        phases: plan.phases || [],
        status: "active",
        progress: 0,
      }).select().single();

      if (pErr) throw pErr;

      // Save tasks
      let sortOrder = 0;
      const taskInserts: any[] = [];
      for (const phase of plan.phases || []) {
        for (const task of phase.tasks || []) {
          const taskDeadline = deadline
            ? addDays(new Date(deadline), -(task.estimated_days || 0)).toISOString()
            : null;
          taskInserts.push({
            project_id: project.id,
            user_id: user!.id,
            title: task.title,
            description: task.description,
            assigned_to: task.assigned_to,
            priority: task.priority || "medium",
            deadline: taskDeadline,
            phase: phase.name,
            dependencies: task.dependencies || [],
            sort_order: sortOrder++,
          });
        }
      }
      if (taskInserts.length) await supabase.from("ops_tasks").insert(taskInserts);

      // Save milestones
      const milestoneInserts = (plan.milestones || []).map((m: any) => ({
        project_id: project.id,
        user_id: user!.id,
        title: m.title,
        target_date: deadline
          ? addDays(new Date(), m.estimated_days_from_start || 7).toISOString()
          : addDays(new Date(), m.estimated_days_from_start || 7).toISOString(),
      }));
      if (milestoneInserts.length) await supabase.from("ops_milestones").insert(milestoneInserts);

      toast({ title: "Project generated!", description: `${taskInserts.length} tasks created across ${plan.phases?.length || 0} phases.` });
      setTitle(""); setGoal(""); setDeadline(""); setTeamInput(""); setNotes("");
      await fetchAll();
      setView("dashboard");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    await supabase.from("ops_tasks").update({ status }).eq("id", taskId);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    // Recalc project progress
    if (selectedProject) {
      const projectTasks = tasks.filter(t => t.project_id === selectedProject.id);
      const done = projectTasks.filter(t => t.id === taskId ? status === "complete" : t.status === "complete").length;
      const progress = projectTasks.length ? Math.round((done / projectTasks.length) * 100) : 0;
      await supabase.from("ops_projects").update({ progress }).eq("id", selectedProject.id);
      setProjects(prev => prev.map(p => p.id === selectedProject.id ? { ...p, progress } : p));
      setSelectedProject(prev => prev ? { ...prev, progress } : null);
    }
  };

  const deleteProject = async (projectId: string) => {
    await supabase.from("ops_projects").delete().eq("id", projectId);
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setTasks(prev => prev.filter(t => t.project_id !== projectId));
    setMilestones(prev => prev.filter(m => m.project_id !== projectId));
    if (selectedProject?.id === projectId) { setSelectedProject(null); setView("dashboard"); }
    toast({ title: "Project deleted" });
  };

  const openProject = (p: OpsProject) => { setSelectedProject(p); setView("project"); };

  const startEditTask = (task: OpsTask) => {
    setEditingTask({
      id: task.id,
      title: task.title,
      description: task.description || "",
      assigned_to: task.assigned_to || "",
      priority: task.priority || "medium",
      deadline: task.deadline ? task.deadline.split("T")[0] : "",
    });
  };

  const saveEditTask = async () => {
    if (!editingTask) return;
    const deadlineVal = editingTask.deadline ? new Date(editingTask.deadline).toISOString() : null;
    await supabase.from("ops_tasks").update({
      title: editingTask.title,
      description: editingTask.description || null,
      assigned_to: editingTask.assigned_to || null,
      priority: editingTask.priority,
      deadline: deadlineVal,
    }).eq("id", editingTask.id);
    setTasks(prev => prev.map(t => t.id === editingTask.id ? {
      ...t,
      title: editingTask.title,
      description: editingTask.description || null,
      assigned_to: editingTask.assigned_to || null,
      priority: editingTask.priority,
      deadline: deadlineVal,
    } : t));
    setEditingTask(null);
    toast({ title: "Task updated" });
  };

  const addBlankTask = async (projectId: string, phase?: string) => {
    const maxOrder = tasks.filter(t => t.project_id === projectId).reduce((m, t) => Math.max(m, t.sort_order), 0);
    const { data, error } = await supabase.from("ops_tasks").insert({
      project_id: projectId,
      user_id: user!.id,
      title: "New Task",
      status: "not_started",
      priority: "medium",
      phase: phase || null,
      sort_order: maxOrder + 1,
    }).select().single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    const newTask = data as unknown as OpsTask;
    setTasks(prev => [...prev, newTask]);
    startEditTask(newTask);
  };
  // Dashboard stats
  const activeProjects = projects.filter(p => p.status === "active");
  const allTasks = tasks;
  const overdueTasks = allTasks.filter(t => t.deadline && isPast(new Date(t.deadline)) && t.status !== "complete");
  const todayTasks = allTasks.filter(t => t.deadline && isToday(new Date(t.deadline)));
  const completedTasks = allTasks.filter(t => t.status === "complete");

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  // ─── DASHBOARD VIEW ───
  if (view === "dashboard") {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Zyquence Ops</h1>
            <p className="text-sm text-muted-foreground">AI-powered operations & workflow engine</p>
          </div>
          <Button onClick={() => setView("create")} size="sm">
            <Plus className="h-4 w-4 mr-1.5" /> New Project
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Active Projects", value: activeProjects.length, icon: BarChart3, color: "text-blue-500" },
            { label: "Total Tasks", value: allTasks.length, icon: ListTodo, color: "text-foreground" },
            { label: "Completed", value: completedTasks.length, icon: CheckCircle2, color: "text-green-500" },
            { label: "Due Today", value: todayTasks.length, icon: Clock, color: "text-amber-500" },
            { label: "Overdue", value: overdueTasks.length, icon: AlertTriangle, color: "text-destructive" },
          ].map(s => (
            <Card key={s.label} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
                <p className="text-2xl font-bold mt-1">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Overdue alerts */}
        {overdueTasks.length > 0 && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">{overdueTasks.length} overdue task{overdueTasks.length > 1 ? "s" : ""}</span>
              </div>
              <div className="space-y-1">
                {overdueTasks.slice(0, 5).map(t => (
                  <p key={t.id} className="text-xs text-muted-foreground">• {t.title} — due {t.deadline ? format(new Date(t.deadline), "MMM d") : ""}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects list */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Projects</h2>
          {projects.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Zap className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No projects yet. Create one with AI.</p>
              </CardContent>
            </Card>
          ) : (
            projects.map(p => {
              const pTasks = tasks.filter(t => t.project_id === p.id);
              const pDone = pTasks.filter(t => t.status === "complete").length;
              const pProgress = pTasks.length ? Math.round((pDone / pTasks.length) * 100) : 0;
              return (
                <Card key={p.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => openProject(p)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{p.title}</h3>
                          <Badge variant={p.status === "active" ? "default" : "secondary"} className="text-[10px]">{p.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.goal}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-muted-foreground">{pTasks.length} tasks</span>
                          {p.deadline && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(p.deadline), "MMM d, yyyy")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <div className="text-right">
                          <span className="text-sm font-medium">{pProgress}%</span>
                          <Progress value={pProgress} className="w-20 h-1.5 mt-1" />
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}>
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // ─── CREATE VIEW ───
  if (view === "create") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Button variant="ghost" size="sm" onClick={() => setView("dashboard")} className="mb-2 -ml-2 text-muted-foreground">← Back</Button>
          <h1 className="text-2xl font-bold tracking-tight">AI Project Generator</h1>
          <p className="text-sm text-muted-foreground">Describe your goal and AI will generate a structured project plan.</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Project Title</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Q1 Product Launch" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Goal Description</label>
              <Textarea value={goal} onChange={e => setGoal(e.target.value)} placeholder="Describe what you want to achieve..." rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Deadline (optional)</label>
                <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Team Members</label>
                <Input value={teamInput} onChange={e => setTeamInput(e.target.value)} placeholder="Alice, Bob, Charlie" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Notes / Constraints</label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any constraints, budget limits, preferences..." rows={2} />
            </div>
            <Button onClick={handleGenerate} disabled={generating} className="w-full">
              {generating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating plan...</> : <><Zap className="h-4 w-4 mr-2" /> Generate Project Plan</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── PROJECT DETAIL VIEW ───
  if (view === "project" && selectedProject) {
    const projectTasks = tasks.filter(t => t.project_id === selectedProject.id);
    const projectMilestones = milestones.filter(m => m.project_id === selectedProject.id);
    const phases = [...new Set(projectTasks.map(t => t.phase).filter(Boolean))] as string[];

    const statusColors: Record<string, string> = {
      not_started: "bg-muted text-muted-foreground",
      in_progress: "bg-blue-500/10 text-blue-500",
      complete: "bg-green-500/10 text-green-500",
    };
    const priorityColors: Record<string, string> = {
      high: "text-destructive",
      medium: "text-amber-500",
      low: "text-muted-foreground",
    };

    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <Button variant="ghost" size="sm" onClick={() => setView("dashboard")} className="mb-2 -ml-2 text-muted-foreground">← Back</Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{selectedProject.title}</h1>
              <p className="text-sm text-muted-foreground">{selectedProject.goal}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-lg font-bold">{selectedProject.progress}%</span>
                <Progress value={selectedProject.progress} className="w-32 h-2 mt-1" />
              </div>
              <Button size="sm" onClick={() => addBlankTask(selectedProject.id, phases[0] || undefined)}>
                <Plus className="h-4 w-4 mr-1.5" /> Add Task
              </Button>
            </div>
          </div>
        </div>

        {/* Milestones */}
        {projectMilestones.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Milestone className="h-4 w-4" /> Milestones</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex flex-wrap gap-2">
                {projectMilestones.map(m => (
                  <Badge key={m.id} variant={m.is_completed ? "default" : "outline"} className="text-xs">
                    {m.is_completed ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Target className="h-3 w-3 mr-1" />}
                    {m.title}
                    {m.target_date && <span className="ml-1 opacity-60">· {format(new Date(m.target_date), "MMM d")}</span>}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tasks by phase */}
        <div className="space-y-4">
          {phases.map(phase => {
            const phaseTasks = projectTasks.filter(t => t.phase === phase);
            return (
              <Card key={phase}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{phase}</CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-2">
                    {phaseTasks.map(task => (
                      <div key={task.id} className="rounded-lg border border-border/50 hover:border-border transition-colors">
                        {editingTask?.id === task.id ? (
                          <div className="p-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <Input value={editingTask.title} onChange={e => setEditingTask({ ...editingTask, title: e.target.value })} placeholder="Title" className="h-8 text-sm" />
                              <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={saveEditTask}><Save className="h-3.5 w-3.5" /></Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => setEditingTask(null)}><X className="h-3.5 w-3.5" /></Button>
                            </div>
                            <Input value={editingTask.description} onChange={e => setEditingTask({ ...editingTask, description: e.target.value })} placeholder="Description" className="h-8 text-xs" />
                            <div className="grid grid-cols-3 gap-2">
                              <Input value={editingTask.assigned_to} onChange={e => setEditingTask({ ...editingTask, assigned_to: e.target.value })} placeholder="Assigned to" className="h-8 text-xs" />
                              <select value={editingTask.priority} onChange={e => setEditingTask({ ...editingTask, priority: e.target.value })} className="h-8 rounded-md border border-input bg-background px-2 text-xs">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                              </select>
                              <Input type="date" value={editingTask.deadline} onChange={e => setEditingTask({ ...editingTask, deadline: e.target.value })} className="h-8 text-xs" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-2.5">
                            <button
                              onClick={() => {
                                const next = task.status === "not_started" ? "in_progress" : task.status === "in_progress" ? "complete" : "not_started";
                                updateTaskStatus(task.id, next);
                              }}
                              className="shrink-0"
                            >
                              {task.status === "complete" ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : task.status === "in_progress" ? (
                                <Clock className="h-4 w-4 text-blue-500" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${task.status === "complete" ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
                              {task.description && <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {task.assigned_to && (
                                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <Users className="h-2.5 w-2.5" />{task.assigned_to}
                                </span>
                              )}
                              {task.priority && <span className={`text-[10px] font-medium uppercase ${priorityColors[task.priority] || ""}`}>{task.priority}</span>}
                              {task.deadline && (
                                <span className={`text-[10px] ${isPast(new Date(task.deadline)) && task.status !== "complete" ? "text-destructive" : "text-muted-foreground"}`}>
                                  {format(new Date(task.deadline), "MMM d")}
                                </span>
                              )}
                              <Badge variant="outline" className={`text-[10px] px-1.5 ${statusColors[task.status] || ""}`}>
                                {task.status.replace("_", " ")}
                              </Badge>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEditTask(task)}>
                                <Pencil className="h-3 w-3 text-muted-foreground" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Tasks without a phase */}
          {projectTasks.filter(t => !t.phase).length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Other Tasks</CardTitle></CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-2">
                  {projectTasks.filter(t => !t.phase).map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/50">
                      <span className="text-sm">{task.title}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return null;
}
