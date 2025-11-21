import { Volume2, Minus, Plus, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { Track } from "../MusicStudio";

interface TrackControlsProps {
  track: Track;
  onUpdate: (updates: Partial<Track>) => void;
}

const TrackControls = ({ track, onUpdate }: TrackControlsProps) => {
  return (
    <div className="flex items-center gap-4">
      {/* Volume */}
      <div className="flex items-center gap-2 flex-1">
        <Volume2 className="w-4 h-4 text-muted-foreground" />
        <Slider
          value={[track.volume * 100]}
          onValueChange={([v]) => onUpdate({ volume: v / 100 })}
          className="flex-1"
        />
        <span className="text-xs text-muted-foreground w-10">
          {Math.round(track.volume * 100)}%
        </span>
      </div>

      {/* Pan */}
      <div className="flex items-center gap-2 w-32">
        <Minus className="w-3 h-3 text-muted-foreground" />
        <Slider
          value={[(track.pan + 1) * 50]}
          onValueChange={([v]) => onUpdate({ pan: (v / 50) - 1 })}
          className="flex-1"
        />
        <Plus className="w-3 h-3 text-muted-foreground" />
      </div>

      {/* Mute/Solo */}
      <div className="flex items-center gap-1">
        <Button
          variant={track.muted ? "default" : "outline"}
          size="sm"
          onClick={() => onUpdate({ muted: !track.muted })}
        >
          M
        </Button>
        <Button
          variant={track.solo ? "default" : "outline"}
          size="sm"
          onClick={() => onUpdate({ solo: !track.solo })}
        >
          S
        </Button>
      </div>
    </div>
  );
};

export default TrackControls;