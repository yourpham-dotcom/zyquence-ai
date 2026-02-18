import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

const upcomingEvents = [
  { time: "9:00 AM", label: "Morning workout", color: "bg-blue-500" },
  { time: "2:00 PM", label: "Studio session", color: "bg-orange-500" },
  { time: "6:00 PM", label: "Review goals", color: "bg-emerald-500" },
];

export function MiniCalendar() {
  const [currentDate] = useState(new Date());
  const today = currentDate.getDate();
  const month = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-sidebar-foreground/80">
          {month} {year}
        </span>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5">
        {DAYS.map((d, i) => (
          <div key={i} className="text-[10px] text-center text-sidebar-foreground/40 font-medium">
            {d}
          </div>
        ))}
        {cells.map((day, i) => (
          <div
            key={i}
            className={cn(
              "text-[10px] text-center py-1 rounded-md cursor-default",
              day === today
                ? "bg-primary text-primary-foreground font-bold"
                : day
                ? "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                : ""
            )}
          >
            {day ?? ""}
          </div>
        ))}
      </div>

      {/* Upcoming */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          Upcoming
        </span>
        {upcomingEvents.map((evt, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", evt.color)} />
            <span className="text-[10px] text-sidebar-foreground/60">{evt.time}</span>
            <span className="text-[10px] text-sidebar-foreground/80 truncate">{evt.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
