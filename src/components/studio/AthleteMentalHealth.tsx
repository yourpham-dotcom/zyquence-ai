import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Activity, TrendingUp, MessageSquare, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AthleteMentalHealth = () => {
  const [mood, setMood] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!mood.trim()) {
      toast({
        title: "Input Required",
        description: "Please describe your current state",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("athlete-mental-coach", {
        body: { 
          input: mood,
          type: "mental_health"
        },
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "Your personalized insights are ready",
      });
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 gap-6 bg-background">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Mental Health & Performance</h2>
            <p className="text-sm text-muted-foreground">AI-powered wellness and development tracking</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Performance Metrics</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Mental Resilience</span>
              <span className="text-sm font-semibold text-foreground">85%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Focus Level</span>
              <span className="text-sm font-semibold text-foreground">92%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Stress Management</span>
              <span className="text-sm font-semibold text-foreground">78%</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Development Tracking</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Weekly Progress</span>
              <span className="text-sm font-semibold text-primary">+12%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Goal Completion</span>
              <span className="text-sm font-semibold text-primary">7/10</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Consistency Streak</span>
              <span className="text-sm font-semibold text-primary">14 days</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Quick Check-in</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            How are you feeling today? Share your thoughts for personalized insights.
          </p>
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Start Check-in
          </Button>
        </Card>
      </div>

      <Card className="flex-1 p-6 bg-card border-border flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">AI Mental Health Analysis</h3>
        </div>

        <Textarea
          placeholder="Describe how you're feeling mentally, physically, or emotionally. Share your thoughts about training, competition, or life balance..."
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="flex-1 mb-4 min-h-[120px] bg-background border-border text-foreground placeholder:text-muted-foreground"
        />

        <Button 
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mb-4"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Get AI Insights
            </>
          )}
        </Button>

        {analysis && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <h4 className="font-semibold text-foreground mb-2">Your Personalized Insights</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{analysis}</p>
          </Card>
        )}
      </Card>
    </div>
  );
};

export default AthleteMentalHealth;
