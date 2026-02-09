import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, BarChart3, FlaskConical, Trophy, Briefcase, Upload, Code, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import ProGate from "@/components/ProGate";

const DataIntelligence = () => {
  const { isPro, loading: subLoading } = useSubscription();
  const [stats, setStats] = useState({
    datasetsCount: 0,
    queriesCount: 0,
    dashboardsCount: 0,
    experimentsCount: 0,
    totalXP: 0,
    level: 1,
    missionsCompleted: 0
  });

  useEffect(() => {
    if (isPro) {
      loadStats();
    }
  }, [isPro]);

  if (subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isPro) {
    return <ProGate />;
  }

  const loadStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [datasets, queries, dashboards, experiments, userStats] = await Promise.all([
      supabase.from("di_datasets").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("di_sql_queries").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("di_dashboards").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("di_experiments").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("di_user_stats").select("*").eq("user_id", user.id).maybeSingle()
    ]);

    setStats({
      datasetsCount: datasets.count || 0,
      queriesCount: queries.count || 0,
      dashboardsCount: dashboards.count || 0,
      experimentsCount: experiments.count || 0,
      totalXP: userStats.data?.total_xp || 0,
      level: userStats.data?.level || 1,
      missionsCompleted: userStats.data?.missions_completed || 0
    });
  };

  const features = [
    {
      icon: Upload,
      title: "Data Upload",
      description: "Upload and clean CSV datasets",
      path: "/data-intelligence/upload",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Code,
      title: "SQL Lab",
      description: "Practice SQL with real datasets",
      path: "/data-intelligence/sql-lab",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: BarChart3,
      title: "Visualizer",
      description: "Build interactive dashboards",
      path: "/data-intelligence/visualizer",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: FlaskConical,
      title: "A/B Testing",
      description: "Run statistical experiments",
      path: "/data-intelligence/experiments",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Trophy,
      title: "Missions",
      description: "Complete data challenges",
      path: "/data-intelligence/missions",
      color: "from-yellow-500 to-amber-500"
    },
    {
      icon: Briefcase,
      title: "Portfolio",
      description: "Showcase your work",
      path: "/data-intelligence/portfolio",
      color: "from-indigo-500 to-violet-500"
    }
  ];

  return (
    <div className="h-screen bg-background overflow-y-auto">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
              <Database className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Data Intelligence</h1>
              <p className="text-muted-foreground">Master data analysis, SQL, and visualization</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-border/50">
            <p className="text-sm text-muted-foreground">Level</p>
            <p className="text-3xl font-bold">{stats.level}</p>
          </Card>
          <Card className="p-4 border-border/50">
            <p className="text-sm text-muted-foreground">Total XP</p>
            <p className="text-3xl font-bold">{stats.totalXP}</p>
          </Card>
          <Card className="p-4 border-border/50">
            <p className="text-sm text-muted-foreground">Missions</p>
            <p className="text-3xl font-bold">{stats.missionsCompleted}</p>
          </Card>
          <Card className="p-4 border-border/50">
            <p className="text-sm text-muted-foreground">Datasets</p>
            <p className="text-3xl font-bold">{stats.datasetsCount}</p>
          </Card>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link key={feature.path} to={feature.path}>
              <Card className="group relative overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 h-full">
                <div className="p-6 space-y-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                  <Button variant="ghost" className="w-full group-hover:bg-muted">
                    Launch →
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataIntelligence;
