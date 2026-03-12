import { useState, useRef, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import * as Tone from "tone";
import DAWTrackList from "./DAWTrackList";
import DAWTimeline from "./DAWTimeline";
import DAWMixer from "./DAWMixer";
import DAWAITools from "./DAWAITools";
import DAWTransport from "./DAWTransport";

export interface DAWClip {
  id: string;
  trackId: string;
  name: string;
  audioUrl?: string;
  startTime: number; // in seconds
  duration: number;
  color: string;
}

export interface DAWTrack {
  id: string;
  name: string;
  type: "vocal" | "beat" | "fx" | "instrument" | "master";
  color: string;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  armed: boolean;
  clips: DAWClip[];
  effects: DAWEffect[];
}

export interface DAWEffect {
  id: string;
  type: "reverb" | "delay" | "eq" | "compressor";
  enabled: boolean;
  params: Record<string, number>;
}

const TRACK_COLORS = [
  "hsl(210, 80%, 55%)", "hsl(340, 75%, 55%)", "hsl(150, 70%, 45%)",
  "hsl(45, 90%, 55%)", "hsl(270, 70%, 60%)", "hsl(180, 65%, 45%)",
  "hsl(20, 85%, 55%)", "hsl(300, 60%, 55%)",
];

const DAWStudio = () => {
  const { toast } = useToast();
  const [tracks, setTracks] = useState<DAWTrack[]>([
    createTrack("Vocals", "vocal", 0),
    createTrack("Beats", "beat", 1),
    createTrack("FX", "fx", 2),
  ]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [mixerHeight, setMixerHeight] = useState(200);
  const animFrameRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  function createTrack(name: string, type: DAWTrack["type"], index: number): DAWTrack {
    return {
      id: crypto.randomUUID(),
      name,
      type,
      color: TRACK_COLORS[index % TRACK_COLORS.length],
      volume: 0.8,
      pan: 0,
      muted: false,
      solo: false,
      armed: false,
      clips: [],
      effects: [],
    };
  }

  const addTrack = (type: DAWTrack["type"] = "instrument") => {
    const names: Record<string, string> = {
      vocal: "Vocals", beat: "Beats", fx: "FX",
      instrument: "Instrument", master: "Master",
    };
    const newTrack = createTrack(
      `${names[type]} ${tracks.filter(t => t.type === type).length + 1}`,
      type,
      tracks.length
    );
    setTracks(prev => [...prev, newTrack]);
    setSelectedTrackId(newTrack.id);
  };

  const deleteTrack = (id: string) => {
    setTracks(prev => prev.filter(t => t.id !== id));
    if (selectedTrackId === id) setSelectedTrackId(null);
  };

  const updateTrack = (id: string, updates: Partial<DAWTrack>) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handlePlayPause = async () => {
    if (!isPlaying) {
      await Tone.start();
      Tone.getTransport().bpm.value = bpm;
      Tone.getTransport().start();
      setIsPlaying(true);
      startTimeUpdate();
    } else {
      Tone.getTransport().pause();
      setIsPlaying(false);
      cancelAnimationFrame(animFrameRef.current);
    }
  };

  const handleStop = () => {
    Tone.getTransport().stop();
    setIsPlaying(false);
    setIsRecording(false);
    setCurrentTime(0);
    cancelAnimationFrame(animFrameRef.current);
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleRecord = async () => {
    const armedTrack = tracks.find(t => t.armed);
    if (!armedTrack) {
      toast({ title: "No track armed", description: "Arm a track (R button) to record", variant: "destructive" });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        const newClip: DAWClip = {
          id: crypto.randomUUID(),
          trackId: armedTrack.id,
          name: `Recording ${new Date().toLocaleTimeString()}`,
          audioUrl: url,
          startTime: currentTime,
          duration: 5,
          color: armedTrack.color,
        };
        setTracks(prev => prev.map(t =>
          t.id === armedTrack.id ? { ...t, clips: [...t.clips, newClip] } : t
        ));
        stream.getTracks().forEach(t => t.stop());
        toast({ title: "Recording saved", description: `Added to ${armedTrack.name}` });
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      if (!isPlaying) handlePlayPause();
    } catch {
      toast({ title: "Microphone access denied", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const startTimeUpdate = () => {
    const update = () => {
      setCurrentTime(Tone.getTransport().seconds);
      animFrameRef.current = requestAnimationFrame(update);
    };
    animFrameRef.current = requestAnimationFrame(update);
  };

  const seekTo = (time: number) => {
    Tone.getTransport().seconds = time;
    setCurrentTime(time);
  };

  const handleFileDrop = useCallback((files: FileList, trackId: string) => {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith("audio/")) return;
      const url = URL.createObjectURL(file);
      const newClip: DAWClip = {
        id: crypto.randomUUID(),
        trackId,
        name: file.name.replace(/\.[^.]+$/, ""),
        audioUrl: url,
        startTime: 0,
        duration: 10,
        color: tracks.find(t => t.id === trackId)?.color || "hsl(210, 80%, 55%)",
      };
      setTracks(prev => prev.map(t =>
        t.id === trackId ? { ...t, clips: [...t.clips, newClip] } : t
      ));
    });
    toast({ title: "Audio imported", description: `${files.length} file(s) added` });
  }, [tracks, toast]);

  const moveClip = (clipId: string, newTrackId: string, newStartTime: number) => {
    let movedClip: DAWClip | null = null;
    setTracks(prev => {
      const updated = prev.map(t => {
        const clip = t.clips.find(c => c.id === clipId);
        if (clip) movedClip = { ...clip, trackId: newTrackId, startTime: Math.max(0, newStartTime) };
        return { ...t, clips: t.clips.filter(c => c.id !== clipId) };
      });
      if (movedClip) {
        return updated.map(t =>
          t.id === newTrackId ? { ...t, clips: [...t.clips, movedClip!] } : t
        );
      }
      return updated;
    });
  };

  const deleteClip = (clipId: string) => {
    setTracks(prev => prev.map(t => ({
      ...t, clips: t.clips.filter(c => c.id !== clipId),
    })));
  };

  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Transport Bar */}
      <DAWTransport
        isPlaying={isPlaying}
        isRecording={isRecording}
        bpm={bpm}
        currentTime={currentTime}
        zoom={zoom}
        onPlayPause={handlePlayPause}
        onStop={handleStop}
        onRecord={isRecording ? stopRecording : handleRecord}
        onBpmChange={setBpm}
        onZoomChange={setZoom}
        showAIPanel={showAIPanel}
        onToggleAIPanel={() => setShowAIPanel(!showAIPanel)}
      />

      {/* Main workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Track List */}
        <DAWTrackList
          tracks={tracks}
          selectedTrackId={selectedTrackId}
          onSelectTrack={setSelectedTrackId}
          onAddTrack={addTrack}
          onDeleteTrack={deleteTrack}
          onUpdateTrack={updateTrack}
        />

        {/* Center: Timeline */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <DAWTimeline
            tracks={tracks}
            currentTime={currentTime}
            zoom={zoom}
            bpm={bpm}
            isPlaying={isPlaying}
            onSeek={seekTo}
            onFileDrop={handleFileDrop}
            onMoveClip={moveClip}
            onDeleteClip={deleteClip}
            selectedTrackId={selectedTrackId}
          />
        </div>

        {/* Right: AI Tools */}
        {showAIPanel && (
          <DAWAITools
            tracks={tracks}
            selectedTrackId={selectedTrackId}
            bpm={bpm}
            onAddClip={(trackId, clip) => {
              setTracks(prev => prev.map(t =>
                t.id === trackId ? { ...t, clips: [...t.clips, clip] } : t
              ));
            }}
          />
        )}
      </div>

      {/* Bottom: Mixer */}
      <DAWMixer
        tracks={tracks}
        onUpdateTrack={updateTrack}
        selectedTrackId={selectedTrackId}
        onSelectTrack={setSelectedTrackId}
        height={mixerHeight}
      />
    </div>
  );
};

export default DAWStudio;
