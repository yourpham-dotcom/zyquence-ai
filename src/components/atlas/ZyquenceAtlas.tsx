import { useState } from "react";
import { LayoutGrid, Map, Clock, RotateCcw, Plane, Activity } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import AtlasHome from "./AtlasHome";
import AtlasExplore from "./AtlasExplore";
import AtlasCurfew from "./AtlasCurfew";
import AtlasReset from "./AtlasReset";
import AtlasTransition from "./AtlasTransition";
import AtlasChat from "./AtlasChat";

type AtlasTab = "dashboard" | "planner" | "city" | "reset" | "adjust";

const ZyquenceAtlas = () => {
  const [activeTab, setActiveTab] = useState<AtlasTab>("dashboard");
  const [mode, setMode] = useState<"recovery" | "exploration" | "low-energy" | "travel">("recovery");

  const tabs = [
    { id: "dashboard" as AtlasTab, label: "Dashboard", icon: LayoutGrid },
    { id: "planner" as AtlasTab, label: "Scenario", icon: Clock },
    { id: "city" as AtlasTab, label: "City", icon: Map },
    { id: "reset" as AtlasTab, label: "Reset", icon: RotateCcw },
    { id: "adjust" as AtlasTab, label: "Adjust", icon: Plane },
  ];

  const modes = [
    { id: "recovery" as const, label: "Recovery" },
    { id: "exploration" as const, label: "Exploration" },
    { id: "low-energy" as const, label: "Low-Energy" },
    { id: "travel" as const, label: "Travel Day" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AtlasHome onNavigate={setActiveTab} mode={mode} />;
      case "planner":
        return <AtlasCurfew mode={mode} />;
      case "city":
        return <AtlasExplore mode={mode} />;
      case "reset":
        return <AtlasReset />;
      case "adjust":
        return <AtlasTransition />;
      default:
        return <AtlasHome onNavigate={setActiveTab} mode={mode} />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="shrink-0 px-5 pt-5 pb-3 space-y-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <h1 className="text-sm font-semibold tracking-tight uppercase">Atlas</h1>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-1.5">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-2.5 py-1 text-[11px] font-medium border transition-colors ${
                mode === m.id
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-5">
          {renderContent()}
        </div>
      </ScrollArea>

      {/* Chat Support */}
      <AtlasChat />
    </div>
  );
};

export default ZyquenceAtlas;
