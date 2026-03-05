import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Brain, Save, Zap, Mic, Upload, Image, FileText, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCreativeIdeas } from "@/hooks/useCreativeIdeas";

const CIIdeaCapture = () => {
  const [ideaText, setIdeaText] = useState("");
  const [title, setTitle] = useState("");
  const { saveIdea, analyzeIdea, generateStrategy } = useCreativeIdeas();
  const navigate = useNavigate();

  const handleSave = () => {
    if (!title.trim() || !ideaText.trim()) {
      toast({ title: "Enter a title and description", variant: "destructive" });
      return;
    }
    saveIdea.mutate({ title, description: ideaText }, {
      onSuccess: () => { setTitle(""); setIdeaText(""); }
    });
  };

  const handleAnalyze = () => {
    if (!title.trim() || !ideaText.trim()) {
      toast({ title: "Enter a title and description", variant: "destructive" });
      return;
    }
    analyzeIdea.mutate({ title, description: ideaText }, {
      onSuccess: () => {
        setTitle(""); setIdeaText("");
        navigate("/creative-intelligence/analysis");
      }
    });
  };

  const handleConvertToStrategy = () => {
    if (!title.trim() || !ideaText.trim()) {
      toast({ title: "Enter a title and description", variant: "destructive" });
      return;
    }
    analyzeIdea.mutate({ title, description: ideaText }, {
      onSuccess: (data) => {
        // After analysis, generate strategy
        generateStrategy.mutate({
          id: data.id,
          title,
          description: ideaText,
          idea_score: data.result.idea_score,
        } as any, {
          onSuccess: () => {
            setTitle(""); setIdeaText("");
            navigate("/creative-intelligence/strategy");
          }
        });
      }
    });
  };

  const isProcessing = analyzeIdea.isPending || saveIdea.isPending || generateStrategy.isPending;

  return (
    <div className="space-y-8 max-w-3xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Idea Capture</h1>
        <p className="text-muted-foreground mt-1 text-sm">Capture ideas in any format. AI will analyze and structure them.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: FileText, label: "Text", active: true },
          { icon: Mic, label: "Voice", active: false },
          { icon: Upload, label: "File", active: false },
          { icon: Image, label: "Image", active: false },
        ].map((f) => (
          <Card
            key={f.label}
            className={`cursor-pointer transition-all border-border/50 hover:border-primary/50 ${f.active ? "bg-primary/10 border-primary/40" : "bg-card/60"}`}
          >
            <CardContent className="p-4 flex flex-col items-center gap-2">
              <f.icon className={`h-5 w-5 ${f.active ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-xs font-medium">{f.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card/60 backdrop-blur border-border/50">
        <CardContent className="p-6 space-y-4">
          <Input
            placeholder="Idea title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-background/50 border-border/50 text-foreground"
            disabled={isProcessing}
          />
          <Textarea
            placeholder="Describe your idea in detail. What problem does it solve? Who is the target audience? What makes it unique?"
            value={ideaText}
            onChange={(e) => setIdeaText(e.target.value)}
            className="min-h-[200px] bg-background/50 border-border/50 text-foreground resize-none"
            disabled={isProcessing}
          />
          <div className="flex flex-wrap gap-3 pt-2">
            <Button onClick={handleAnalyze} className="gap-2" disabled={isProcessing}>
              {analyzeIdea.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
              Analyze Idea
            </Button>
            <Button variant="secondary" onClick={handleSave} className="gap-2" disabled={isProcessing}>
              {saveIdea.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Idea
            </Button>
            <Button variant="outline" onClick={handleConvertToStrategy} className="gap-2" disabled={isProcessing}>
              {generateStrategy.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Convert to Strategy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CIIdeaCapture;
