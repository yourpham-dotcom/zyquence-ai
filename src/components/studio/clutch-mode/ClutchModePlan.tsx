import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  RotateCcw, Play, Clock, CheckCircle2, Coffee,
  Settings, Shield, ArrowRight, Sparkles, AlertCircle
} from "lucide-react";
import { format, parseISO } from "date-fns";
import type { ClutchPlan, ReplanData } from "./types";

interface ClutchModePlanProps {
  plan: ClutchPlan;
  onReplan: (data: ReplanData) => void;
  onReset: () => void;
  isReplanning: boolean;
}

const blockTypeConfig: Record<string, { icon: typeof Play; className: string; label: string }> = {
  work: { icon: Play, className: "bg-primary/10 border-primary/30 text-foreground", label: "Work" },
  break: { icon: Coffee, className: "bg-accent/50 border-border text-muted-foreground", label: "Break" },
  admin: { icon: Settings, className: "bg-secondary/10 border-secondary/30 text-foreground", label: "Setup" },
  buffer: { icon: Shield, className: "bg-muted/30 border-border text-muted-foreground", label: "Buffer" },
};

const ClutchModePlan = ({ plan, onReplan, onReset, isReplanning }: ClutchModePlanProps) => {
  const [showReplan, setShowReplan] = useState(false);
  const [completedTasks, setCompletedTasks] = useState("");
  const [remainingTime, setRemainingTime] = useState("");
  const [currentEnergy, setCurrentEnergy] = useState(5);

  const handleReplan = () => {
    onReplan({ completedTasks, remainingTime, currentEnergy });
  };

  const formatTime = (iso: string) => {
    try {
      return format(parseISO(iso), "h:mm a");
    } catch {
      return iso;
    }
  };

  const formatDate = (iso: string) => {
    try {
      return format(parseISO(iso), "EEE, MMM d");
    } catch {
      return "";
    }
  };

  // Group schedule blocks by date
  const groupedBlocks: Record<string, typeof plan.scheduleBlocks> = {};
  plan.scheduleBlocks.forEach((block) => {
    const dateKey = formatDate(block.startTime);
    if (!groupedBlocks[dateKey]) groupedBlocks[dateKey] = [];
    groupedBlocks[dateKey].push(block);
  });

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
          {/* Summary */}
          <Card className="p-5 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-foreground leading-relaxed">{plan.summary}</p>
            </div>
          </Card>

          {/* 2-Minute Start */}
          <Card className="p-4 border-primary/40 bg-primary/10">
            <div className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Start right now (2 min)</p>
                <p className="text-sm text-foreground">{plan.twoMinuteStart}</p>
              </div>
            </div>
          </Card>

          {/* Top Priorities */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Top Priorities</h3>
            {plan.topPriorities.map((p, i) => (
              <Card key={i} className="p-4 bg-card/50 border-border">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-mono font-bold text-primary bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-foreground">{p.task}</p>
                      <Badge variant="secondary" className="shrink-0 text-xs">~{p.estimatedMinutes}m</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.reason}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Next 60 Minutes */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Next 60 Minutes</h3>
            <Card className="p-4 bg-card/50 border-border">
              <div className="space-y-2">
                {plan.next60Minutes.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-foreground flex-1">{item.step}</span>
                    <span className="text-xs font-mono text-muted-foreground">{item.minutes}m</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Schedule */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Full Schedule</h3>
            {Object.entries(groupedBlocks).map(([date, blocks]) => (
              <div key={date} className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">{date}</p>
                {blocks.map((block, i) => {
                  const config = blockTypeConfig[block.type] || blockTypeConfig.work;
                  const Icon = config.icon;
                  return (
                    <Card key={i} className={`p-3 border ${config.className}`}>
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{block.label}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-mono shrink-0">
                          <Clock className="h-3 w-3" />
                          {formatTime(block.startTime)} – {formatTime(block.endTime)}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ))}
          </div>

          {/* If Behind Plan */}
          {plan.ifBehindPlan.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">If You Fall Behind</h3>
              <Card className="p-4 bg-card/50 border-border">
                <ul className="space-y-2">
                  {plan.ifBehindPlan.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}

          {/* Notes */}
          {plan.notes.length > 0 && (
            <Card className="p-4 bg-accent/30 border-border">
              <ul className="space-y-1.5">
                {plan.notes.map((note, i) => (
                  <li key={i} className="text-xs text-muted-foreground">• {note}</li>
                ))}
              </ul>
            </Card>
          )}

          {/* Replan Section */}
          {showReplan && (
            <Card className="p-4 border-primary/20 bg-card space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Quick Replan</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">What did you complete?</Label>
                  <Textarea
                    value={completedTasks}
                    onChange={(e) => setCompletedTasks(e.target.value)}
                    placeholder="Finished the intro paragraph, reviewed half the slides..."
                    className="min-h-[80px] resize-none mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">How much time do you have left?</Label>
                  <Textarea
                    value={remainingTime}
                    onChange={(e) => setRemainingTime(e.target.value)}
                    placeholder="About 4 hours tonight, then 2 hours tomorrow morning"
                    className="min-h-[60px] resize-none mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Current energy ({currentEnergy}/10)</Label>
                  <Slider
                    value={[currentEnergy]}
                    onValueChange={(v) => setCurrentEnergy(v[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <Button onClick={handleReplan} disabled={isReplanning} className="w-full">
                  {isReplanning ? "Replanning..." : "Regenerate Plan"}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between p-4 border-t border-border shrink-0">
        <Button variant="ghost" onClick={onReset} className="gap-1 text-muted-foreground">
          <RotateCcw className="h-4 w-4" /> Start Over
        </Button>
        <Button
          variant={showReplan ? "secondary" : "default"}
          onClick={() => setShowReplan(!showReplan)}
          className="gap-1"
        >
          <RotateCcw className="h-4 w-4" />
          {showReplan ? "Hide Replan" : "Replan Mode"}
        </Button>
      </div>
    </div>
  );
};

export default ClutchModePlan;
