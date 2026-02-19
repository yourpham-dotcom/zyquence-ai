import { useState, useEffect, useCallback } from "react";
import {
  GraduationCap, Plus, Trash2, AlertTriangle, CheckCircle2,
  BookOpen, BarChart3, Brain, Loader2, ChevronDown, ChevronRight,
  Sparkles, TrendingUp, Clock, Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Profile {
  id: string; school_name: string; major: string; minor: string | null;
  start_semester: string; start_year: number; expected_graduation_year: number | null;
  total_required_units: number; is_transfer: boolean;
}
interface Semester {
  id: string; semester_name: string; semester_year: number; semester_type: string;
  is_completed: boolean; semester_gpa: number | null; sort_order: number;
}
interface Course {
  id: string; semester_id: string; course_code: string; course_name: string;
  units: number; category: string; grade: string | null; status: string;
  prerequisites: string | null; difficulty: string; notes: string | null;
}

interface Props {
  profileId: string;
  onReset: () => void;
}

export default function AcademicRoadmap({ profileId, onReset }: Props) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [addCourseOpen, setAddCourseOpen] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState({ course_code: "", course_name: "", units: 3, category: "major", difficulty: "medium", prerequisites: "" });
  const [aiInsights, setAiInsights] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [tab, setTab] = useState("roadmap");

  const fetchData = useCallback(async () => {
    if (!user) return;
    const [{ data: p }, { data: s }, { data: c }] = await Promise.all([
      supabase.from("academic_profiles").select("*").eq("id", profileId).single(),
      supabase.from("academic_semesters").select("*").eq("profile_id", profileId).order("sort_order"),
      supabase.from("academic_courses").select("*").eq("user_id", user.id),
    ]);
    if (p) setProfile(p as Profile);
    if (s) {
      setSemesters(s as Semester[]);
      setExpanded(new Set(s.slice(0, 2).map((sem: any) => sem.id)));
    }
    if (c) setCourses(c as Course[]);
  }, [user, profileId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const completedUnits = courses.filter((c) => c.status === "completed").reduce((sum, c) => sum + c.units, 0);
  const totalPlanned = courses.reduce((sum, c) => sum + c.units, 0);
  const progressPct = profile ? Math.min(100, Math.round((completedUnits / profile.total_required_units) * 100)) : 0;
  const remainingUnits = profile ? Math.max(0, profile.total_required_units - completedUnits) : 0;

  const semesterCourses = (semId: string) => courses.filter((c) => c.semester_id === semId);
  const semesterUnits = (semId: string) => semesterCourses(semId).reduce((s, c) => s + c.units, 0);

  const toggleExpand = (id: string) => {
    const next = new Set(expanded);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpanded(next);
  };

  const addCourse = async (semesterId: string) => {
    if (!user || !courseForm.course_code.trim() || !courseForm.course_name.trim()) return;
    const { error } = await supabase.from("academic_courses").insert({
      user_id: user.id,
      semester_id: semesterId,
      course_code: courseForm.course_code.trim(),
      course_name: courseForm.course_name.trim(),
      units: courseForm.units,
      category: courseForm.category,
      difficulty: courseForm.difficulty,
      prerequisites: courseForm.prerequisites.trim() || null,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setCourseForm({ course_code: "", course_name: "", units: 3, category: "major", difficulty: "medium", prerequisites: "" });
    setAddCourseOpen(null);
    fetchData();
  };

  const updateCourseStatus = async (id: string, status: string) => {
    await supabase.from("academic_courses").update({ status }).eq("id", id);
    fetchData();
  };

  const updateCourseGrade = async (id: string, grade: string) => {
    await supabase.from("academic_courses").update({ grade: grade || null }).eq("id", id);
    fetchData();
  };

  const deleteCourse = async (id: string) => {
    await supabase.from("academic_courses").delete().eq("id", id);
    fetchData();
  };

  const deleteProfile = async () => {
    if (!user) return;
    await supabase.from("academic_profiles").delete().eq("id", profileId);
    onReset();
  };

  // Alerts
  const alerts: { type: string; msg: string }[] = [];
  semesters.forEach((sem) => {
    const u = semesterUnits(sem.id);
    if (u > 18) alerts.push({ type: "warning", msg: `${sem.semester_name}: Overloaded (${u} units)` });
    if (u > 0 && u < 9 && sem.semester_type !== "summer") alerts.push({ type: "info", msg: `${sem.semester_name}: Light load (${u} units)` });
  });
  if (remainingUnits > 0 && semesters.filter((s) => !s.is_completed).length > 0) {
    const avgNeeded = Math.ceil(remainingUnits / semesters.filter((s) => !s.is_completed).length);
    if (avgNeeded > 16) alerts.push({ type: "warning", msg: `Need ~${avgNeeded} units/semester to graduate on time` });
  }

  const getAiInsights = async () => {
    setAiLoading(true);
    setAiInsights("");
    try {
      const payload = `Profile: ${profile?.major} at ${profile?.school_name}\nCompleted: ${completedUnits}/${profile?.total_required_units} units\nSemesters:\n${semesters.map((s) => {
        const sc = semesterCourses(s.id);
        return `${s.semester_name} (${s.is_completed ? "done" : "upcoming"}): ${sc.map((c) => `${c.course_code} ${c.course_name} [${c.difficulty}] ${c.status} ${c.grade || ""}`).join(", ") || "empty"}`;
      }).join("\n")}`;

      const resp = await supabase.functions.invoke("student-ai", {
        body: { mode: "gpa_strategy", text: payload },
      });
      if (resp.error) throw resp.error;
      setAiInsights(resp.data?.result || "No insights generated.");
      setTab("insights");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    planned: "bg-muted text-muted-foreground",
    in_progress: "bg-blue-500/20 text-blue-500",
    completed: "bg-emerald-500/20 text-emerald-500",
    dropped: "bg-orange-500/20 text-orange-500",
    failed: "bg-red-500/20 text-red-500",
  };

  const difficultyIcon: Record<string, string> = { easy: "🟢", medium: "🟡", hard: "🔴" };

  if (!profile) return null;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />Academic Blueprint
          </h1>
          <p className="text-muted-foreground text-sm">{profile.major}{profile.minor ? ` · Minor: ${profile.minor}` : ""} — {profile.school_name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={getAiInsights} disabled={aiLoading}>
            {aiLoading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Brain className="h-3 w-3 mr-1" />}AI Insights
          </Button>
          <Button variant="ghost" size="sm" onClick={deleteProfile} className="text-destructive">Reset</Button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card border-border"><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><Target className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Progress</span></div>
          <p className="text-2xl font-bold text-foreground">{progressPct}%</p>
          <Progress value={progressPct} className="h-1.5 mt-1" />
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><CheckCircle2 className="h-4 w-4 text-emerald-500" /><span className="text-xs text-muted-foreground">Completed</span></div>
          <p className="text-2xl font-bold text-foreground">{completedUnits} <span className="text-sm text-muted-foreground">units</span></p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><Clock className="h-4 w-4 text-yellow-500" /><span className="text-xs text-muted-foreground">Remaining</span></div>
          <p className="text-2xl font-bold text-foreground">{remainingUnits} <span className="text-sm text-muted-foreground">units</span></p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-blue-500" /><span className="text-xs text-muted-foreground">Planned</span></div>
          <p className="text-2xl font-bold text-foreground">{totalPlanned} <span className="text-sm text-muted-foreground">units</span></p>
        </CardContent></Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="bg-card border-border border-l-4 border-l-yellow-500">
          <CardContent className="p-4 space-y-1">
            {alerts.map((a, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                <span className="text-foreground">{a.msg}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* ROADMAP TAB */}
        <TabsContent value="roadmap" className="space-y-3 mt-4">
          {semesters.map((sem) => {
            const sc = semesterCourses(sem.id);
            const units = semesterUnits(sem.id);
            const isOpen = expanded.has(sem.id);

            return (
              <Card key={sem.id} className={`bg-card border-border ${sem.is_completed ? "opacity-70" : ""}`}>
                <CardHeader className="p-4 pb-2 cursor-pointer" onClick={() => toggleExpand(sem.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                      <CardTitle className="text-sm font-semibold">{sem.semester_name}</CardTitle>
                      <Badge variant="outline" className="text-xs">{units} units</Badge>
                      {units > 18 && <Badge variant="destructive" className="text-xs">Heavy</Badge>}
                      {sem.is_completed && <Badge className="bg-emerald-500/20 text-emerald-500 text-xs">Done</Badge>}
                    </div>
                    <Dialog open={addCourseOpen === sem.id} onOpenChange={(o) => setAddCourseOpen(o ? sem.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}><Plus className="h-3 w-3 mr-1" />Add Course</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-sm" onClick={(e) => e.stopPropagation()}>
                        <DialogHeader><DialogTitle>Add Course to {sem.semester_name}</DialogTitle></DialogHeader>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div><Label>Code *</Label><Input value={courseForm.course_code} onChange={(e) => setCourseForm({ ...courseForm, course_code: e.target.value })} placeholder="CS 101" /></div>
                            <div><Label>Units</Label><Input type="number" value={courseForm.units} onChange={(e) => setCourseForm({ ...courseForm, units: Number(e.target.value) })} /></div>
                          </div>
                          <div><Label>Name *</Label><Input value={courseForm.course_name} onChange={(e) => setCourseForm({ ...courseForm, course_name: e.target.value })} placeholder="Intro to Computer Science" /></div>
                          <div className="grid grid-cols-2 gap-2">
                            <div><Label>Category</Label>
                              <Select value={courseForm.category} onValueChange={(v) => setCourseForm({ ...courseForm, category: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="major">Major</SelectItem>
                                  <SelectItem value="minor">Minor</SelectItem>
                                  <SelectItem value="ge">Gen Ed</SelectItem>
                                  <SelectItem value="elective">Elective</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div><Label>Difficulty</Label>
                              <Select value={courseForm.difficulty} onValueChange={(v) => setCourseForm({ ...courseForm, difficulty: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="easy">Easy</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="hard">Hard</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div><Label>Prerequisites</Label><Input value={courseForm.prerequisites} onChange={(e) => setCourseForm({ ...courseForm, prerequisites: e.target.value })} placeholder="e.g. MATH 101" /></div>
                          <Button onClick={() => addCourse(sem.id)} className="w-full">Add Course</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                {isOpen && sc.length > 0 && (
                  <CardContent className="p-4 pt-0 space-y-1.5">
                    {sc.map((c) => (
                      <div key={c.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 group">
                        <span className="text-xs">{difficultyIcon[c.difficulty]}</span>
                        <span className="font-mono text-xs text-muted-foreground w-16 shrink-0">{c.course_code}</span>
                        <span className="text-sm text-foreground flex-1 truncate">{c.course_name}</span>
                        <Badge variant="outline" className="text-[10px]">{c.units}u</Badge>
                        <Badge variant="outline" className="text-[10px]">{c.category}</Badge>
                        <Select value={c.status} onValueChange={(v) => updateCourseStatus(c.id, v)}>
                          <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planned">Planned</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="dropped">Dropped</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Grade"
                          value={c.grade || ""}
                          onChange={(e) => updateCourseGrade(c.id, e.target.value)}
                          className="w-16 h-7 text-xs text-center"
                        />
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => deleteCourse(c.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                )}
                {isOpen && sc.length === 0 && (
                  <CardContent className="p-4 pt-0">
                    <p className="text-xs text-muted-foreground text-center py-2">No courses added yet</p>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />Units per Semester</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {semesters.map((sem) => {
                  const u = semesterUnits(sem.id);
                  return (
                    <div key={sem.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{sem.semester_name}</span>
                        <span className="text-foreground font-medium">{u} units</span>
                      </div>
                      <Progress value={Math.min(100, (u / 18) * 100)} className="h-1.5" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" />Course Breakdown</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {["major", "minor", "ge", "elective"].map((cat) => {
                  const count = courses.filter((c) => c.category === cat).length;
                  const units = courses.filter((c) => c.category === cat).reduce((s, c) => s + c.units, 0);
                  if (count === 0) return null;
                  return (
                    <div key={cat} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{cat === "ge" ? "Gen Ed" : cat}</span>
                      <span className="text-foreground">{count} courses · {units} units</span>
                    </div>
                  );
                })}
                <div className="border-t border-border pt-2 flex items-center justify-between text-sm font-medium">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-foreground">{courses.length} courses · {totalPlanned} units</span>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Graduation Estimate</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Progress value={progressPct} className="h-3" />
                </div>
                <span className="text-lg font-bold text-primary">{progressPct}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{completedUnits} of {profile?.total_required_units} units completed · {remainingUnits} remaining</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI INSIGHTS TAB */}
        <TabsContent value="insights" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />AI Academic Insights</CardTitle>
            </CardHeader>
            <CardContent>
              {aiInsights ? (
                <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{aiInsights}</div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm mb-3">Click "AI Insights" to get personalized academic recommendations</p>
                  <Button onClick={getAiInsights} disabled={aiLoading} variant="outline">
                    {aiLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}Generate Insights
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground text-center mt-3">⚠️ Recommendations are guidance only. Students should verify requirements with their academic institution.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
