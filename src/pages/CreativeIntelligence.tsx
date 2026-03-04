import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import ProGate from "@/components/ProGate";

const CreativeIntelligence = () => {
  const navigate = useNavigate();
  const { isPro, loading } = useSubscription();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isPro) return <ProGate />;

  return (
    <div className="h-screen bg-background flex flex-col">
      <header className="h-12 border-b border-border flex items-center px-4 gap-3 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-bold text-foreground">Creative Intelligence Engine</span>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Creative Intelligence Engine</h1>
          <p className="text-sm text-muted-foreground">
            AI-powered creative tools are coming soon. Stay tuned for advanced content generation, visual storytelling, and creative workflow automation.
          </p>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
};

export default CreativeIntelligence;
