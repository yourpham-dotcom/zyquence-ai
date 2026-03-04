import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const settings = [
  { id: "auto-analyze", label: "Auto-Analyze New Ideas", desc: "Automatically run AI analysis when a new idea is captured." },
  { id: "notifications", label: "Opportunity Alerts", desc: "Get notified when high-confidence opportunities are detected." },
  { id: "auto-workflow", label: "Auto-Generate Workflows", desc: "Automatically create workflow drafts from approved strategies." },
  { id: "insights", label: "Weekly Insights Digest", desc: "Receive a weekly summary of AI insights and recommendations." },
];

const CISettings = () => (
  <div className="space-y-8 max-w-2xl animate-fade-in">
    <div>
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
      <p className="text-muted-foreground mt-1 text-sm">Configure your Creative Intelligence Engine preferences.</p>
    </div>

    <Card className="bg-card/60 backdrop-blur border-border/50">
      <CardContent className="p-6 space-y-6">
        {settings.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor={s.id} className="text-sm font-medium text-foreground">{s.label}</Label>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </div>
            <Switch id={s.id} />
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

export default CISettings;
