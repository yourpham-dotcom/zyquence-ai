import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
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

const WorkspaceDashboard = () => {
  const { user } = useAuth();
  const { isPro } = useSubscription();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {isPro && <Crown className="h-4 w-4 text-yellow-500" />}
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {isPro ? "Pro Plan" : "Free Plan"}
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'hsl(222, 47%, 11%)' }}>
          Welcome back
        </h1>
        <p className="text-sm" style={{ color: 'hsl(215, 20%, 45%)' }}>{user?.email}</p>
      </div>

      {/* Personalized News Feed */}
      <ZyquenceNewsFeed isPro={isPro} />

      {/* Quick Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/dashboard/calendar">
          <Card className="group hover:shadow-md transition-all duration-200 h-full">
            <CardContent className="p-4">
              <CalendarDays className="h-5 w-5 mb-2 text-blue-500" />
              <h3 className="text-sm font-semibold" style={{ color: 'hsl(222, 47%, 11%)' }}>Calendar</h3>
              <p className="text-xs mt-0.5" style={{ color: 'hsl(215, 20%, 45%)' }}>3 events today</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/dashboard/finance">
          <Card className="group hover:shadow-md transition-all duration-200 h-full">
            <CardContent className="p-4">
              <DollarSign className="h-5 w-5 mb-2 text-emerald-500" />
              <h3 className="text-sm font-semibold" style={{ color: 'hsl(222, 47%, 11%)' }}>Finance</h3>
              <p className="text-xs mt-0.5" style={{ color: 'hsl(215, 20%, 45%)' }}>Track spending</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/dashboard/goals">
          <Card className="group hover:shadow-md transition-all duration-200 h-full">
            <CardContent className="p-4">
              <Target className="h-5 w-5 mb-2 text-orange-500" />
              <h3 className="text-sm font-semibold" style={{ color: 'hsl(222, 47%, 11%)' }}>Goals</h3>
              <p className="text-xs mt-0.5" style={{ color: 'hsl(215, 20%, 45%)' }}>4 active goals</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/dashboard/assistant">
          <Card className="group hover:shadow-md transition-all duration-200 h-full">
            <CardContent className="p-4">
              <Sparkles className="h-5 w-5 mb-2 text-purple-500" />
              <h3 className="text-sm font-semibold" style={{ color: 'hsl(222, 47%, 11%)' }}>AI Suggestions</h3>
              <p className="text-xs mt-0.5" style={{ color: 'hsl(215, 20%, 45%)' }}>Personalized tips</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Your Tools */}
      <div>
        <h2 className="text-base font-semibold mb-3" style={{ color: 'hsl(222, 47%, 11%)' }}>Your Tools</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link to="/studio">
            <Card className="group hover:shadow-md transition-all duration-200 h-full">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shrink-0">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm" style={{ color: 'hsl(222, 47%, 11%)' }}>Studio</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'hsl(215, 20%, 45%)' }}>Music, photo, video, code & creative tools</p>
                </div>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" style={{ color: 'hsl(215, 20%, 45%)' }} />
              </CardContent>
            </Card>
          </Link>
          <Link to="/studio">
            <Card className="group hover:shadow-md transition-all duration-200 h-full">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm" style={{ color: 'hsl(222, 47%, 11%)' }}>Zyquence Atlas</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'hsl(215, 20%, 45%)' }}>Lifestyle planning & city planner</p>
                </div>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" style={{ color: 'hsl(215, 20%, 45%)' }} />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Pro Modules */}
      <div>
        <h2 className="text-base font-semibold mb-3" style={{ color: 'hsl(222, 47%, 11%)' }}>Pro Modules</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: Database, title: "Data Intelligence", description: "SQL lab, datasets, visualizations", path: "/data-intelligence", color: "from-blue-500 to-cyan-500" },
            { icon: Gamepad2, title: "Gaming Engine", description: "Wellness, code practice, sports", path: "/gaming-intelligence", color: "from-purple-500 to-pink-500" },
            { icon: Cpu, title: "AI Builder", description: "Build custom AI tools", path: "/ai-builder", color: "from-indigo-500 to-violet-500" },
            { icon: Music, title: "Artist Intelligence", description: "AI music identity & branding", path: "/artist-intelligence", color: "from-fuchsia-500 to-rose-500" },
          ].map((mod) => (
            <Link key={mod.title} to={isPro ? mod.path : "/pricing"}>
              <Card className="group hover:shadow-md transition-all duration-200 h-full">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${mod.color} flex items-center justify-center shrink-0`}>
                    <mod.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm" style={{ color: 'hsl(222, 47%, 11%)' }}>{mod.title}</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'hsl(215, 20%, 45%)' }}>{mod.description}</p>
                  </div>
                  {isPro ? (
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" style={{ color: 'hsl(215, 20%, 45%)' }} />
                  ) : (
                    <Lock className="h-3.5 w-3.5 shrink-0 mt-1" style={{ color: 'hsl(215, 20%, 45%)' }} />
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
