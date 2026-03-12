import { useState, useRef, useCallback, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Play, Pause, RotateCcw, Gauge, Waves, Droplets, Maximize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DAWTrack } from "./DAWStudio";

interface DAWEffectsPanelProps {
  tracks: DAWTrack[];
  selectedTrackId: string | null;
  playersRef: React.MutableRefObject<Map<string, any>>;
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataLength = buffer.length * blockAlign;
  const arrayBuffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(arrayBuffer);
  const writeStr = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
  writeStr(0, "RIFF"); view.setUint32(4, 36 + dataLength, true); writeStr(8, "WAVE");
  writeStr(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true); view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true); writeStr(36, "data"); view.setUint32(40, dataLength, true);
  const channels = Array.from({ length: numChannels }, (_, i) => buffer.getChannelData(i));
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const s = Math.max(-1, Math.min(1, channels[ch][i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }
  }
  return new Blob([arrayBuffer], { type: "audio/wav" });
}

const DAWEffectsPanel = ({ tracks, selectedTrackId, playersRef }: DAWEffectsPanelProps) => {
  const { toast } = useToast();
  const [slowedEnabled, setSlowedEnabled] = useState(false);
  const [reverbEnabled, setReverbEnabled] = useState(false);
  const [speed, setSpeed] = useState(0.85);
  const [reverbSize, setReverbSize] = useState(50);
  const [wetDry, setWetDry] = useState(40);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const previewCtxRef = useRef<AudioContext | null>(null);
  const previewSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const selectedTrack = tracks.find(t => t.id === selectedTrackId);
  const hasClips = selectedTrack && selectedTrack.clips.length > 0;

  const getFirstClipBuffer = useCallback(async (): Promise<AudioBuffer | null> => {
    if (!selectedTrack || selectedTrack.clips.length === 0) return null;
    const clip = selectedTrack.clips[0];
    if (!clip.audioUrl) return null;
    try {
      const res = await fetch(clip.audioUrl);
      const ab = await res.arrayBuffer();
      const ctx = new AudioContext();
      const buf = await ctx.decodeAudioData(ab);
      ctx.close();
      return buf;
    } catch {
      return null;
    }
  }, [selectedTrack]);

  const generateImpulseResponse = (ctx: BaseAudioContext, duration: number, decay: number): AudioBuffer => {
    const length = Math.floor(ctx.sampleRate * duration);
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return impulse;
  };

  const handlePreview = async () => {
    if (isPreviewing) {
      previewSourceRef.current?.stop();
      previewCtxRef.current?.close();
      setIsPreviewing(false);
      return;
    }

    const buffer = await getFirstClipBuffer();
    if (!buffer) {
      toast({ title: "No audio", description: "Select a track with audio clips", variant: "destructive" });
      return;
    }

    const ctx = new AudioContext();
    previewCtxRef.current = ctx;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = slowedEnabled ? speed : 1;

    let lastNode: AudioNode = source;

    if (reverbEnabled) {
      const convolver = ctx.createConvolver();
      const reverbDuration = 1 + (reverbSize / 100) * 5;
      const decay = 1 + (reverbSize / 100) * 3;
      convolver.buffer = generateImpulseResponse(ctx, reverbDuration, decay);

      const dryGain = ctx.createGain();
      const wetGain = ctx.createGain();
      const mixValue = wetDry / 100;
      dryGain.gain.value = 1 - mixValue;
      wetGain.gain.value = mixValue;

      lastNode.connect(dryGain);
      lastNode.connect(convolver);
      convolver.connect(wetGain);
      dryGain.connect(ctx.destination);
      wetGain.connect(ctx.destination);
      lastNode = source; // already connected
    } else {
      lastNode.connect(ctx.destination);
    }

    previewSourceRef.current = source;
    source.onended = () => { setIsPreviewing(false); ctx.close(); };
    source.start();
    setIsPreviewing(true);
  };

  const handleExport = async () => {
    const buffer = await getFirstClipBuffer();
    if (!buffer) {
      toast({ title: "No audio", description: "Select a track with audio clips", variant: "destructive" });
      return;
    }

    setIsExporting(true);
    toast({ title: "Processing...", description: "Applying Slowed + Reverb effects" });

    try {
      const playbackRate = slowedEnabled ? speed : 1;
      const outputLength = Math.ceil(buffer.length / playbackRate);
      const reverbTail = reverbEnabled ? Math.ceil(buffer.sampleRate * (1 + (reverbSize / 100) * 5)) : 0;
      const totalLength = outputLength + reverbTail;
      const offlineCtx = new OfflineAudioContext(buffer.numberOfChannels, totalLength, buffer.sampleRate);

      const source = offlineCtx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = playbackRate;

      if (reverbEnabled) {
        const convolver = offlineCtx.createConvolver();
        const reverbDuration = 1 + (reverbSize / 100) * 5;
        const decay = 1 + (reverbSize / 100) * 3;
        convolver.buffer = generateImpulseResponse(offlineCtx, reverbDuration, decay);

        const dryGain = offlineCtx.createGain();
        const wetGain = offlineCtx.createGain();
        const mixValue = wetDry / 100;
        dryGain.gain.value = 1 - mixValue;
        wetGain.gain.value = mixValue;

        source.connect(dryGain);
        source.connect(convolver);
        convolver.connect(wetGain);
        dryGain.connect(offlineCtx.destination);
        wetGain.connect(offlineCtx.destination);
      } else {
        source.connect(offlineCtx.destination);
      }

      source.start();
      const rendered = await offlineCtx.startRendering();
      const wavBlob = audioBufferToWav(rendered);

      const a = document.createElement("a");
      a.href = URL.createObjectURL(wavBlob);
      a.download = `slowed-reverb-${new Date().toISOString().slice(0, 10)}.wav`;
      a.click();
      URL.revokeObjectURL(a.href);

      toast({ title: "Export complete!", description: "Slowed + Reverb mix downloaded" });
    } catch (e) {
      console.error("Export failed:", e);
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = () => {
    setSlowedEnabled(false);
    setReverbEnabled(false);
    setSpeed(0.85);
    setReverbSize(50);
    setWetDry(40);
    if (isPreviewing) {
      previewSourceRef.current?.stop();
      previewCtxRef.current?.close();
      setIsPreviewing(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground tracking-wide uppercase">Slowed + Reverb</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleReset} title="Reset all">
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {!selectedTrack && (
        <p className="text-xs text-muted-foreground text-center py-4">Select a track to apply effects</p>
      )}

      {selectedTrack && (
        <>
          <Card className="p-3 space-y-3 border-border bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-primary" />
                <Label htmlFor="slowed-toggle" className="text-xs font-semibold">Slowed</Label>
              </div>
              <Switch id="slowed-toggle" checked={slowedEnabled} onCheckedChange={setSlowedEnabled} />
            </div>
            {slowedEnabled && (
              <div className="space-y-2 pl-6">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-muted-foreground">Speed</Label>
                  <span className="text-[10px] font-mono text-foreground">{speed.toFixed(2)}x</span>
                </div>
                <Slider
                  value={[speed * 100]}
                  onValueChange={([v]) => setSpeed(v / 100)}
                  min={50}
                  max={120}
                  step={1}
                />
                <div className="flex justify-between text-[8px] text-muted-foreground">
                  <span>0.50x</span><span>1.00x</span><span>1.20x</span>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-3 space-y-3 border-border bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Waves className="h-4 w-4 text-primary" />
                <Label htmlFor="reverb-toggle" className="text-xs font-semibold">Reverb</Label>
              </div>
              <Switch id="reverb-toggle" checked={reverbEnabled} onCheckedChange={setReverbEnabled} />
            </div>
            {reverbEnabled && (
              <div className="space-y-3 pl-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Droplets className="h-3 w-3 text-muted-foreground" />
                      <Label className="text-[10px] text-muted-foreground">Wet/Dry Mix</Label>
                    </div>
                    <span className="text-[10px] font-mono text-foreground">{wetDry}%</span>
                  </div>
                  <Slider
                    value={[wetDry]}
                    onValueChange={([v]) => setWetDry(v)}
                    min={0}
                    max={100}
                  />
                  <div className="flex justify-between text-[8px] text-muted-foreground">
                    <span>Dry</span><span>Wet</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Maximize2 className="h-3 w-3 text-muted-foreground" />
                      <Label className="text-[10px] text-muted-foreground">Reverb Size</Label>
                    </div>
                    <span className="text-[10px] font-mono text-foreground">{reverbSize}%</span>
                  </div>
                  <Slider
                    value={[reverbSize]}
                    onValueChange={([v]) => setReverbSize(v)}
                    min={5}
                    max={100}
                  />
                  <div className="flex justify-between text-[8px] text-muted-foreground">
                    <span>Small</span><span>Large</span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Preview & Export */}
          <div className="space-y-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={handlePreview}
              disabled={!hasClips || (!slowedEnabled && !reverbEnabled)}
            >
              {isPreviewing ? <Pause className="h-3.5 w-3.5 mr-1.5" /> : <Play className="h-3.5 w-3.5 mr-1.5" />}
              {isPreviewing ? "Stop Preview" : "Preview Effect"}
            </Button>
            <Button
              size="sm"
              className="w-full text-xs"
              onClick={handleExport}
              disabled={!hasClips || (!slowedEnabled && !reverbEnabled) || isExporting}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              {isExporting ? "Processing..." : "Export Processed Audio"}
            </Button>
          </div>

          {!hasClips && (
            <p className="text-[10px] text-muted-foreground text-center">
              Add audio clips to this track to use effects
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default DAWEffectsPanel;
