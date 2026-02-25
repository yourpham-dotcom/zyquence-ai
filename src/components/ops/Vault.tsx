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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft, DollarSign, TrendingUp, Target, Calendar, Loader2,
  Plus, Sparkles, PiggyBank, CreditCard, Shield, Briefcase, Landmark,
  BarChart3, CheckCircle2, Trash2, ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

type FinancialProject = {
  id: string;
  title: string;
  goal_description: string;
  target_amount: number | null;
  deadline: string | null;
  current_income: number | null;
  phases: any[];
  tasks: any[];
  milestones: any[];
  recommendations: string[];
  notes: string | null;
  status: string;
  progress: number;
  created_at: string;
};

const TEMPLATES = [
  { title: "Budget Setup Plan", description: "Create a structured monthly budget to track income and expenses", icon: CreditCard, goal: "Set up a comprehensive monthly budget with categories for all expenses, savings, and investments." },
  { title: "Debt Reduction Plan", description: "Systematic plan to pay off debt efficiently", icon: TrendingUp, goal: "Create a debt elimination strategy using avalanche or snowball method to become debt-free." },
  { title: "Savings Goal Plan", description: "Build savings for a specific target", icon: PiggyBank, goal: "Build a disciplined savings plan to reach a specific savings goal with automated contributions." },
  { title: "Investment Starter Plan", description: "Begin investing with a structured approach", icon: Landmark, goal: "Start an investment portfolio with diversified assets appropriate for a beginner investor." },
  { title: "Contract Income Management", description: "Manage irregular freelance/contract income", icon: Briefcase, goal: "Create a financial management system for irregular contract/freelance income including tax planning." },
  { title: "Emergency Fund Plan", description: "Build a 3-6 month emergency fund", icon: Shield, goal: "Build an emergency fund covering 3-6 months of essential expenses with a clear savings timeline." },
];

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const incomeData = [
  { month: "Jan", amount: 4200 }, { month: "Feb", amount: 4500 },
  { month: "Mar", amount: 4100 }, { month: "Apr", amount: 4800 },
  { month: "May", amount: 5100 }, { month: "Jun", amount: 4900 },
];

const savingsData = [
  { name: "Saved", value: 12400 }, { name: "Remaining", value: 7600 },
];

type VaultProfile = {
  total_income_monthly: number;
  monthly_savings: number;
};

