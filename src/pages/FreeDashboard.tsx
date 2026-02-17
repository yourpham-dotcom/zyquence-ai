import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import {
  Palette,
  Cpu,
  ArrowRight,
  LogOut,
  Loader2,
  Crown,
  Sparkles,
} from "lucide-react";
import { useEffect } from "react";

const FreeDashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isPro, loading: subLoading } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
    if (!authLoading && !subLoading && isPro) {
      navigate("/pro-dashboard", { replace: true });
    }
  }, [authLoading, subLoading, user, isPro, navigate]);

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const freeModules = [
    {
      icon: Palette,
      title: "Studio",
      description: "Music, photo, video, code editor, and AI-powered creative tools",
      path: "/studio",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Cpu,
      title: "AI Builder",
      description: "Build and export custom AI-powered tools and workflows",
      path: "/ai-builder",
      color: "from-indigo-500 to-violet-500",
    },
  ];

  const proModules = [
    { title: "Data Intelligence", description: "SQL lab, datasets, visualizations, A/B testing, and missions" },
    { title: "Gaming Engine", description: "Mental wellness, code practice, sports arena, and creative tools" },
    { title: "Artist Intelligence", description: "AI-powered music identity, branding, and career direction" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-10 max-w-5xl space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
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

        {/* Free Modules */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Tools</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {freeModules.map((mod) => (
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

        {/* Upgrade CTA */}
        <div>
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <h2 className="text-lg font-semibold text-foreground">Upgrade to Pro</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Unlock premium modules and take your creative journey to the next level.
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                {proModules.map((mod) => (
                  <div key={mod.title} className="flex items-start gap-2 p-3 rounded-lg bg-background/50">
                    <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{mod.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{mod.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button asChild className="mt-2">
                <Link to="/pricing">
                  <Crown className="h-4 w-4 mr-2" />
                  View Plans
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FreeDashboard;
