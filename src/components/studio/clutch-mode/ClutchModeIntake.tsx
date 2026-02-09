import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  CalendarIcon, Plus, Trash2, Clock, Brain, Zap,
  ChevronRight, ChevronLeft, Target
} from "lucide-react";
import type { ClutchIntakeData, WorkingWindow, FixedCommitment } from "./types";

interface ClutchModeIntakeProps {
  onSubmit: (data: ClutchIntakeData) => void;
  isLoading: boolean;
}

const STEPS = [
  { label: "Deadline", icon: CalendarIcon },
  { label: "Availability", icon: Clock },
  { label: "Preferences", icon: Brain },
  { label: "Brain Dump", icon: Zap },
  { label: "Priorities", icon: Target },
];

const generateId = () => Math.random().toString(36).substring(2, 9);

const ClutchModeIntake = ({ onSubmit, isLoading }: ClutchModeIntakeProps) => {
  const [step, setStep] = useState(0);
  const [deadlineDate, setDeadlineDate] = useState<Date>();
  const [deadlineTime, setDeadlineTime] = useState("23:59");
  const [workingWindows, setWorkingWindows] = useState<WorkingWindow[]>([
    { id: generateId(), date: "", startTime: "09:00", endTime: "17:00" },
  ]);
  const [minSleepHours, setMinSleepHours] = useState(6);
  const [focusMethod, setFocusMethod] = useState<"25/5" | "50/10" | "90/15">("25/5");
  const [energyLevel, setEnergyLevel] = useState(5);
  const [brainDump, setBrainDump] = useState("");
  const [topOutcomes, setTopOutcomes] = useState(["", "", ""]);
  const [fixedCommitments, setFixedCommitments] = useState<FixedCommitment[]>([]);
  const [doneEnough, setDoneEnough] = useState("");

  const addWorkingWindow = () => {
    setWorkingWindows((prev) => [
      ...prev,
      { id: generateId(), date: "", startTime: "09:00", endTime: "17:00" },
    ]);
  };

  const removeWorkingWindow = (id: string) => {
    setWorkingWindows((prev) => prev.filter((w) => w.id !== id));
  };

  const updateWorkingWindow = (id: string, field: keyof WorkingWindow, value: string) => {
    setWorkingWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [field]: value } : w))
    );
  };

  const addCommitment = () => {
    setFixedCommitments((prev) => [
      ...prev,
      { id: generateId(), label: "", date: "", startTime: "09:00", endTime: "10:00" },
    ]);
  };

  const removeCommitment = (id: string) => {
    setFixedCommitments((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCommitment = (id: string, field: keyof FixedCommitment, value: string) => {
    setFixedCommitments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleSubmit = () => {
    if (!deadlineDate) return;
    onSubmit({
      deadline: format(deadlineDate, "yyyy-MM-dd"),
      deadlineTime,
      workingWindows,
      minSleepHours,
      focusMethod,
      energyLevel,
      brainDump,
      topOutcomes: topOutcomes.filter((o) => o.trim() !== ""),
      fixedCommitments,
      doneEnough,
    });
  };

  const canProceed = () => {
    switch (step) {
      case 0: return !!deadlineDate;
      case 1: return workingWindows.length > 0;
      case 2: return true;
      case 3: return brainDump.trim().length > 0;
      case 4: return topOutcomes.some((o) => o.trim() !== "") && doneEnough.trim().length > 0;
      default: return false;
    }
  };

  const focusMethods = [
    { value: "25/5" as const, label: "25/5", desc: "Pomodoro — short bursts" },
    { value: "50/10" as const, label: "50/10", desc: "Deep focus — medium blocks" },
    { value: "90/15" as const, label: "90/15", desc: "Flow state — long sessions" },
  ];

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">When is your deadline?</h3>
              <p className="text-sm text-muted-foreground">We will work backwards from here.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label className="text-sm text-muted-foreground mb-2 block">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !deadlineDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deadlineDate ? format(deadlineDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deadlineDate}
                      onSelect={setDeadlineDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="w-full sm:w-36">
                <Label className="text-sm text-muted-foreground mb-2 block">Time</Label>
                <Input
                  type="time"
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">When can you work?</h3>
              <p className="text-sm text-muted-foreground">Add your available time blocks between now and the deadline.</p>
            </div>

            <div className="space-y-3">
              {workingWindows.map((w) => (
                <Card key={w.id} className="p-3 bg-card/50 border-border">
                  <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2">
                    <div className="flex-1 w-full">
                      <Label className="text-xs text-muted-foreground">Date</Label>
                      <Input type="date" value={w.date} onChange={(e) => updateWorkingWindow(w.id, "date", e.target.value)} />
                    </div>
                    <div className="w-full sm:w-28">
                      <Label className="text-xs text-muted-foreground">From</Label>
                      <Input type="time" value={w.startTime} onChange={(e) => updateWorkingWindow(w.id, "startTime", e.target.value)} />
                    </div>
                    <div className="w-full sm:w-28">
                      <Label className="text-xs text-muted-foreground">To</Label>
                      <Input type="time" value={w.endTime} onChange={(e) => updateWorkingWindow(w.id, "endTime", e.target.value)} />
                    </div>
                    {workingWindows.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeWorkingWindow(w.id)} className="text-destructive shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
              <Button variant="outline" size="sm" onClick={addWorkingWindow} className="w-full">
                <Plus className="h-4 w-4 mr-1" /> Add Window
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Fixed Commitments</h4>
              <p className="text-xs text-muted-foreground">Classes, meetings, shifts — anything you cannot move.</p>
              {fixedCommitments.map((c) => (
                <Card key={c.id} className="p-3 bg-card/50 border-border">
                  <div className="flex flex-col gap-2">
                    <Input placeholder="Label (e.g., Team meeting)" value={c.label} onChange={(e) => updateCommitment(c.id, "label", e.target.value)} />
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input type="date" value={c.date} onChange={(e) => updateCommitment(c.id, "date", e.target.value)} className="flex-1" />
                      <Input type="time" value={c.startTime} onChange={(e) => updateCommitment(c.id, "startTime", e.target.value)} className="w-full sm:w-28" />
                      <Input type="time" value={c.endTime} onChange={(e) => updateCommitment(c.id, "endTime", e.target.value)} className="w-full sm:w-28" />
                      <Button variant="ghost" size="icon" onClick={() => removeCommitment(c.id)} className="text-destructive shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              <Button variant="outline" size="sm" onClick={addCommitment} className="w-full">
                <Plus className="h-4 w-4 mr-1" /> Add Commitment
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">How do you work best?</h3>
              <p className="text-sm text-muted-foreground">We will structure your plan around these preferences.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Minimum sleep (hours)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[minSleepHours]}
                  onValueChange={(v) => setMinSleepHours(v[0])}
                  min={3}
                  max={10}
                  step={0.5}
                  className="flex-1"
                />
                <span className="text-sm font-mono font-semibold w-10 text-right text-foreground">{minSleepHours}h</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Focus method (work/break minutes)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {focusMethods.map((fm) => (
                  <button
                    key={fm.value}
                    onClick={() => setFocusMethod(fm.value)}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-all",
                      focusMethod === fm.value
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card/50 text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    <span className="text-sm font-semibold">{fm.label}</span>
                    <p className="text-xs mt-0.5">{fm.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Current energy level</Label>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">Low</span>
                <Slider
                  value={[energyLevel]}
                  onValueChange={(v) => setEnergyLevel(v[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground">High</span>
                <span className="text-sm font-mono font-semibold w-8 text-right text-foreground">{energyLevel}</span>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Brain dump</h3>
              <p className="text-sm text-muted-foreground">Write everything on your mind. Do not organize — just dump it all here.</p>
            </div>
            <Textarea
              value={brainDump}
              onChange={(e) => setBrainDump(e.target.value)}
              placeholder="Everything I need to do: finish the essay intro, email professor, review slides for Wednesday, buy groceries, fix the bug in my app, read chapter 4..."
              className="min-h-[200px] resize-none"
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">What matters most?</h3>
              <p className="text-sm text-muted-foreground">Pick up to 3 outcomes that absolutely must happen by the deadline.</p>
            </div>
            <div className="space-y-3">
              {topOutcomes.map((outcome, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground w-5">{i + 1}.</span>
                  <Input
                    value={outcome}
                    onChange={(e) => {
                      const updated = [...topOutcomes];
                      updated[i] = e.target.value;
                      setTopOutcomes(updated);
                    }}
                    placeholder={
                      i === 0 ? "e.g., Submit essay draft" :
                      i === 1 ? "e.g., Study for midterm" :
                      "e.g., Reply to important emails"
                    }
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">What does "done enough" look like?</Label>
              <Textarea
                value={doneEnough}
                onChange={(e) => setDoneEnough(e.target.value)}
                placeholder="Even if nothing else gets done, I'll feel okay if I at least..."
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Step indicators */}
      <div className="flex items-center justify-center gap-1 py-4 px-4 border-b border-border shrink-0">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center">
            <button
              onClick={() => i <= step && setStep(i)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all",
                i === step
                  ? "bg-primary text-primary-foreground"
                  : i < step
                  ? "text-foreground cursor-pointer hover:bg-accent"
                  : "text-muted-foreground cursor-default"
              )}
            >
              <s.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground mx-0.5" />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-xl mx-auto">
          {renderStep()}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-4 border-t border-border shrink-0">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="gap-1"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed() || isLoading}
            className="gap-1"
          >
            {isLoading ? "Building plan..." : "Generate Plan"}
            <Zap className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ClutchModeIntake;
