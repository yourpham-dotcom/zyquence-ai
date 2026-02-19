import { useState } from "react";
import { Compass, Loader2, Briefcase, GraduationCap, DollarSign, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CareerResult {
  career: string;
  description: string;
  education: string[];
  skills: string[];
  salary_range: string;
  match_reason: string;
}

export default function CareerExplorer() {
  const [interests, setInterests] = useState("");
  const [skills, setSkills] = useState("");
  const [education, setEducation] = useState("");
  const [results, setResults] = useState<CareerResult[]>([]);
  const [loading, setLoading] = useState(false);

  const explore = async () => {
    if (!interests.trim()) { toast({ title: "Enter your interests", variant: "destructive" }); return; }
    setLoading(true);
    setResults([]);

    try {
      const resp = await supabase.functions.invoke("student-ai", {
        body: { mode: "career", text: `Interests: ${interests}\nSkills: ${skills}\nEducation: ${education}` },
      });
      if (resp.error) throw resp.error;
      const parsed = JSON.parse(resp.data?.result || "[]");
      setResults(Array.isArray(parsed) ? parsed : []);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to explore careers", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Compass className="h-6 w-6 text-emerald-500" />Career Explorer</h1>
        <p className="text-muted-foreground text-sm">Discover career paths that match your interests and skills</p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-5 space-y-4">
          <div><Label>What are you interested in? *</Label><Textarea value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="e.g. technology, design, helping people, data analysis..." rows={3} /></div>
          <div><Label>Your skills</Label><Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. Python, communication, creativity..." /></div>
          <div><Label>Current education level</Label><Input value={education} onChange={(e) => setEducation(e.target.value)} placeholder="e.g. High school senior, College freshman..." /></div>
          <Button onClick={explore} disabled={loading} className="w-full">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Exploring...</> : <><Sparkles className="h-4 w-4 mr-2" />Explore Careers</>}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Recommended Careers</h2>
          {results.map((r, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" />{r.career}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                  </div>
                  {r.salary_range && (
                    <Badge variant="secondary" className="shrink-0 flex items-center gap-1"><DollarSign className="h-3 w-3" />{r.salary_range}</Badge>
                  )}
                </div>
                {r.education?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1"><GraduationCap className="h-3 w-3" />Education Path</p>
                    <div className="flex flex-wrap gap-1">{r.education.map((e, j) => <Badge key={j} variant="outline" className="text-xs">{e}</Badge>)}</div>
                  </div>
                )}
                {r.skills?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Key Skills</p>
                    <div className="flex flex-wrap gap-1">{r.skills.map((s, j) => <Badge key={j} variant="secondary" className="text-xs">{s}</Badge>)}</div>
                  </div>
                )}
                {r.match_reason && <p className="text-xs text-muted-foreground italic">{r.match_reason}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">⚠️ Career suggestions are AI-generated. Research thoroughly before making career decisions.</p>
    </div>
  );
}