export default function Vault({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<FinancialProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<FinancialProject | null>(null);
  const [generating, setGenerating] = useState(false);
  const [vaultProfile, setVaultProfile] = useState<VaultProfile>({ total_income_monthly: 0, monthly_savings: 0 });

  // Form state
  const [goalDesc, setGoalDesc] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [currentIncome, setCurrentIncome] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchVaultProfile();
    }
  }, [user]);

  const fetchVaultProfile = async () => {
    const { data } = await supabase
      .from("vault_profiles")
      .select("total_income_monthly, monthly_savings")
      .eq("user_id", user!.id)
      .maybeSingle();
    if (data) setVaultProfile(data as unknown as VaultProfile);
  };

  const fetchProjects = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("financial_projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProjects(data as unknown as FinancialProject[]);
    setLoading(false);
  };

  const generatePlan = async (goalOverride?: string) => {
    const goal = goalOverride || goalDesc;
    if (!goal.trim()) {
      toast({ title: "Missing goal", description: "Please describe your financial goal.", variant: "destructive" });
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/vault-generate-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_KEY}` },
        body: JSON.stringify({
          goalDescription: goal,
          targetAmount: targetAmount ? parseFloat(targetAmount) : null,
          deadline: deadline || null,
          currentIncome: currentIncome ? parseFloat(currentIncome) : null,
          notes: notes || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }

      const plan = await res.json();
      if (plan.error) throw new Error(plan.error);

      const title = goalOverride
        ? TEMPLATES.find(t => t.goal === goalOverride)?.title || "Financial Plan"
        : goal.slice(0, 60);

      const { error: insertErr } = await supabase.from("financial_projects").insert({
        user_id: user!.id,
        title,
        goal_description: goal,
        target_amount: targetAmount ? parseFloat(targetAmount) : null,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        current_income: currentIncome ? parseFloat(currentIncome) : null,
        phases: plan.phases || [],
        tasks: (plan.phases || []).flatMap((p: any) => (p.tasks || []).map((t: any) => ({ ...t, phase: p.name }))),
        milestones: plan.milestones || [],
        recommendations: plan.recommendations || [],
        notes: notes || null,
        status: "active",
        progress: 0,
      });

      if (insertErr) throw insertErr;

      // Upsert vault_profiles with income/savings data
      const incomeVal = currentIncome ? parseFloat(currentIncome) : (plan.assumptions?.monthlyIncome || null);
      const savingsVal = plan.estimated_monthly_savings || plan.assumptions?.monthlySavingsTarget || null;

      if (incomeVal || savingsVal) {
        const updates: any = { user_id: user!.id, updated_at: new Date().toISOString() };
        if (incomeVal) updates.total_income_monthly = incomeVal;
        if (savingsVal) updates.monthly_savings = savingsVal;

        // Check if profile exists
        const { data: existing } = await supabase
          .from("vault_profiles")
          .select("user_id")
          .eq("user_id", user!.id)
          .maybeSingle();

        if (existing) {
          const updateFields: any = { updated_at: new Date().toISOString() };
          if (incomeVal) updateFields.total_income_monthly = incomeVal;
          if (savingsVal) updateFields.monthly_savings = savingsVal;
          await supabase.from("vault_profiles").update(updateFields).eq("user_id", user!.id);
        } else {
          await supabase.from("vault_profiles").insert({
            user_id: user!.id,
            total_income_monthly: incomeVal || 0,
            monthly_savings: savingsVal || 0,
          });
        }
      }

      toast({ title: "Financial plan created!", description: `${plan.phases?.length || 0} phases generated.` });
      setGoalDesc(""); setTargetAmount(""); setDeadline(""); setCurrentIncome(""); setNotes("");
      setShowCreateModal(false);
      await Promise.all([fetchProjects(), fetchVaultProfile()]);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const deleteProject = async (id: string) => {
    await supabase.from("financial_projects").delete().eq("id", id);
    setProjects(prev => prev.filter(p => p.id !== id));
    if (selectedProject?.id === id) setSelectedProject(null);
    toast({ title: "Plan deleted" });
  };

  const activePlans = projects.filter(p => p.status === "active");
  const totalTasks = projects.reduce((sum, p) => sum + (p.tasks?.length || 0), 0);

  // ─── PROJECT DETAIL VIEW ───
  if (selectedProject) {
    const p = selectedProject;
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => setSelectedProject(null)} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back to Vault
        </Button>

        <div>
          <h1 className="text-xl font-bold">{p.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{p.goal_description}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            {p.target_amount && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> Target: ${p.target_amount.toLocaleString()}</span>}
            {p.deadline && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(new Date(p.deadline), "MMM d, yyyy")}</span>}
            <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
          </div>
        </div>

        {/* Recommendations */}
        {p.recommendations?.length > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> AI Recommendations</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {p.recommendations.map((r, i) => <p key={i} className="text-xs text-muted-foreground">• {r}</p>)}
            </CardContent>
          </Card>
        )}

        {/* Phases & Tasks */}
        {p.phases?.map((phase: any, pi: number) => (
          <Card key={pi}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{phase.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(phase.tasks || []).map((task: any, ti: number) => (
                <div key={ti} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.description}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">{task.priority}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {/* Milestones */}
        {p.milestones?.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Milestones</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {p.milestones.map((m: any, i: number) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <Target className="h-4 w-4 text-primary shrink-0" />
                  <span>{m.title}</span>
                  <span className="text-xs text-muted-foreground ml-auto">~{m.estimated_days_from_start} days</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ─── MAIN VAULT DASHBOARD ───
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Zyquence Vault</h1>
            <p className="text-sm text-muted-foreground">AI-powered financial planning & wealth execution</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateModal(true)} size="sm">
          <Plus className="h-4 w-4 mr-1.5" /> New Plan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Income", value: vaultProfile.total_income_monthly ? `$${vaultProfile.total_income_monthly.toLocaleString()}` : "$0", icon: DollarSign, color: "text-green-500" },
          { label: "Monthly Savings", value: vaultProfile.monthly_savings ? `$${vaultProfile.monthly_savings.toLocaleString()}` : "$0", icon: PiggyBank, color: "text-blue-500" },
          { label: "Active Plans", value: activePlans.length, icon: Target, color: "text-primary" },
          { label: "Financial Tasks", value: totalTasks, icon: BarChart3, color: "text-amber-500" },
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

      {/* Section A — Financial Roadmaps */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Financial Roadmaps</h2>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowCreateModal(true)}>
            <Sparkles className="h-3.5 w-3.5" /> Create Financial Plan with AI
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : projects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <DollarSign className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No financial plans yet. Create one with AI or use a template.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {projects.map(p => (
              <Card key={p.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setSelectedProject(p)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{p.title}</h3>
                        <Badge variant={p.status === "active" ? "default" : "secondary"} className="text-[10px]">{p.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.goal_description}</p>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                        {p.target_amount && <span>${p.target_amount.toLocaleString()} target</span>}
                        {p.deadline && <span>{format(new Date(p.deadline), "MMM d, yyyy")}</span>}
                        <span>{p.tasks?.length || 0} tasks</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}>
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Section B — Templates */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Templates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TEMPLATES.map(t => (
            <Card key={t.title} className="hover:border-primary/30 transition-colors cursor-pointer group" onClick={() => { setGoalDesc(t.goal); setShowCreateModal(true); }}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <t.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium group-hover:text-primary transition-colors">{t.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Section C — Financial Overview */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Financial Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Income Tracking</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={incomeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Savings Progress</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={savingsData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                    {savingsData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Create Financial Plan</DialogTitle>
            <DialogDescription>Describe your financial goal and let AI generate a structured plan.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Financial Goal *</label>
              <Textarea value={goalDesc} onChange={e => setGoalDesc(e.target.value)} placeholder="e.g. Save $10,000 for a down payment in 12 months" rows={3} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Goal Amount ($)</label>
                <Input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="10000" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Deadline</label>
                <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="mt-1" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Current Monthly Income ($)</label>
              <Input type="number" value={currentIncome} onChange={e => setCurrentIncome(e.target.value)} placeholder="4500" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Notes / Constraints</label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any constraints or preferences..." rows={2} className="mt-1" />
            </div>
            <Button onClick={() => generatePlan()} disabled={generating || !goalDesc.trim()} className="w-full">
              {generating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating Plan...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate Plan</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
