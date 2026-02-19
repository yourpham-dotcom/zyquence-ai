import { useState, useEffect } from "react";
import { Sparkles, Sun, Moon, Palette } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type Theme = "dark" | "light" | "aurora";

const THEME_ORDER: Theme[] = ["dark", "light", "aurora"];

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.remove("light", "aurora");
  document.body.classList.remove("aurora-bg");
  if (theme === "light") root.classList.add("light");
  if (theme === "aurora") {
    root.classList.add("aurora");
    document.body.classList.add("aurora-bg");
  }
};

export function WorkspaceSearchBar() {
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<Theme>("dark");
  const navigate = useNavigate();

  useEffect(() => {
    const saved = (localStorage.getItem("zyquence-theme") || "dark") as Theme;
    setTheme(saved);
    applyTheme(saved);
  }, []);

  const cycleTheme = () => {
    const idx = THEME_ORDER.indexOf(theme);
    const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
    setTheme(next);
    applyTheme(next);
    localStorage.setItem("zyquence-theme", next);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      navigate(`/dashboard/assistant?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  const ThemeIcon = theme === "light" ? Moon : theme === "aurora" ? Palette : Sun;

  return (
    <div className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl px-6 py-3">
      <div className="flex items-center gap-3 max-w-3xl mx-auto">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Sparkles className="h-4 w-4 text-primary/60" />
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What do you want to plan or build today?"
            className="pl-10 pr-4 h-10 bg-card/60 border-border/50 rounded-xl text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary/30"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <kbd className="text-[10px] text-muted-foreground/40 bg-muted/20 px-1.5 py-0.5 rounded">
              ↵
            </kbd>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl shrink-0"
          onClick={cycleTheme}
          aria-label="Cycle theme"
        >
          <ThemeIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
