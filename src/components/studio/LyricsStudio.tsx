import { useState, useCallback } from "react";
import { Mic2, PenTool, Copy, RefreshCw, Download, Sparkles, Heart, Zap, Loader2, BarChart3, Lightbulb, AudioLines } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

const LYRICS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lyrics-studio`;

const GENRES = ["Rap", "Melodic Rap", "R&B", "Trap", "Drill", "Pop", "Afro", "Custom"];
const MOODS = ["Toxic Love", "Heartbreak", "Confident", "Hustle", "Party", "Emotional", "Dark", "Custom"];
const STRUCTURES = ["Verse Only", "Verse + Hook", "Full Song", "Freestyle"];

const sliderLabels = (labels: string[]) => (
  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
    {labels.map(l => <span key={l}>{l}</span>)}
  </div>
);

const LyricsStudio = () => {
  const { toast } = useToast();
  const [mode, setMode] = useState<"humanize" | "generate">("humanize");
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [showAlternate, setShowAlternate] = useState(false);
  const [alternateOutput, setAlternateOutput] = useState("");

  // Shared fields
  const [artistInspiration, setArtistInspiration] = useState("");
  const [genre, setGenre] = useState("Rap");
  const [mood, setMood] = useState("Confident");

  // Humanize fields
  const [lyrics, setLyrics] = useState("");
  const [humanizationStrength, setHumanizationStrength] = useState(50);
  const [slangLevel, setSlangLevel] = useState(50);
  const [emotionLevel, setEmotionLevel] = useState(50);

  // Generate fields
  const [topic, setTopic] = useState("");
  const [songStructure, setSongStructure] = useState("Full Song");
  const [energyLevel, setEnergyLevel] = useState(50);
  const [creativityLevel, setCreativityLevel] = useState(50);

  const getSliderLabel = (value: number, labels: string[]) => {
    if (value < 33) return labels[0];
    if (value < 66) return labels[1];
    return labels[2];
  };

  const streamLyrics = useCallback(async (body: Record<string, any>) => {
    setIsLoading(true);
    setOutput("");
    let fullText = "";

    try {
      const resp = await fetch(LYRICS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || "Request failed");
      }
      if (!resp.body) throw new Error("No response stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setOutput(fullText);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleHumanize = (action?: "emotional" | "catchy") => {
    if (!lyrics.trim()) {
      toast({ title: "Paste lyrics first", variant: "destructive" });
      return;
    }
    streamLyrics({
      mode: "humanize",
      lyrics,
      artistInspiration,
      genre,
      mood,
      humanizationStrength: getSliderLabel(humanizationStrength, ["light", "medium", "heavy"]),
      slangLevel: getSliderLabel(slangLevel, ["clean", "moderate", "street"]),
      emotionLevel: getSliderLabel(emotionLevel, ["chill", "balanced", "deep"]),
      action: action || "humanize",
    });
  };

  const handleGenerate = () => {
    streamLyrics({
      mode: "generate",
      topic,
      artistInspiration,
      genre,
      mood,
      songStructure,
      energyLevel: getSliderLabel(energyLevel, ["calm", "mid", "high"]),
      creativityLevel: getSliderLabel(creativityLevel, ["safe", "balanced", "experimental"]),
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast({ title: "Copied to clipboard" });
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lyrics.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRegenerate = () => {
    if (mode === "humanize") handleHumanize();
    else handleGenerate();
  };

  const handleAlternate = () => {
    if (!showAlternate && !alternateOutput && output) {
      setAlternateOutput(output);
      handleRegenerate();
    }
    setShowAlternate(!showAlternate);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
            <Mic2 className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Zyquence Lyrics Studio</h2>
            <p className="text-sm text-muted-foreground">Create, rewrite, and humanize lyrics with AI.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-6 mt-4 w-fit">
          <TabsTrigger value="humanize" className="gap-2">
            <PenTool className="w-4 h-4" /> Humanize Lyrics
          </TabsTrigger>
          <TabsTrigger value="generate" className="gap-2">
            <Sparkles className="w-4 h-4" /> Generate Lyrics
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* LEFT PANEL — Input */}
          <ScrollArea className="flex-1 min-w-0">
            <div className="p-6 space-y-5">
              <TabsContent value="humanize" className="mt-0 space-y-5">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Your Lyrics</Label>
                  <Textarea
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    placeholder="Paste your lyrics here… AI generated or rough drafts both work."
                    className="min-h-[180px] rounded-xl bg-card border-border resize-none text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Artist Inspiration</Label>
                    <Input
                      value={artistInspiration}
                      onChange={(e) => setArtistInspiration(e.target.value)}
                      placeholder="Bryson Tiller, Drake, SZA…"
                      className="rounded-xl bg-card border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Genre</Label>
                    <Select value={genre} onValueChange={setGenre}>
                      <SelectTrigger className="rounded-xl bg-card border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>{GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Mood</Label>
                  <Select value={mood} onValueChange={setMood}>
                    <SelectTrigger className="rounded-xl bg-card border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>{MOODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                {/* Sliders */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Humanization Strength</Label>
                    <Slider value={[humanizationStrength]} onValueChange={([v]) => setHumanizationStrength(v)} max={100} step={1} className="py-1" />
                    {sliderLabels(["Light", "Medium", "Heavy"])}
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Slang Level</Label>
                    <Slider value={[slangLevel]} onValueChange={([v]) => setSlangLevel(v)} max={100} step={1} className="py-1" />
                    {sliderLabels(["Clean", "Moderate", "Street"])}
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Emotion Level</Label>
                    <Slider value={[emotionLevel]} onValueChange={([v]) => setEmotionLevel(v)} max={100} step={1} className="py-1" />
                    {sliderLabels(["Chill", "Balanced", "Deep"])}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => handleHumanize()} disabled={isLoading} className="rounded-xl gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PenTool className="w-4 h-4" />}
                    Humanize Lyrics
                  </Button>
                  <Button variant="outline" onClick={() => handleHumanize("emotional")} disabled={isLoading} className="rounded-xl gap-2">
                    <Heart className="w-4 h-4" /> Make More Emotional
                  </Button>
                  <Button variant="outline" onClick={() => handleHumanize("catchy")} disabled={isLoading} className="rounded-xl gap-2">
                    <Zap className="w-4 h-4" /> Make More Catchy
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="generate" className="mt-0 space-y-5">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Song Topic</Label>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="What's the song about?"
                    className="rounded-xl bg-card border-border"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Artist Inspiration</Label>
                    <Input
                      value={artistInspiration}
                      onChange={(e) => setArtistInspiration(e.target.value)}
                      placeholder="Travis Scott, SZA…"
                      className="rounded-xl bg-card border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Genre</Label>
                    <Select value={genre} onValueChange={setGenre}>
                      <SelectTrigger className="rounded-xl bg-card border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>{GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Mood</Label>
                    <Select value={mood} onValueChange={setMood}>
                      <SelectTrigger className="rounded-xl bg-card border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>{MOODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Song Structure</Label>
                    <Select value={songStructure} onValueChange={setSongStructure}>
                      <SelectTrigger className="rounded-xl bg-card border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>{STRUCTURES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Sliders */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Energy Level</Label>
                    <Slider value={[energyLevel]} onValueChange={([v]) => setEnergyLevel(v)} max={100} step={1} className="py-1" />
                    {sliderLabels(["Calm", "Mid", "High"])}
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Creativity</Label>
                    <Slider value={[creativityLevel]} onValueChange={([v]) => setCreativityLevel(v)} max={100} step={1} className="py-1" />
                    {sliderLabels(["Safe", "Balanced", "Experimental"])}
                  </div>
                </div>

                <Button onClick={handleGenerate} disabled={isLoading} className="rounded-xl gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate Lyrics
                </Button>
              </TabsContent>
            </div>
          </ScrollArea>

          {/* Divider */}
          <div className="hidden md:block w-px bg-border" />

          {/* RIGHT PANEL — Output */}
          <ScrollArea className="flex-1 min-w-0">
            <div className="p-6 space-y-5">
              {/* Output area */}
              <div className="rounded-xl bg-card border border-border p-5 min-h-[250px]">
                {isLoading && !output ? (
                  <div className="flex flex-col items-center justify-center h-[200px] gap-3 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                    <p className="text-sm font-medium">Cooking your lyrics…</p>
                  </div>
                ) : output ? (
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">{showAlternate && alternateOutput ? alternateOutput : output}</pre>
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-16">Your AI-generated lyrics will appear here.</p>
                )}
              </div>

              {/* Output actions */}
              {output && (
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="outline" size="sm" onClick={handleCopy} className="rounded-xl gap-2">
                    <Copy className="w-3.5 h-3.5" /> Copy Lyrics
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={isLoading} className="rounded-xl gap-2">
                    <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload} className="rounded-xl gap-2">
                    <Download className="w-3.5 h-3.5" /> Download TXT
                  </Button>
                  <div className="flex items-center gap-2 ml-auto">
                    <Label className="text-xs text-muted-foreground">Alternate Version</Label>
                    <Switch checked={showAlternate} onCheckedChange={handleAlternate} />
                  </div>
                </div>
              )}

              {/* Suggestions section */}
              {output && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">AI Suggestions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl bg-card border border-border p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AudioLines className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-semibold text-foreground">Flow Suggestions</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Try varying syllable counts between lines for a more dynamic flow.</p>
                    </div>
                    <div className="rounded-xl bg-card border border-border p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-semibold text-foreground">Rhyme Improvements</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Consider multi-syllable rhymes for a more complex and polished sound.</p>
                    </div>
                    <div className="rounded-xl bg-card border border-border p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-green-400" />
                        <span className="text-xs font-semibold text-foreground">Ad-Lib Ideas</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Add ad-libs like "yeah", "uh", or "skrt" to enhance the vibe.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Future placeholder buttons */}
              <div className="pt-4 border-t border-border">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">Coming Soon</h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" disabled className="rounded-xl gap-2 opacity-50">
                    <BarChart3 className="w-3.5 h-3.5" /> Beat Match
                  </Button>
                  <Button variant="outline" size="sm" disabled className="rounded-xl gap-2 opacity-50">
                    <AudioLines className="w-3.5 h-3.5" /> Flow Analyzer
                  </Button>
                  <Button variant="outline" size="sm" disabled className="rounded-xl gap-2 opacity-50">
                    <Mic2 className="w-3.5 h-3.5" /> Voice to Lyrics
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </Tabs>
    </div>
  );
};

export default LyricsStudio;
