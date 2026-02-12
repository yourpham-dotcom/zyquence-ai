import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const AtlasReset = () => {
  const [checkInScore, setCheckInScore] = useState<number | null>(null);
  const [journalEntry, setJournalEntry] = useState("");
  const [activeReset, setActiveReset] = useState<string | null>(null);
  const [resetComplete, setResetComplete] = useState(false);

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
    </div>
  );
};

export default AtlasReset;
