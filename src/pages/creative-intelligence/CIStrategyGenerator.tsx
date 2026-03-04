import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Clock, Users, DollarSign, CheckCircle2 } from "lucide-react";

const steps = [
  { phase: "Phase 1", title: "Market Research & Validation", duration: "2 weeks", status: "completed" },
  { phase: "Phase 2", title: "MVP Design & Prototyping", duration: "3 weeks", status: "current" },
  { phase: "Phase 3", title: "Development Sprint", duration: "6 weeks", status: "upcoming" },
  { phase: "Phase 4", title: "Beta Launch & Feedback", duration: "2 weeks", status: "upcoming" },
  { phase: "Phase 5", title: "Public Launch & Scale", duration: "4 weeks", status: "upcoming" },
];

const resources = [
  { icon: Users, label: "Team Size", value: "4-6 people" },
  { icon: Clock, label: "Total Timeline", value: "17 weeks" },
  { icon: DollarSign, label: "Est. Budget", value: "$45,000 – $75,000" },
];

const CIStrategyGenerator = () => (
  <div className="space-y-8 animate-fade-in">
    <div>
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Strategy Generator</h1>
      <p className="text-muted-foreground mt-1 text-sm">AI-generated strategies from your analyzed ideas.</p>
    </div>

    {/* Overview */}
    <Card className="bg-card/60 backdrop-blur border-border/50">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Strategy: AI-Powered Content Pipeline</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Build an automated content pipeline leveraging AI to generate, optimize, and distribute content across channels.
          Focus on mid-market SaaS companies with content teams of 3-10 people.
        </p>
      </CardContent>
    </Card>

    {/* Step-by-step Plan */}
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">Step-by-Step Plan</h2>
      <div className="space-y-3">
        {steps.map((s, i) => (
          <Card key={i} className="bg-card/60 backdrop-blur border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                s.status === "completed" ? "bg-emerald-500/20 text-emerald-400" :
                s.status === "current" ? "bg-primary/20 text-primary" :
                "bg-muted text-muted-foreground"
              }`}>
                {s.status === "completed" ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium">{s.phase}</p>
                <p className="text-sm font-semibold text-foreground">{s.title}</p>
              </div>
              <Badge variant="outline" className="shrink-0 text-xs">{s.duration}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>

    {/* Resources */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {resources.map((r) => (
        <Card key={r.label} className="bg-card/60 backdrop-blur border-border/50">
          <CardContent className="p-5 flex items-center gap-3">
            <r.icon className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">{r.label}</p>
              <p className="text-sm font-semibold text-foreground">{r.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <Button className="gap-2">
      <GitBranch className="h-4 w-4" /> Generate Workflow
    </Button>
  </div>
);

export default CIStrategyGenerator;
