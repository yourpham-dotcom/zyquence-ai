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
  Clock, Users, Zap, ChevronDown, ChevronRight, ChevronLeft, Trash2, BarChart3,
  Milestone, ListTodo, Pencil, X, Save, Map as MapIcon, Send, Sparkles, GitBranch,
  BookOpen, Package, MessageSquare, DollarSign, Globe
} from "lucide-react";
import { format, isPast, isToday, addDays } from "date-fns";
import { RoadmapTimeline } from "@/components/ops/RoadmapTimeline";
import { WorkflowMap, type WorkflowNode, type WorkflowEdge } from "@/components/ops/WorkflowMap";
import InventoryManagement from "@/components/ops/InventoryManagement";
import Vault from "@/components/ops/Vault";
import Sync from "@/components/ops/Sync";
import ZyquenceAtlas from "@/components/atlas/ZyquenceAtlas";

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

type View = "dashboard" | "create" | "project" | "roadmap" | "workflow" | "create-workflow" | "inventory" | "vault" | "sync" | "atlas";

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
  const [workflowNodes, setWorkflowNodes] = useState<WorkflowNode[]>([]);
  const [workflowEdges, setWorkflowEdges] = useState<WorkflowEdge[]>([]);
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

  // Workflow create state
  const [wfGoal, setWfGoal] = useState("");
  const [wfNotes, setWfNotes] = useState("");
  const [wfTeam, setWfTeam] = useState("");
  const [wfGenerating, setWfGenerating] = useState(false);

  // Roadmap AI adjust state
  const [adjustInput, setAdjustInput] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    const [pRes, tRes, mRes, wnRes, weRes] = await Promise.all([
      supabase.from("ops_projects").select("*").order("created_at", { ascending: false }),
      supabase.from("ops_tasks").select("*").order("sort_order"),
      supabase.from("ops_milestones").select("*").order("target_date"),
      supabase.from("workflow_nodes").select("*").order("sort_order"),
      supabase.from("workflow_edges").select("*"),
    ]);
    if (pRes.data) setProjects(pRes.data as unknown as OpsProject[]);
    if (tRes.data) setTasks(tRes.data as unknown as OpsTask[]);
    if (mRes.data) setMilestones(mRes.data as unknown as OpsMilestone[]);
    if (wnRes.data) setWorkflowNodes(wnRes.data as unknown as WorkflowNode[]);
    if (weRes.data) setWorkflowEdges(weRes.data as unknown as WorkflowEdge[]);
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

      // Auto-generate workflow map for the new project
      try {
        const wfRes = await fetch(`${SUPABASE_URL}/functions/v1/ops-generate-workflow`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_KEY}` },
          body: JSON.stringify({ goal, notes: notes || null, teamMembers }),
        });
        if (wfRes.ok) {
          const wfData = await wfRes.json();
          if (wfData.nodes?.length) {
            const nodeIdMap = new Map<string, string>();
            for (let i = 0; i < wfData.nodes.length; i++) {
              const n = wfData.nodes[i];
              const { data: inserted } = await supabase.from("workflow_nodes").insert({
                project_id: project.id,
                user_id: user!.id,
                label: n.label,
                description: n.description || null,
                owner: n.owner || null,
                node_type: n.node_type || "step",
                status: n.status || "pending",
                sort_order: i,
                position_x: 0,
                position_y: 0,
              }).select().single();
              if (inserted) nodeIdMap.set(n.id, inserted.id);
            }
            const edgeInserts = (wfData.edges || [])
              .filter((e: any) => nodeIdMap.has(e.from) && nodeIdMap.has(e.to))
              .map((e: any) => ({
                project_id: project.id,
                user_id: user!.id,
                source_node_id: nodeIdMap.get(e.from),
                target_node_id: nodeIdMap.get(e.to),
                label: e.label || null,
              }));
            if (edgeInserts.length) await supabase.from("workflow_edges").insert(edgeInserts);
          }
        }
      } catch (wfErr) {
        console.error("Workflow auto-generation failed:", wfErr);
      }

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
  const openRoadmap = (p: OpsProject) => { setSelectedProject(p); setView("roadmap"); };
  const openWorkflow = (p: OpsProject) => { setSelectedProject(p); setView("workflow"); };

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

  // AI Smart Adjust
  const handleAdjustRoadmap = async () => {
    if (!adjustInput.trim() || !selectedProject) return;
    setAdjusting(true);
    try {
      const projectTasks = tasks.filter(t => t.project_id === selectedProject.id).map(t => ({
        id: t.id, title: t.title, deadline: t.deadline, status: t.status, phase: t.phase, assigned_to: t.assigned_to,
      }));
      const projectMilestones = milestones.filter(m => m.project_id === selectedProject.id).map(m => ({
        id: m.id, title: m.title, target_date: m.target_date, is_completed: m.is_completed,
      }));

      const res = await fetch(`${SUPABASE_URL}/functions/v1/ops-adjust-roadmap`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_KEY}` },
        body: JSON.stringify({
          adjustment: adjustInput,
          tasks: projectTasks,
          milestones: projectMilestones,
          projectGoal: selectedProject.goal,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Adjustment failed");
      }

      const result = await res.json();
      if (result.error) throw new Error(result.error);

      // Apply task adjustments
      if (result.adjustedTasks?.length) {
        for (const adj of result.adjustedTasks) {
          if (adj.id && adj.new_deadline) {
            const newDeadline = new Date(adj.new_deadline).toISOString();
            await supabase.from("ops_tasks").update({ deadline: newDeadline }).eq("id", adj.id);
            setTasks(prev => prev.map(t => t.id === adj.id ? { ...t, deadline: newDeadline } : t));
          }
        }
      }

      // Apply milestone adjustments
      if (result.adjustedMilestones?.length) {
        for (const adj of result.adjustedMilestones) {
          if (adj.id && adj.new_target_date) {
            const newDate = new Date(adj.new_target_date).toISOString();
            await supabase.from("ops_milestones").update({ target_date: newDate }).eq("id", adj.id);
            setMilestones(prev => prev.map(m => m.id === adj.id ? { ...m, target_date: newDate } : m));
          }
        }
      }

      toast({
        title: "Roadmap adjusted",
        description: result.summary || `${result.adjustedTasks?.length || 0} tasks updated.`,
      });

      if (result.warnings?.length) {
        toast({
          title: "⚠️ Timeline warnings",
          description: result.warnings.join("; "),
          variant: "destructive",
        });
      }

      setAdjustInput("");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setAdjusting(false);
    }
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

        {/* Quick access buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-1.5">
            <BookOpen className="h-4 w-4" /> Journal
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setView("inventory")}>
            <Package className="h-4 w-4" /> Inventory Management
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setView("sync")}>
            <Users className="h-4 w-4" /> Sync
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setView("vault")}>
            <DollarSign className="h-4 w-4" /> Vault
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setView("atlas")}>
            <Globe className="h-4 w-4" /> Atlas
          </Button>
        </div>

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
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); openRoadmap(p); }}>
                          <MapIcon className="h-3 w-3 mr-1" /> Roadmap
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); openWorkflow(p); }}>
                          <GitBranch className="h-3 w-3 mr-1" /> Workflow
                        </Button>
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
          <h1 className="text-2xl font-bold tracking-tight">AI Roadmap Engine</h1>
          <p className="text-sm text-muted-foreground">Describe your goal and AI will generate a structured execution roadmap.</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Project / Goal Description</label>
              <Textarea value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g. Launch a sports card drop in 30 days, Release an EP in 2 months..." rows={4} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Project Title</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Q1 Product Launch" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Target Deadline (optional)</label>
                <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Team Members (optional)</label>
                <Input value={teamInput} onChange={e => setTeamInput(e.target.value)} placeholder="Alice, Bob, Charlie" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Notes / Constraints (optional)</label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any constraints, budget limits, preferences..." rows={2} />
            </div>
            <Button onClick={handleGenerate} disabled={generating} className="w-full">
              {generating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating Roadmap...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate Roadmap</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── ROADMAP VIEW ───
  if (view === "roadmap" && selectedProject) {
    const projectTasks = tasks.filter(t => t.project_id === selectedProject.id);
    const projectMilestones = milestones.filter(m => m.project_id === selectedProject.id);
    const pDone = projectTasks.filter(t => t.status === "complete").length;
    const pProgress = projectTasks.length ? Math.round((pDone / projectTasks.length) * 100) : 0;

    // Roadmap insights
    const delayedPhases = [...new Set(
      projectTasks
        .filter(t => t.deadline && isPast(new Date(t.deadline)) && t.status !== "complete")
        .map(t => t.phase)
        .filter(Boolean)
    )];
    const upcomingMilestones = projectMilestones.filter(m => m.target_date && !m.is_completed);

    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <Button variant="ghost" size="sm" onClick={() => setView("project")} className="mb-2 -ml-2 text-muted-foreground">← Back to Project</Button>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <MapIcon className="h-5 w-5 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight">{selectedProject.title} — Roadmap</h1>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{selectedProject.goal}</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold">{pProgress}%</span>
              <Progress value={pProgress} className="w-32 h-2 mt-1" />
            </div>
          </div>
        </div>

        {/* Insights row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-medium text-muted-foreground">Upcoming Milestones</span>
              </div>
              {upcomingMilestones.length > 0 ? (
                <div className="space-y-1">
                  {upcomingMilestones.slice(0, 3).map(m => (
                    <p key={m.id} className="text-xs">
                      {m.title} <span className="text-muted-foreground">· {m.target_date ? format(new Date(m.target_date), "MMM d") : ""}</span>
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">All milestones complete ✓</p>
              )}
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-xs font-medium text-muted-foreground">Delayed Phases</span>
              </div>
              {delayedPhases.length > 0 ? (
                <div className="space-y-1">
                  {delayedPhases.map(p => <p key={p} className="text-xs text-destructive">{p}</p>)}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No delays detected ✓</p>
              )}
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <ListTodo className="h-4 w-4 text-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Next Priorities</span>
              </div>
              {(() => {
                const next = projectTasks
                  .filter(t => t.status !== "complete" && t.deadline)
                  .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
                  .slice(0, 3);
                return next.length > 0 ? (
                  <div className="space-y-1">
                    {next.map(t => (
                      <p key={t.id} className="text-xs truncate">
                        {t.title} <span className="text-muted-foreground">· {format(new Date(t.deadline!), "MMM d")}</span>
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">All tasks complete ✓</p>
                );
              })()}
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapIcon className="h-4 w-4" /> Execution Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 overflow-x-auto">
            <div className="min-w-[600px]">
              <RoadmapTimeline
                tasks={projectTasks}
                milestones={projectMilestones}
                projectDeadline={selectedProject.deadline}
                projectStart={selectedProject.created_at}
                onTaskClick={(task) => {
                  const opsTask = tasks.find(t => t.id === task.id);
                  if (opsTask) startEditTask(opsTask);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Smart Adjust */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> AI Smart Adjust
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-xs text-muted-foreground mb-3">
              Describe a change and AI will recalculate your timeline, shifting dependencies automatically.
            </p>
            <div className="flex gap-2">
              <Input
                value={adjustInput}
                onChange={e => setAdjustInput(e.target.value)}
                placeholder='e.g. "Marketing is delayed by 3 days" or "Add a QA phase before launch"'
                className="flex-1"
                onKeyDown={e => e.key === "Enter" && handleAdjustRoadmap()}
              />
              <Button onClick={handleAdjustRoadmap} disabled={adjusting || !adjustInput.trim()} size="sm">
                {adjusting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Editing task overlay */}
        {editingTask && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Edit Task</CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingTask(null)}><X className="h-3.5 w-3.5" /></Button>
              </div>
            </CardHeader>
            <CardContent className="pb-4 space-y-2">
              <Input value={editingTask.title} onChange={e => setEditingTask({ ...editingTask, title: e.target.value })} placeholder="Title" className="h-8 text-sm" />
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
              <Button size="sm" onClick={saveEditTask}><Save className="h-3.5 w-3.5 mr-1" /> Save</Button>
            </CardContent>
          </Card>
        )}
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
              <Button variant="outline" size="sm" onClick={() => setView("roadmap")}>
                <MapIcon className="h-4 w-4 mr-1.5" /> Roadmap
              </Button>
              <Button variant="outline" size="sm" onClick={() => setView("workflow")}>
                <GitBranch className="h-4 w-4 mr-1.5" /> Workflow Map
              </Button>
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

  // ─── WORKFLOW GENERATION HANDLER ───
  const handleGenerateWorkflow = async () => {
    if (!wfGoal.trim() || !selectedProject) {
      toast({ title: "Missing fields", description: "Goal description is required.", variant: "destructive" });
      return;
    }
    setWfGenerating(true);
    try {
      const teamMembers = wfTeam.split(",").map(s => s.trim()).filter(Boolean);
      const res = await fetch(`${SUPABASE_URL}/functions/v1/ops-generate-workflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_KEY}` },
        body: JSON.stringify({ goal: wfGoal, notes: wfNotes || null, teamMembers }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Generation failed"); }
      const result = await res.json();
      if (result.error) throw new Error(result.error);

      // Save nodes
      const nodeIdMap = new Map();
      for (let i = 0; i < (result.nodes || []).length; i++) {
        const n = result.nodes[i];
        const { data, error } = await supabase.from("workflow_nodes").insert({
          project_id: selectedProject.id,
          user_id: user!.id,
          label: n.label,
          description: n.description || null,
          owner: n.owner || null,
          status: n.status || "pending",
          node_type: n.node_type || "step",
          position_x: 0,
          position_y: 0,
          sort_order: i,
        }).select().single();
        if (data) nodeIdMap.set(n.id, data.id);
      }

      // Save edges
      for (const e of result.edges || []) {
        const sourceId = nodeIdMap.get(e.from);
        const targetId = nodeIdMap.get(e.to);
        if (sourceId && targetId) {
          await supabase.from("workflow_edges").insert({
            project_id: selectedProject.id,
            user_id: user!.id,
            source_node_id: sourceId,
            target_node_id: targetId,
            label: e.label || null,
          });
        }
      }

      toast({ title: "Workflow Map generated!", description: `${result.nodes?.length || 0} steps created.` });
      setWfGoal(""); setWfNotes(""); setWfTeam("");
      await fetchAll();
      setView("workflow");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setWfGenerating(false);
    }
  };

  // Workflow node handlers
  const handleNodeUpdate = async (node: WorkflowNode) => {
    await supabase.from("workflow_nodes").update({
      label: node.label, description: node.description, owner: node.owner, status: node.status,
    }).eq("id", node.id);
    setWorkflowNodes(prev => prev.map(n => n.id === node.id ? { ...n, ...node } : n));
    toast({ title: "Node updated" });
  };

  const handleNodeDelete = async (nodeId: string) => {
    await supabase.from("workflow_nodes").delete().eq("id", nodeId);
    setWorkflowNodes(prev => prev.filter(n => n.id !== nodeId));
    setWorkflowEdges(prev => prev.filter(e => e.source_node_id !== nodeId && e.target_node_id !== nodeId));
    toast({ title: "Node deleted" });
  };

  const handleNodeAdd = async () => {
    if (!selectedProject) return;
    const maxOrder = workflowNodes.filter(n => n.project_id === selectedProject.id).reduce((m, n) => Math.max(m, n.sort_order), 0);
    const { data } = await supabase.from("workflow_nodes").insert({
      project_id: selectedProject.id,
      user_id: user!.id,
      label: "New Step",
      status: "pending",
      node_type: "step",
      position_x: 300,
      position_y: 200,
      sort_order: maxOrder + 1,
    }).select().single();
    if (data) setWorkflowNodes(prev => [...prev, data as unknown as WorkflowNode]);
  };

  const handleNodePositionUpdate = (nodeId: string, x: number, y: number) => {
    setWorkflowNodes(prev => prev.map(n => n.id === nodeId ? { ...n, position_x: x, position_y: y } : n));
    // Debounced save (just update local for now, save on next interaction)
    supabase.from("workflow_nodes").update({ position_x: x, position_y: y }).eq("id", nodeId).then(() => {});
  };

  // ─── CREATE WORKFLOW VIEW ───
  if (view === "create-workflow" && selectedProject) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Button variant="ghost" size="sm" onClick={() => setView("project")} className="mb-2 -ml-2 text-muted-foreground">← Back</Button>
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Generate Workflow Map</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Describe the process and AI will generate an interactive workflow diagram.</p>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Process / Goal Description</label>
              <Textarea value={wfGoal} onChange={e => setWfGoal(e.target.value)} placeholder="e.g. Launch a marketing campaign from ideation to analytics review..." rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Team Members (optional)</label>
                <Input value={wfTeam} onChange={e => setWfTeam(e.target.value)} placeholder="Alice, Bob, Charlie" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Notes / Constraints (optional)</label>
                <Input value={wfNotes} onChange={e => setWfNotes(e.target.value)} placeholder="Budget limits, timeline..." />
              </div>
            </div>
            <Button onClick={handleGenerateWorkflow} disabled={wfGenerating} className="w-full">
              {wfGenerating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating Workflow...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate Workflow Map</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── WORKFLOW VIEW ───
  if (view === "workflow" && selectedProject) {
    const projectNodes = workflowNodes.filter(n => n.project_id === selectedProject.id);
    const projectEdges = workflowEdges.filter(e => e.project_id === selectedProject.id);

    // Stats
    const completedSteps = projectNodes.filter(n => n.status === "complete").length;
    const blockedSteps = projectNodes.filter(n => n.status === "blocked").length;
    const inProgressSteps = projectNodes.filter(n => n.status === "in_progress").length;

    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <Button variant="ghost" size="sm" onClick={() => setView("project")} className="mb-2 -ml-2 text-muted-foreground">← Back to Project</Button>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight">{selectedProject.title} — Workflow Map</h1>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{selectedProject.goal}</p>
            </div>
            <Button size="sm" onClick={() => setView("create-workflow")}>
              <Sparkles className="h-4 w-4 mr-1.5" /> Generate New
            </Button>
          </div>
        </div>

        {/* Workflow insights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Steps", value: projectNodes.length, icon: GitBranch, color: "text-foreground" },
            { label: "In Progress", value: inProgressSteps, icon: Clock, color: "text-blue-500" },
            { label: "Completed", value: completedSteps, icon: CheckCircle2, color: "text-green-500" },
            { label: "Blocked", value: blockedSteps, icon: AlertTriangle, color: "text-destructive" },
          ].map(s => (
            <Card key={s.label} className="border-border/50">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
                <p className="text-xl font-bold mt-0.5">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Workflow diagram */}
        {projectNodes.length > 0 ? (
          <Card>
            <CardContent className="p-4">
              <WorkflowMap
                nodes={projectNodes}
                edges={projectEdges}
                onNodeUpdate={handleNodeUpdate}
                onNodeDelete={handleNodeDelete}
                onNodeAdd={handleNodeAdd}
                onNodePositionUpdate={handleNodePositionUpdate}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <GitBranch className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground mb-3">No workflow map yet for this project.</p>
              <Button size="sm" onClick={() => setView("create-workflow")}>
                <Sparkles className="h-4 w-4 mr-1.5" /> Generate Workflow Map
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ─── INVENTORY VIEW ───
  if (view === "inventory") {
    return <InventoryManagement onBack={() => setView("dashboard")} />;
  }

  // ─── VAULT VIEW ───
  if (view === "vault") {
    return <Vault onBack={() => setView("dashboard")} />;
  }

  // ─── SYNC VIEW ───
  if (view === "sync") {
    return <Sync onBack={() => setView("dashboard")} />;
  }

  // ─── ATLAS VIEW ───
  if (view === "atlas") {
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setView("dashboard")} className="gap-1.5 text-muted-foreground">
          <ChevronLeft className="h-4 w-4" /> Back to Ops
        </Button>
        <ZyquenceAtlas />
      </div>
    );
  }

  return null;
}
