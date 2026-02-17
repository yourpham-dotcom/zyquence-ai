import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import {
  Database,
  Gamepad2,
  Palette,
  Globe,
  Cpu,
  Music,
  ArrowRight,
  LogOut,
  Loader2,
  Crown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const ProDashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isPro, loading: subLoading } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, subLoading, user, isPro, navigate]);

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const modules = [
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
      tag: "atlas",
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-10 max-w-5xl space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-yellow-500">
                Pro
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">Home</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>

        {/* Module Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod) => (
            <Link key={mod.title} to={mod.path}>
              <Card className="group h-full border-border/50 hover:border-primary/40 transition-all duration-200 overflow-hidden">
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
                  <div className="flex items-center text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Open <ArrowRight className="h-3 w-3 ml-1" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProDashboard;
