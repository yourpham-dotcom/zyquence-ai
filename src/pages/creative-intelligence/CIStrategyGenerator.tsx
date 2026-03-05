import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Clock, DollarSign, CheckCircle2, Loader2 } from "lucide-react";
import { useCreativeIdeas } from "@/hooks/useCreativeIdeas";
import { formatDistanceToNow } from "date-fns";

const CIStrategyGenerator = () => {
  const { ideas, isLoading } = useCreativeIdeas();
  const strategizedIdeas = ideas.filter((i) => i.ai_strategy);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Strategy Generator</h1>
        <p className="text-muted-foreground mt-1 text-sm">AI-generated strategies from your analyzed ideas.</p>
      </div>

      {strategizedIdeas.length === 0 ? (
        <Card className="bg-card/60 backdrop-blur border-border/50">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground text-sm">No strategies yet. Analyze an idea first, then generate a strategy.</p>
          </CardContent>
        </Card>
      ) : (
        strategizedIdeas.map((idea) => {
          const s = idea.ai_strategy;
          return (
            <div key={idea.id} className="space-y-6">
              <Card className="bg-card/60 backdrop-blur border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-foreground">{idea.title}</h2>
                    <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(idea.updated_at), { addSuffix: true })}</span>
                  </div>
                  {s.overview && <p className="text-sm text-muted-foreground leading-relaxed">{s.overview}</p>}
                </CardContent>
              </Card>

              {s.steps && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Step-by-Step Plan</h3>
                  <div className="space-y-3">
                    {s.steps.map((step: any, i: number) => (
                      <Card key={i} className="bg-card/60 backdrop-blur border-border/50">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary/20 text-primary">
                            <span className="text-xs font-bold">{i + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground font-medium">{step.phase}</p>
                            <p className="text-sm font-semibold text-foreground">{step.title}</p>
                            {step.description && <p className="text-xs text-muted-foreground mt-1">{step.description}</p>}
                          </div>
                          {step.duration && <Badge variant="outline" className="shrink-0 text-xs">{step.duration}</Badge>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {s.team_size && (
                  <Card className="bg-card/60 backdrop-blur border-border/50">
                    <CardContent className="p-5 flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Team Size</p>
                        <p className="text-sm font-semibold text-foreground">{s.team_size}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {s.timeline && (
                  <Card className="bg-card/60 backdrop-blur border-border/50">
                    <CardContent className="p-5 flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Timeline</p>
                        <p className="text-sm font-semibold text-foreground">{s.timeline}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {s.budget && (
                  <Card className="bg-card/60 backdrop-blur border-border/50">
                    <CardContent className="p-5 flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Budget</p>
                        <p className="text-sm font-semibold text-foreground">{s.budget}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {s.risks && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground">Key Risks</p>
                    {s.risks.map((r: string, i: number) => <p key={i} className="text-xs text-muted-foreground">• {r}</p>)}
                  </div>
                  {s.success_metrics && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-foreground">Success Metrics</p>
                      {s.success_metrics.map((m: string, i: number) => <p key={i} className="text-xs text-muted-foreground">• {m}</p>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default CIStrategyGenerator;
