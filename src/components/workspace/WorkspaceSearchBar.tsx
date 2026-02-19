import { useState, useEffect } from "react";
import { Sparkles, Sun, Moon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function WorkspaceSearchBar() {
  const [query, setQuery] = useState("");
  const [isLight, setIsLight] = useState(() => document.documentElement.classList.contains("light"));
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("zyquence-theme");
    if (saved === "light") {
      document.documentElement.classList.add("light");
      setIsLight(true);
    }
  }, []);

  const toggleTheme = () => {
    const next = !isLight;
    setIsLight(next);
    document.documentElement.classList.toggle("light", next);
    localStorage.setItem("zyquence-theme", next ? "light" : "dark");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      navigate(`/dashboard/assistant?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

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
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
