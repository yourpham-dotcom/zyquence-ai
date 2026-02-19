import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import MusicStudio from "@/components/studio/MusicStudio";

const MusicIntelligence = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Music Intelligence</h1>
          <p className="text-[11px] text-muted-foreground">Production & Artistry</p>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <MusicStudio />
      </div>
    </div>
  );
};

export default MusicIntelligence;
