import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const sampleEvents = [
  { id: 1, title: "Morning workout", time: "9:00 AM", color: "bg-blue-500" },
  { id: 2, title: "Studio session", time: "2:00 PM", color: "bg-orange-500" },
  { id: 3, title: "Review goals", time: "6:00 PM", color: "bg-emerald-500" },
  { id: 4, title: "Meal prep", time: "7:30 PM", color: "bg-purple-500" },
];

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Calendar</h1>
        <Button size="sm" className="rounded-xl">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Event
        </Button>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Calendar */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sampleEvents.map((evt) => (
              <div
                key={evt.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className={cn("w-1.5 h-8 rounded-full shrink-0", evt.color)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{evt.title}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {evt.time}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;
