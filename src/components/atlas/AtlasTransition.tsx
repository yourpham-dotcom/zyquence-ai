import { useState } from "react";
import { Check, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const AtlasTransition = () => {
  const [activePhase, setActivePhase] = useState<30 | 60 | 90>(30);
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setCompletedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const phases = {
    30: {
      title: "Days 1–30",
      subtitle: "Settling in",
      items: [
        { id: "housing", label: "Secure housing", category: "Logistics" },
        { id: "bank", label: "Local banking setup", category: "Finance" },
        { id: "sim", label: "Local phone / SIM", category: "Logistics" },
        { id: "grocery", label: "Locate grocery sources", category: "Daily" },
        { id: "gym", label: "Recovery facility access", category: "Performance" },
        { id: "transport", label: "Transportation sorted", category: "Logistics" },
        { id: "language", label: "10 essential local phrases", category: "Adjustment" },
        { id: "emergency", label: "Emergency contacts saved", category: "Safety" },
      ],
    },
    60: {
      title: "Days 30–60",
      subtitle: "Building structure",
      items: [
        { id: "routine", label: "Daily routine established", category: "Daily" },
        { id: "food-spots", label: "Food rotation built", category: "Daily" },
        { id: "barber", label: "Personal services located", category: "Lifestyle" },
        { id: "explore", label: "3 neighborhoods explored", category: "Adjustment" },
        { id: "finance-track", label: "Monthly spending tracked", category: "Finance" },
        { id: "recovery-routine", label: "Recovery routine dialed in", category: "Performance" },
      ],
    },
    90: {
      title: "Days 60–90",
      subtitle: "Operating normally",
      items: [
        { id: "comfort", label: "Comfort zones identified", category: "Lifestyle" },
        { id: "cultural", label: "Local event attended", category: "Adjustment" },
        { id: "tax", label: "Tax obligations understood", category: "Finance" },
        { id: "support", label: "Personal support network built", category: "Social" },
        { id: "evaluate", label: "Lifestyle setup reviewed", category: "Daily" },
      ],
    },
  };

  const currentPhase = phases[activePhase];
  const phaseCompleted = currentPhase.items.filter((i) => completedItems.includes(i.id)).length;
  const phaseProgress = (phaseCompleted / currentPhase.items.length) * 100;

  const frictionPoints = [
    { title: "Language gap", detail: "Basic phrases prevent most friction. Translation apps help but aren't reliable for nuance." },
    { title: "Timing norms differ", detail: "Meal times, store hours, and punctuality expectations vary by region." },
    { title: "Financial rhythm", detail: "Pay schedules, tax withholding, and cost of living differ from home market." },
    { title: "Personal space norms", detail: "Greetings, physical distance, and eye contact expectations vary." },
  ];

  const commonErrors = [
    "Assuming English fluency everywhere",
    "Not learning emergency numbers",
    "Overspending in month one",
    "Skipping sleep adjustment",
    "Ignoring local traffic laws",
  ];

  return (
    <div className="space-y-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">International Adjustment</p>

      {/* Phase Selector */}
      <div className="flex gap-1.5">
        {([30, 60, 90] as const).map((phase) => (
          <button
            key={phase}
            onClick={() => setActivePhase(phase)}
            className={`flex-1 py-2.5 text-xs font-medium border transition-colors ${
              activePhase === phase
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:border-foreground/30"
            }`}
          >
            {phase} Days
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div>
            <p className="font-medium">{currentPhase.title}</p>
            <p className="text-muted-foreground">{currentPhase.subtitle}</p>
          </div>
          <span className="text-muted-foreground">{phaseCompleted}/{currentPhase.items.length}</span>
        </div>
        <Progress value={phaseProgress} className="h-1" />
      </div>

      {/* Checklist */}
      <div className="space-y-1.5">
        {currentPhase.items.map((item) => (
          <button
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`w-full flex items-center gap-3 p-3 border text-left transition-colors ${
              completedItems.includes(item.id)
                ? "border-foreground/10 opacity-50"
                : "border-border hover:border-foreground/15"
            }`}
          >
            <div
              className={`h-4 w-4 border flex items-center justify-center shrink-0 transition-colors ${
                completedItems.includes(item.id)
                  ? "border-foreground bg-foreground"
                  : "border-border"
              }`}
            >
              {completedItems.includes(item.id) && <Check className="h-3 w-3 text-background" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${completedItems.includes(item.id) ? "line-through" : ""}`}>
                {item.label}
              </p>
              <p className="text-[10px] text-muted-foreground">{item.category}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Friction Points */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Friction Points</p>
        {frictionPoints.map((fp, i) => (
          <div key={i} className="p-3 border border-border space-y-1">
            <p className="text-sm font-medium">{fp.title}</p>
            <p className="text-[11px] text-muted-foreground">{fp.detail}</p>
          </div>
        ))}
      </div>

      {/* Common Errors */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Common Errors</p>
        {commonErrors.map((err, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-foreground/80">
            <AlertTriangle className="h-3 w-3 text-muted-foreground shrink-0" />
            {err}
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground border-t border-border/50 pt-3">
        Informational only. Not legal, financial, or contractual advice.
      </p>
    </div>
  );
};

export default AtlasTransition;
