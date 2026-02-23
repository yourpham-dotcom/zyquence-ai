import { useState, useMemo } from "react";
import { differenceInDays, format, addDays, isAfter, isBefore } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Diamond, CheckCircle2, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type TimelineTask = {
  id: string;
  title: string;
  description?: string | null;
  assigned_to?: string | null;
  status: string;
  priority: string;
  deadline?: string | null;
  phase?: string | null;
};

type TimelineMilestone = {
  id: string;
  title: string;
  target_date: string | null;
  is_completed: boolean;
};

type Props = {
  tasks: TimelineTask[];
  milestones: TimelineMilestone[];
  projectDeadline?: string | null;
  projectStart: string;
  onTaskClick?: (task: TimelineTask) => void;
};

const PHASE_COLORS = [
  "bg-blue-500/80",
  "bg-emerald-500/80",
  "bg-amber-500/80",
  "bg-violet-500/80",
  "bg-rose-500/80",
  "bg-cyan-500/80",
  "bg-orange-500/80",
];

const PHASE_BG = [
  "bg-blue-500/10 border-blue-500/20",
  "bg-emerald-500/10 border-emerald-500/20",
  "bg-amber-500/10 border-amber-500/20",
  "bg-violet-500/10 border-violet-500/20",
  "bg-rose-500/10 border-rose-500/20",
  "bg-cyan-500/10 border-cyan-500/20",
  "bg-orange-500/10 border-orange-500/20",
];

