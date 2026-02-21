import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useEliteAccess } from "@/hooks/useEliteAccess";
import {
  Crown,
  ArrowLeft,
  Loader2,
  Shield,
  Zap,
  Database,
  Gamepad2,
  Cpu,
  Music,
  Palette,
  Globe,
  ArrowRight,
  Star,
} from "lucide-react";
import { useEffect } from "react";

const EliteDashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isElite, loading: eliteLoading } = useEliteAccess();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !eliteLoading) {
      if (!user) {
        navigate("/auth");
      } else if (!isElite) {
        navigate("/dashboard");
      }
    }
  }, [authLoading, eliteLoading, user, isElite, navigate]);

  if (authLoading || eliteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isElite) return null;

  const eliteModules = [
    {
      icon: Database,
      title: "Data Intelligence",
      description: "SQL lab, datasets, visualizations, A/B testing, and missions",
      path: "/data-intelligence",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Gamepad2,
      title: "Gaming Engine",
      description: "Mental wellness, code practice, sports arena, and creative tools",
      path: "/gaming-intelligence",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Palette,
      title: "Studio",
      description: "Music, photo, video, code editor, and AI-powered creative tools",
      path: "/studio",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Globe,
      title: "Zyquence Atlas",
      description: "Lifestyle planning, city planner, scenario view, and reset tools",
      path: "/studio",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Cpu,
      title: "AI Builder",
      description: "Build and export custom AI-powered tools and workflows",
      path: "/ai-builder",
      color: "from-indigo-500 to-violet-500",
    },
    {
      icon: Music,
      title: "Artist Intelligence",
      description: "AI-powered music identity, branding, and career direction",
      path: "/artist-intelligence",
      color: "from-fuchsia-500 to-rose-500",
    },
  ];

  const elitePerks = [
    { icon: Shield, label: "Priority Support" },
    { icon: Zap, label: "Early Access Features" },
    { icon: Star, label: "Exclusive Tools" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-10 max-w-5xl space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30">
                <Crown className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Elite
                </span>
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome back, Elite
            </h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">Home</Link>
            </Button>
          </div>
        </div>

        {/* Elite Perks Banner */}
        <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-yellow-500/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-6 flex-wrap">
              <h3 className="text-sm font-semibold text-amber-400">Elite Perks</h3>
              {elitePerks.map((perk) => (
                <div key={perk.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <perk.icon className="h-4 w-4 text-amber-400/70" />
                  <span>{perk.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Module Grid */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">All Modules</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {eliteModules.map((mod) => (
              <Link key={mod.title} to={mod.path}>
                <Card className="group h-full border-border/50 hover:border-amber-500/40 transition-all duration-200 overflow-hidden">
                  <div className="p-5 space-y-4">
                    <div
                      className={`w-11 h-11 rounded-lg bg-gradient-to-br ${mod.color} flex items-center justify-center`}
                    >
                      <mod.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{mod.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {mod.description}
                      </p>
                    </div>
                    <div className="flex items-center text-xs font-medium text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Open <ArrowRight className="h-3 w-3 ml-1" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EliteDashboard;
