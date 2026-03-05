import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Radar, Loader2, RefreshCw } from "lucide-react";
import { useCreativeIdeas } from "@/hooks/useCreativeIdeas";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Opportunity {
  title: string;
  confidence: number;
  impact: string;
  action: string;
  category: string;
}

const impactColor = (i: string) => {
  if (i === "High") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (i === "Medium") return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return "bg-muted text-muted-foreground";
};

const CIOpportunityScanner = () => {
  const { ideas } = useCreativeIdeas();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const scanOpportunities = async () => {
    setLoading(true);
    try {
      const ideasContext = ideas.map(i => ({
        title: i.title,
        description: i.description,
        idea_score: i.idea_score,
        status: i.status,
      }));

      const { data, error } = await supabase.functions.invoke("creative-intelligence", {
        body: { action: "insights", idea: ideasContext },
      });
      if (error) throw error;
      setOpportunities(data.result?.opportunities || []);
      setGenerated(true);
      toast({ title: "Opportunities scanned!" });
    } catch (e: any) {
      toast({ title: "Scan failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Opportunity Scanner</h1>
          <p className="text-muted-foreground mt-1 text-sm">AI-detected external opportunities across markets and trends.</p>
        </div>
        <Button onClick={scanOpportunities} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {generated ? "Rescan" : "Scan"} Opportunities
        </Button>
      </div>

      {!generated && !loading && (
        <Card className="bg-card/60 backdrop-blur border-border/50">
          <CardContent className="p-8 text-center">
            <Radar className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Click "Scan Opportunities" to discover AI-detected market trends and opportunities.</p>
          </CardContent>
        </Card>
      )}

      {opportunities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((opp, i) => (
            <Card key={i} className="bg-card/60 backdrop-blur border-border/50 hover:border-border/80 transition-all">
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
      )}
    </div>
  );
};

export default CIOpportunityScanner;
