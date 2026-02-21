import { useFocusAreas, FOCUS_AREA_OPTIONS } from "@/hooks/useFocusAreas";
import { useEliteAccess } from "@/hooks/useEliteAccess";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2, Sparkles, Lock } from "lucide-react";

const FREE_PRO_AREA_IDS = ["athlete", "health", "productivity"];

const FocusAreasSettings = () => {
  const { focusAreas, loading, saving, toggleFocusArea } = useFocusAreas();
  const { isElite } = useEliteAccess();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> My Focus Areas
        </CardTitle>
        <CardDescription>
          Choose your interests to personalize your dashboard. Only relevant tools will appear.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {FOCUS_AREA_OPTIONS.map((area) => {
            const selected = focusAreas.includes(area.id);
            const locked = !isElite && !FREE_PRO_AREA_IDS.includes(area.id);
            return (
              <button
                key={area.id}
                onClick={() => !locked && toggleFocusArea(area.id)}
                disabled={saving || locked}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 text-center transition-all duration-200",
                  locked
                    ? "border-border/30 bg-card/50 opacity-50 cursor-not-allowed"
                    : "hover:scale-[1.02] active:scale-[0.98]",
                  selected && !locked
                    ? "border-primary bg-primary/10 shadow-sm"
                    : !locked
                    ? "border-border/50 bg-card hover:border-primary/30"
                    : ""
                )}
              >
                <span className="text-2xl">{area.icon}</span>
                <span className={cn(
                  "text-xs font-semibold",
                  selected && !locked ? "text-primary" : "text-foreground"
                )}>
                  {area.label}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {area.description}
                </span>
                {selected && !locked && (
                  <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
                )}
                {locked && (
                  <Lock className="absolute top-1.5 right-1.5 h-3 w-3 text-muted-foreground" />
                )}
              </button>
            );
          })}
        </div>
        {focusAreas.length > 0 && (
          <p className="mt-4 text-xs text-muted-foreground text-center">
            {focusAreas.length} area{focusAreas.length !== 1 ? "s" : ""} selected · Dashboard will update automatically
          </p>
        )}
        {saving && (
          <p className="mt-2 text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" /> Saving...
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default FocusAreasSettings;
