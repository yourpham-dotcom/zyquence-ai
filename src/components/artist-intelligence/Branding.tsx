import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Loader2, Save, Palette, Upload, X, FileAudio, Link2, ExternalLink, 
  Music2, TrendingUp, DollarSign, Users, Megaphone, Target, Lightbulb,
  ArrowRight, Zap, Mail
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BrandingProps { profile: any; }

const Branding = ({ profile }: BrandingProps) => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [musicUrl, setMusicUrl] = useState("");
  const [analysisMode, setAnalysisMode] = useState<"audio" | "url">("url");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.includes("audio") && !file.name.endsWith(".mp3") && !file.name.endsWith(".wav") && !file.name.endsWith(".m4a")) {
      toast.error("Please upload an audio file (.mp3, .wav, .m4a)");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File must be under 20MB");
      return;
    }
    setAudioFile(file);
    setAnalysisMode("audio");
  };

  const removeFile = () => {
    setAudioFile(null);
    setAnalysisMode("url");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const detectPlatform = (url: string): "spotify" | "soundcloud" | null => {
    if (url.includes("spotify.com") || url.includes("open.spotify")) return "spotify";
    if (url.includes("soundcloud.com")) return "soundcloud";
    return null;
  };

  const handleUrlChange = (url: string) => {
    setMusicUrl(url);
    if (url.trim() && detectPlatform(url)) setAnalysisMode("url");
  };

  const analyze = async () => {
    setLoading(true);
    try {
      if (analysisMode === "url" && musicUrl.trim()) {
        const platform = detectPlatform(musicUrl);
        if (!platform) { toast.error("Please enter a valid Spotify or SoundCloud URL"); setLoading(false); return; }
        const { data, error } = await supabase.functions.invoke("artist-intelligence", {
          body: { module: "sound_url", profile, input: { url: musicUrl, platform } },
        });
        if (error) throw error;
        setResult(data);
      } else if (analysisMode === "audio" && audioFile) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        const filePath = `${user.id}/${Date.now()}-${audioFile.name}`;
        const { error: uploadError } = await supabase.storage.from("artist-audio").upload(filePath, audioFile);
        if (uploadError) throw uploadError;
        const { data: signedData, error: signedError } = await supabase.storage.from("artist-audio").createSignedUrl(filePath, 300);
        if (signedError) throw signedError;
        const { data, error } = await supabase.functions.invoke("artist-intelligence", {
          body: { module: "sound_audio", profile, input: { audio_url: signedData.signedUrl } },
        });
        if (error) throw error;
        setResult(data);
      } else {
        toast.error("Please paste a link or upload a file first");
        setLoading(false);
        return;
      }
    } catch (e: any) { toast.error(e.message || "Failed"); } finally { setLoading(false); }
  };

  const save = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      await supabase.from("sound_recommendations").insert({
        user_id: user.id, profile_id: profile.id,
        genre_scores: result.genre_scores, bpm_range: result.bpm_range,
        beat_styles: result.beat_styles, vocal_guidance: result.vocal_guidance,
        flow_ideas: result.flow_ideas, comparable_artists: result.comparable_artists,
        music_lane_summary: result.music_lane_summary, full_analysis: result,
      });
      toast.success("Branding analysis saved");
    } catch (e: any) { toast.error(e.message || "Save failed"); } finally { setSaving(false); }
  };

  const difficultyColor = (d: string) => {
    if (d === "easy") return "text-green-400";
    if (d === "medium") return "text-yellow-400";
    return "text-red-400";
  };

  const revenueColor = (r: string) => {
    if (r === "high") return "bg-green-500/20 text-green-400 border-green-500/30";
    if (r === "medium") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-muted text-muted-foreground";
  };

  // ─── Empty state ───
  if (!result && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Palette className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-foreground">Branding</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Paste your Spotify or SoundCloud link, or upload your music — AI builds your brand strategy, platform playbook, and monetization plan
          </p>
        </div>

        <Card className="w-full max-w-md border border-border">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Link2 className="h-4 w-4 text-primary" />
              Paste a Spotify or SoundCloud link
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="https://open.spotify.com/track/... or soundcloud.com/..."
                value={musicUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="text-sm"
              />
              {musicUrl && (
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => setMusicUrl("")}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {musicUrl && detectPlatform(musicUrl) && (
              <Badge variant="secondary" className="text-xs">
                <ExternalLink className="h-3 w-3 mr-1" />
                {detectPlatform(musicUrl) === "spotify" ? "Spotify" : "SoundCloud"} detected
              </Badge>
            )}
            {musicUrl && !detectPlatform(musicUrl) && musicUrl.length > 5 && (
              <p className="text-xs text-destructive">Enter a valid Spotify or SoundCloud URL</p>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 w-full max-w-md">
          <div className="h-px bg-border flex-1" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px bg-border flex-1" />
        </div>

        <Card className="w-full max-w-md border-dashed border-2 border-border hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <input ref={fileInputRef} type="file" accept=".mp3,.wav,.m4a,audio/*" className="hidden" onChange={handleFileSelect} />
            {!audioFile ? (
              <button onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                <Upload className="h-8 w-8" />
                <div className="text-center">
                  <p className="text-sm font-medium">Upload your music file</p>
                  <p className="text-xs text-muted-foreground mt-1">.mp3, .wav, or .m4a (max 20MB)</p>
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileAudio className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{audioFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(audioFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={removeFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3 justify-center">
          {musicUrl && detectPlatform(musicUrl) && (
            <Button onClick={() => { setAnalysisMode("url"); analyze(); }} size="lg">
              <Link2 className="h-4 w-4 mr-2" /> Analyze from {detectPlatform(musicUrl) === "spotify" ? "Spotify" : "SoundCloud"}
            </Button>
          )}
          {audioFile && (
            <Button onClick={() => { setAnalysisMode("audio"); analyze(); }} size="lg">
              <Music2 className="h-4 w-4 mr-2" /> Analyze Uploaded File
            </Button>
          )}
        </div>
        {!profile && <p className="text-xs text-muted-foreground">Complete your Creator Profile first</p>}
      </div>
    );
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">
        {analysisMode === "audio" ? "Analyzing your music & building brand strategy..." : "Fetching data & building brand strategy..."}
      </p>
    </div>
  );

  // ─── Results ───
  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Branding</h2>
          <p className="text-sm text-muted-foreground">Your complete brand & monetization playbook</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setResult(null); setAudioFile(null); setMusicUrl(""); setAnalysisMode("url"); }}>
            New Analysis
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Save
          </Button>
        </div>
      </div>

      {/* Audio Observations */}
      {result.audio_observations && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FileAudio className="h-4 w-4" /> What We Found</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-foreground/80">{result.audio_observations}</p></CardContent>
        </Card>
      )}

      {/* Brand Identity */}
      {result.brand_identity && (
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Palette className="h-4 w-4 text-primary" /> Brand Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Visual Direction</p>
              <p className="text-sm text-foreground/80">{result.brand_identity.visual_direction}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Brand Voice</p>
              <p className="text-sm text-foreground/80">{result.brand_identity.brand_voice}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Content Pillars</p>
              <div className="flex flex-wrap gap-2">
                {result.brand_identity.content_pillars?.map((p: string) => <Badge key={p} variant="secondary">{p}</Badge>)}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Tagline Ideas</p>
              <div className="space-y-1">
                {result.brand_identity.tagline_ideas?.map((t: string, i: number) => (
                  <p key={i} className="text-sm text-foreground/70 italic">"{t}"</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Platform Strategy */}
      {result.platform_strategy && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary" /> Platform Conversion Playbook
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.platform_strategy.map((ps: any) => (
              <Card key={ps.platform} className="border-border hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{ps.platform}</span>
                    <Badge variant="outline" className="text-[10px]">{ps.posting_frequency}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-foreground/70">{ps.why}</p>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Content Ideas</p>
                    <ul className="space-y-1">
                      {ps.content_ideas?.map((idea: string, i: number) => (
                        <li key={i} className="text-xs text-foreground/60 flex items-start gap-1.5">
                          <Lightbulb className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                          {idea}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-accent/50 rounded-md p-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Conversion Tactic</p>
                    <p className="text-xs text-foreground/80 flex items-start gap-1.5">
                      <ArrowRight className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                      {ps.conversion_tactic}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Audience Conversion */}
      {result.audience_conversion && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Audience Conversion Strategy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current Strengths</p>
              <p className="text-sm text-foreground/80">{result.audience_conversion.current_strengths}</p>
            </div>
            <div className="bg-accent/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><Target className="h-3 w-3" /> Listener → Superfan Funnel</p>
              <p className="text-sm text-foreground/80">{result.audience_conversion.funnel_strategy}</p>
            </div>
            <div className="flex items-start gap-2 bg-primary/5 border border-primary/20 rounded-lg p-3">
              <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-foreground">Direct Audience Ownership</p>
                <p className="text-xs text-foreground/70 mt-0.5">{result.audience_conversion.email_sms_play}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Collaboration Opportunities</p>
              <div className="flex flex-wrap gap-2">
                {result.audience_conversion.collab_opportunities?.map((c: string) => (
                  <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monetization Paths */}
      {result.monetization_paths && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" /> Monetization Paths
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.monetization_paths.map((mp: any) => (
              <Card key={mp.channel} className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{mp.channel}</span>
                    <Badge variant="outline" className={`text-[10px] ${revenueColor(mp.revenue_potential)}`}>
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {mp.revenue_potential}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-foreground/70">{mp.description}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Difficulty:</span>
                    <span className={`font-medium ${difficultyColor(mp.difficulty)}`}>{mp.difficulty}</span>
                  </div>
                  <div className="bg-accent/50 rounded-md p-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">First Step</p>
                    <p className="text-xs text-foreground/80 flex items-start gap-1.5">
                      <Zap className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                      {mp.first_step}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Sound Analysis (collapsed) */}
      {result.genre_scores && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Music2 className="h-4 w-4" /> Sound Profile</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(result.genre_scores).sort(([, a], [, b]) => (b as number) - (a as number)).map(([genre, score]) => (
              <div key={genre} className="space-y-1">
                <div className="flex justify-between text-sm"><span className="text-foreground/80">{genre}</span><span className="text-muted-foreground">{score as number}%</span></div>
                <Progress value={score as number} className="h-2" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <p className="text-xs text-muted-foreground">BPM Sweet Spot</p>
                <p className="text-lg font-bold text-foreground">{result.bpm_range?.sweet_spot}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Comparable Artists</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {result.comparable_artists?.map((a: string) => <Badge key={a} variant="outline" className="text-[10px]">{a}</Badge>)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {result.music_lane_summary && (
        <Card className="border-primary/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Music Lane Summary</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-foreground/80">{result.music_lane_summary}</p></CardContent>
        </Card>
      )}
    </div>
  );
};

export default Branding;
