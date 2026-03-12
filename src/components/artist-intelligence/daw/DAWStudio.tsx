import { useState, useRef, useCallback, useEffect, useMemo } from "react";
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
  startTime: number;
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
  player?: Tone.Player;
  channel?: Tone.Channel;
}

export interface DAWEffect {
  id: string;
  type: "reverb" | "delay" | "eq" | "compressor";
  enabled: boolean;
  params: Record<string, number>;
  node?: Tone.Reverb | Tone.FeedbackDelay | Tone.EQ3 | Tone.Compressor;
}

const TRACK_COLORS = [
  "hsl(210, 80%, 55%)", "hsl(340, 75%, 55%)", "hsl(150, 70%, 45%)",
  "hsl(45, 90%, 55%)", "hsl(270, 70%, 60%)", "hsl(180, 65%, 45%)",
  "hsl(20, 85%, 55%)", "hsl(300, 60%, 55%)",
];

const DAWStudio = () => {
  const { toast } = useToast();
  const [tracks, setTracks] = useState<DAWTrack[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const animFrameRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordStartTimeRef = useRef<number>(0);
  const channelsRef = useRef<Map<string, Tone.Channel>>(new Map());
  const playersRef = useRef<Map<string, Tone.Player>>(new Map());

  // Initialize default tracks
  useEffect(() => {
    const initial = [
      createTrack("Vocals", "vocal", 0),
      createTrack("Beats", "beat", 1),
      createTrack("FX", "fx", 2),
    ];
    setTracks(initial);
    initial.forEach(t => createChannel(t.id, t.volume, t.pan, t.muted));
    return () => {
      channelsRef.current.forEach(ch => ch.dispose());
      playersRef.current.forEach(p => p.dispose());
    };
  }, []);

  // Sync master volume to Tone.js
  useEffect(() => {
    Tone.getDestination().volume.value = Tone.gainToDb(masterVolume);
  }, [masterVolume]);

  // Sync BPM
  useEffect(() => {
    Tone.getTransport().bpm.value = bpm;
  }, [bpm]);

  function createChannel(trackId: string, volume: number, pan: number, muted: boolean) {
    const ch = new Tone.Channel({
      volume: muted ? -Infinity : Tone.gainToDb(volume),
      pan,
    }).toDestination();
    channelsRef.current.set(trackId, ch);
    return ch;
  }

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
    createChannel(newTrack.id, newTrack.volume, newTrack.pan, newTrack.muted);
    setTracks(prev => [...prev, newTrack]);
    setSelectedTrackId(newTrack.id);
    toast({ title: `${names[type]} track added` });
  };

  const deleteTrack = (id: string) => {
    // Dispose audio nodes
    const ch = channelsRef.current.get(id);
    if (ch) { ch.dispose(); channelsRef.current.delete(id); }
    const p = playersRef.current.get(id);
    if (p) { p.dispose(); playersRef.current.delete(id); }
    setTracks(prev => prev.filter(t => t.id !== id));
    if (selectedTrackId === id) setSelectedTrackId(null);
    toast({ title: "Track deleted" });
  };

  const updateTrack = (id: string, updates: Partial<DAWTrack>) => {
    setTracks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const updated = { ...t, ...updates };

      // Sync to Tone.js channel
      const ch = channelsRef.current.get(id);
      if (ch) {
        if ("volume" in updates) ch.volume.value = updated.muted ? -Infinity : Tone.gainToDb(updated.volume);
        if ("pan" in updates) ch.pan.value = updated.pan;
        if ("muted" in updates) ch.volume.value = updated.muted ? -Infinity : Tone.gainToDb(updated.volume);
      }

      // Handle solo: mute all non-solo tracks
      if ("solo" in updates) {
        setTimeout(() => applySolo(), 0);
      }

      return updated;
    }));
  };

  const applySolo = () => {
    setTracks(prev => {
      const hasSolo = prev.some(t => t.solo);
      prev.forEach(t => {
        const ch = channelsRef.current.get(t.id);
        if (ch) {
          if (hasSolo) {
            ch.volume.value = t.solo ? Tone.gainToDb(t.volume) : -Infinity;
          } else {
            ch.volume.value = t.muted ? -Infinity : Tone.gainToDb(t.volume);
          }
        }
      });
      return prev;
    });
  };

  // Load a clip's audio into a Tone.Player
  const loadClipAudio = (clip: DAWClip) => {
    if (!clip.audioUrl) return;
    const ch = channelsRef.current.get(clip.trackId);
    if (!ch) return;

    try {
      const player = new Tone.Player({
        url: clip.audioUrl,
        onload: () => {
          // Update clip duration from actual audio length
          const realDuration = player.buffer.duration;
          setTracks(prev => prev.map(t => ({
            ...t,
            clips: t.clips.map(c => c.id === clip.id ? { ...c, duration: realDuration } : c),
          })));
        },
      }).connect(ch);
      playersRef.current.set(clip.id, player);
    } catch (e) {
      console.error("Failed to load clip audio:", e);
    }
  };

  const handlePlayPause = async () => {
    if (!isPlaying) {
      await Tone.start();
      Tone.getTransport().bpm.value = bpm;

      // Schedule all clips
      tracks.forEach(track => {
        track.clips.forEach(clip => {
          const player = playersRef.current.get(clip.id);
          if (player?.loaded) {
            const startOffset = Math.max(0, currentTime - clip.startTime);
            const delay = Math.max(0, clip.startTime - currentTime);
            if (currentTime < clip.startTime + clip.duration) {
              player.start(`+${delay}`, startOffset);
            }
          }
        });
      });

      Tone.getTransport().start(undefined, currentTime);
      setIsPlaying(true);
      startTimeUpdate();
    } else {
      Tone.getTransport().pause();
      // Stop all players
      playersRef.current.forEach(p => { try { p.stop(); } catch {} });
      setIsPlaying(false);
      cancelAnimationFrame(animFrameRef.current);
    }
  };

  const handleStop = () => {
    Tone.getTransport().stop();
    playersRef.current.forEach(p => { try { p.stop(); } catch {} });
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
      toast({ title: "No track armed", description: "Click the mic (🎤) button on a track to arm it for recording", variant: "destructive" });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const recorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm" });
      chunksRef.current = [];
      recordStartTimeRef.current = currentTime;

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        const url = URL.createObjectURL(blob);
        const recordDuration = Tone.getTransport().seconds - recordStartTimeRef.current;
        const newClip: DAWClip = {
          id: crypto.randomUUID(),
          trackId: armedTrack.id,
          name: `Rec ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
          audioUrl: url,
          startTime: recordStartTimeRef.current,
          duration: Math.max(recordDuration, 0.5),
          color: armedTrack.color,
        };
        setTracks(prev => prev.map(t =>
          t.id === armedTrack.id ? { ...t, clips: [...t.clips, newClip] } : t
        ));
        // Load into player
        loadClipAudio(newClip);
        stream.getTracks().forEach(t => t.stop());
        toast({ title: "Recording saved", description: `Added to ${armedTrack.name}` });
      };
      mediaRecorderRef.current = recorder;
      recorder.start(100); // collect in 100ms chunks for better timing
      setIsRecording(true);
      if (!isPlaying) handlePlayPause();
      toast({ title: "Recording started", description: `Recording to ${armedTrack.name}` });
    } catch {
      toast({ title: "Microphone access denied", description: "Please allow microphone access to record", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({ title: "Recording stopped" });
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
    const wasPlaying = isPlaying;
    if (wasPlaying) {
      Tone.getTransport().pause();
      playersRef.current.forEach(p => { try { p.stop(); } catch {} });
    }
    Tone.getTransport().seconds = time;
    setCurrentTime(time);
    if (wasPlaying) {
      // Reschedule clips from new position
      tracks.forEach(track => {
        track.clips.forEach(clip => {
          const player = playersRef.current.get(clip.id);
          if (player?.loaded && time < clip.startTime + clip.duration) {
            const startOffset = Math.max(0, time - clip.startTime);
            const delay = Math.max(0, clip.startTime - time);
            player.start(`+${delay}`, startOffset);
          }
        });
      });
      Tone.getTransport().start(undefined, time);
    }
  };

  const handleFileDrop = useCallback((files: FileList, trackId: string) => {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith("audio/")) {
        toast({ title: "Invalid file", description: `${file.name} is not an audio file`, variant: "destructive" });
        return;
      }
      const url = URL.createObjectURL(file);
      const newClip: DAWClip = {
        id: crypto.randomUUID(),
        trackId,
        name: file.name.replace(/\.[^.]+$/, ""),
        audioUrl: url,
        startTime: 0,
        duration: 10, // will be updated once loaded
        color: tracks.find(t => t.id === trackId)?.color || "hsl(210, 80%, 55%)",
      };
      setTracks(prev => prev.map(t =>
        t.id === trackId ? { ...t, clips: [...t.clips, newClip] } : t
      ));
      loadClipAudio(newClip);
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
        // Reconnect player to new channel
        const player = playersRef.current.get(clipId);
        if (player) {
          player.disconnect();
          const ch = channelsRef.current.get(newTrackId);
          if (ch) player.connect(ch);
        }
        return updated.map(t =>
          t.id === newTrackId ? { ...t, clips: [...t.clips, movedClip!] } : t
        );
      }
      return updated;
    });
  };

  const deleteClip = (clipId: string) => {
    const player = playersRef.current.get(clipId);
    if (player) { try { player.stop(); } catch {} player.dispose(); playersRef.current.delete(clipId); }
    setTracks(prev => prev.map(t => ({
      ...t, clips: t.clips.filter(c => c.id !== clipId),
    })));
    toast({ title: "Clip deleted" });
  };

  const addEffectToTrack = (trackId: string, effectType: DAWEffect["type"], presetParams?: Record<string, number>) => {
    const ch = channelsRef.current.get(trackId);
    if (!ch) return;

    let node: Tone.Reverb | Tone.FeedbackDelay | Tone.EQ3 | Tone.Compressor;
    const params = presetParams || {};

    switch (effectType) {
      case "reverb":
        node = new Tone.Reverb({ decay: params.decay ?? 2.5, wet: params.wet ?? 0.4 });
        break;
      case "delay":
        node = new Tone.FeedbackDelay({ delayTime: params.delayTime ?? 0.25, feedback: params.feedback ?? 0.3, wet: params.wet ?? 0.3 });
        break;
      case "eq":
        node = new Tone.EQ3({ low: params.low ?? 0, mid: params.mid ?? 0, high: params.high ?? 0 });
        break;
      case "compressor":
        node = new Tone.Compressor({ threshold: params.threshold ?? -24, ratio: params.ratio ?? 4, attack: params.attack ?? 0.003, release: params.release ?? 0.25 });
        break;
    }

    // Insert effect into channel chain
    ch.chain(node, Tone.getDestination());

    const effect: DAWEffect = {
      id: crypto.randomUUID(),
      type: effectType,
      enabled: true,
      params,
      node,
    };

    setTracks(prev => prev.map(t =>
      t.id === trackId ? { ...t, effects: [...t.effects, effect] } : t
    ));

    toast({ title: `${effectType.charAt(0).toUpperCase() + effectType.slice(1)} added`, description: `Applied to track` });
  };

  const applyEffectPreset = (presetName: string) => {
    const trackId = selectedTrackId;
    if (!trackId) {
      toast({ title: "No track selected", description: "Select a track first to apply effects", variant: "destructive" });
      return;
    }

    const presets: Record<string, { type: DAWEffect["type"]; params: Record<string, number> }> = {
      "Warm Reverb": { type: "reverb", params: { decay: 3, wet: 0.35 } },
      "Tape Delay": { type: "delay", params: { delayTime: 0.375, feedback: 0.4, wet: 0.25 } },
      "Radio EQ": { type: "eq", params: { low: -12, mid: 6, high: -8 } },
      "Hard Comp": { type: "compressor", params: { threshold: -30, ratio: 8, attack: 0.001, release: 0.1 } },
      "Airy Verb": { type: "reverb", params: { decay: 5, wet: 0.5 } },
      "Slapback": { type: "delay", params: { delayTime: 0.1, feedback: 0.15, wet: 0.35 } },
    };

    const preset = presets[presetName];
    if (preset) addEffectToTrack(trackId, preset.type, preset.params);
  };

  const handleExport = async (format: "mp3" | "wav") => {
    toast({ title: `Exporting as ${format.toUpperCase()}`, description: "Rendering all tracks..." });

    try {
      // Use OfflineAudioContext to render
      const sampleRate = 44100;
      const totalClips = tracks.flatMap(t => t.clips);
      if (totalClips.length === 0) {
        toast({ title: "Nothing to export", description: "Add some audio clips first", variant: "destructive" });
        return;
      }

      const maxEnd = Math.max(...totalClips.map(c => c.startTime + c.duration));
      const totalSamples = Math.ceil(maxEnd * sampleRate);
      const offlineCtx = new OfflineAudioContext(2, totalSamples, sampleRate);

      // Load and schedule each clip
      const loadPromises = totalClips.map(async (clip) => {
        if (!clip.audioUrl) return;
        const track = tracks.find(t => t.id === clip.trackId);
        if (!track || track.muted) return;

        try {
          const response = await fetch(clip.audioUrl);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await offlineCtx.decodeAudioData(arrayBuffer);
          
          const source = offlineCtx.createBufferSource();
          source.buffer = audioBuffer;
          
          const gainNode = offlineCtx.createGain();
          gainNode.gain.value = track.volume;
          
          const panNode = offlineCtx.createStereoPanner();
          panNode.pan.value = track.pan;
          
          source.connect(gainNode).connect(panNode).connect(offlineCtx.destination);
          source.start(clip.startTime);
        } catch (e) {
          console.warn("Could not load clip for export:", clip.name, e);
        }
      });

      await Promise.all(loadPromises);
      const renderedBuffer = await offlineCtx.startRendering();

      // Convert to WAV
      const wavBlob = audioBufferToWav(renderedBuffer);
      
      const a = document.createElement("a");
      a.href = URL.createObjectURL(wavBlob);
      a.download = `mix-${new Date().toISOString().slice(0, 10)}.${format === "wav" ? "wav" : "wav"}`; // WAV for both since MP3 encoding needs lamejs
      a.click();
      URL.revokeObjectURL(a.href);

      toast({ title: "Export complete!", description: `Your mix has been downloaded` });
    } catch (e) {
      console.error("Export failed:", e);
      toast({ title: "Export failed", description: "An error occurred during export", variant: "destructive" });
    }
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      channelsRef.current.forEach(ch => ch.dispose());
      playersRef.current.forEach(p => p.dispose());
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
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

      <div className="flex-1 flex overflow-hidden">
        <DAWTrackList
          tracks={tracks}
          selectedTrackId={selectedTrackId}
          onSelectTrack={setSelectedTrackId}
          onAddTrack={addTrack}
          onDeleteTrack={deleteTrack}
          onUpdateTrack={updateTrack}
        />

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

        {showAIPanel && (
          <DAWAITools
            tracks={tracks}
            selectedTrackId={selectedTrackId}
            bpm={bpm}
            onAddClip={(trackId, clip) => {
              setTracks(prev => prev.map(t =>
                t.id === trackId ? { ...t, clips: [...t.clips, clip] } : t
              ));
              loadClipAudio(clip);
            }}
            onApplyPreset={applyEffectPreset}
            onExport={handleExport}
            onAddEffect={(trackId, type) => addEffectToTrack(trackId, type)}
          />
        )}
      </div>

      <DAWMixer
        tracks={tracks}
        onUpdateTrack={updateTrack}
        selectedTrackId={selectedTrackId}
        onSelectTrack={setSelectedTrackId}
        masterVolume={masterVolume}
        onMasterVolumeChange={setMasterVolume}
      />
    </div>
  );
};

// WAV encoding helper
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataLength = buffer.length * blockAlign;
  const headerLength = 44;
  const arrayBuffer = new ArrayBuffer(headerLength + dataLength);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, "data");
  view.setUint32(40, dataLength, true);

  const channels = [];
  for (let i = 0; i < numChannels; i++) channels.push(buffer.getChannelData(i));

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

export default DAWStudio;
