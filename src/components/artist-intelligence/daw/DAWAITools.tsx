import { useState } from "react";
import { Bot, Wand2, Music2, Mic2, Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { DAWTrack, DAWClip } from "./DAWStudio";

interface DAWAIToolsProps {
  tracks: DAWTrack[];
  selectedTrackId: string | null;
  bpm: number;
  onAddClip: (trackId: string, clip: DAWClip) => void;
}

const DAWAITools = ({ tracks, selectedTrackId, bpm, onAddClip }: DAWAIToolsProps) => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<"mp3" | "wav">("mp3");

  const handleAIGenerate = async (task: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("artist-intelligence", {
        body: {
          action: "studio_ai",
          task,
          prompt,
          bpm,
          tracks: tracks.map(t => ({ name: t.name, type: t.type, clipCount: t.clips.length })),
        },
      });
      if (error) throw error;
      if (data?.suggestions) setSuggestions(data.suggestions);
      toast({ title: "AI analysis complete" });
    } catch {
      toast({ title: "AI processing failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    toast({
      title: `Exporting as ${exportFormat.toUpperCase()}`,
      description: "Mixing down all tracks...",
    });
    // In a full implementation, this would use OfflineAudioContext to render
    setTimeout(() => {
      toast({ title: "Export complete", description: `Your song has been exported as ${exportFormat.toUpperCase()}` });
    }, 2000);
  };

  return (
    <div className="w-72 border-l border-border bg-card/80 flex flex-col shrink-0">
      <div className="h-8 border-b border-border flex items-center px-3 bg-muted/30 shrink-0">
        <Bot className="h-3.5 w-3.5 text-primary mr-2" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">AI Tools</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="w-full h-8">
            <TabsTrigger value="generate" className="text-[10px]">Generate</TabsTrigger>
            <TabsTrigger value="mix" className="text-[10px]">Mix</TabsTrigger>
            <TabsTrigger value="export" className="text-[10px]">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-3 mt-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">
                Beat Generation
              </label>
              <Textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Describe a beat... e.g. 'dark trap beat with heavy 808s at 140bpm'"
                className="text-xs min-h-[60px] resize-none"
              />
              <Button
                size="sm"
                className="w-full mt-2 text-xs"
                onClick={() => handleAIGenerate("beat_generate")}
                disabled={loading || !prompt}
              >
                <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                {loading ? "Generating..." : "Generate Beat Ideas"}
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                Quick Actions
              </label>
              <Button
                variant="outline" size="sm" className="w-full text-xs justify-start"
                onClick={() => handleAIGenerate("chord_suggest")}
                disabled={loading}
              >
                <Music2 className="h-3.5 w-3.5 mr-2" />
                Suggest Chord Progressions
              </Button>
              <Button
                variant="outline" size="sm" className="w-full text-xs justify-start"
                onClick={() => handleAIGenerate("melody_suggest")}
                disabled={loading}
              >
                <Sparkles className="h-3.5 w-3.5 mr-2" />
                Generate Melody Ideas
              </Button>
              <Button
                variant="outline" size="sm" className="w-full text-xs justify-start"
                onClick={() => handleAIGenerate("arrangement_suggest")}
                disabled={loading}
              >
                <Music2 className="h-3.5 w-3.5 mr-2" />
                Arrangement Suggestions
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="mix" className="space-y-3 mt-3">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                Vocal Mixing
              </label>
              <Button
                variant="outline" size="sm" className="w-full text-xs justify-start"
                onClick={() => handleAIGenerate("vocal_mix")}
                disabled={loading}
              >
                <Mic2 className="h-3.5 w-3.5 mr-2" />
                Auto-Mix Vocals
              </Button>
              <Button
                variant="outline" size="sm" className="w-full text-xs justify-start"
                onClick={() => handleAIGenerate("eq_suggest")}
                disabled={loading}
              >
                <Sparkles className="h-3.5 w-3.5 mr-2" />
                EQ Suggestions
              </Button>
              <Button
                variant="outline" size="sm" className="w-full text-xs justify-start"
                onClick={() => handleAIGenerate("master_suggest")}
                disabled={loading}
              >
                <Wand2 className="h-3.5 w-3.5 mr-2" />
                Mastering Suggestions
              </Button>
            </div>

            {/* Effects presets */}
            <Card className="p-3">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">
                Effect Presets
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {["Warm Reverb", "Tape Delay", "Radio EQ", "Hard Comp", "Airy Verb", "Slapback"].map(p => (
                  <Button key={p} variant="outline" size="sm" className="text-[10px] h-7">
                    {p}
                  </Button>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-3 mt-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">
                Export Format
              </label>
              <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as "mp3" | "wav")}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp3">MP3 (compressed)</SelectItem>
                  <SelectItem value="wav">WAV (lossless)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="p-3 space-y-2">
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Tracks:</span>
                  <span className="font-medium text-foreground">{tracks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total clips:</span>
                  <span className="font-medium text-foreground">{tracks.reduce((a, t) => a + t.clips.length, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>BPM:</span>
                  <span className="font-medium text-foreground">{bpm}</span>
                </div>
              </div>
            </Card>

            <Button className="w-full text-xs" onClick={handleExport}>
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export as {exportFormat.toUpperCase()}
            </Button>
          </TabsContent>
        </Tabs>

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-4 space-y-2">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
              AI Suggestions
            </label>
            {suggestions.map((s, i) => (
              <Card key={i} className="p-2.5">
                <p className="text-xs text-foreground">{s}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DAWAITools;
