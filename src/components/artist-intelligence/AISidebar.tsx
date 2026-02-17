import { 
  LayoutDashboard, Fingerprint, Music2, ArrowRightLeft, 
  Gauge, Map, MessageSquare, ChevronLeft, ChevronRight,
  Mic2, Users, Calendar, Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

export type AIModule = 
  | "overview" | "profile" | "identity" | "sound" 
  | "translator" | "readiness" | "strategy" | "feedback";

const navItems: { id: AIModule; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "profile", label: "Creator Profile", icon: Fingerprint },
  { id: "identity", label: "Identity", icon: Fingerprint },
  { id: "sound", label: "Sound Direction", icon: Music2 },
  { id: "translator", label: "Translator", icon: ArrowRightLeft },
  { id: "readiness", label: "Readiness Score", icon: Gauge },
  { id: "strategy", label: "Strategy", icon: Map },
  { id: "feedback", label: "Feedback Coach", icon: MessageSquare },
];

const futureItems = [
  { label: "Voice Analysis", icon: Mic2 },
  { label: "Collaboration", icon: Users },
  { label: "Release Planner", icon: Calendar },
  { label: "AI Beat Gen", icon: Cpu },
];

interface AISidebarProps {
  active: AIModule;
  onNavigate: (module: AIModule) => void;
  hasProfile: boolean;
}

const AISidebar = ({ active, onNavigate, hasProfile }: AISidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn(
      "h-full border-r border-border bg-card/50 backdrop-blur-sm flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-60"
    )}>
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <div>
            <h2 className="text-sm font-bold text-foreground tracking-tight">Artist Intelligence</h2>
            <p className="text-[10px] text-muted-foreground">Engine</p>
          </div>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const disabled = item.id !== "overview" && item.id !== "profile" && !hasProfile;
          return (
            <button
              key={item.id}
              onClick={() => !disabled && onNavigate(item.id)}
              disabled={disabled}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                active === item.id
                  ? "bg-primary text-primary-foreground"
                  : disabled
                  ? "text-muted-foreground/40 cursor-not-allowed"
                  : "text-foreground/70 hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}

        {!collapsed && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Coming Soon</p>
            </div>
            {futureItems.map((item) => (
              <div key={item.label} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground/30">
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </>
        )}
      </nav>
    </div>
  );
};

export default AISidebar;
