import { useState } from "react";
import { Plane, Check, ChevronRight, DollarSign, Globe, AlertTriangle, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      title: "First 30 Days",
      subtitle: "Getting settled",
      items: [
        { id: "housing", label: "Secure permanent housing", category: "Logistics" },
        { id: "bank", label: "Set up local banking", category: "Finance" },
        { id: "sim", label: "Get a local phone/SIM", category: "Logistics" },
        { id: "grocery", label: "Find reliable grocery stores", category: "Lifestyle" },
        { id: "gym", label: "Locate a gym or recovery facility", category: "Performance" },
        { id: "transport", label: "Figure out daily transportation", category: "Logistics" },
        { id: "language", label: "Learn 10 essential local phrases", category: "Culture" },
        { id: "emergency", label: "Save emergency contacts & hospital info", category: "Safety" },
      ],
    },
    60: {
      title: "Days 30-60",
      subtitle: "Building routine",
      items: [
        { id: "routine", label: "Establish a daily routine", category: "Lifestyle" },
        { id: "food-spots", label: "Build a rotation of go-to restaurants", category: "Food" },
        { id: "barber", label: "Find a trusted barber/stylist", category: "Lifestyle" },
        { id: "social", label: "Connect with other expat athletes", category: "Social" },
        { id: "explore", label: "Explore 3 neighborhoods beyond your own", category: "Culture" },
        { id: "finance-track", label: "Track monthly spending patterns", category: "Finance" },
        { id: "recovery-routine", label: "Dial in recovery routine with local resources", category: "Performance" },
      ],
    },
    90: {
      title: "Days 60-90",
      subtitle: "Feeling at home",
      items: [
        { id: "comfort", label: "Identify your comfort zones in the city", category: "Lifestyle" },
        { id: "cultural", label: "Attend a local cultural event", category: "Culture" },
        { id: "tax", label: "Understand basic tax obligations", category: "Finance" },
        { id: "support", label: "Build a small personal support network", category: "Social" },
        { id: "mentor", label: "Connect with a veteran expat athlete", category: "Social" },
        { id: "evaluate", label: "Review and adjust your lifestyle setup", category: "Lifestyle" },
      ],
    },
  };

  const currentPhase = phases[activePhase];
  const phaseCompleted = currentPhase.items.filter((i) => completedItems.includes(i.id)).length;
  const phaseProgress = (phaseCompleted / currentPhase.items.length) * 100;

  const culturalNotes = [
    { title: "Tipping customs vary widely", detail: "Research local norms. Some countries consider tipping rude." },
    { title: "Punctuality expectations differ", detail: "In some cultures, being 15 min late is normal." },
    { title: "Personal space is cultural", detail: "Handshakes, hugs, and distance vary country to country." },
    { title: "Learn to say please and thank you", detail: "Even basic effort in the local language goes a long way." },
  ];

  const commonMistakes = [
    "Assuming everyone speaks English",
    "Not learning local emergency numbers",
    "Overspending in the first month",
    "Isolating yourself from teammates",
    "Ignoring jet lag and sleep adjustment",
    "Not understanding local driving laws",
  ];

  return (
    <div className="space-y-6">
      {/* Phase Selector */}
      <div className="flex gap-2">
        {([30, 60, 90] as const).map((phase) => (
          <button
            key={phase}
            onClick={() => setActivePhase(phase)}
            className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all ${
              activePhase === phase
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:border-foreground/30"
            }`}
          >
            {phase} Days
          </button>
        ))}
      </div>

      {/* Phase Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{currentPhase.title}</p>
            <p className="text-xs text-muted-foreground">{currentPhase.subtitle}</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {phaseCompleted}/{currentPhase.items.length}
          </Badge>
        </div>
        <Progress value={phaseProgress} className="h-1.5" />
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        {currentPhase.items.map((item) => (
          <button
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
              completedItems.includes(item.id)
                ? "border-emerald-500/20 bg-emerald-500/5"
                : "border-border/50 hover:border-foreground/15"
            }`}
          >
            <div
              className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                completedItems.includes(item.id)
                  ? "border-emerald-500 bg-emerald-500"
                  : "border-border"
              }`}
            >
              {completedItems.includes(item.id) && <Check className="h-3 w-3 text-background" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${completedItems.includes(item.id) ? "line-through text-muted-foreground" : ""}`}>
                {item.label}
              </p>
              <p className="text-[10px] text-muted-foreground">{item.category}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Cultural Notes */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium">Cultural Notes</p>
        </div>
        {culturalNotes.map((note, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-3">
              <p className="text-sm font-medium">{note.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{note.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Common Mistakes */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium">Common Mistakes Abroad</p>
        </div>
        <div className="space-y-1.5">
          {commonMistakes.map((mistake, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-foreground/80">
              <span className="text-xs text-muted-foreground w-4 shrink-0">{i + 1}.</span>
              {mistake}
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground text-center">
        This content is educational only and is not legal, financial, or contractual advice.
      </p>
    </div>
  );
};

export default AtlasTransition;
