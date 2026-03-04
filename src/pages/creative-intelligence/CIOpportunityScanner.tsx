import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Radar, TrendingUp, Zap } from "lucide-react";

const opportunities = [
  { title: "AI Video Generation Market", confidence: 92, impact: "High", action: "Launch video module by Q3 to capture early market share.", category: "Market Trend" },
  { title: "TikTok Creator Economy Shift", confidence: 78, impact: "Medium", action: "Build creator-focused workflow templates targeting short-form content.", category: "Social Trend" },
  { title: "Enterprise AI Budget Surge", confidence: 88, impact: "High", action: "Position as enterprise AI workflow solution. Create case studies.", category: "Business" },
  { title: "No-Code Automation Demand", confidence: 85, impact: "High", action: "Add visual no-code builder to workflow engine.", category: "Market Trend" },
  { title: "Remote Team Collaboration Tools", confidence: 71, impact: "Medium", action: "Integrate real-time collaboration features into workflow builder.", category: "Business" },
  { title: "Sustainability Reporting Automation", confidence: 65, impact: "Low", action: "Monitor trend. Consider adding ESG reporting templates in Q4.", category: "Emerging" },
];

const impactColor = (i: string) => {
  if (i === "High") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (i === "Medium") return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return "bg-muted text-muted-foreground";
};

const CIOpportunityScanner = () => (
  <div className="space-y-8 animate-fade-in">
    <div>
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Opportunity Scanner</h1>
      <p className="text-muted-foreground mt-1 text-sm">AI-detected external opportunities across markets and trends.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {opportunities.map((opp) => (
        <Card key={opp.title} className="bg-card/60 backdrop-blur border-border/50 hover:border-border/80 transition-all">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">{opp.category}</Badge>
              <Badge variant="outline" className={impactColor(opp.impact)}>{opp.impact} Impact</Badge>
            </div>
            <h3 className="text-sm font-semibold text-foreground">{opp.title}</h3>
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Confidence Score</span>
                <span className="font-mono font-semibold text-foreground">{opp.confidence}%</span>
              </div>
              <Progress value={opp.confidence} className="h-1.5" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Action: </span>{opp.action}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default CIOpportunityScanner;
