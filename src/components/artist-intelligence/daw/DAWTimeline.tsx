import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { DAWTrack, DAWClip } from "./DAWStudio";

interface DAWTimelineProps {
  tracks: DAWTrack[];
  currentTime: number;
  zoom: number;
  bpm: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  onFileDrop: (files: FileList, trackId: string) => void;
  onMoveClip: (clipId: string, newTrackId: string, newStartTime: number) => void;
  onDeleteClip: (clipId: string) => void;
  selectedTrackId: string | null;
}

const TRACK_HEIGHT = 72;
const PIXELS_PER_SECOND_BASE = 40;
const TOTAL_DURATION = 120; // 2 minutes visible

const DAWTimeline = ({
  tracks, currentTime, zoom, bpm, isPlaying, onSeek, onFileDrop, onMoveClip, onDeleteClip, selectedTrackId,
}: DAWTimelineProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragOverTrackId, setDragOverTrackId] = useState<string | null>(null);
  const [draggingClip, setDraggingClip] = useState<{ id: string; offsetX: number } | null>(null);
  const pps = PIXELS_PER_SECOND_BASE * zoom;
  const totalWidth = TOTAL_DURATION * pps;

  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scrollLeft = containerRef.current?.scrollLeft || 0;
    const x = e.clientX - rect.left + scrollLeft;
    onSeek(x / pps);
  };

  const handleDragOver = useCallback((e: React.DragEvent, trackId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverTrackId(trackId);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, trackId: string) => {
    e.preventDefault();
    setDragOverTrackId(null);
    if (e.dataTransfer.files.length > 0) {
      onFileDrop(e.dataTransfer.files, trackId);
      return;
    }
    const clipId = e.dataTransfer.getData("clipId");
    if (clipId) {
      const rect = e.currentTarget.getBoundingClientRect();
      const scrollLeft = containerRef.current?.scrollLeft || 0;
      const x = e.clientX - rect.left + scrollLeft;
      const offsetX = parseFloat(e.dataTransfer.getData("offsetX") || "0");
      onMoveClip(clipId, trackId, (x - offsetX) / pps);
    }
  }, [onFileDrop, onMoveClip, pps]);

  // Generate beat markers
  const beatInterval = 60 / bpm;
  const barInterval = beatInterval * 4;
  const markers: { x: number; label: string; isBeat: boolean }[] = [];
  for (let t = 0; t < TOTAL_DURATION; t += beatInterval) {
    const barNum = Math.floor(t / barInterval) + 1;
    const beatInBar = Math.round((t % barInterval) / beatInterval) + 1;
    const isBar = beatInBar === 1;
    markers.push({
      x: t * pps,
      label: isBar ? `${barNum}` : "",
      isBeat: !isBar,
    });
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-muted/20">
      {/* Ruler */}
      <div
        className="h-8 border-b border-border bg-muted/40 relative cursor-pointer shrink-0 overflow-hidden"
        onClick={handleRulerClick}
      >
        <div className="absolute inset-0 overflow-x-auto" ref={containerRef} style={{ width: "100%" }}>
          <div className="relative h-full" style={{ width: totalWidth }}>
            {markers.map((m, i) => (
              <div key={i} className="absolute top-0 h-full" style={{ left: m.x }}>
                <div className={cn("h-full border-l", m.isBeat ? "border-border/30" : "border-border/60")} />
                {m.label && (
                  <span className="absolute top-1 left-1 text-[9px] text-muted-foreground font-mono">
                    {m.label}
                  </span>
                )}
              </div>
            ))}
            {/* Playhead on ruler */}
            <div
              className="absolute top-0 h-full w-0.5 bg-destructive z-20 pointer-events-none"
              style={{ left: currentTime * pps }}
            />
          </div>
        </div>
      </div>

      {/* Track lanes */}
      <div className="flex-1 overflow-auto relative" ref={containerRef}>
        <div className="relative" style={{ width: totalWidth, minHeight: tracks.length * TRACK_HEIGHT }}>
          {/* Grid lines */}
          {markers.map((m, i) => (
            <div
              key={i}
              className={cn(
                "absolute top-0 bottom-0 border-l",
                m.isBeat ? "border-border/10" : "border-border/25"
              )}
              style={{ left: m.x }}
            />
          ))}

          {/* Track rows */}
          {tracks.map((track, trackIndex) => (
            <div
              key={track.id}
              className={cn(
                "absolute left-0 right-0 border-b border-border/30 transition-colors",
                dragOverTrackId === track.id && "bg-primary/10",
                selectedTrackId === track.id && "bg-accent/20"
              )}
              style={{ top: trackIndex * TRACK_HEIGHT, height: TRACK_HEIGHT }}
              onDragOver={e => handleDragOver(e, track.id)}
              onDragLeave={() => setDragOverTrackId(null)}
              onDrop={e => handleDrop(e, track.id)}
            >
              {/* Drop hint */}
              {dragOverTrackId === track.id && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <span className="text-xs text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
                    Drop audio here
                  </span>
                </div>
              )}

              {/* Clips */}
              {track.clips.map(clip => (
                <ClipBlock
                  key={clip.id}
                  clip={clip}
                  pps={pps}
                  trackHeight={TRACK_HEIGHT}
                  onDelete={onDeleteClip}
                />
              ))}

              {/* Empty track hint */}
              {track.clips.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-muted-foreground/40">
                    Drag & drop audio or record
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-destructive z-30 pointer-events-none"
            style={{ left: currentTime * pps }}
          >
            <div className="w-2.5 h-2.5 bg-destructive rounded-full -ml-1 -mt-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

const ClipBlock = ({
  clip, pps, trackHeight, onDelete,
}: {
  clip: DAWClip; pps: number; trackHeight: number; onDelete: (id: string) => void;
}) => {
  const width = clip.duration * pps;
  const left = clip.startTime * pps;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("clipId", clip.id);
    const rect = e.currentTarget.getBoundingClientRect();
    e.dataTransfer.setData("offsetX", String(e.clientX - rect.left));
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDoubleClick={() => onDelete(clip.id)}
      className="absolute rounded-md cursor-grab active:cursor-grabbing group overflow-hidden"
      style={{
        left,
        width: Math.max(width, 20),
        top: 4,
        height: trackHeight - 8,
        backgroundColor: clip.color,
        opacity: 0.85,
      }}
      title="Drag to move · Double-click to delete"
    >
      {/* Waveform placeholder */}
      <div className="absolute inset-0 flex items-end px-1 pb-1">
        {Array.from({ length: Math.max(Math.floor(width / 3), 4) }).map((_, i) => (
          <div
            key={i}
            className="flex-1 mx-px rounded-t bg-white/30"
            style={{ height: `${20 + Math.random() * 60}%` }}
          />
        ))}
      </div>
      <div className="absolute top-0 left-0 right-0 px-1.5 py-0.5">
        <span className="text-[9px] font-medium text-white drop-shadow-sm truncate block">
          {clip.name}
        </span>
      </div>
    </div>
  );
};

export default DAWTimeline;
