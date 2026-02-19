import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [currentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(currentDate.getDate());
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const load = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) try { setEvents(JSON.parse(saved)); } catch {}
      else setEvents([]);
    };
    load();
    window.addEventListener("storage", load);
    const interval = setInterval(load, 2000);
    return () => { window.removeEventListener("storage", load); clearInterval(interval); };
  }, []);

  const today = currentDate.getDate();
  const month = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();
  const monthNum = currentDate.getMonth();

  const firstDay = new Date(year, monthNum, 1).getDay();
  const daysInMonth = new Date(year, monthNum + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthPrefix = `${year}-${String(monthNum + 1).padStart(2, "0")}`;

  const eventDates = new Set(
    events
      .filter((e) => e.date.startsWith(monthPrefix))
      .map((e) => parseInt(e.date.split("-")[2]))
  );

  const selectedDateStr = `${monthPrefix}-${String(selectedDay).padStart(2, "0")}`;
  const eventsForSelected = events
    .filter((e) => e.date === selectedDateStr)
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 5);

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  const handleDayDoubleClick = (day: number) => {
    navigate("/dashboard/calendar");
  };

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
            onClick={() => day && handleDayClick(day)}
            onDoubleClick={() => day && handleDayDoubleClick(day)}
            className={cn(
              "text-[10px] text-center py-1 rounded-md relative",
              day ? "cursor-pointer" : "cursor-default",
              day === today && day === selectedDay
                ? "bg-primary text-primary-foreground font-bold"
                : day === selectedDay
                ? "bg-accent text-foreground font-bold ring-1 ring-primary/50"
                : day === today
                ? "bg-primary/30 text-primary-foreground font-bold"
                : day
                ? "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                : ""
            )}
          >
            {day ?? ""}
            {day && eventDates.has(day) && day !== selectedDay && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
            )}
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          {eventsForSelected.length > 0 ? `Events · ${selectedDay}` : "Upcoming"}
        </span>
        {eventsForSelected.length === 0 ? (
          <p className="text-[10px] text-sidebar-foreground/40">No events for this date</p>
        ) : (
          eventsForSelected.map((evt) => (
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
