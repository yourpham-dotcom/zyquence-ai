import { useState } from "react";
import { Heart, Wind, BookOpen, Check, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const AtlasReset = () => {
  const [checkInScore, setCheckInScore] = useState<number | null>(null);
  const [journalEntry, setJournalEntry] = useState("");
  const [activeReset, setActiveReset] = useState<string | null>(null);
  const [resetComplete, setResetComplete] = useState(false);

  const moods = [
    { score: 1, label: "Rough", emoji: "😔" },
    { score: 2, label: "Low", emoji: "😐" },
    { score: 3, label: "Okay", emoji: "🙂" },
    { score: 4, label: "Good", emoji: "😊" },
    { score: 5, label: "Great", emoji: "💪" },
  ];

  const resetPrompts = [
    {
      id: "breathe",
      title: "30-Second Breathe",
      duration: "30s",
      icon: Wind,
      steps: [
        "Close your eyes",
        "Breathe in for 4 counts",
        "Hold for 4 counts",
        "Breathe out for 6 counts",
        "Repeat 3 times",
        "Open your eyes slowly",
      ],
    },
    {
      id: "ground",
      title: "60-Second Grounding",
      duration: "60s",
      icon: Heart,
      steps: [
        "Name 5 things you can see",
        "Name 4 things you can touch",
        "Name 3 things you can hear",
        "Name 2 things you can smell",
        "Name 1 thing you can taste",
        "Take one deep breath",
      ],
    },
    {
      id: "refocus",
      title: "90-Second Refocus",
      duration: "90s",
      icon: RotateCcw,
      steps: [
        "Stand or sit tall",
        "Roll your shoulders back 5 times",
        "Close your eyes and visualize your best moment this week",
        "Hold that image for 15 seconds",
        "Say one thing you're grateful for right now",
        "Open your eyes and move forward",
      ],
    },
  ];

  const journalPrompts = [
    "What's on your mind right now?",
    "What went well today?",
    "What's one thing you're looking forward to?",
    "How does your body feel right now?",
    "What would make tomorrow great?",
  ];

  const [currentPrompt] = useState(journalPrompts[Math.floor(Math.random() * journalPrompts.length)]);

  return (
    <div className="space-y-6">
      {/* Daily Check-In */}
      <div className="space-y-3">
        <p className="text-sm font-medium">How are you feeling?</p>
        <div className="flex gap-2 justify-between">
          {moods.map((mood) => (
            <button
              key={mood.score}
              onClick={() => setCheckInScore(mood.score)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                checkInScore === mood.score
                  ? "bg-foreground/5 border-foreground/20"
                  : "border-border/50 hover:border-border"
              }`}
            >
              <span className="text-xl">{mood.emoji}</span>
              <span className="text-[10px] text-muted-foreground">{mood.label}</span>
            </button>
          ))}
        </div>
        {checkInScore && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="h-3 w-3 text-emerald-500" />
            Logged. Take care of yourself today.
          </div>
        )}
      </div>

      {/* Reset Exercises */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Quick Reset</p>
        {resetPrompts.map((prompt) => (
          <Card
            key={prompt.id}
            className={`border-border/50 cursor-pointer transition-all ${
              activeReset === prompt.id ? "ring-1 ring-foreground/20" : "hover:border-foreground/15"
            }`}
            onClick={() => {
              setActiveReset(activeReset === prompt.id ? null : prompt.id);
              setResetComplete(false);
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <prompt.icon className="h-4 w-4 text-foreground/60" />
                  <div>
                    <p className="text-sm font-medium">{prompt.title}</p>
                    <p className="text-xs text-muted-foreground">{prompt.duration}</p>
                  </div>
                </div>
              </div>
              {activeReset === prompt.id && (
                <div className="mt-4 space-y-3">
                  <ol className="space-y-2">
                    {prompt.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="text-xs text-muted-foreground mt-0.5 w-4 shrink-0">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setResetComplete(true);
                    }}
                    className={`w-full py-2 rounded-lg text-xs font-medium transition-all ${
                      resetComplete
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : "bg-foreground text-background hover:bg-foreground/90"
                    }`}
                  >
                    {resetComplete ? "Done. Nice work." : "I'm done"}
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Journal */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium">Quick Journal</p>
        </div>
        <p className="text-xs text-muted-foreground italic">{currentPrompt}</p>
        <Textarea
          value={journalEntry}
          onChange={(e) => setJournalEntry(e.target.value)}
          placeholder="Write freely. This stays private."
          className="min-h-[120px] resize-none"
        />
        {journalEntry.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {journalEntry.length} characters · Private to you
          </p>
        )}
      </div>
    </div>
  );
};

export default AtlasReset;
