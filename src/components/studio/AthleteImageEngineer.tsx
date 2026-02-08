import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, TrendingUp, Users, Target, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const stripMarkdown = (text: string): string => {
  return text
    .replace(/#{1,6}\s?/g, '')        // Remove headings
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^*]+)\*/g, '$1')     // Remove italic
    .replace(/\*\s/g, '- ')           // Replace * bullets with -
    .replace(/\*$/gm, '')             // Remove trailing *
    .trim();
};

const AthleteImageEngineer = () => {
  const [profile, setProfile] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!profile.trim()) {
      toast({
        title: "Input Required",
        description: "Please describe your current image and goals",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("athlete-mental-coach", {
        body: { 
          input: profile,
          type: "image_engineering"
        },
      });

      if (error) throw error;

      setAnalysis(data);
      toast({
        title: "Analysis Complete",
        description: "Your personalized brand strategy is ready",
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
            <Star className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Athlete Image Engineer</h2>
            <p className="text-sm text-muted-foreground">Build your brand and secure more sponsorship deals</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3 mb-3">
            <Star className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Personal Brand</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Develop a unique, authentic brand identity that resonates with fans and sponsors.
          </p>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div>✓ Brand positioning</div>
            <div>✓ Visual identity</div>
            <div>✓ Voice & messaging</div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Social Media</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Optimize your social presence to grow followers and engagement organically.
          </p>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div>✓ Content strategy</div>
            <div>✓ Engagement tactics</div>
            <div>✓ Platform optimization</div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Sponsorships</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Attract and secure brand partnerships that align with your values and goals.
          </p>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div>✓ Pitch preparation</div>
            <div>✓ Portfolio building</div>
            <div>✓ Negotiation tips</div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Growth Metrics</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Track your brand growth and measure your marketability to sponsors.
          </p>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div>✓ Engagement rate</div>
            <div>✓ Follower growth</div>
            <div>✓ Brand mentions</div>
          </div>
        </Card>
      </div>

      <Card className="flex-1 p-6 bg-card border-border flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">AI Brand Strategy Analyzer</h3>
        </div>

        <Textarea
          placeholder="Tell me about yourself: your sport, achievements, personality, current social media presence, career goals, and what kind of brands you want to work with..."
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
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
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Brand Strategy
            </>
          )}
        </Button>

        {analysis && (
          <div className="space-y-4">
            <Card className="p-4 bg-primary/5 border-primary/20">
              <h4 className="font-semibold text-foreground mb-2">Your Brand Analysis</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{stripMarkdown(analysis.overview)}</p>
            </Card>

            {analysis.strengths && (
              <Card className="p-4 bg-background border-border">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Key Strengths
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {analysis.strengths.map((strength: string, idx: number) => (
                    <li key={idx}>• {stripMarkdown(strength)}</li>
                  ))}
                </ul>
              </Card>
            )}

            {analysis.recommendations && (
              <Card className="p-4 bg-background border-border">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Action Plan
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {analysis.recommendations.map((rec: string, idx: number) => (
                    <li key={idx}>• {stripMarkdown(rec)}</li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}
      </Card>

      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex gap-3">
          <Star className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-foreground mb-2">Pro Tips for Building Your Brand</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>• Be authentic and consistent</div>
              <div>• Engage with your community daily</div>
              <div>• Share your journey, not just wins</div>
              <div>• Partner with aligned brands</div>
              <div>• Invest in quality content</div>
              <div>• Build relationships, not transactions</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AthleteImageEngineer;
