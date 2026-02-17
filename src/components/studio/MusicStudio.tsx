import { useState, useEffect } from "react";
import { Music2, Save, Upload, Download, Users, Play, Pause, Mic2, PanelRightOpen, PanelRightClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MultitrackEditor from "./music/MultitrackEditor";
import RecordingPanel from "./music/RecordingPanel";
import EffectsPanel from "./music/EffectsPanel";
import ExportDialog from "./music/ExportDialog";
import ProjectManager from "./music/ProjectManager";
import CollaborationPanel from "./music/CollaborationPanel";
import LyricsStudio from "./LyricsStudio";
import * as Tone from "tone";

export interface Track {
  id: string;
  name: string;
  audioUrl?: string;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  effects: any;
  orderIndex: number;
  color: string;
  player?: Tone.Player;
}

export interface Project {
  id: string;
  title: string;
  bpm: number;
  timeSignature: string;
  tracks: Track[];
}

const MusicStudio = () => {
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [userTier, setUserTier] = useState<"free" | "pro" | "premium">("free");
  const [showLyricsSidebar, setShowLyricsSidebar] = useState(false);

  useEffect(() => {
    initializeProject();
    checkUserTier();
  }, []);

  const initializeProject = async () => {
    // Initialize with empty project
    const newProject: Project = {
      id: crypto.randomUUID(),
      title: "Untitled Project",
      bpm: 120,
      timeSignature: "4/4",
      tracks: [],
    };
    setProject(newProject);
  };

  const checkUserTier = async () => {
    // TODO: Implement actual tier checking with Auth0/Stripe
    // For now, default to free tier
    setUserTier("free");
  };

  const getMaxTracks = () => {
    if (userTier === "premium") return Infinity;
    if (userTier === "pro") return 10;
    return 3; // free tier
  };

  const addTrack = () => {
    const maxTracks = getMaxTracks();
    if (tracks.length >= maxTracks) {
      toast({
        title: "Track limit reached",
        description: `Upgrade to ${userTier === "free" ? "Pro" : "Premium"} to add more tracks`,
        variant: "destructive",
      });
      return;
    }

    const newTrack: Track = {
      id: crypto.randomUUID(),
      name: `Track ${tracks.length + 1}`,
      volume: 0.8,
      pan: 0,
      muted: false,
      solo: false,
      effects: {},
      orderIndex: tracks.length,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    };

    setTracks([...tracks, newTrack]);
    toast({
      title: "Track added",
      description: `Track ${tracks.length + 1} created`,
    });
  };

  const handlePlayPause = async () => {
    if (!isPlaying) {
      await Tone.start();
      Tone.Transport.start();
      setIsPlaying(true);
      toast({ title: "Playing" });
    } else {
      Tone.Transport.pause();
      setIsPlaying(false);
      toast({ title: "Paused" });
    }
  };

  const handleSave = async () => {
    if (!project) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save your project",
          variant: "destructive",
        });
        return;
      }

      // Save project to database
      const { error } = await supabase.from("music_projects").upsert({
        id: project.id,
        user_id: user.id,
        title: project.title,
        bpm: project.bpm,
        time_signature: project.timeSignature,
      });

      if (error) throw error;

      // Save tracks
      for (const track of tracks) {
        await supabase.from("music_tracks").upsert({
          id: track.id,
          project_id: project.id,
          name: track.name,
          audio_url: track.audioUrl,
          volume: track.volume,
          pan: track.pan,
          muted: track.muted,
          solo: track.solo,
          effects: track.effects,
          order_index: track.orderIndex,
          color: track.color,
        });
      }

      toast({
        title: "Project saved",
        description: "Your project has been saved successfully",
      });
    } catch (error) {
      console.error("Error saving project:", error);
      toast({
        title: "Error saving project",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Music2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{project?.title || "Music Studio"}</h2>
            <p className="text-sm text-muted-foreground">
              {tracks.length}/{getMaxTracks() === Infinity ? "∞" : getMaxTracks()} tracks • {userTier.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showLyricsSidebar ? "default" : "outline"}
            size="sm"
            onClick={() => setShowLyricsSidebar(!showLyricsSidebar)}
          >
            {showLyricsSidebar ? <PanelRightClose className="w-4 h-4 mr-2" /> : <PanelRightOpen className="w-4 h-4 mr-2" />}
            <Mic2 className="w-4 h-4 mr-1" />
            Lyrics
          </Button>
          <Button variant="outline" size="sm" onClick={handlePlayPause}>
            {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowExport(true)}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={showLyricsSidebar ? 60 : 100} minSize={30}>
            <Tabs defaultValue="editor" className="h-full flex flex-col">
              <TabsList className="mx-6 mt-4 w-fit">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="record">Record</TabsTrigger>
                <TabsTrigger value="effects">Effects</TabsTrigger>
                <TabsTrigger value="collaborate">Collaborate</TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="flex-1 overflow-hidden mt-0">
                <MultitrackEditor
                  tracks={tracks}
                  setTracks={setTracks}
                  selectedTrack={selectedTrack}
                  setSelectedTrack={setSelectedTrack}
                  onAddTrack={addTrack}
                  isPlaying={isPlaying}
                  bpm={project?.bpm || 120}
                />
              </TabsContent>

              <TabsContent value="record" className="flex-1 overflow-hidden">
                <RecordingPanel
                  onRecordingComplete={(audioUrl) => {
                    if (selectedTrack) {
                      setTracks(tracks.map(t =>
                        t.id === selectedTrack ? { ...t, audioUrl } : t
                      ));
                    }
                  }}
                />
              </TabsContent>

              <TabsContent value="effects" className="flex-1 overflow-hidden">
                <EffectsPanel
                  selectedTrack={tracks.find(t => t.id === selectedTrack)}
                  onEffectsChange={(effects) => {
                    if (selectedTrack) {
                      setTracks(tracks.map(t =>
                        t.id === selectedTrack ? { ...t, effects } : t
                      ));
                    }
                  }}
                />
              </TabsContent>

              <TabsContent value="collaborate" className="flex-1 overflow-hidden">
                <CollaborationPanel projectId={project?.id} />
              </TabsContent>
            </Tabs>
          </ResizablePanel>

          {showLyricsSidebar && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={40} minSize={25} maxSize={70}>
                <div className="h-full flex flex-col bg-card overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <Mic2 className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">Lyrics Studio</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowLyricsSidebar(false)}>
                      <PanelRightClose className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto min-h-0">
                    <LyricsStudio />
                  </div>
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      {showExport && project && (
        <ExportDialog
          project={project}
          tracks={tracks}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
};

export default MusicStudio;