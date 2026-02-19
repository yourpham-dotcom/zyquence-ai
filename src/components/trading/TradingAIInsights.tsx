import { useState } from "react";
import { useTradingJournal } from "@/hooks/useTradingJournal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Loader2, AlertTriangle } from "lucide-react";

export function TradingAIInsights() {
  const { trades } = useTradingJournal();
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsight = async () => {
    setLoading(true);
    try {
      const recentTrades = (trades.data ?? []).slice(0, 20).map((t) => ({
        symbol: t.symbol,
        type: t.trade_type,
        entry: t.entry_price,
        exit: t.exit_price,
        pl: t.profit_loss,
        strategy: t.strategy_used,
        timeframe: t.timeframe,
        confidence: t.confidence_level,
        emotion_before: t.emotion_before,
        emotion_after: t.emotion_after,
        mistakes: t.mistakes_made,
        lesson: t.lesson_learned,
      }));

      const { data, error } = await supabase.functions.invoke("trade-reflection", {
        body: { trades: recentTrades, type: "portfolio" },
      });
      if (error) throw error;
      setInsight(data.feedback);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4" /> AI Trading Coach</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Get AI-powered analysis of your recent trading patterns, psychology, and areas for improvement.
          </p>
          <Button onClick={generateInsight} disabled={loading || !trades.data?.length}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analyzing...</> : "Generate Portfolio Insights"}
          </Button>

          {insight && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 space-y-3">
              <p className="text-sm text-foreground/90 whitespace-pre-wrap">{insight}</p>
              <div className="flex items-start gap-2 p-2 rounded bg-destructive/5 border border-destructive/10">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground">
                  This is for educational purposes only and does not constitute financial advice. Always do your own research before making trading decisions.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
