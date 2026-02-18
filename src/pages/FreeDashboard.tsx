import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  Palette,
  Globe,
  ArrowRight,
  LogOut,
  Loader2,
  Crown,
  Lock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const FreeDashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  if (authLoading) {
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
      icon: Globe,
      title: "Zyquence Atlas",
      description: "Lifestyle planning, city planner, scenario view, and reset tools",
      path: "/studio",
      color: "from-emerald-500 to-teal-500",
    },
  ];

  const proModules = [
    { title: "Data Intelligence", description: "SQL lab, datasets, visualizations, A/B testing" },
    { title: "Gaming Engine", description: "Mental wellness, code practice, sports arena" },
    { title: "AI Builder", description: "Build custom AI-powered tools and workflows" },
    { title: "Artist Intelligence", description: "AI-powered music identity and branding" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-10 max-w-5xl space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Free Plan
            </span>
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

        {/* Pro Upsell */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Unlock with Pro</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {proModules.map((mod) => (
              <Card key={mod.title} className="border-border/30 opacity-60">
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">{mod.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {mod.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button asChild className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
              <Link to="/pricing">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Pro — $19.99/mo
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeDashboard;
