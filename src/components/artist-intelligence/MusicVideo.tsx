import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Loader2, Save, Video, Upload, X, FileVideo, FileAudio, Film,
  Camera, Sparkles, Clapperboard, Palette, MapPin, Scissors, Play, Download, Link
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MusicVideoProps { profile: any; }

const MusicVideo = ({ profile }: MusicVideoProps) => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [generatingClips, setGeneratingClips] = useState<Record<number, boolean>>({});
  const [generatedClips, setGeneratedClips] = useState<Record<number, string>>({});
  const [songTitle, setSongTitle] = useState("");
  const [songMood, setSongMood] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter(f => {
      const ext = f.name.toLowerCase();
      return ext.endsWith(".mp4") || ext.endsWith(".mp3") || ext.endsWith(".mov") ||
             ext.endsWith(".wav") || ext.endsWith(".m4a") || f.type.includes("video") || f.type.includes("audio");
    });
    if (valid.length !== selected.length) toast.error("Some files were skipped — only .mp4, .mov, .mp3, .wav, .m4a accepted");
    const oversized = valid.filter(f => f.size > 50 * 1024 * 1024);
    if (oversized.length) toast.error("Files must be under 50MB each");
    const ok = valid.filter(f => f.size <= 50 * 1024 * 1024);
    setFiles(prev => [...prev, ...ok].slice(0, 10));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const isVideo = (f: File) => f.type.includes("video") || f.name.endsWith(".mp4") || f.name.endsWith(".mov");
  const isAudio = (f: File) => f.type.includes("audio") || f.name.endsWith(".mp3") || f.name.endsWith(".wav") || f.name.endsWith(".m4a");

  const analyze = async () => {
    setLoading(true);
    try {
      const fileDescriptions = files.map(f => ({
        name: f.name,
        type: isVideo(f) ? "video" : "audio",
        size_mb: +(f.size / (1024 * 1024)).toFixed(1),
      }));

      const { data, error } = await supabase.functions.invoke("artist-intelligence", {
        body: {
          module: "music_video",
          profile,
          input: {
            song_title: songTitle || "Untitled",
            song_mood: songMood || "Not specified",
            youtube_url: youtubeUrl || null,
            uploaded_files: fileDescriptions,
          },
        },
      });
      if (error) throw error;
      setResult(data);
    } catch (e: any) { toast.error(e.message || "Failed"); } finally { setLoading(false); }
  };

  const generateClip = async (sceneIdx: number, prompt: string) => {
    setGeneratingClips(prev => ({ ...prev, [sceneIdx]: true }));
    try {
      // Use the edge function to call the AI video generation
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt: `Cinematic music video scene: ${prompt}`, type: "video" },
      });
      if (error) throw error;
      if (data?.url) {
        setGeneratedClips(prev => ({ ...prev, [sceneIdx]: data.url }));
        toast.success(`Scene ${sceneIdx + 1} clip generated!`);
      } else {
        toast.info("Video clip generation is processing — check back shortly");
      }
    } catch (e: any) {
      toast.error(e.message || "Clip generation failed");
    } finally {
      setGeneratingClips(prev => ({ ...prev, [sceneIdx]: false }));
    }
  };

  // ─── Empty state ───
  if (!result && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Film className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-foreground">Music Video</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Upload your music or video files — AI creates a complete music video concept with storyboard, shot list, and generates visual clips for each scene
          </p>
        </div>

        {/* Song context */}
        <Card className="w-full max-w-md border border-border">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clapperboard className="h-4 w-4 text-primary" />
              Song Details (optional)
            </div>
            <Input
              placeholder="Song title"
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="Mood / vibe (e.g. dark & moody, energetic party, introspective)"
              value={songMood}
              onChange={(e) => setSongMood(e.target.value)}
              className="text-sm"
            />
          </CardContent>
        </Card>

        {/* YouTube URL */}
        <Card className="w-full max-w-md border border-border">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Link className="h-4 w-4 text-primary" />
              YouTube URL (optional)
            </div>
            <Input
              placeholder="https://youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">Paste a YouTube music video or audio link for reference</p>
          </CardContent>
        </Card>
        <Card className="w-full max-w-md border-dashed border-2 border-border hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp4,.mp3,.mov,.wav,.m4a,video/*,audio/*"
              className="hidden"
              multiple
              onChange={handleFileSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Upload className="h-8 w-8" />
              <div className="text-center">
                <p className="text-sm font-medium">Upload music & video files</p>
                <p className="text-xs text-muted-foreground mt-1">.mp4, .mov, .mp3, .wav, .m4a — up to 50MB each, max 10 files</p>
              </div>
            </button>
          </CardContent>
        </Card>

        {/* Uploaded files list */}
        {files.length > 0 && (
          <div className="w-full max-w-md space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                  {isVideo(f) ? <FileVideo className="h-4 w-4 text-primary" /> : <FileAudio className="h-4 w-4 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{(f.size / (1024 * 1024)).toFixed(1)} MB • {isVideo(f) ? "Video" : "Audio"}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeFile(i)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button onClick={analyze} size="lg" disabled={!profile}>
          <Sparkles className="h-4 w-4 mr-2" /> Generate Music Video Concept
        </Button>
        {!profile && <p className="text-xs text-muted-foreground">Complete your Creator Profile first</p>}
      </div>
    );
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Directing your music video concept...</p>
    </div>
  );

  // ─── Results ───
  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">{result.concept_title || "Music Video Concept"}</h2>
          <p className="text-sm text-muted-foreground">Your AI-directed music video blueprint</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setResult(null); setFiles([]); setGeneratedClips({}); setSongTitle(""); setSongMood(""); }}>
            New Concept
          </Button>
        </div>
      </div>

      {/* Creative Direction */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Palette className="h-4 w-4 text-primary" /> Creative Direction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-foreground/80">{result.creative_direction}</p>
          <div className="flex flex-wrap gap-2">
            {result.visual_themes?.map((t: string) => <Badge key={t} variant="secondary">{t}</Badge>)}
          </div>
        </CardContent>
      </Card>

      {/* Storyboard */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Film className="h-4 w-4 text-primary" /> Storyboard — Scene by Scene
        </h3>
        <div className="space-y-4">
          {result.scenes?.map((scene: any, idx: number) => (
            <Card key={idx} className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">{scene.scene_number}</span>
                    {scene.timestamp}
                  </span>
                  <div className="flex gap-2">
                    {generatedClips[idx] ? (
                      <a href={generatedClips[idx]} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3 mr-1" /> View Clip
                        </Button>
                      </a>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={generatingClips[idx]}
                        onClick={() => generateClip(idx, scene.ai_clip_prompt)}
                      >
                        {generatingClips[idx] ? (
                          <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Generating...</>
                        ) : (
                          <><Play className="h-3 w-3 mr-1" /> Generate Clip</>
                        )}
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-foreground/80">{scene.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-accent/50 rounded p-2">
                    <p className="text-muted-foreground uppercase tracking-wider text-[10px] mb-0.5">Camera</p>
                    <p className="text-foreground/70">{scene.camera_work}</p>
                  </div>
                  <div className="bg-accent/50 rounded p-2">
                    <p className="text-muted-foreground uppercase tracking-wider text-[10px] mb-0.5">Lighting</p>
                    <p className="text-foreground/70">{scene.lighting_mood}</p>
                  </div>
                  <div className="bg-accent/50 rounded p-2">
                    <p className="text-muted-foreground uppercase tracking-wider text-[10px] mb-0.5">Wardrobe / Props</p>
                    <p className="text-foreground/70">{scene.wardrobe_props}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Locations & Wardrobe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4" /> Locations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.locations?.map((loc: any, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-xs font-medium text-foreground">{loc.name}</span>
                <span className="text-xs text-muted-foreground">— {loc.vibe}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Camera className="h-4 w-4" /> Wardrobe Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.wardrobe_guide?.map((w: any, i: number) => (
              <div key={i}>
                <p className="text-xs font-medium text-foreground">{w.look}</p>
                <p className="text-xs text-muted-foreground">{w.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Editing Notes */}
      {result.editing_notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Scissors className="h-4 w-4" /> Editing Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pace</p>
              <p className="text-sm text-foreground/80">{result.editing_notes.pace}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Effects</p>
              <p className="text-sm text-foreground/80">{result.editing_notes.effects}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Transitions</p>
              <p className="text-sm text-foreground/80">{result.editing_notes.transitions}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Production Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Budget Tier</p>
            <p className="text-lg font-bold text-foreground capitalize mt-1">{result.budget_tier}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Crew Needed</p>
            <p className="text-xs text-foreground/80 mt-1">{result.estimated_crew}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Reference Videos</p>
            <div className="space-y-0.5">
              {result.reference_artists?.map((r: string, i: number) => (
                <p key={i} className="text-xs text-foreground/70">{r}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MusicVideo;
