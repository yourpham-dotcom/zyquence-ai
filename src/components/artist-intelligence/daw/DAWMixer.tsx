import { Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { DAWTrack } from "./DAWStudio";
import { Button } from "@/components/ui/button";

interface DAWMixerProps {
  tracks: DAWTrack[];
  onUpdateTrack: (id: string, updates: Partial<DAWTrack>) => void;
  selectedTrackId: string | null;
  onSelectTrack: (id: string) => void;
  masterVolume: number;
  onMasterVolumeChange: (v: number) => void;
}

const DAWMixer = ({ tracks, onUpdateTrack, selectedTrackId, onSelectTrack, masterVolume, onMasterVolumeChange }: DAWMixerProps) => (
  <div className="border-t border-border bg-card shrink-0 h-[200px]">
    <div className="h-6 border-b border-border bg-muted/30 flex items-center px-3">
      <Volume2 className="h-3 w-3 text-muted-foreground mr-2" />
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Mixer</span>
    </div>
    <div className="flex h-[calc(100%-24px)] overflow-x-auto px-2 gap-1 py-2">
      {tracks.map(track => {
        const db = track.muted ? -Infinity : Math.round(20 * Math.log10(track.volume));
        return (
          <div
            key={track.id}
            onClick={() => onSelectTrack(track.id)}
            className={cn(
              "flex flex-col items-center gap-1 px-2 py-1 rounded-md min-w-[60px] cursor-pointer transition-colors",
              selectedTrackId === track.id ? "bg-accent/50" : "hover:bg-accent/20"
            )}
          >
            {/* Volume dB */}
            <span className="text-[8px] text-muted-foreground font-mono">
              {track.muted ? "-∞" : `${db > 0 ? "+" : ""}${db}`} dB
            </span>

            {/* Fader */}
            <div className="flex-1 flex items-center justify-center w-full min-h-[60px]">
              <Slider
                orientation="vertical"
                value={[track.volume * 100]}
                onValueChange={([v]) => onUpdateTrack(track.id, { volume: v / 100 })}
                className="h-full"
                max={100}
              />
            </div>

            {/* Pan knob display */}
            <div className="flex items-center gap-0.5 w-full">
              <span className="text-[7px] text-muted-foreground">L</span>
              <Slider
                value={[track.pan * 50 + 50]}
                onValueChange={([v]) => onUpdateTrack(track.id, { pan: (v - 50) / 50 })}
                className="flex-1"
                max={100}
              />
              <span className="text-[7px] text-muted-foreground">R</span>
            </div>

            {/* Controls */}
            <div className="flex gap-0.5">
              <Button
                variant={track.muted ? "destructive" : "outline"}
                size="icon" className="h-5 w-5 text-[8px]"
                onClick={e => { e.stopPropagation(); onUpdateTrack(track.id, { muted: !track.muted }); }}
              >
                M
              </Button>
              <Button
                variant={track.solo ? "default" : "outline"}
                size="icon" className="h-5 w-5 text-[8px]"
                onClick={e => { e.stopPropagation(); onUpdateTrack(track.id, { solo: !track.solo }); }}
              >
                S
              </Button>
            </div>

            {/* Label */}
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: track.color }} />
              <span className="text-[8px] text-muted-foreground truncate max-w-[56px] text-center mt-0.5">
                {track.name}
              </span>
            </div>
          </div>
        );
      })}

      {/* Master channel */}
      <div className="flex flex-col items-center gap-1 px-2 py-1 rounded-md min-w-[60px] border-l border-border ml-1 pl-3">
        <span className="text-[8px] text-muted-foreground font-mono">
          {Math.round(20 * Math.log10(masterVolume))} dB
        </span>
        <div className="flex-1 flex items-center justify-center w-full min-h-[60px]">
          <Slider
            orientation="vertical"
            value={[masterVolume * 100]}
            onValueChange={([v]) => onMasterVolumeChange(v / 100)}
            className="h-full"
            max={100}
          />
        </div>
        <span className="text-[8px] text-muted-foreground font-bold uppercase">Master</span>
      </div>
    </div>
  </div>
);

export default DAWMixer;