export function RoadmapTimeline({ tasks, milestones, projectDeadline, projectStart, onTaskClick }: Props) {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  const { phases, timelineStart, timelineEnd, totalDays } = useMemo(() => {
    const start = new Date(projectStart);
    const allDates = tasks
      .filter(t => t.deadline)
      .map(t => new Date(t.deadline!));
    const milestoneDates = milestones
      .filter(m => m.target_date)
      .map(m => new Date(m.target_date!));
    const allTimeDates = [...allDates, ...milestoneDates];
    
    if (projectDeadline) allTimeDates.push(new Date(projectDeadline));
    
    const end = allTimeDates.length > 0
      ? new Date(Math.max(...allTimeDates.map(d => d.getTime())))
      : addDays(start, 30);
    
    // Add buffer
    const timelineEnd = addDays(end, 3);
    const totalDays = Math.max(differenceInDays(timelineEnd, start), 7);

    // Group tasks by phase
    const phaseMap = new Map<string, TimelineTask[]>();
    tasks.forEach(t => {
      const phase = t.phase || "Unassigned";
      if (!phaseMap.has(phase)) phaseMap.set(phase, []);
      phaseMap.get(phase)!.push(t);
    });

    const phases = Array.from(phaseMap.entries()).map(([name, phaseTasks]) => {
      const deadlines = phaseTasks.filter(t => t.deadline).map(t => new Date(t.deadline!));
      const earliestTask = deadlines.length ? new Date(Math.min(...deadlines.map(d => d.getTime()))) : start;
      const latestTask = deadlines.length ? new Date(Math.max(...deadlines.map(d => d.getTime()))) : addDays(start, 7);
      
      return {
        name,
        tasks: phaseTasks,
        startDay: Math.max(0, differenceInDays(earliestTask, start) - 2),
        endDay: differenceInDays(latestTask, start) + 1,
        completed: phaseTasks.filter(t => t.status === "complete").length,
        total: phaseTasks.length,
      };
    });

    return { phases, timelineStart: start, timelineEnd, totalDays };
  }, [tasks, milestones, projectDeadline, projectStart]);

  // Generate week markers
  const weekMarkers = useMemo(() => {
    const markers: { label: string; position: number }[] = [];
    for (let i = 0; i <= totalDays; i += 7) {
      markers.push({
        label: format(addDays(timelineStart, i), "MMM d"),
        position: (i / totalDays) * 100,
      });
    }
    return markers;
  }, [totalDays, timelineStart]);

  const milestonePositions = useMemo(() => {
    return milestones
      .filter(m => m.target_date)
      .map(m => ({
        ...m,
        position: Math.min(100, Math.max(0, (differenceInDays(new Date(m.target_date!), timelineStart) / totalDays) * 100)),
      }));
  }, [milestones, timelineStart, totalDays]);

  const todayPosition = useMemo(() => {
    const days = differenceInDays(new Date(), timelineStart);
    return Math.min(100, Math.max(0, (days / totalDays) * 100));
  }, [timelineStart, totalDays]);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No tasks with deadlines to display on the roadmap.
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-1">
        {/* Week scale header */}
        <div className="relative h-8 mb-2">
          {weekMarkers.map((marker, i) => (
            <div
              key={i}
              className="absolute top-0 flex flex-col items-center"
              style={{ left: `${marker.position}%` }}
            >
              <div className="h-3 w-px bg-border" />
              <span className="text-[10px] text-muted-foreground mt-0.5 whitespace-nowrap">
                {marker.label}
              </span>
            </div>
          ))}
          {/* Today marker */}
          {todayPosition >= 0 && todayPosition <= 100 && (
            <div
              className="absolute top-0 bottom-0 w-px bg-primary z-10"
              style={{ left: `${todayPosition}%` }}
            >
              <span className="absolute -top-4 -translate-x-1/2 text-[9px] font-medium text-primary bg-background px-1">
                Today
              </span>
            </div>
          )}
        </div>

        {/* Milestone markers */}
        {milestonePositions.length > 0 && (
          <div className="relative h-6 mb-1">
            {milestonePositions.map(m => (
              <Tooltip key={m.id}>
                <TooltipTrigger asChild>
                  <div
                    className="absolute -translate-x-1/2 cursor-pointer"
                    style={{ left: `${m.position}%` }}
                  >
                    <Diamond
                      className={cn(
                        "h-4 w-4",
                        m.is_completed ? "text-green-500 fill-green-500" : "text-amber-500 fill-amber-500/30"
                      )}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p className="font-medium">{m.title}</p>
                  {m.target_date && <p className="text-muted-foreground">{format(new Date(m.target_date), "MMM d, yyyy")}</p>}
                  <p>{m.is_completed ? "✓ Completed" : "Pending"}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}

        {/* Phase bars */}
        <div className="space-y-2">
          {phases.map((phase, idx) => {
            const colorIdx = idx % PHASE_COLORS.length;
            const barLeft = (phase.startDay / totalDays) * 100;
            const barWidth = Math.max(3, ((phase.endDay - phase.startDay) / totalDays) * 100);
            const isExpanded = expandedPhase === phase.name;

            return (
              <div key={phase.name} className="space-y-1">
                {/* Phase bar */}
                <div
                  className="relative h-9 rounded-md bg-muted/30 cursor-pointer group"
                  onClick={() => setExpandedPhase(isExpanded ? null : phase.name)}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "absolute top-0 bottom-0 rounded-md transition-all",
                          PHASE_COLORS[colorIdx],
                          "flex items-center px-3 min-w-[80px]"
                        )}
                        style={{
                          left: `${barLeft}%`,
                          width: `${barWidth}%`,
                        }}
                      >
                        <span className="text-xs font-medium text-white truncate">
                          {phase.name}
                        </span>
                        <span className="ml-auto text-[10px] text-white/80 shrink-0 pl-2">
                          {phase.completed}/{phase.total}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p className="font-medium">{phase.name}</p>
                      <p className="text-muted-foreground">{phase.completed} of {phase.total} tasks complete</p>
                      <p className="text-muted-foreground">Click to expand tasks</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Today line overlay */}
                  {todayPosition >= 0 && todayPosition <= 100 && (
                    <div
                      className="absolute top-0 bottom-0 w-px bg-primary/40 pointer-events-none"
                      style={{ left: `${todayPosition}%` }}
                    />
                  )}
                </div>

                {/* Expanded tasks */}
                {isExpanded && (
                  <div className={cn("ml-4 space-y-1 py-1 pl-3 border-l-2", PHASE_BG[colorIdx].split(" ")[0] ? `border-l-${PHASE_COLORS[colorIdx].replace("bg-", "").replace("/80", "")}` : "border-l-border")}>
                    {phase.tasks.map(task => {
                      const taskPos = task.deadline
                        ? (differenceInDays(new Date(task.deadline), timelineStart) / totalDays) * 100
                        : null;
                      return (
                        <Tooltip key={task.id}>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded text-xs cursor-pointer hover:bg-accent/50 transition-colors border",
                                PHASE_BG[colorIdx]
                              )}
                              onClick={() => onTaskClick?.(task)}
                            >
                              {task.status === "complete" ? (
                                <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                              ) : task.status === "in_progress" ? (
                                <Clock className="h-3 w-3 text-blue-500 shrink-0" />
                              ) : (
                                <div className="h-3 w-3 rounded-full border border-muted-foreground/30 shrink-0" />
                              )}
                              <span className={cn("truncate", task.status === "complete" && "line-through text-muted-foreground")}>
                                {task.title}
                              </span>
                              <span className="ml-auto text-muted-foreground shrink-0">
                                {task.deadline ? format(new Date(task.deadline), "MMM d") : "—"}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="text-xs max-w-[200px]">
                            <p className="font-medium">{task.title}</p>
                            {task.description && <p className="text-muted-foreground">{task.description}</p>}
                            {task.assigned_to && (
                              <p className="flex items-center gap-1 mt-1">
                                <Users className="h-3 w-3" /> {task.assigned_to}
                              </p>
                            )}
                            <p className="mt-1">Status: {task.status.replace("_", " ")}</p>
                            <p>Priority: {task.priority}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
