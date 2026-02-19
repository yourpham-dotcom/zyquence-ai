import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Plus, Clock, Save, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  color: string;
  date: string;
}

const EVENT_COLORS = [
  "bg-blue-500",
  "bg-orange-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-yellow-500",
];

const STORAGE_KEY = "zyquence-calendar-events";

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showDialog, setShowDialog] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [draft, setDraft] = useState<{ title: string; time: string; color: string }[]>([
    { title: "", time: "", color: EVENT_COLORS[0] },
    { title: "", time: "", color: EVENT_COLORS[1] },
    { title: "", time: "", color: EVENT_COLORS[2] },
    { title: "", time: "", color: EVENT_COLORS[3] },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setEvents(JSON.parse(saved)); } catch {}
    }
  }, []);

  const saveEvents = (updated: CalendarEvent[]) => {
    setEvents(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addDraftRow = () => {
    setDraft((prev) => [
      ...prev,
      { title: "", time: "", color: EVENT_COLORS[prev.length % EVENT_COLORS.length] },
    ]);
  };

  const removeDraftRow = (idx: number) => {
    setDraft((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateDraft = (idx: number, field: "title" | "time", value: string) => {
    setDraft((prev) => prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d)));
  };

  const handleSave = () => {
    const dateStr = (date ?? new Date()).toISOString().split("T")[0];
    const newEvents = draft
      .filter((d) => d.title.trim())
      .map((d) => ({
        id: crypto.randomUUID(),
        title: d.title.trim(),
        time: d.time || "12:00 PM",
        color: d.color,
        date: dateStr,
      }));

    if (newEvents.length === 0) {
      toast.error("Add at least one event with a title");
      return;
    }

    saveEvents([...events, ...newEvents]);
    toast.success(`${newEvents.length} event(s) saved`);
    setShowDialog(false);
    setDraft([
      { title: "", time: "", color: EVENT_COLORS[0] },
      { title: "", time: "", color: EVENT_COLORS[1] },
      { title: "", time: "", color: EVENT_COLORS[2] },
      { title: "", time: "", color: EVENT_COLORS[3] },
    ]);
  };

  const deleteEvent = (id: string) => {
    saveEvents(events.filter((e) => e.id !== id));
    toast.success("Event removed");
  };

  const selectedDateStr = (date ?? new Date()).toISOString().split("T")[0];
  const eventsForDate = events.filter((e) => e.date === selectedDateStr);
  const allEvents = events.sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Calendar</h1>
        <Button size="sm" className="rounded-xl" onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Event
        </Button>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <Calendar mode="single" selected={date} onSelect={setDate} className="w-full" />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              {eventsForDate.length > 0
                ? `Events for ${(date ?? new Date()).toLocaleDateString()}`
                : "All Saved Events"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
            {(eventsForDate.length > 0 ? eventsForDate : allEvents).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No events yet</p>
            ) : (
              (eventsForDate.length > 0 ? eventsForDate : allEvents).map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors group"
                >
                  <div className={cn("w-1.5 h-8 rounded-full shrink-0", evt.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{evt.title}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {evt.time}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteEvent(evt.id)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Event Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Events for {(date ?? new Date()).toLocaleDateString()}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {draft.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={cn("w-2 h-8 rounded-full shrink-0", d.color)} />
                <Input
                  placeholder={`Event ${i + 1}`}
                  value={d.title}
                  onChange={(e) => updateDraft(i, "title", e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Time"
                  value={d.time}
                  onChange={(e) => updateDraft(i, "time", e.target.value)}
                  className="w-24"
                />
                {draft.length > 1 && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeDraftRow(i)}>
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addDraftRow} className="w-full">
            <Plus className="h-3 w-3 mr-1" /> Add Another Event
          </Button>
          <Button onClick={handleSave} className="w-full">
            <Save className="h-4 w-4 mr-1.5" /> Save Events
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
