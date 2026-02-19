import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import ZyquenceNewsFeed from "@/components/workspace/ZyquenceNewsFeed";
import {
  CalendarDays,
  DollarSign,
  Target,
  Sparkles,
  Palette,
  Globe,
  Database,
  Gamepad2,
  Cpu,
  Music,
  ArrowRight,
  Lock,
  Crown,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const WorkspaceDashboard = () => {
  const { user } = useAuth();
  const { isPro } = useSubscription();

  const quickCards = [
    {
      title: "Calendar",
      description: "3 events today",
      icon: CalendarDays,
      path: "/dashboard/calendar",
      gradient: "from-blue-500/10 to-cyan-500/10",
      iconColor: "text-blue-500",
    },
    {
      title: "Finance",
      description: "Track spending",
      icon: DollarSign,
      path: "/dashboard/finance",
      gradient: "from-emerald-500/10 to-green-500/10",
      iconColor: "text-emerald-500",
    },
    {
      title: "Goals",
      description: "4 active goals",
      icon: Target,
      path: "/dashboard/goals",
      gradient: "from-orange-500/10 to-amber-500/10",
      iconColor: "text-orange-500",
    },
    {
      title: "AI Suggestions",
      description: "Personalized tips",
      icon: Sparkles,
      path: "/dashboard/assistant",
      gradient: "from-purple-500/10 to-pink-500/10",
      iconColor: "text-purple-500",
    },
  ];

  const tools = [
    { icon: Palette, title: "Studio", description: "Music, photo, video, code & creative tools", path: "/studio", color: "from-orange-500 to-red-500" },
    { icon: Globe, title: "Zyquence Atlas", description: "Lifestyle planning & city planner", path: "/studio", color: "from-emerald-500 to-teal-500" },
  ];

  const proModules = [
    { icon: Database, title: "Data Intelligence", description: "SQL lab, datasets, visualizations", path: "/data-intelligence", color: "from-blue-500 to-cyan-500" },
    { icon: Gamepad2, title: "Gaming Engine", description: "Wellness, code practice, sports", path: "/gaming-intelligence", color: "from-purple-500 to-pink-500" },
    { icon: Cpu, title: "AI Builder", description: "Build custom AI tools", path: "/ai-builder", color: "from-indigo-500 to-violet-500" },
    { icon: Music, title: "Artist Intelligence", description: "AI music identity & branding", path: "/artist-intelligence", color: "from-fuchsia-500 to-rose-500" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {isPro && <Crown className="h-4 w-4 text-yellow-500" />}
          <span className={cn(
            "text-xs font-semibold uppercase tracking-wider",
            isPro ? "text-yellow-500" : "text-muted-foreground"
          )}>
            {isPro ? "Pro Plan" : "Free Plan"}
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>

      {/* Personalized News Feed */}
      <ZyquenceNewsFeed isPro={isPro} />

      {/* Quick Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickCards.map((card) => (
          <Link key={card.title} to={card.path}>
            <Card className="group border-border/50 hover:border-primary/30 transition-all duration-200 overflow-hidden h-full dark:bg-background dark:border-border/30">
              <CardContent className={cn("p-4 bg-gradient-to-br dark:bg-none", card.gradient)}>
                <card.icon className={cn("h-5 w-5 mb-2", card.iconColor)} />
                <h3 className="text-sm font-semibold text-foreground">{card.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{card.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Your Tools */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Your Tools</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <Link key={tool.title} to={tool.path}>
              <Card className="group border-border/50 hover:border-primary/30 transition-all duration-200 overflow-hidden h-full">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center shrink-0`}>
                    <tool.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm">{tool.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{tool.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Pro Modules */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">
          {isPro ? "Pro Modules" : "Pro Modules"}
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {proModules.map((mod) => (
            <Link key={mod.title} to={isPro ? mod.path : "/pricing"}>
              <Card className="group border-border/50 hover:border-primary/30 transition-all duration-200 overflow-hidden h-full">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${mod.color} flex items-center justify-center shrink-0`}>
                    <mod.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm">{mod.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{mod.description}</p>
                  </div>
                  {isPro ? (
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1" />
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        {!isPro && (
          <div className="mt-4 text-center">
            <Button asChild size="sm" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
              <Link to="/pricing">
                <Crown className="h-3.5 w-3.5 mr-1.5" />
                Upgrade to Pro — $19.99/mo
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceDashboard;
