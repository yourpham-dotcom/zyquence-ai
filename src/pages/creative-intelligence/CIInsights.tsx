import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertTriangle, TrendingUp, Zap, Target } from "lucide-react";

const insights = [
  { icon: AlertTriangle, title: "Bottleneck: Design Review", desc: "Design review stage is 2.5x slower than average. Consider adding a parallel review track or reducing approval layers.", type: "Bottleneck", color: "text-amber-400" },
  { icon: TrendingUp, title: "Productivity Up 23%", desc: "Team velocity increased 23% over the last 2 weeks. Automation in content generation is the primary driver.", type: "Trend", color: "text-emerald-400" },
  { icon: Zap, title: "Optimization: Merge Stages", desc: "Research and Design stages share 60% of the same resources. Merging could save 8 hours/week.", type: "Optimization", color: "text-violet-400" },
  { icon: Target, title: "Predicted Outcome", desc: "At current velocity, the AI Content Pipeline project will complete 5 days ahead of schedule.", type: "Prediction", color: "text-blue-400" },
  { icon: Brain, title: "Strategy Refinement", desc: "Market conditions suggest pivoting the launch strategy from B2C to B2B for 40% higher conversion potential.", type: "Strategy", color: "text-rose-400" },
  { icon: TrendingUp, title: "Resource Reallocation", desc: "Automation freed up 12h/week of developer time. Recommended reallocation to the Analytics stage.", type: "Suggestion", color: "text-teal-400" },
];

const CIInsights = () => (
  <div className="space-y-8 animate-fade-in">
    <div>
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Insights & Intelligence</h1>
      <p className="text-muted-foreground mt-1 text-sm">AI-generated insights to optimize your strategies and workflows.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {insights.map((ins) => (
        <Card key={ins.title} className="bg-card/60 backdrop-blur border-border/50 hover:border-border/80 transition-all">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <ins.icon className={`h-4 w-4 ${ins.color}`} />
              <Badge variant="outline" className="text-xs">{ins.type}</Badge>
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-2">{ins.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{ins.desc}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default CIInsights;
