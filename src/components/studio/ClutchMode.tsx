import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Flame } from "lucide-react";
import ClutchModeIntake from "./clutch-mode/ClutchModeIntake";
import ClutchModePlan from "./clutch-mode/ClutchModePlan";
import type { ClutchIntakeData, ClutchPlan, ReplanData } from "./clutch-mode/types";

const ClutchMode = () => {
  const [plan, setPlan] = useState<ClutchPlan | null>(null);
  const [intakeData, setIntakeData] = useState<ClutchIntakeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReplanning, setIsReplanning] = useState(false);

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
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
        <Flame className="h-5 w-5 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Clutch Mode</h2>
        <span className="text-xs text-muted-foreground ml-1">— Last-minute planning, zero shame</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {plan ? (
          <ClutchModePlan
            plan={plan}
            onReplan={handleReplan}
            onReset={handleReset}
            isReplanning={isReplanning}
          />
        ) : (
          <ClutchModeIntake onSubmit={generatePlan} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
};

export default ClutchMode;
