import { Plus, Trash2, Volume2, VolumeX, Mic2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DAWTrack } from "./DAWStudio";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DAWTrackListProps {
  tracks: DAWTrack[];
  selectedTrackId: string | null;
  onSelectTrack: (id: string) => void;
  onAddTrack: (type: DAWTrack["type"]) => void;
  onDeleteTrack: (id: string) => void;
  onUpdateTrack: (id: string, updates: Partial<DAWTrack>) => void;
}

const TRACK_HEIGHT = 72;

const DAWTrackList = ({
  tracks, selectedTrackId, onSelectTrack, onAddTrack, onDeleteTrack, onUpdateTrack,
}: DAWTrackListProps) => (
  <div className="w-52 border-r border-border bg-card/80 flex flex-col shrink-0">
    {/* Header */}
    <div className="h-8 border-b border-border flex items-center justify-between px-3 bg-muted/30 shrink-0">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Tracks</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onAddTrack("vocal")}>🎤 Vocal Track</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAddTrack("beat")}>🥁 Beat Track</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAddTrack("fx")}>✨ FX Track</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAddTrack("instrument")}>🎹 Instrument Track</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    {/* Track items */}
    <div className="flex-1 overflow-y-auto">
      {tracks.map((track) => (
        <div
          key={track.id}
          onClick={() => onSelectTrack(track.id)}
          className={cn(
            "border-b border-border/50 px-2 py-1.5 cursor-pointer transition-colors",
            selectedTrackId === track.id ? "bg-accent/60" : "hover:bg-accent/30"
          )}
          style={{ height: TRACK_HEIGHT }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: track.color }} />
            <span className="text-xs font-medium truncate flex-1">{track.name}</span>
            <Button
              variant="ghost" size="icon" className="h-5 w-5 shrink-0"
              onClick={e => { e.stopPropagation(); onDeleteTrack(track.id); }}
            >
              <Trash2 className="h-3 w-3 text-muted-foreground" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={track.muted ? "destructive" : "ghost"}
              size="icon" className="h-5 w-5 text-[9px] font-bold"
              onClick={e => { e.stopPropagation(); onUpdateTrack(track.id, { muted: !track.muted }); }}
            >
              {track.muted ? <VolumeX className="h-3 w-3" /> : "M"}
            </Button>
            <Button
              variant={track.solo ? "default" : "ghost"}
              size="icon" className="h-5 w-5 text-[9px] font-bold"
              onClick={e => { e.stopPropagation(); onUpdateTrack(track.id, { solo: !track.solo }); }}
            >
              S
            </Button>
            <Button
              variant={track.armed ? "destructive" : "ghost"}
              size="icon" className="h-5 w-5 text-[9px] font-bold"
              onClick={e => { e.stopPropagation(); onUpdateTrack(track.id, { armed: !track.armed }); }}
            >
              <Mic2 className="h-3 w-3" />
            </Button>
            <span className="text-[9px] text-muted-foreground ml-auto capitalize">{track.type}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default DAWTrackList;
