import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const STORAGE_KEY = "zyquence-calendar-events";

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  color: string;
  date: string;
}

export function MiniCalendar() {
  const [currentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const load = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) try { setEvents(JSON.parse(saved)); } catch {}
      else setEvents([]);
    };
    load();
    // Listen for storage changes from the calendar page
    window.addEventListener("storage", load);
    // Also poll briefly to catch same-tab writes
    const interval = setInterval(load, 2000);
    return () => { window.removeEventListener("storage", load); clearInterval(interval); };
  }, []);

  const today = currentDate.getDate();
  const month = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();
  const todayStr = currentDate.toISOString().split("T")[0];

  const firstDay = new Date(year, currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Get dates that have events this month
  const eventDates = new Set(
    events
      .filter((e) => e.date.startsWith(`${year}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`))
      .map((e) => parseInt(e.date.split("-")[2]))
  );

  // Upcoming events (today and future, max 5)
  const upcoming = events
    .filter((e) => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 5);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-sidebar-foreground/80">
          {month} {year}
        </span>
      </div>

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
              "text-[10px] text-center py-1 rounded-md cursor-default relative",
              day === today
                ? "bg-primary text-primary-foreground font-bold"
                : day
                ? "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                : ""
            )}
          >
            {day ?? ""}
            {day && eventDates.has(day) && day !== today && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
            )}
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          Upcoming
        </span>
        {upcoming.length === 0 ? (
          <p className="text-[10px] text-sidebar-foreground/40">No upcoming events</p>
        ) : (
          upcoming.map((evt) => (
            <div key={evt.id} className="flex items-center gap-2">
              <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", evt.color)} />
              <span className="text-[10px] text-sidebar-foreground/60">{evt.time}</span>
              <span className="text-[10px] text-sidebar-foreground/80 truncate">{evt.title}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
