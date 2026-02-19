import { useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Settings2,
  Bookmark,
  BookmarkCheck,
  Clock,
  TrendingUp,
  Plus,
  X,
  Crown,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const ALL_CATEGORIES = [
  "Technology",
  "AI",
  "Finance",
  "Business",
  "Sports",
  "Music",
  "Lifestyle",
  "Startups",
  "Health",
  "Education",
] as const;

type Category = (typeof ALL_CATEGORIES)[number];

interface NewsItem {
  id: string;
  title: string;
  source: string;
  category: Category;
  time: string;
  url: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Technology: "bg-blue-500/15 text-blue-500 border-blue-500/20",
  AI: "bg-violet-500/15 text-violet-500 border-violet-500/20",
  Finance: "bg-emerald-500/15 text-emerald-500 border-emerald-500/20",
  Business: "bg-amber-500/15 text-amber-500 border-amber-500/20",
  Sports: "bg-orange-500/15 text-orange-500 border-orange-500/20",
  Music: "bg-fuchsia-500/15 text-fuchsia-500 border-fuchsia-500/20",
  Lifestyle: "bg-pink-500/15 text-pink-500 border-pink-500/20",
  Startups: "bg-cyan-500/15 text-cyan-500 border-cyan-500/20",
  Health: "bg-green-500/15 text-green-500 border-green-500/20",
  Education: "bg-indigo-500/15 text-indigo-500 border-indigo-500/20",
};

interface ZyquenceNewsFeedProps {
  isPro: boolean;
}

const ZyquenceNewsFeed = ({ isPro }: ZyquenceNewsFeedProps) => {
  const [preferences, setPreferences] = useState<Category[]>([
    "Technology",
    "AI",
    "Finance",
    "Business",
  ]);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [customInterest, setCustomInterest] = useState("");
  const [customInterests, setCustomInterests] = useState<string[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNews = useCallback(async (categories: Category[]) => {
    try {
      const { data, error } = await supabase.functions.invoke("fetch-news", {
        body: { categories },
      });
      if (error) {
        console.error("Error fetching news:", error);
        return;
      }
      if (data?.success && data.news) {
        setNews(data.news);
      }
    } catch (err) {
      console.error("Failed to fetch news:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Fetch on mount and when preferences change
  useEffect(() => {
    setIsLoading(true);
    fetchNews(preferences);
  }, [preferences, fetchNews]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNews(preferences);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [preferences, fetchNews]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchNews(preferences);
  }, [preferences, fetchNews]);

  const toggleBookmark = (id: string) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleCategory = (cat: Category) => {
    setPreferences((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const addCustomInterest = () => {
    const trimmed = customInterest.trim();
    if (trimmed && !customInterests.includes(trimmed)) {
      setCustomInterests((prev) => [...prev, trimmed]);
      setCustomInterest("");
    }
  };

  const contextLabel = preferences.slice(0, 3).join(", ");

  return (
    <div className="space-y-3">
      {/* Context line */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">
            Based on your interests in{" "}
            <span className="text-foreground font-medium">{contextLabel}</span>
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            Trending for You
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
        >
          <RefreshCw className={cn("h-3.5 w-3.5", (isRefreshing || isLoading) && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Pro AI insight */}
      {isPro && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg border border-primary/20 bg-primary/5">
          <Crown className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-foreground font-medium">AI Insight:</span>{" "}
            This week shows increased funding activity in AI startups, with 3
            major rounds exceeding $100M.
          </p>
        </div>
      )}

      {/* Scrollable news cards */}
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-3">
          {isLoading && news.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="min-w-[260px] max-w-[280px] shrink-0 border-border/50 bg-card/80 animate-pulse">
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 w-16 bg-muted rounded" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-4 w-3/4 bg-muted rounded" />
                  </div>
                  <div className="h-3 w-24 bg-muted rounded" />
                </CardContent>
              </Card>
            ))
          ) : (
            news.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="group min-w-[260px] max-w-[280px] shrink-0 border-border/50 hover:border-primary/30 bg-card/80 backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 overflow-hidden cursor-pointer">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-medium px-1.5 py-0",
                          CATEGORY_COLORS[item.category]
                        )}
                      >
                        {item.category}
                      </Badge>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleBookmark(item.id);
                        }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {bookmarked.has(item.id) ? (
                          <BookmarkCheck className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <Bookmark className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.source}</span>
                        <span>·</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.time}
                        </div>
                      </div>
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))
          )}
          {!isLoading && news.length === 0 && (
            <div className="flex items-center justify-center w-full min-h-[100px] text-sm text-muted-foreground">
              No news matching your preferences. Adjust your settings.
            </div>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Settings modal */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>News Preferences</DialogTitle>
            <DialogDescription>
              Choose categories and add custom interests to personalize your
              feed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Categories</h4>
              <div className="space-y-2">
                {ALL_CATEGORIES.map((cat) => (
                  <div key={cat} className="flex items-center justify-between py-1">
                    <span className="text-sm text-foreground">{cat}</span>
                    <Switch
                      checked={preferences.includes(cat)}
                      onCheckedChange={() => toggleCategory(cat)}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Custom Interests</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. NBA, Crypto, Design"
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomInterest()}
                  className="h-8 text-sm"
                />
                <Button size="sm" variant="outline" className="h-8 px-2" onClick={addCustomInterest}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              {customInterests.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {customInterests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="text-xs gap-1 pr-1">
                      {interest}
                      <button onClick={() => setCustomInterests((prev) => prev.filter((i) => i !== interest))}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ZyquenceNewsFeed;
