import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  RefreshCw,
  PanelRightClose,
  GripVertical,
  ChevronLeft,
  Wifi,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketState: string;
}

interface ChartPoint {
  time: number;
  price: number;
}

interface ChartData {
  symbol: string;
  previousClose: number;
  points: ChartPoint[];
}

const WATCHLIST_SYMBOLS = [
  "^IXIC", "^GSPC", "^DJI",
  "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA",
  "BTC-USD", "ETH-USD",
];

const CHART_OPTIONS = [
  { symbol: "^IXIC", label: "NASDAQ" },
  { symbol: "^GSPC", label: "S&P 500" },
  { symbol: "^DJI", label: "DOW" },
  { symbol: "AAPL", label: "AAPL" },
  { symbol: "NVDA", label: "NVDA" },
];

const MIN_WIDTH = 220;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 300;
const REFRESH_INTERVAL = 30000; // 30 seconds

// Mini chart component using real data
function StockChart({ data, width }: { data: ChartData | null; width: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.points.length < 2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const prices = data.points.map((p) => p.price);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const range = maxP - minP || 1;
    const padding = 4;

    const lastPrice = prices[prices.length - 1];
    const isUp = lastPrice >= data.previousClose;
    const lineColor = isUp ? "#10b981" : "#ef4444";
    const fillColor = isUp ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)";

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Previous close line
    const prevY = h - padding - ((data.previousClose - minP) / range) * (h - padding * 2);
    ctx.strokeStyle = "rgba(128,128,128,0.3)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(0, prevY);
    ctx.lineTo(w, prevY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price line
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.beginPath();
    data.points.forEach((p, i) => {
      const x = (i / (data.points.length - 1)) * w;
      const y = h - padding - ((p.price - minP) / range) * (h - padding * 2);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Fill
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
  }, [data, width]);

  if (!data || data.points.length < 2) {
    return (
      <div className="h-[120px] rounded-lg border border-border/50 bg-card/50 flex items-center justify-center">
        <span className="text-xs text-muted-foreground">Loading chart...</span>
      </div>
    );
  }

  const lastPrice = data.points[data.points.length - 1].price;
  const change = lastPrice - data.previousClose;
  const changePct = (change / data.previousClose) * 100;
  const isUp = change >= 0;

  return (
    <div className="rounded-lg border border-border/50 bg-card/50 overflow-hidden">
      <div className="px-3 pt-2 pb-1 flex items-baseline justify-between">
        <div>
          <span className="text-lg font-bold text-foreground font-mono">
            {lastPrice >= 1000
              ? lastPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : lastPrice.toFixed(2)}
          </span>
        </div>
        <span className={cn("text-xs font-mono font-medium", isUp ? "text-emerald-500" : "text-red-500")}>
          {isUp ? "+" : ""}{change.toFixed(2)} ({isUp ? "+" : ""}{changePct.toFixed(2)}%)
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-[100px]"
        style={{ display: "block" }}
      />
    </div>
  );
}

export function StocksSidebar() {
  const [hidden, setHidden] = useState(false);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [selectedChart, setSelectedChart] = useState(CHART_OPTIONS[0]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Fetch quotes
  const fetchQuotes = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("stock-quotes", {
        body: { symbols: WATCHLIST_SYMBOLS, type: "quotes" },
      });
      if (error) {
        console.error("Quote fetch error:", error);
        return;
      }
      if (data?.success && data.quotes) {
        setStocks(data.quotes);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch quotes:", err);
    }
  }, []);

  // Fetch chart
  const fetchChart = useCallback(async (symbol: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("stock-quotes", {
        body: { symbols: [symbol], type: "chart" },
      });
      if (error) {
        console.error("Chart fetch error:", error);
        return;
      }
      if (data?.success && data.chart) {
        setChartData(data.chart);
      }
    } catch (err) {
      console.error("Failed to fetch chart:", err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchQuotes();
    fetchChart(selectedChart.symbol);
  }, []);

  // Auto-refresh quotes
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(fetchQuotes, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [isLive, fetchQuotes]);

  // Auto-refresh chart
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => fetchChart(selectedChart.symbol), 60000);
    return () => clearInterval(interval);
  }, [isLive, selectedChart.symbol, fetchChart]);

  // Fetch chart when symbol changes
  useEffect(() => {
    setChartData(null);
    fetchChart(selectedChart.symbol);
  }, [selectedChart.symbol, fetchChart]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchQuotes(), fetchChart(selectedChart.symbol)]);
    setRefreshing(false);
  };

  // Resize drag handler
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const startX = e.clientX;
    const startWidth = width;

    const onMouseMove = (ev: MouseEvent) => {
      const delta = startX - ev.clientX;
      setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta)));
    };

    const onMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [width]);

  if (hidden) {
    return (
      <div className="w-10 border-l border-border bg-card/30 flex flex-col items-center pt-3 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8 mb-2" onClick={() => setHidden(false)} title="Open Markets">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <BarChart3 className="h-4 w-4 text-muted-foreground rotate-90" />
      </div>
    );
  }

  return (
    <div
      ref={sidebarRef}
      className="border-l border-border bg-card/30 flex shrink-0 h-screen relative"
      style={{ width }}
    >
      {/* Drag handle */}
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize z-10 group flex items-center justify-center",
          "hover:bg-primary/20 transition-colors",
          isDragging && "bg-primary/30"
        )}
      >
        <div className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 flex items-center justify-center rounded-r-md",
          "opacity-0 group-hover:opacity-100 transition-opacity bg-accent/80",
          isDragging && "opacity-100"
        )}>
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-border">
          <div className="flex items-center gap-2 min-w-0">
            <BarChart3 className="h-4 w-4 text-primary shrink-0" />
            <h3 className="text-sm font-semibold text-foreground truncate">Markets</h3>
            {isLive ? (
              <Wifi className="h-3 w-3 text-emerald-500 shrink-0" />
            ) : (
              <WifiOff className="h-3 w-3 text-muted-foreground shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsLive(!isLive)} title={isLive ? "Pause live updates" : "Resume live updates"}>
              {isLive ? <Wifi className="h-3.5 w-3.5 text-emerald-500" /> : <WifiOff className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRefresh} title="Refresh">
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setHidden(true)} title="Close sidebar">
              <PanelRightClose className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-4">
            {/* Status bar */}
            {lastUpdate && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  Updated {lastUpdate.toLocaleTimeString()}
                </span>
                {stocks[0]?.marketState && (
                  <span className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded",
                    stocks[0].marketState === "REGULAR"
                      ? "bg-emerald-500/15 text-emerald-500"
                      : "bg-amber-500/15 text-amber-500"
                  )}>
                    {stocks[0].marketState === "REGULAR" ? "Market Open" : stocks[0].marketState === "PRE" ? "Pre-Market" : stocks[0].marketState === "POST" ? "After Hours" : "Closed"}
                  </span>
                )}
              </div>
            )}

            {/* Chart selector tabs */}
            <div className="flex gap-1 flex-wrap">
              {CHART_OPTIONS.map((cs) => (
                <button
                  key={cs.symbol}
                  onClick={() => setSelectedChart(cs)}
                  className={cn(
                    "px-2 py-1 rounded text-[10px] font-medium transition-colors",
                    selectedChart.symbol === cs.symbol
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cs.label}
                </button>
              ))}
            </div>

            {/* Real chart */}
            <StockChart data={chartData} width={width} />

            {/* Stock Tickers */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Watchlist
              </h4>
              <div className="space-y-0.5">
                {stocks.length === 0 ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between px-2 py-2 animate-pulse">
                      <div className="space-y-1">
                        <div className="h-3 w-12 bg-muted rounded" />
                        <div className="h-2.5 w-16 bg-muted rounded" />
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="h-3 w-14 bg-muted rounded ml-auto" />
                        <div className="h-2.5 w-10 bg-muted rounded ml-auto" />
                      </div>
                    </div>
                  ))
                ) : (
                  stocks.map((stock) => (
                    <div
                      key={stock.symbol}
                      className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-accent/30 transition-colors cursor-default"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-foreground block truncate">
                          {stock.symbol.replace("-USD", "").replace("^", "")}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate block">
                          {stock.name}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-medium text-foreground block">
                          {stock.price >= 1000
                            ? stock.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : stock.price.toFixed(2)}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-mono flex items-center gap-0.5 justify-end",
                            stock.change >= 0 ? "text-emerald-500" : "text-red-500"
                          )}
                        >
                          {stock.change >= 0 ? (
                            <TrendingUp className="h-2.5 w-2.5" />
                          ) : (
                            <TrendingDown className="h-2.5 w-2.5" />
                          )}
                          {stock.change >= 0 ? "+" : ""}
                          {stock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
