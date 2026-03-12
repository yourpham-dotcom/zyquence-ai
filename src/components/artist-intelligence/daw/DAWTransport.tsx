import { Play, Pause, Square, Circle, SkipBack, ZoomIn, ZoomOut, Bot, BotOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface DAWTransportProps {
  isPlaying: boolean;
  isRecording: boolean;
  bpm: number;
  currentTime: number;
  zoom: number;
  onPlayPause: () => void;
  onStop: () => void;
  onRecord: () => void;
  onBpmChange: (bpm: number) => void;
  onZoomChange: (z: number) => void;
  showAIPanel: boolean;
  onToggleAIPanel: () => void;
  showFXPanel: boolean;
  onToggleFXPanel: () => void;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
};

const DAWTransport = ({
  isPlaying, isRecording, bpm, currentTime, zoom,
  onPlayPause, onStop, onRecord, onBpmChange, onZoomChange,
  showAIPanel, onToggleAIPanel, showFXPanel, onToggleFXPanel,
}: DAWTransportProps) => (
  <div className="h-12 border-b border-border bg-card flex items-center px-3 gap-2 shrink-0">
    {/* Transport controls */}
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onStop}>
        <SkipBack className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onStop}>
        <Square className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant={isPlaying ? "default" : "ghost"}
        size="icon"
        className="h-8 w-8"
        onClick={onPlayPause}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <Button
        variant={isRecording ? "destructive" : "ghost"}
        size="icon"
        className="h-8 w-8"
        onClick={onRecord}
      >
        <Circle className={`h-4 w-4 ${isRecording ? "fill-current animate-pulse" : ""}`} />
      </Button>
    </div>

    {/* Time display */}
    <div className="font-mono text-sm bg-muted/50 px-3 py-1.5 rounded-md border border-border min-w-[120px] text-center tracking-wider text-foreground">
      {formatTime(currentTime)}
    </div>

    <div className="w-px h-6 bg-border mx-1" />

    {/* BPM */}
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">BPM</span>
      <Input
        type="number"
        value={bpm}
        onChange={e => onBpmChange(Math.max(20, Math.min(300, Number(e.target.value))))}
        className="w-16 h-7 text-xs text-center"
      />
    </div>

    <div className="flex-1" />

    {/* Zoom */}
    <div className="flex items-center gap-1.5">
      <ZoomOut className="h-3.5 w-3.5 text-muted-foreground" />
      <Slider
        value={[zoom * 50]}
        onValueChange={([v]) => onZoomChange(Math.max(0.25, v / 50))}
        className="w-24"
        max={200}
        min={12}
      />
      <ZoomIn className="h-3.5 w-3.5 text-muted-foreground" />
    </div>

    <div className="w-px h-6 bg-border mx-1" />

    {/* AI toggle */}
    <Button variant={showAIPanel ? "default" : "ghost"} size="sm" className="h-8 text-xs" onClick={onToggleAIPanel}>
      {showAIPanel ? <Bot className="h-3.5 w-3.5 mr-1.5" /> : <BotOff className="h-3.5 w-3.5 mr-1.5" />}
      AI Tools
    </Button>
  </div>
);

export default DAWTransport;
