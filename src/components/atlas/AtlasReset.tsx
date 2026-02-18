import { useState } from "react";
import { Check, RotateCcw, Plus, X, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface ScheduleBlock {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  type: "recovery" | "training" | "lifestyle" | "rest";
}

const AtlasReset = () => {
  const [checkInScore, setCheckInScore] = useState<number | null>(null);
  const [journalEntry, setJournalEntry] = useState("");
  const [activeReset, setActiveReset] = useState<string | null>(null);
  const [resetComplete, setResetComplete] = useState(false);
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([
    { id: "1", label: "Morning Recovery", startTime: "07:00", endTime: "08:00", type: "recovery" },
    { id: "2", label: "Training", startTime: "09:00", endTime: "11:00", type: "training" },
    { id: "3", label: "Free Time", startTime: "12:00", endTime: "14:00", type: "lifestyle" },
  ]);
  const [newBlock, setNewBlock] = useState({ label: "", startTime: "", endTime: "", type: "lifestyle" as ScheduleBlock["type"] });

  const levels = [
    { score: 1, label: "Low" },
    { score: 2, label: "Below avg" },
    { score: 3, label: "Baseline" },
    { score: 4, label: "Good" },
    { score: 5, label: "Peak" },
  ];

  const resets = [
    {
      id: "breathe",
      title: "30s Breathe",
      duration: "30 seconds",
      steps: [
        "Close eyes",
        "Inhale 4 counts",
        "Hold 4 counts",
        "Exhale 6 counts",
        "Repeat 3 times",
        "Open eyes",
      ],
    },
    {
      id: "ground",
      title: "60s Ground",
      duration: "60 seconds",
      steps: [
        "5 things you see",
        "4 things you can touch",
        "3 things you hear",
        "2 things you smell",
        "1 thing you taste",
        "One breath",
      ],
    },
    {
      id: "refocus",
      title: "90s Refocus",
      duration: "90 seconds",
      steps: [
        "Stand or sit tall",
        "Roll shoulders back x5",
        "Visualize best moment this week (15s)",
        "Name one thing going right",
        "Open eyes, move on",
      ],
    },
  ];

  const prompts = [
    "What needs your attention right now?",
    "What went well today?",
    "How does your body feel?",
    "One thing to prioritize tomorrow.",
  ];

  const [currentPrompt] = useState(prompts[Math.floor(Math.random() * prompts.length)]);

  return (
    <div className="space-y-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Reset</p>

      {/* Check-In */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Current status</p>
        <div className="flex gap-1.5">
          {levels.map((l) => (
            <button
              key={l.score}
              onClick={() => setCheckInScore(l.score)}
              className={`flex-1 py-2.5 text-center text-xs font-medium border transition-colors ${
                checkInScore === l.score
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/30"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        {checkInScore && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Check className="h-3 w-3" />
            Logged.
          </div>
        )}
      </div>

      {/* Reset Exercises */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Quick reset</p>
        {resets.map((r) => (
          <Card
            key={r.id}
            className={`border-border cursor-pointer transition-colors ${
              activeReset === r.id ? "border-foreground/30" : "hover:border-foreground/15"
            }`}
            onClick={() => {
              setActiveReset(activeReset === r.id ? null : r.id);
              setResetComplete(false);
            }}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{r.title}</p>
                <span className="text-[11px] text-muted-foreground">{r.duration}</span>
              </div>
              {activeReset === r.id && (
                <div className="mt-3 space-y-2">
                  <ol className="space-y-1.5">
                    {r.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="text-[11px] text-muted-foreground w-4 shrink-0">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setResetComplete(true);
                    }}
                    className={`w-full py-2 text-xs font-medium border transition-colors ${
                      resetComplete
                        ? "border-foreground/20 text-muted-foreground"
                        : "bg-foreground text-background border-foreground"
                    }`}
                  >
                    {resetComplete ? "Done" : "Complete"}
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Journal */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Quick note</p>
        <p className="text-[11px] text-muted-foreground">{currentPrompt}</p>
        <Textarea
          value={journalEntry}
          onChange={(e) => setJournalEntry(e.target.value)}
          placeholder="Private. Not stored externally."
          className="min-h-[100px] resize-none text-sm"
        />
        {journalEntry.length > 0 && (
          <p className="text-[10px] text-muted-foreground">{journalEntry.length} chars · Private</p>
        )}
      </div>

      {/* Schedule Builder */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Schedule Builder</p>
        <div className="space-y-1.5">
          {scheduleBlocks
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map((block) => (
              <div
                key={block.id}
                className="flex items-center gap-2 p-2.5 border border-border hover:border-foreground/15 transition-colors"
              >
                <div className={`w-1.5 h-8 shrink-0 ${
                  block.type === "recovery" ? "bg-blue-500" :
                  block.type === "training" ? "bg-orange-500" :
                  block.type === "rest" ? "bg-green-500" : "bg-foreground/30"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{block.label}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {block.startTime} – {block.endTime}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground uppercase shrink-0">{block.type}</span>
                <button
                  onClick={() => setScheduleBlocks(prev => prev.filter(b => b.id !== block.id))}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
        </div>

        {/* Add Block */}
        <Card className="border-border">
          <CardContent className="p-3 space-y-2">
            <p className="text-[11px] text-muted-foreground">Add block</p>
            <input
              type="text"
              value={newBlock.label}
              onChange={(e) => setNewBlock(prev => ({ ...prev, label: e.target.value }))}
              placeholder="Label"
              className="w-full text-sm bg-transparent border border-border px-2 py-1.5 outline-none focus:border-foreground/30 transition-colors"
            />
            <div className="flex gap-2">
              <input
                type="time"
                value={newBlock.startTime}
                onChange={(e) => setNewBlock(prev => ({ ...prev, startTime: e.target.value }))}
                className="flex-1 text-sm bg-transparent border border-border px-2 py-1.5 outline-none focus:border-foreground/30"
              />
              <input
                type="time"
                value={newBlock.endTime}
                onChange={(e) => setNewBlock(prev => ({ ...prev, endTime: e.target.value }))}
                className="flex-1 text-sm bg-transparent border border-border px-2 py-1.5 outline-none focus:border-foreground/30"
              />
            </div>
            <div className="flex gap-1">
              {(["recovery", "training", "lifestyle", "rest"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setNewBlock(prev => ({ ...prev, type: t }))}
                  className={`flex-1 py-1.5 text-[11px] font-medium border transition-colors ${
                    newBlock.type === t
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                if (newBlock.label && newBlock.startTime && newBlock.endTime) {
                  setScheduleBlocks(prev => [...prev, { ...newBlock, id: Date.now().toString() }]);
                  setNewBlock({ label: "", startTime: "", endTime: "", type: "lifestyle" });
                }
              }}
              className="w-full py-2 text-xs font-medium bg-foreground text-background border border-foreground transition-colors hover:bg-foreground/90"
            >
              <Plus className="h-3 w-3 inline mr-1" />
              Add Block
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AtlasReset;
