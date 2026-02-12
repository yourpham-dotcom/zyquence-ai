import { useState } from "react";
import { Clock, Moon, Sun, Calendar, Bell, MapPin, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const AtlasCurfew = () => {
  const [curfew, setCurfew] = useState("23:00");
  const [dayType, setDayType] = useState<"game" | "off" | "travel">("off");
  const [remindersOn, setRemindersOn] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState(30);

  const dayTypes = [
    { id: "game" as const, label: "Game Day", icon: Sun, curfewDefault: "22:00" },
    { id: "off" as const, label: "Off Day", icon: Moon, curfewDefault: "23:30" },
    { id: "travel" as const, label: "Travel Day", icon: Calendar, curfewDefault: "22:00" },
  ];

  const getLifestyleWindow = () => {
    const hour = parseInt(curfew.split(":")[0]);
    if (dayType === "game") {
      return { start: "Post-game (~2hrs after)", end: curfew, duration: "~2-3 hrs" };
    }
    if (dayType === "travel") {
      return { start: "After arrival", end: curfew, duration: "Varies" };
    }
    return { start: "Morning", end: curfew, duration: `All day until ${formatTime(curfew)}` };
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
  };

  const window = getLifestyleWindow();

  const suggestedSpots = [
    { name: "Quick dinner spot", fits: true, time: "45 min", type: "Food" },
    { name: "Recovery smoothie bar", fits: true, time: "15 min", type: "Recovery" },
    { name: "Shopping district", fits: dayType !== "game", time: "1-2 hrs", type: "Shopping" },
    { name: "Cultural museum visit", fits: dayType === "off", time: "2-3 hrs", type: "Culture" },
  ];

  return (
    <div className="space-y-5">
      {/* Day Type Selector */}
      <div className="space-y-2">
        <p className="text-sm font-medium">What kind of day is it?</p>
        <div className="flex gap-2">
          {dayTypes.map((dt) => (
            <button
              key={dt.id}
              onClick={() => {
                setDayType(dt.id);
                setCurfew(dt.curfewDefault);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-medium border transition-all ${
                dayType === dt.id
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/30"
              }`}
            >
              <dt.icon className="h-4 w-4" />
              {dt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Curfew Input */}
      <Card className="border-border/50">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Your Curfew</span>
            </div>
            <Badge variant="outline" className="text-xs">Optional</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Input
              type="time"
              value={curfew}
              onChange={(e) => setCurfew(e.target.value)}
              className="w-40 text-center text-lg font-semibold"
            />
            <p className="text-2xl font-semibold text-foreground/80">{formatTime(curfew)}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            This can be your personal preference or a team guideline. You control this.
          </p>
        </CardContent>
      </Card>

      {/* Lifestyle Window */}
      <Card className="border-border/50">
        <CardContent className="p-5 space-y-3">
          <p className="text-sm font-medium">Your Lifestyle Window</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Start</p>
              <p className="text-sm font-medium">{window.start}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">End</p>
              <p className="text-sm font-medium">{formatTime(curfew)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-medium">{window.duration}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reminders */}
      <Card className="border-border/50">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Gentle Reminders</span>
            </div>
            <Switch checked={remindersOn} onCheckedChange={setRemindersOn} />
          </div>
          {remindersOn && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Remind me before curfew</p>
              <div className="flex gap-2">
                {[15, 30, 45, 60].map((min) => (
                  <button
                    key={min}
                    onClick={() => setReminderMinutes(min)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                      reminderMinutes === min
                        ? "bg-foreground text-background border-foreground"
                        : "border-border text-muted-foreground hover:border-foreground/30"
                    }`}
                  >
                    {min} min
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground italic">
                A friendly heads-up, not an alarm. Just helping you stay on track.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggested Spots That Fit */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Fits Your Window</p>
        {suggestedSpots.map((spot, i) => (
          <div
            key={i}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
              spot.fits ? "border-border/50 bg-card/50" : "border-border/20 opacity-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm">{spot.name}</p>
                <p className="text-xs text-muted-foreground">{spot.type} · {spot.time}</p>
              </div>
            </div>
            {spot.fits ? (
              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">Fits</Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] text-muted-foreground">Too long</Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AtlasCurfew;
