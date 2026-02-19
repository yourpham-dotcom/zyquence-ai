import { useTradingJournal } from "@/hooks/useTradingJournal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown, Target, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function TradingAnalytics() {
  const { trades } = useTradingJournal();

  if (trades.isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const data = trades.data ?? [];
  const closedTrades = data.filter((t) => t.exit_price !== null);
  const wins = closedTrades.filter((t) => t.profit_loss !== null && t.profit_loss > 0);
  const losses = closedTrades.filter((t) => t.profit_loss !== null && t.profit_loss < 0);
  const totalPL = closedTrades.reduce((s, t) => s + (t.profit_loss ?? 0), 0);
  const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0;

  // Strategy breakdown
  const strategyMap = new Map<string, { wins: number; total: number; pl: number }>();
  closedTrades.forEach((t) => {
    const s = t.strategy_used || "Unspecified";
    const existing = strategyMap.get(s) || { wins: 0, total: 0, pl: 0 };
    existing.total++;
    if (t.profit_loss && t.profit_loss > 0) existing.wins++;
    existing.pl += t.profit_loss ?? 0;
    strategyMap.set(s, existing);
  });
  const strategies = Array.from(strategyMap.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.total - a.total);

  // Performance over time (group by date)
  const dateMap = new Map<string, number>();
  closedTrades.forEach((t) => {
    const d = t.trade_date;
    dateMap.set(d, (dateMap.get(d) ?? 0) + (t.profit_loss ?? 0));
  });
  const chartData = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, pl]) => ({ date: date.slice(5), pl: parseFloat(pl.toFixed(2)) }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<BarChart3 className="h-4 w-4" />} label="Total Trades" value={closedTrades.length.toString()} />
        <StatCard icon={<Target className="h-4 w-4" />} label="Win Rate" value={`${winRate.toFixed(1)}%`} color={winRate >= 50 ? "text-emerald-500" : "text-red-500"} />
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Total P/L" value={`$${totalPL.toFixed(2)}`} color={totalPL >= 0 ? "text-emerald-500" : "text-red-500"} />
        <StatCard icon={<TrendingDown className="h-4 w-4" />} label="Avg P/L" value={closedTrades.length > 0 ? `$${(totalPL / closedTrades.length).toFixed(2)}` : "$0"} color={totalPL >= 0 ? "text-emerald-500" : "text-red-500"} />
      </div>

      {/* P/L Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Performance Over Time</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="pl" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Strategy Breakdown */}
      {strategies.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Strategy Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {strategies.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{s.name}</span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-muted-foreground">{s.total} trades</span>
                    <span className="text-muted-foreground">{s.total > 0 ? ((s.wins / s.total) * 100).toFixed(0) : 0}% win</span>
                    <span className={s.pl >= 0 ? "text-emerald-500" : "text-red-500"}>
                      {s.pl >= 0 ? "+" : ""}${s.pl.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color?: string }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">{icon}<span className="text-xs">{label}</span></div>
        <p className={`text-xl font-bold ${color || "text-foreground"}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
