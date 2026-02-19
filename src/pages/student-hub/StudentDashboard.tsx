import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Brain, Compass, FileText, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, overdue: 0 });

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const { data } = await supabase
        .from("assignments")
        .select("status, due_date")
        .eq("user_id", user.id);
      if (data) {
        const now = new Date();
        setStats({
          total: data.length,
          pending: data.filter((a) => a.status === "pending").length,
          completed: data.filter((a) => a.status === "completed").length,
          overdue: data.filter((a) => a.status !== "completed" && a.due_date && new Date(a.due_date) < now).length,
        });
      }
    };
    fetchStats();
  }, [user]);

  const quickLinks = [
    { title: "Assignments", desc: "Plan & track your work", icon: BookOpen, path: "/student-hub/assignments", color: "text-blue-500" },
    { title: "Study Assistant", desc: "AI-powered study tools", icon: Brain, path: "/student-hub/study", color: "text-purple-500" },
    { title: "Career Explorer", desc: "Discover career paths", icon: Compass, path: "/student-hub/career", color: "text-emerald-500" },
    { title: "Resume Builder", desc: "Build your resume", icon: FileText, path: "/student-hub/resume", color: "text-amber-500" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Student Hub</h1>
        <p className="text-muted-foreground mt-1">Your academic command center</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Assignments", value: stats.total, icon: BookOpen, color: "text-primary" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-500" },
          { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Overdue", value: stats.overdue, icon: AlertTriangle, color: "text-red-500" },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickLinks.map((link) => (
          <Link key={link.path} to={link.path}>
            <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer group">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-muted ${link.color}`}>
                  <link.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{link.title}</h3>
                  <p className="text-sm text-muted-foreground">{link.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
