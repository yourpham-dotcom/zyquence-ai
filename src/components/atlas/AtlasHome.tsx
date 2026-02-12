import { useState } from "react";
import { MapPin, Calendar, Clock, Moon, Compass, RotateCcw, Plane, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type AtlasTab = "home" | "explore" | "curfew" | "reset" | "transition";

interface AtlasHomeProps {
  onNavigate: (tab: AtlasTab) => void;
}

const AtlasHome = ({ onNavigate }: AtlasHomeProps) => {
  const [city, setCity] = useState("Los Angeles");
  const [country, setCountry] = useState("USA");
  const [dayStatus, setDayStatus] = useState<"game" | "travel" | "off">("off");
  const [curfewTime, setCurfewTime] = useState("11:00 PM");

  const statusConfig = {
    game: { label: "Game Day", color: "bg-destructive/10 text-destructive border-destructive/20" },
    travel: { label: "Travel Day", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    off: { label: "Off Day", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  };

  const currentStatus = statusConfig[dayStatus];

  const quickActions = [
    { icon: Compass, label: "Explore", tab: "explore" as AtlasTab, desc: "Discover your city" },
    { icon: Clock, label: "Curfew", tab: "curfew" as AtlasTab, desc: "Manage your windows" },
    { icon: RotateCcw, label: "Reset", tab: "reset" as AtlasTab, desc: "Mental check-in" },
    { icon: Plane, label: "Transition", tab: "transition" as AtlasTab, desc: "Moving abroad" },
  ];

  return (
    <div className="space-y-6">
      {/* Location & Status Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{city}, {country}</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {(["game", "travel", "off"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setDayStatus(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                dayStatus === status ? statusConfig[status].color : "border-border text-muted-foreground hover:border-foreground/20"
              }`}
            >
              {statusConfig[status].label}
            </button>
          ))}
        </div>
      </div>

      {/* Lifestyle Window Card */}
      <Card className="border-border/50">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Lifestyle Window</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {dayStatus === "game" ? "Limited" : dayStatus === "travel" ? "Flexible" : "Open"}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Available</p>
              <p className="text-lg font-semibold">
                {dayStatus === "game" ? "Post-game — " + curfewTime : dayStatus === "travel" ? "Varies" : "All day — " + curfewTime}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Curfew</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={curfewTime}
                  onChange={(e) => setCurfewTime(e.target.value)}
                  className="text-lg font-semibold bg-transparent border-none outline-none w-24"
                  placeholder="--:-- --"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <button
            key={action.tab}
            onClick={() => onNavigate(action.tab)}
            className="p-4 rounded-xl border border-border/50 hover:border-foreground/20 transition-all text-left space-y-2 bg-card/50"
          >
            <action.icon className="h-5 w-5 text-foreground/70" />
            <div>
              <p className="text-sm font-medium">{action.label}</p>
              <p className="text-xs text-muted-foreground">{action.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Privacy Notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-card/30 border border-border/30">
        <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Zyquence Atlas is a lifestyle and productivity platform for athletes and is not affiliated with any team, league, or agency. All data remains private and controlled by you.
        </p>
      </div>
    </div>
  );
};

export default AtlasHome;
