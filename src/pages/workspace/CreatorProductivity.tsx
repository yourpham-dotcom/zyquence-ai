import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, ArrowLeft, Target, Calendar, Star, TrendingUp, Flag } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const CreatorProductivity = () => {
  const [goal, setGoal] = useState("");
  const [niche, setNiche] = useState("");
  const [challenges, setChallenges] = useState("");
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!goal.trim() || !niche.trim() || !challenges.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    setPlan("");

    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/creator-productivity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ goal, niche, challenges }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: "Failed to generate plan" }));
        toast.error(err.error || "Failed to generate plan");
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setPlan(fullText);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sectionIcons: Record<string, typeof Target> = {
    "WEEKLY ACTION PLAN": Calendar,
    "DAILY TASKS": Star,
    "TOP PRIORITIES": Target,
    "GROWTH STRATEGY": TrendingUp,
    "MILESTONES": Flag,
  };

  const renderPlan = (text: string) => {
    const sections = text.split(/\d+\.\s*(WEEKLY ACTION PLAN|DAILY TASKS|TOP PRIORITIES|GROWTH STRATEGY|MILESTONES)/g);

    if (sections.length <= 1) {
      return <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{text}</p>;
    }

    const parsed: { title: string; content: string }[] = [];
    for (let i = 1; i < sections.length; i += 2) {
      parsed.push({ title: sections[i], content: (sections[i + 1] || "").trim() });
    }

    return (
      <div className="space-y-6">
        {sections[0]?.trim() && (
          <p className="text-sm text-foreground leading-relaxed">{sections[0].trim()}</p>
        )}
        {parsed.map((s) => {
          const Icon = sectionIcons[s.title] || Sparkles;
          return (
            <div key={s.title} className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary shrink-0" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">{s.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed pl-6">
                {s.content}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Creator Productivity
          </h1>
          <p className="text-xs text-muted-foreground">AI-powered productivity coach for creators</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Tell me about your creative work</CardTitle>
          <CardDescription className="text-xs">
            Share your goal, niche, and challenges to get a personalized action plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="goal" className="text-xs font-medium">Your Goal</Label>
            <Input
              id="goal"
              placeholder="e.g. Grow my YouTube channel to 10K subscribers in 3 months"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="niche" className="text-xs font-medium">Your Niche</Label>
            <Input
              id="niche"
              placeholder="e.g. Tech reviews, music production, fitness content"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="challenges" className="text-xs font-medium">Your Challenges</Label>
            <Textarea
              id="challenges"
              placeholder="e.g. Inconsistent posting, struggling with video editing, low engagement..."
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>
          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating your plan...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" /> Generate Productivity Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {plan && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> Your Productivity Plan
            </CardTitle>
          </CardHeader>
          <CardContent>{renderPlan(plan)}</CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreatorProductivity;
