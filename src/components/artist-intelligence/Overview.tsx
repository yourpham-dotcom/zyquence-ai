import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Fingerprint, Music2, Gauge, Map, MessageSquare, ArrowRightLeft, Sparkles } from "lucide-react";
import type { AIModule } from "./AISidebar";

interface OverviewProps {
  profile: any;
  identity: any;
  readiness: any;
  onNavigate: (module: AIModule) => void;
}

const Overview = ({ profile, identity, readiness, onNavigate }: OverviewProps) => {
  const hasProfile = !!profile;
  const score = readiness?.overall_score || 0;
  const circumference = 2 * Math.PI * 40;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-full">
      {/* Welcome */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">
          {hasProfile ? `Welcome back${profile.stage_name ? `, ${profile.stage_name}` : ""}` : "Artist Intelligence Engine"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {hasProfile ? "Your creative intelligence dashboard" : "Build your music identity with AI-powered guidance"}
        </p>
      </div>

      {!hasProfile ? (
        <Card className="border-primary/20">
          <CardContent className="py-8 flex flex-col items-center gap-4">
            <Sparkles className="h-10 w-10 text-primary" />
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-foreground">Get Started</h2>
              <p className="text-sm text-muted-foreground">Create your creator profile to unlock all modules</p>
            </div>
            <Button onClick={() => onNavigate("profile")} size="lg">Create Profile</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Archetype */}
            <Card>
              <CardContent className="py-4 text-center">
                <Fingerprint className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Archetype</p>
                <p className="text-sm font-bold text-foreground mt-1">{identity?.archetype || "Not analyzed"}</p>
              </CardContent>
            </Card>

            {/* Readiness */}
            <Card>
              <CardContent className="py-4 flex flex-col items-center">
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
                      strokeDasharray={circumference} strokeDashoffset={dashOffset}
                      strokeLinecap="round" className="transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-foreground">{score || "—"}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Readiness Score</p>
              </CardContent>
            </Card>

            {/* Profile Info */}
            <Card>
              <CardContent className="py-4 text-center space-y-2">
                <p className="text-xs text-muted-foreground">Profile</p>
                <Badge variant="secondary">{profile.background || "Creator"}</Badge>
                <Badge variant="outline" className="ml-1">{profile.experience_level}</Badge>
                <div className="flex flex-wrap justify-center gap-1 mt-1">
                  {profile.preferred_genres?.slice(0, 3).map((g: string) => (
                    <Badge key={g} variant="outline" className="text-[10px]">{g}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { id: "identity" as AIModule, label: "Identity Analysis", icon: Fingerprint },
              { id: "sound" as AIModule, label: "Sound Direction", icon: Music2 },
              { id: "translator" as AIModule, label: "Translator", icon: ArrowRightLeft },
              { id: "readiness" as AIModule, label: "Readiness Score", icon: Gauge },
              { id: "strategy" as AIModule, label: "Strategy", icon: Map },
              { id: "feedback" as AIModule, label: "Feedback Coach", icon: MessageSquare },
            ].map(item => (
              <Card key={item.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => onNavigate(item.id)}>
                <CardContent className="py-4 flex flex-col items-center gap-2">
                  <item.icon className="h-5 w-5 text-primary" />
                  <span className="text-xs font-medium text-foreground text-center">{item.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Overview;
