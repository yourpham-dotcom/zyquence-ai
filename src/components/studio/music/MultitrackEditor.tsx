import { useState } from "react";
import { Plus, Trash2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import TrackControls from "./TrackControls";
import WaveformDisplay from "./WaveformDisplay";
import type { Track } from "../MusicStudio";

interface MultitrackEditorProps {
  tracks: Track[];
  setTracks: (tracks: Track[]) => void;
  selectedTrack: string | null;
  setSelectedTrack: (id: string | null) => void;
  onAddTrack: () => void;
  isPlaying: boolean;
  bpm: number;
}

const MultitrackEditor = ({
  tracks,
  setTracks,
  selectedTrack,
  setSelectedTrack,
  onAddTrack,
  isPlaying,
  bpm,
}: MultitrackEditorProps) => {
  const [masterVolume, setMasterVolume] = useState(0.8);

  const updateTrack = (id: string, updates: Partial<Track>) => {
    setTracks(tracks.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTrack = (id: string) => {
    setTracks(tracks.filter(t => t.id !== id));
    if (selectedTrack === id) setSelectedTrack(null);
  };

  return (
    <div className="h-full flex flex-col p-6 gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={onAddTrack} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Track
          </Button>
          <div className="text-sm text-muted-foreground">
            {bpm} BPM
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <Slider
            value={[masterVolume * 100]}
            onValueChange={([v]) => setMasterVolume(v / 100)}
            className="w-32"
          />
          <span className="text-sm text-muted-foreground w-12">
            {Math.round(masterVolume * 100)}%
          </span>
        </div>
      </div>

      {/* Tracks */}
      <ScrollArea className="flex-1">
        <div className="space-y-3">
          {tracks.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <Volume2 className="w-12 h-12 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">No tracks yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first track to start creating music
                  </p>
                  <Button onClick={onAddTrack}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Track
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            tracks.map((track) => (
              <Card
                key={track.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedTrack === track.id
                    ? "ring-2 ring-primary"
                    : "hover:bg-accent"
                }`}
                onClick={() => setSelectedTrack(track.id)}
              >
                <div className="flex items-center gap-4">
                  {/* Track Color */}
                  <div
                    className="w-3 h-12 rounded"
                    style={{ backgroundColor: track.color }}
                  />

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium truncate">{track.name}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTrack(track.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Waveform */}
                    {track.audioUrl ? (
                      <WaveformDisplay
                        audioUrl={track.audioUrl}
                        color={track.color}
                        isPlaying={isPlaying}
                      />
                    ) : (
                      <div className="h-16 bg-muted rounded flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">
                          No audio loaded
                        </p>
                      </div>
                    )}

                    {/* Controls */}
                    <div className="mt-3">
                      <TrackControls
                        track={track}
                        onUpdate={(updates) => updateTrack(track.id, updates)}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MultitrackEditor;