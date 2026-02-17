import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Copy, ArrowRightLeft, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ArtistTranslator = ({ profile }: { profile: any }) => {
  const [input, setInput] = useState({ story: "", challenges: "", achievements: "", lifestyle: "" });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const translate = async () => {
    if (!input.story && !input.challenges) { toast.error("Enter at least a story or challenge"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("artist-intelligence", {
        body: { module: "translator", profile, input },
      });
      if (error) throw error;
      setResult(data);
    } catch (e: any) { toast.error(e.message || "Failed"); } finally { setLoading(false); }
  };

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copied"); };

  if (!result && !loading) {
    return (
      <div className="p-6 space-y-6 max-w-2xl mx-auto overflow-y-auto max-h-full">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <ArrowRightLeft className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Experience Translator</h2>
          <p className="text-sm text-muted-foreground">Convert your life experiences into music themes and concepts</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Personal Story</label>
            <Textarea value={input.story} onChange={e => setInput(f => ({ ...f, story: e.target.value }))} placeholder="Share your journey, background, pivotal moments..." rows={3} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Challenges</label>
            <Textarea value={input.challenges} onChange={e => setInput(f => ({ ...f, challenges: e.target.value }))} placeholder="Obstacles you've overcome..." rows={2} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Achievements</label>
            <Textarea value={input.achievements} onChange={e => setInput(f => ({ ...f, achievements: e.target.value }))} placeholder="Your proudest moments..." rows={2} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Lifestyle Details</label>
            <Textarea value={input.lifestyle} onChange={e => setInput(f => ({ ...f, lifestyle: e.target.value }))} placeholder="Day-to-day life, environment..." rows={2} className="mt-1" />
          </div>
          <Button onClick={translate} className="w-full" size="lg">
            <Sparkles className="h-4 w-4 mr-2" /> Translate to Music
          </Button>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Translating your experiences...</p>
    </div>
  );

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Music Themes</h2>
        <Button variant="outline" onClick={() => setResult(null)}>New Translation</Button>
      </div>

      {/* Song Topics */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Song Topics</h3>
        {result.song_topics?.map((t: any, i: number) => (
          <Card key={i}>
            <CardContent className="py-3 px-4 flex items-start justify-between gap-3">
              <div><p className="font-medium text-foreground text-sm">{t.title}</p><p className="text-sm text-muted-foreground">{t.description}</p></div>
              <Button variant="ghost" size="icon" className="shrink-0" onClick={() => copy(t.title + ": " + t.description)}><Copy className="h-3.5 w-3.5" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hooks */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Hook Concepts</h3>
        {result.hook_concepts?.map((h: any, i: number) => (
          <Card key={i}>
            <CardContent className="py-3 px-4 flex items-start justify-between gap-3">
              <div><p className="font-medium text-foreground text-sm italic">"{h.hook}"</p><p className="text-xs text-muted-foreground mt-1">{h.context}</p></div>
              <Button variant="ghost" size="icon" className="shrink-0" onClick={() => copy(h.hook)}><Copy className="h-3.5 w-3.5" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Emotional Themes */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Emotional Themes</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {result.emotional_themes?.map((t: string) => (
            <span key={t} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm cursor-pointer hover:bg-primary/20" onClick={() => copy(t)}>{t}</span>
          ))}
        </CardContent>
      </Card>

      {/* Storytelling Angles */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Storytelling Angles</h3>
        {result.storytelling_angles?.map((a: any, i: number) => (
          <Card key={i}>
            <CardContent className="py-3 px-4 flex items-start justify-between gap-3">
              <div><p className="font-medium text-foreground text-sm">{a.angle}</p><p className="text-sm text-muted-foreground">{a.description}</p></div>
              <Button variant="ghost" size="icon" className="shrink-0" onClick={() => copy(a.angle + ": " + a.description)}><Copy className="h-3.5 w-3.5" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ArtistTranslator;
