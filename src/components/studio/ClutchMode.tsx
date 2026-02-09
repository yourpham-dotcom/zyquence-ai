import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Flame, CalendarDays, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ClutchModeIntake from "./clutch-mode/ClutchModeIntake";
import ClutchModePlan from "./clutch-mode/ClutchModePlan";
import ClutchModeChat from "./clutch-mode/ClutchModeChat";
import type { ClutchIntakeData, ClutchPlan, ReplanData } from "./clutch-mode/types";

type ActiveTab = "schedule" | "chat";

const ClutchMode = () => {
  const [plan, setPlan] = useState<ClutchPlan | null>(null);
  const [intakeData, setIntakeData] = useState<ClutchIntakeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReplanning, setIsReplanning] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("schedule");

  const generatePlan = async (data: ClutchIntakeData) => {
    setIsLoading(true);
    setIntakeData(data);
    try {
      const { data: result, error } = await supabase.functions.invoke("clutch-mode", {
        body: { intake: data },
      });

      if (error) throw error;
      if (!result?.plan) throw new Error("No plan returned");

      setPlan(result.plan);
      setActiveTab("schedule");
    } catch (err: any) {
      console.error("Clutch Mode error:", err);
      toast.error("Failed to generate plan. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplan = async (replanData: ReplanData) => {
    if (!intakeData) return;
    setIsReplanning(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("clutch-mode", {
        body: { intake: intakeData, replan: replanData },
      });

      if (error) throw error;
      if (!result?.plan) throw new Error("No plan returned");

      setPlan(result.plan);
      toast.success("Plan updated. Keep going.");
    } catch (err: any) {
      console.error("Replan error:", err);
      toast.error("Failed to replan. Try again.");
    } finally {
      setIsReplanning(false);
    }
  };

  const handleReset = () => {
    setPlan(null);
    setIntakeData(null);
    setActiveTab("schedule");
  };

  const handlePlanUpdate = (updatedPlan: ClutchPlan) => {
    setPlan(updatedPlan);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
        <Flame className="h-5 w-5 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Clutch Mode</h2>
        <span className="text-xs text-muted-foreground ml-1 hidden sm:inline">— Last-minute planning, zero shame</span>

        {/* Tabs (only show when plan exists) */}
        {plan && (
          <div className="ml-auto flex items-center gap-1 bg-muted/30 rounded-lg p-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("schedule")}
              className={cn(
                "h-7 px-3 text-xs gap-1.5 rounded-md",
                activeTab === "schedule"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Schedule
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("chat")}
              className={cn(
                "h-7 px-3 text-xs gap-1.5 rounded-md",
                activeTab === "chat"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Adjust
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {!plan ? (
          <ClutchModeIntake onSubmit={generatePlan} isLoading={isLoading} />
        ) : activeTab === "schedule" ? (
          <ClutchModePlan
            plan={plan}
            onReplan={handleReplan}
            onReset={handleReset}
            isReplanning={isReplanning}
          />
        ) : (
          <ClutchModeChat
            plan={plan}
            intakeData={intakeData!}
            onPlanUpdate={handlePlanUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default ClutchMode;
