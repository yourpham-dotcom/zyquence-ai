import { useFocusAreas, FOCUS_AREA_OPTIONS } from "@/hooks/useFocusAreas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2, Sparkles } from "lucide-react";

const FocusAreasSettings = () => {
  const { focusAreas, loading, saving, toggleFocusArea } = useFocusAreas();

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
            return (
              <button
                key={area.id}
                onClick={() => toggleFocusArea(area.id)}
                disabled={saving}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 text-center transition-all duration-200",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  selected
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border/50 bg-card hover:border-primary/30"
                )}
              >
                <span className="text-2xl">{area.icon}</span>
                <span className={cn(
                  "text-xs font-semibold",
                  selected ? "text-primary" : "text-foreground"
                )}>
                  {area.label}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {area.description}
                </span>
                {selected && (
                  <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
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
