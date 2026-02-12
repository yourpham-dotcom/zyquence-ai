import { useState } from "react";
import { Globe, Compass, Clock, RotateCcw, Plane, Home, ArrowLeft, ToggleLeft, ToggleRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import AtlasHome from "./AtlasHome";
import AtlasExplore from "./AtlasExplore";
import AtlasCurfew from "./AtlasCurfew";
import AtlasReset from "./AtlasReset";
import AtlasTransition from "./AtlasTransition";
import AtlasChat from "./AtlasChat";

type AtlasTab = "home" | "explore" | "curfew" | "reset" | "transition";

const ZyquenceAtlas = () => {
  const [activeTab, setActiveTab] = useState<AtlasTab>("home");
  const [mode, setMode] = useState<"domestic" | "international">("domestic");

  const tabs = [
    { id: "home" as AtlasTab, label: "Home", icon: Home },
    { id: "explore" as AtlasTab, label: "Explore", icon: Compass },
    { id: "curfew" as AtlasTab, label: "Curfew", icon: Clock },
    { id: "reset" as AtlasTab, label: "Reset", icon: RotateCcw },
    { id: "transition" as AtlasTab, label: "Transition", icon: Plane },
  ];

  const modeInfo = {
    domestic: {
      label: "Domestic",
      tips: ["Arena-centric suggestions", "Traffic-aware timing", "Crowd & media awareness", "Recovery-first recs"],
    },
    international: {
      label: "International",
      tips: ["Language-friendly spots", "Athlete-safe areas", "Cultural etiquette", "Common mistakes abroad"],
    },
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <AtlasHome onNavigate={setActiveTab} />;
      case "explore":
        return <AtlasExplore />;
      case "curfew":
        return <AtlasCurfew />;
      case "reset":
        return <AtlasReset />;
      case "transition":
        return <AtlasTransition />;
      default:
        return <AtlasHome onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="shrink-0 px-5 pt-5 pb-3 space-y-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-foreground/70" />
            <h1 className="text-lg font-semibold">Zyquence Atlas</h1>
          </div>
          {/* Mode Toggle */}
          <button
            onClick={() => setMode(mode === "domestic" ? "international" : "domestic")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border hover:border-foreground/20 transition-all"
          >
            {mode === "domestic" ? (
              <ToggleLeft className="h-3.5 w-3.5" />
            ) : (
              <ToggleRight className="h-3.5 w-3.5" />
            )}
            {modeInfo[mode].label}
          </button>
        </div>

        {/* Mode Tips Banner */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {modeInfo[mode].tips.map((tip, i) => (
            <Badge key={i} variant="outline" className="text-[10px] whitespace-nowrap shrink-0 px-2 py-0.5">
              {tip}
            </Badge>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
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
