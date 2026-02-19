import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  RefreshCw,
  PanelRightClose,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const MOCK_STOCKS: StockQuote[] = [
  { symbol: "^IXIC", name: "NASDAQ", price: 20145.32, change: 127.45, changePercent: 0.64 },
  { symbol: "^GSPC", name: "S&P 500", price: 6123.87, change: 34.21, changePercent: 0.56 },
  { symbol: "^DJI", name: "Dow Jones", price: 44891.56, change: -52.13, changePercent: -0.12 },
  { symbol: "AAPL", name: "Apple", price: 248.73, change: 3.12, changePercent: 1.27 },
  { symbol: "MSFT", name: "Microsoft", price: 452.18, change: 5.67, changePercent: 1.27 },
  { symbol: "GOOGL", name: "Alphabet", price: 192.34, change: -1.23, changePercent: -0.64 },
  { symbol: "AMZN", name: "Amazon", price: 225.67, change: 4.89, changePercent: 2.21 },
  { symbol: "NVDA", name: "NVIDIA", price: 142.56, change: 8.34, changePercent: 6.22 },
  { symbol: "META", name: "Meta", price: 632.41, change: 12.56, changePercent: 2.03 },
  { symbol: "TSLA", name: "Tesla", price: 352.89, change: -7.43, changePercent: -2.06 },
  { symbol: "BTC-USD", name: "Bitcoin", price: 97234.50, change: 1245.30, changePercent: 1.30 },
  { symbol: "ETH-USD", name: "Ethereum", price: 3412.78, change: -45.23, changePercent: -1.31 },
];

const CHART_SYMBOLS = [
  { symbol: "NASDAQ:IXIC", label: "NASDAQ" },
  { symbol: "SP:SPX", label: "S&P 500" },
  { symbol: "AAPL", label: "AAPL" },
  { symbol: "NVDA", label: "NVDA" },
];

const MIN_WIDTH = 220;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 288;

function TradingViewMiniChart({ symbol }: { symbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.async = true;
    script.type = "text/javascript";
    script.innerHTML = JSON.stringify({
      symbol,
      width: "100%",
      height: "160",
      locale: "en",
      dateRange: "1D",
      colorTheme: "dark",
      isTransparent: true,
      autosize: false,
      largeChartUrl: "",
      noTimeScale: true,
    });

    containerRef.current.appendChild(script);
  }, [symbol]);

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden bg-card/50">
      <div className="tradingview-widget-container" ref={containerRef} />
    </div>
  );
}

export function StocksSidebar() {
  const [hidden, setHidden] = useState(false);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [stocks, setStocks] = useState(MOCK_STOCKS);
  const [selectedChart, setSelectedChart] = useState(CHART_SYMBOLS[0]);
  const [refreshing, setRefreshing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Resize drag handler
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX;
    const startWidth = width;

    const onMouseMove = (ev: MouseEvent) => {
      const delta = startX - ev.clientX; // dragging left = wider
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta));
      setWidth(newWidth);
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

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks((prev) =>
        prev.map((s) => {
          const delta = (Math.random() - 0.48) * s.price * 0.002;
          const newPrice = +(s.price + delta).toFixed(2);
          const newChange = +(s.change + delta).toFixed(2);
          const newPercent = +((newChange / (newPrice - newChange)) * 100).toFixed(2);
          return { ...s, price: newPrice, change: newChange, changePercent: newPercent };
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  // Hidden state — show a small open button
  if (hidden) {
    return (
      <div className="w-10 border-l border-border bg-card/30 flex flex-col items-center pt-3 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 mb-2"
          onClick={() => setHidden(false)}
          title="Open Markets"
        >
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
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleRefresh}
              title="Refresh"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setHidden(true)}
              title="Close sidebar"
            >
              <PanelRightClose className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-4">
            {/* Chart selector tabs */}
            <div className="flex gap-1 flex-wrap">
              {CHART_SYMBOLS.map((cs) => (
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

            {/* TradingView Chart */}
            <TradingViewMiniChart
              key={selectedChart.symbol}
              symbol={selectedChart.symbol}
            />

            {/* Stock Tickers */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Watchlist
              </h4>
              <div className="space-y-0.5">
                {stocks.map((stock) => (
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
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
