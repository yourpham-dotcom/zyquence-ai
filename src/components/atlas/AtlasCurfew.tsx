import { useState, useMemo } from "react";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface AtlasCurfewProps {
  mode: string;
}

const AtlasCurfew = ({ mode }: AtlasCurfewProps) => {
  const [city, setCity] = useState("Los Angeles");
  const [country, setCountry] = useState("USA");
  const [stayLength, setStayLength] = useState("7");
  const [arrivalDate, setArrivalDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [cutoffTime, setCutoffTime] = useState("23:00");
  const [dayType, setDayType] = useState<"game" | "off" | "travel">("off");

  const formatTime = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
  };

  const scenario = useMemo(() => {
    const cutoffHour = parseInt(cutoffTime.split(":")[0]);
    const cutoffMin = parseInt(cutoffTime.split(":")[1]);

    let startHour: number;
    let startLabel: string;

    if (dayType === "game") {
      startHour = 21;
      startLabel = "~9:00 PM (post-game estimate)";
    } else if (dayType === "travel") {
      startHour = 14;
      startLabel = "~2:00 PM (post-arrival estimate)";
    } else {
      startHour = 8;
      startLabel = "8:00 AM";
    }

    const totalMinutes = (cutoffHour * 60 + cutoffMin) - (startHour * 60);
    const hours = Math.floor(Math.max(0, totalMinutes) / 60);
    const mins = Math.max(0, totalMinutes) % 60;

    const categories: { name: string; duration: string; fits: boolean; priority: string }[] = [];

    if (mode === "recovery") {
      categories.push(
        { name: "Recovery meal", duration: "45 min", fits: totalMinutes >= 45, priority: "High" },
        { name: "Light walk", duration: "30 min", fits: totalMinutes >= 75, priority: "Medium" },
        { name: "Shopping", duration: "90 min", fits: totalMinutes >= 165, priority: "Low" },
      );
    } else if (mode === "exploration") {
      categories.push(
        { name: "Neighborhood walk", duration: "60 min", fits: totalMinutes >= 60, priority: "High" },
        { name: "Local food spot", duration: "45 min", fits: totalMinutes >= 105, priority: "High" },
        { name: "Cultural site", duration: "120 min", fits: totalMinutes >= 225, priority: "Medium" },
        { name: "Shopping district", duration: "90 min", fits: totalMinutes >= 315, priority: "Low" },
      );
    } else if (mode === "low-energy") {
      categories.push(
        { name: "Coffee spot", duration: "30 min", fits: totalMinutes >= 30, priority: "High" },
        { name: "Light meal", duration: "40 min", fits: totalMinutes >= 70, priority: "Medium" },
        { name: "Bookstore / quiet area", duration: "45 min", fits: totalMinutes >= 115, priority: "Low" },
      );
    } else {
      categories.push(
        { name: "Airport food", duration: "30 min", fits: totalMinutes >= 30, priority: "High" },
        { name: "Hotel check-in area", duration: "20 min", fits: totalMinutes >= 50, priority: "Medium" },
        { name: "Nearby walk", duration: "30 min", fits: totalMinutes >= 80, priority: "Low" },
      );
    }

    const warnings: string[] = [];
    if (totalMinutes < 60) warnings.push("Very limited window. Prioritize essentials only.");
    if (dayType === "game" && totalMinutes > 180) warnings.push("Extended post-game window. Monitor energy.");
    if (dayType === "travel") warnings.push("Arrival time is estimated. Adjust after landing.");
    if (parseInt(stayLength) <= 2) warnings.push("Short stay. Minimize exploration scope.");

    return { startLabel, totalMinutes, hours, mins, categories, warnings };
  }, [cutoffTime, dayType, mode, stayLength]);

  return (
    <div className="space-y-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Scenario View</p>

      {/* Inputs Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] text-muted-foreground">City</label>
          <Input value={city} onChange={(e) => setCity(e.target.value)} className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] text-muted-foreground">Country / Region</label>
          <Input value={country} onChange={(e) => setCountry(e.target.value)} className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] text-muted-foreground">Stay (days)</label>
          <Input type="number" value={stayLength} onChange={(e) => setStayLength(e.target.value)} className="h-8 text-sm" min="1" />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] text-muted-foreground">Arrival Date</label>
          <Input type="date" value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} className="h-8 text-sm" />
        </div>
      </div>

      {/* Day Type + Cutoff */}
      <div className="flex items-end gap-3">
        <div className="flex gap-1.5">
          {(["game", "off", "travel"] as const).map((dt) => (
            <button
              key={dt}
              onClick={() => setDayType(dt)}
              className={`px-2.5 py-1.5 text-xs font-medium border transition-colors ${
                dayType === dt
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/30"
              }`}
            >
              {dt === "game" ? "Game" : dt === "off" ? "Off" : "Travel"}
            </button>
          ))}
        </div>
        <div className="space-y-1">
          <label className="text-[11px] text-muted-foreground">Cutoff</label>
          <Input type="time" value={cutoffTime} onChange={(e) => setCutoffTime(e.target.value)} className="h-8 text-sm w-28" />
        </div>
      </div>

      {/* Time Breakdown */}
      <Card className="border-border">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Time Breakdown</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[11px] text-muted-foreground">Start</p>
              <p className="text-sm font-medium">{scenario.startLabel}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">End</p>
              <p className="text-sm font-medium">{formatTime(cutoffTime)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Usable Time</p>
              <p className="text-sm font-medium">
                {scenario.totalMinutes > 0 ? `${scenario.hours}h ${scenario.mins}m` : "None"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Categories */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Activities That Fit</p>
        {scenario.categories.map((cat, i) => (
          <div
            key={i}
            className={`flex items-center justify-between p-3 border transition-colors ${
              cat.fits ? "border-border" : "border-border/30 opacity-40"
            }`}
          >
            <div className="flex items-center gap-3">
              {cat.fits ? (
                <CheckCircle className="h-3.5 w-3.5 text-foreground/50" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm">{cat.name}</p>
                <p className="text-[11px] text-muted-foreground">{cat.duration} · Priority: {cat.priority}</p>
              </div>
            </div>
            <span className={`text-[11px] font-medium ${cat.fits ? "text-foreground/70" : "text-muted-foreground"}`}>
              {cat.fits ? "Fits" : "Exceeds"}
            </span>
          </div>
        ))}
      </div>

      {/* Warnings */}
      {scenario.warnings.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-border/50">
          {scenario.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
              {w}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AtlasCurfew;
