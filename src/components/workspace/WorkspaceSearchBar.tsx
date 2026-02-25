import { useState, useEffect, useRef } from "react";
import { Sparkles, Sun, Moon, Palette, CloudRain, Waves, Snowflake, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export type Theme = "dark" | "light" | "aurora" | "rainfall" | "coastal" | "snowfall";

const THEMES: { value: Theme; label: string; icon: typeof Sun; emoji?: string }[] = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "aurora", label: "Aurora", icon: Palette },
  { value: "rainfall", label: "Rainfall", icon: CloudRain, emoji: "🌧" },
  { value: "coastal", label: "Coastal", icon: Waves, emoji: "🏖" },
  { value: "snowfall", label: "Snowfall", icon: Snowflake, emoji: "❄️" },
];

export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.remove("light", "aurora", "rainfall", "coastal", "snowfall");
  document.body.classList.remove("aurora-bg", "rainfall-bg", "coastal-bg", "snowfall-bg");
  if (theme === "light") root.classList.add("light");
  if (theme === "aurora") { root.classList.add("aurora"); document.body.classList.add("aurora-bg"); }
  if (theme === "rainfall") { root.classList.add("rainfall"); document.body.classList.add("rainfall-bg"); }
  if (theme === "coastal") { root.classList.add("coastal"); document.body.classList.add("coastal-bg"); }
  if (theme === "snowfall") { root.classList.add("snowfall"); document.body.classList.add("snowfall-bg"); }
};

export function WorkspaceSearchBar() {
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<Theme>("dark");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = (localStorage.getItem("zyquence-theme") || "dark") as Theme;
    setTheme(saved);
    applyTheme(saved);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selectTheme = (t: Theme) => {
    setTheme(t);
    applyTheme(t);
    localStorage.setItem("zyquence-theme", t);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      navigate(`/dashboard/assistant?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  const current = THEMES.find(t => t.value === theme) || THEMES[0];
  const CurrentIcon = current.icon;

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

        {/* Theme Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-xl shrink-0 gap-1.5 px-2.5"
            onClick={() => setOpen(!open)}
            aria-label="Change theme"
          >
            <CurrentIcon className="h-4 w-4" />
            <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
          </Button>

          {open && (
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-popover border border-border rounded-xl shadow-lg overflow-hidden animate-scale-in z-50">
              <div className="p-1">
                {THEMES.map(t => {
                  const Icon = t.icon;
                  const isActive = theme === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() => selectTheme(t.value)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                        isActive
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-foreground/70 hover:bg-muted/60 hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-left">{t.label}</span>
                      {t.emoji && <span className="text-xs">{t.emoji}</span>}
                      {isActive && (
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
