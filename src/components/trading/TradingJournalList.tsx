import { useState } from "react";
import { useTradingJournal, TradeEntry } from "@/hooks/useTradingJournal";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Search, TrendingUp, TrendingDown, Trash2, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export function TradingJournalList() {
  const { trades, deleteTrade, updateTrade } = useTradingJournal();
  const [search, setSearch] = useState("");
  const [filterTimeframe, setFilterTimeframe] = useState("all");
  const [selectedTrade, setSelectedTrade] = useState<TradeEntry | null>(null);
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  if (trades.isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const filtered = (trades.data ?? []).filter((t) => {
    const matchSearch = !search || t.symbol.toLowerCase().includes(search.toLowerCase()) || t.strategy_used?.toLowerCase().includes(search.toLowerCase());
    const matchTimeframe = filterTimeframe === "all" || t.timeframe === filterTimeframe;
    return matchSearch && matchTimeframe;
  });

  const getAiFeedback = async (trade: TradeEntry) => {
    setAiLoading(trade.id);
    try {
      const { data, error } = await supabase.functions.invoke("trade-reflection", { body: { trade } });
      if (error) throw error;
      updateTrade.mutate({ id: trade.id, ai_feedback: data.feedback });
      setSelectedTrade({ ...trade, ai_feedback: data.feedback });
    } catch (e) {
      console.error(e);
    }
    setAiLoading(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by symbol or strategy..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={filterTimeframe} onValueChange={setFilterTimeframe}>
          <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Timeframes</SelectItem>
            <SelectItem value="scalp">Scalp</SelectItem>
            <SelectItem value="day_trade">Day Trade</SelectItem>
            <SelectItem value="swing">Swing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground text-sm">No trades found. Start logging trades to see them here.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((trade) => {
            const pl = trade.profit_loss;
            const isProfit = pl !== null && pl > 0;
            const isLoss = pl !== null && pl < 0;
            return (
              <Card key={trade.id} className="cursor-pointer hover:bg-accent/30 transition-colors" onClick={() => setSelectedTrade(trade)}>
                <CardContent className="py-3 px-4 flex items-center gap-4">
                  <div className={cn("p-2 rounded-lg", isProfit ? "bg-emerald-500/10" : isLoss ? "bg-red-500/10" : "bg-muted")}>
                    {isProfit ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : isLoss ? <TrendingDown className="h-4 w-4 text-red-500" /> : <TrendingUp className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{trade.symbol}</span>
                      <Badge variant="outline" className="text-[10px]">{trade.trade_type.toUpperCase()}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{trade.asset_type}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{trade.timeframe.replace("_", " ")}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {trade.trade_date} · Entry: ${trade.entry_price}{trade.exit_price ? ` → Exit: $${trade.exit_price}` : ""}{trade.strategy_used ? ` · ${trade.strategy_used}` : ""}
                    </p>
                  </div>
                  {pl !== null && (
                    <span className={cn("text-sm font-mono font-semibold", isProfit ? "text-emerald-500" : "text-red-500")}>
                      {isProfit ? "+" : ""}{pl.toFixed(2)}
                    </span>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Trade Detail Dialog */}
      <Dialog open={!!selectedTrade} onOpenChange={(o) => !o && setSelectedTrade(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedTrade && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedTrade.symbol}
                  <Badge variant="outline">{selectedTrade.trade_type.toUpperCase()}</Badge>
                  {selectedTrade.profit_loss !== null && (
                    <span className={cn("text-sm font-mono", selectedTrade.profit_loss > 0 ? "text-emerald-500" : "text-red-500")}>
                      {selectedTrade.profit_loss > 0 ? "+" : ""}{selectedTrade.profit_loss.toFixed(2)}
                    </span>
                  )}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <Detail label="Asset" value={selectedTrade.asset_type} />
                  <Detail label="Date" value={selectedTrade.trade_date} />
                  <Detail label="Entry" value={`$${selectedTrade.entry_price}`} />
                  <Detail label="Exit" value={selectedTrade.exit_price ? `$${selectedTrade.exit_price}` : "Open"} />
                  <Detail label="Size" value={String(selectedTrade.position_size)} />
                  <Detail label="Timeframe" value={selectedTrade.timeframe.replace("_", " ")} />
                  <Detail label="Strategy" value={selectedTrade.strategy_used || "—"} />
                  <Detail label="Confidence" value={selectedTrade.confidence_level ? `${selectedTrade.confidence_level}/10` : "—"} />
                  <Detail label="Emotion Before" value={selectedTrade.emotion_before || "—"} />
                  <Detail label="Emotion After" value={selectedTrade.emotion_after || "—"} />
                </div>

                {selectedTrade.setup_description && <TextBlock label="Setup" value={selectedTrade.setup_description} />}
                {selectedTrade.mistakes_made && <TextBlock label="Mistakes" value={selectedTrade.mistakes_made} />}
                {selectedTrade.what_went_well && <TextBlock label="What Went Well" value={selectedTrade.what_went_well} />}
                {selectedTrade.what_went_wrong && <TextBlock label="What Went Wrong" value={selectedTrade.what_went_wrong} />}
                {selectedTrade.lesson_learned && <TextBlock label="Lesson Learned" value={selectedTrade.lesson_learned} />}

                {selectedTrade.screenshot_url && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Screenshot</p>
                    <img src={selectedTrade.screenshot_url} alt="Trade" className="rounded-lg max-h-48 object-contain" />
                  </div>
                )}

                {selectedTrade.ai_feedback ? (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1"><Brain className="h-3 w-3" /> AI Reflection</p>
                    <p className="text-xs text-foreground/80 whitespace-pre-wrap">{selectedTrade.ai_feedback}</p>
                    <p className="text-[10px] text-muted-foreground mt-2 italic">⚠️ For educational purposes only. Not financial advice.</p>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => getAiFeedback(selectedTrade)} disabled={aiLoading === selectedTrade.id}>
                    {aiLoading === selectedTrade.id ? <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Analyzing...</> : <><Brain className="h-3 w-3 mr-1" /> Get AI Feedback</>}
                  </Button>
                )}

                <div className="flex justify-end">
                  <Button variant="destructive" size="sm" onClick={() => { deleteTrade.mutate(selectedTrade.id); setSelectedTrade(null); }}>
                    <Trash2 className="h-3 w-3 mr-1" /> Delete Trade
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium capitalize">{value}</p>
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm text-foreground/80">{value}</p>
    </div>
  );
}
