import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Shield, Target, BarChart3, Zap } from "lucide-react";

const metrics = [
  { icon: Target, label: "Idea Score", value: 82, color: "text-emerald-400" },
  { icon: TrendingUp, label: "Market Potential", value: 75, color: "text-blue-400" },
  { icon: BarChart3, label: "Execution Complexity", value: 45, color: "text-amber-400" },
  { icon: Shield, label: "Risk Level", value: 30, color: "text-rose-400" },
  { icon: Zap, label: "Trend Alignment", value: 91, color: "text-violet-400" },
];

const insightCards = [
  { title: "Strong Market Fit", desc: "This idea aligns with 3 emerging market trends in the AI/SaaS space. Early mover advantage is estimated at 18 months." },
  { title: "Low Technical Risk", desc: "Core technology stack is well-established. Primary risk lies in market adoption timing." },
  { title: "Recommended Pivot", desc: "Consider narrowing the target audience to mid-market companies for faster initial traction." },
];

const CIIdeaAnalysis = () => (
  <div className="space-y-8 animate-fade-in">
    <div>
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Idea Analysis</h1>
      <p className="text-muted-foreground mt-1 text-sm">AI-powered evaluation of your idea's potential.</p>
    </div>

    <Card className="bg-card/60 backdrop-blur border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">AI-Powered Content Pipeline</h2>
            <p className="text-xs text-muted-foreground mt-1">Analysis completed • 2 minutes ago</p>
          </div>
          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">High Potential</Badge>
        </div>

        <div className="space-y-5">
          {metrics.map((m) => (
            <div key={m.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <m.icon className={`h-4 w-4 ${m.color}`} />
                  <span className="text-sm font-medium text-foreground">{m.label}</span>
                </div>
                <span className="text-sm font-mono font-semibold text-foreground">{m.value}/100</span>
              </div>
              <Progress value={m.value} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">AI Evaluation</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insightCards.map((c) => (
          <Card key={c.title} className="bg-card/60 backdrop-blur border-border/50">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-foreground mb-2">{c.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

export default CIIdeaAnalysis;
