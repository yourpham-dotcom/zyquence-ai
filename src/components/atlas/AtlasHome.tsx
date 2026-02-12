import { useState } from "react";
import { MapPin, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type AtlasTab = "dashboard" | "planner" | "city" | "reset" | "adjust";

interface AtlasHomeProps {
  onNavigate: (tab: AtlasTab) => void;
  mode: string;
}

const AtlasHome = ({ onNavigate, mode }: AtlasHomeProps) => {
  const [city, setCity] = useState("Los Angeles");
  const [country, setCountry] = useState("USA");
  const [dayStatus, setDayStatus] = useState<"game" | "travel" | "off">("off");
  const [curfewTime, setCurfewTime] = useState("23:00");

  const statusLabels = {
    game: "Game Day",
    travel: "Travel Day",
    off: "Off Day",
  };

  const getAvailableWindow = () => {
    const hour = parseInt(curfewTime.split(":")[0]);
    if (dayStatus === "game") return "Post-game to " + formatTime(curfewTime);
    if (dayStatus === "travel") return "After arrival to " + formatTime(curfewTime);
    return "06:00 AM to " + formatTime(curfewTime);
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
  };

  const getConstraints = () => {
    const constraints: string[] = [];
    if (dayStatus === "game") constraints.push("Limited window post-game");
    if (dayStatus === "travel") constraints.push("Arrival time unknown");
    if (mode === "recovery") constraints.push("Recovery priority active");
    if (mode === "travel") constraints.push("Travel day pacing");
    return constraints;
  };

  const actions = [
    { label: "Plan Scenario", tab: "planner" as AtlasTab, desc: "Calculate time windows" },
    { label: "City Planner", tab: "city" as AtlasTab, desc: "Find locations by category" },
    { label: "Reset", tab: "reset" as AtlasTab, desc: "Check-in and refocus" },
    { label: "Adjust", tab: "adjust" as AtlasTab, desc: "International adjustment" },
  ];

  return (
    <div className="space-y-5">
      {/* Location */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-3.5 w-3.5" />
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="bg-transparent outline-none text-foreground font-medium w-28"
        />
        <span>,</span>
        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="bg-transparent outline-none text-foreground font-medium w-16"
        />
      </div>

      {/* Day Status */}
      <div className="flex gap-1.5">
        {(["game", "travel", "off"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setDayStatus(s)}
            className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
              dayStatus === s
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:border-foreground/30"
            }`}
          >
            {statusLabels[s]}
          </button>
        ))}
      </div>

      {/* Constraints Panel */}
      <Card className="border-border">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Constraints</span>
            <span className="text-xs text-muted-foreground">{statusLabels[dayStatus]}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] text-muted-foreground">Cutoff</p>
              <input
                type="time"
                value={curfewTime}
                onChange={(e) => setCurfewTime(e.target.value)}
                className="text-sm font-medium bg-transparent outline-none border-b border-border/50 pb-0.5"
              />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Available Window</p>
              <p className="text-sm font-medium">{getAvailableWindow()}</p>
            </div>
          </div>

          {getConstraints().length > 0 && (
            <div className="space-y-1 pt-1 border-t border-border/50">
              {getConstraints().map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  {c}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <button
            key={action.tab}
            onClick={() => onNavigate(action.tab)}
            className="p-3 border border-border hover:border-foreground/20 transition-colors text-left space-y-1"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium">{action.label}</p>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="text-[11px] text-muted-foreground">{action.desc}</p>
          </button>
        ))}
      </div>

      {/* Positioning */}
      <p className="text-[10px] text-muted-foreground border-t border-border/50 pt-3">
        Zyquence Atlas is a personal planning and lifestyle utility. It does not provide booking, representation, or advisory services.
      </p>
    </div>
  );
};

export default AtlasHome;
