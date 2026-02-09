import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock, ArrowLeft, Sparkles } from "lucide-react";

const ProGate = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--cyber-blue)/0.08),transparent_50%)]" />

      <div className="relative z-10 max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Lock className="h-7 w-7 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Pro Feature</h1>
          <p className="text-muted-foreground">
            This feature is available exclusively for Pro subscribers. Upgrade to unlock full access.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            className="w-full bg-primary hover:bg-primary/90"
            onClick={() => navigate("/pricing")}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Upgrade to Pro
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProGate;
