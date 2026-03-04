import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Lightbulb, BarChart3, Zap, GitBranch,
  Activity, Brain, Radar, Settings, Sparkles, ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/creative-intelligence" },
  { icon: Lightbulb, label: "Idea Capture", path: "/creative-intelligence/capture" },
  { icon: BarChart3, label: "Idea Analysis", path: "/creative-intelligence/analysis" },
  { icon: Zap, label: "Strategy Generator", path: "/creative-intelligence/strategy" },
  { icon: GitBranch, label: "Workflow Builder", path: "/creative-intelligence/workflow" },
  { icon: Activity, label: "Execution Monitor", path: "/creative-intelligence/monitor" },
  { icon: Brain, label: "Insights & Intelligence", path: "/creative-intelligence/insights" },
  { icon: Radar, label: "Opportunity Scanner", path: "/creative-intelligence/opportunities" },
  { icon: Settings, label: "Settings", path: "/creative-intelligence/settings" },
];

export const CISidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "h-screen border-r border-border/50 bg-card/50 backdrop-blur-sm flex flex-col shrink-0 transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="h-14 flex items-center px-4 gap-2 border-b border-border/50 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-foreground truncate">
            Creative Intel
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-7 w-7 ml-auto shrink-0", collapsed && "ml-0")}
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.path === "/creative-intelligence"
              ? location.pathname === "/creative-intelligence"
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/creative-intelligence"}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
