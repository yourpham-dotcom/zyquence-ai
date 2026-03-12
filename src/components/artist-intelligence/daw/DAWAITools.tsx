import { useState } from "react";
import { Bot, Wand2, Music2, Mic2, Sparkles, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { DAWTrack, DAWClip, DAWEffect } from "./DAWStudio";

interface DAWAIToolsProps {
  tracks: DAWTrack[];
  selectedTrackId: string | null;
  bpm: number;
  onAddClip: (trackId: string, clip: DAWClip) => void;
  onApplyPreset: (presetName: string) => void;
  onExport: (format: "mp3" | "wav") => void;
  onAddEffect: (trackId: string, type: DAWEffect["type"]) => void;
}

const DAWAITools = ({ tracks, selectedTrackId, bpm, onAddClip, onApplyPreset, onExport, onAddEffect }: DAWAIToolsProps) => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingTask, setLoadingTask] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<"mp3" | "wav">("wav");

  const handleAIGenerate = async (task: string) => {
    setLoading(true);
    setLoadingTask(task);
    try {
      const { data, error } = await supabase.functions.invoke("artist-intelligence", {
        body: {
          module: "studio_ai",
          profile: null,
          input: {
            task,
            prompt,
            bpm,
            tracks: tracks.map(t => ({
              name: t.name,
              type: t.type,
              clipCount: t.clips.length,
              volume: t.volume,
              pan: t.pan,
              muted: t.muted,
              solo: t.solo,
              effects: t.effects.map(e => ({ type: e.type, enabled: e.enabled })),
            })),
          },
        },
      });
      if (error) throw error;
      const results = data?.suggestions || data?.recommendations || [];
      if (Array.isArray(results)) {
        setSuggestions(results);
      } else if (typeof data === "object") {
        // Convert object response to suggestion strings
        const extracted: string[] = [];
        if (data.suggestions) extracted.push(...data.suggestions);
        if (data.chord_progressions) extracted.push(...data.chord_progressions.map((c: any) => typeof c === "string" ? c : `${c.name}: ${c.chords?.join(" → ") || c.description}`));
        if (data.melody_ideas) extracted.push(...data.melody_ideas.map((m: any) => typeof m === "string" ? m : m.description));
        if (data.arrangement) extracted.push(...(Array.isArray(data.arrangement) ? data.arrangement : [data.arrangement]));
        if (data.vocal_mix) extracted.push(...(Array.isArray(data.vocal_mix) ? data.vocal_mix : [data.vocal_mix]));
        if (data.eq_suggestions) extracted.push(...(Array.isArray(data.eq_suggestions) ? data.eq_suggestions : [data.eq_suggestions]));
        if (data.mastering) extracted.push(...(Array.isArray(data.mastering) ? data.mastering : [data.mastering]));
        if (data.beat_ideas) extracted.push(...data.beat_ideas.map((b: any) => typeof b === "string" ? b : b.description));
        if (extracted.length === 0) {
          // Flatten any remaining string values
          Object.values(data).forEach(v => {
            if (typeof v === "string" && v.length > 10) extracted.push(v);
            if (Array.isArray(v)) v.forEach(item => { if (typeof item === "string") extracted.push(item); });
          });
        }
        setSuggestions(extracted.length > 0 ? extracted : ["AI analysis complete. Check the results above."]);
      }
      toast({ title: "AI analysis complete" });
    } catch (e) {
      console.error("AI error:", e);
      toast({ title: "AI processing failed", description: "Please try again", variant: "destructive" });
    } finally {
      setLoading(false);
      setLoadingTask(null);
    }
  };

  const isTaskLoading = (task: string) => loading && loadingTask === task;

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
                size="sm" className="w-full mt-2 text-xs"
                onClick={() => handleAIGenerate("beat_generate")}
                disabled={loading || !prompt}
              >
                <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                {isTaskLoading("beat_generate") ? "Generating..." : "Generate Beat Ideas"}
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
                {isTaskLoading("chord_suggest") ? "Analyzing..." : "Suggest Chord Progressions"}
              </Button>
              <Button
                variant="outline" size="sm" className="w-full text-xs justify-start"
                onClick={() => handleAIGenerate("melody_suggest")}
                disabled={loading}
              >
                <Sparkles className="h-3.5 w-3.5 mr-2" />
                {isTaskLoading("melody_suggest") ? "Generating..." : "Generate Melody Ideas"}
              </Button>
              <Button
                variant="outline" size="sm" className="w-full text-xs justify-start"
                onClick={() => handleAIGenerate("arrangement_suggest")}
                disabled={loading}
              >
                <Music2 className="h-3.5 w-3.5 mr-2" />
                {isTaskLoading("arrangement_suggest") ? "Analyzing..." : "Arrangement Suggestions"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="mix" className="space-y-3 mt-3">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                AI Mixing Assistant
              </label>
              <Button
                variant="outline" size="sm" className="w-full text-xs justify-start"
                onClick={() => handleAIGenerate("vocal_mix")}
                disabled={loading}
              >
                <Mic2 className="h-3.5 w-3.5 mr-2" />
                {isTaskLoading("vocal_mix") ? "Analyzing..." : "Auto-Mix Vocals"}
              </Button>
              <Button
                variant="outline" size="sm" className="w-full text-xs justify-start"
                onClick={() => handleAIGenerate("eq_suggest")}
                disabled={loading}
              >
                <Sparkles className="h-3.5 w-3.5 mr-2" />
                {isTaskLoading("eq_suggest") ? "Analyzing..." : "EQ Suggestions"}
              </Button>
              <Button
                variant="outline" size="sm" className="w-full text-xs justify-start"
                onClick={() => handleAIGenerate("master_suggest")}
                disabled={loading}
              >
                <Wand2 className="h-3.5 w-3.5 mr-2" />
                {isTaskLoading("master_suggest") ? "Analyzing..." : "Mastering Suggestions"}
              </Button>
            </div>

            {/* Add Effects to Selected Track */}
            {selectedTrackId && (
              <Card className="p-3">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">
                  Add Effect to Track
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["reverb", "delay", "eq", "compressor"] as const).map(fx => (
                    <Button
                      key={fx} variant="outline" size="sm" className="text-[10px] h-7"
                      onClick={() => onAddEffect(selectedTrackId, fx)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {fx.charAt(0).toUpperCase() + fx.slice(1)}
                    </Button>
                  ))}
                </div>
              </Card>
            )}

            {/* Effect Presets */}
            <Card className="p-3">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">
                Effect Presets {!selectedTrackId && <span className="text-destructive">(select a track)</span>}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {["Warm Reverb", "Tape Delay", "Radio EQ", "Hard Comp", "Airy Verb", "Slapback"].map(p => (
                  <Button
                    key={p} variant="outline" size="sm" className="text-[10px] h-7"
                    onClick={() => onApplyPreset(p)}
                    disabled={!selectedTrackId}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Active effects on selected track */}
            {selectedTrackId && (() => {
              const track = tracks.find(t => t.id === selectedTrackId);
              if (!track || track.effects.length === 0) return null;
              return (
                <Card className="p-3">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">
                    Active Effects on {track.name}
                  </label>
                  <div className="space-y-1">
                    {track.effects.map(fx => (
                      <div key={fx.id} className="flex items-center justify-between text-xs px-2 py-1.5 bg-muted/50 rounded">
                        <span className="capitalize">{fx.type}</span>
                        <span className={`text-[9px] ${fx.enabled ? "text-green-500" : "text-muted-foreground"}`}>
                          {fx.enabled ? "ON" : "OFF"}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })()}
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
                  <SelectItem value="wav">WAV (lossless)</SelectItem>
                  <SelectItem value="mp3">MP3 (compressed)</SelectItem>
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
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium text-foreground">
                    {(() => {
                      const allClips = tracks.flatMap(t => t.clips);
                      if (allClips.length === 0) return "0:00";
                      const maxEnd = Math.max(...allClips.map(c => c.startTime + c.duration));
                      const m = Math.floor(maxEnd / 60);
                      const s = Math.floor(maxEnd % 60);
                      return `${m}:${s.toString().padStart(2, "0")}`;
                    })()}
                  </span>
                </div>
              </div>
            </Card>

            <Button
              className="w-full text-xs"
              onClick={() => onExport(exportFormat)}
              disabled={tracks.flatMap(t => t.clips).length === 0}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export as {exportFormat.toUpperCase()}
            </Button>
          </TabsContent>
        </Tabs>

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                AI Suggestions
              </label>
              <Button variant="ghost" size="sm" className="h-5 text-[9px]" onClick={() => setSuggestions([])}>
                Clear
              </Button>
            </div>
            {suggestions.map((s, i) => (
              <Card key={i} className="p-2.5">
                <p className="text-xs text-foreground leading-relaxed">{s}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DAWAITools;
