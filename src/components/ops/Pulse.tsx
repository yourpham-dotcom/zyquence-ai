import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft, Mic, MicOff, Phone, PhoneOff, Plus, Users, Hash,
  Loader2, ListTodo, CheckCircle2, Clock, Volume2, User, Radio,
  Headphones, MessageSquare, FileText, Zap, ChevronRight
} from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

type VoiceRoom = {
  id: string;
  name: string;
  project_id: string | null;
  created_by: string;
  room_type: string;
  is_active: boolean;
  created_at: string;
};

type VoiceSession = {
  id: string;
  room_id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  transcript: string | null;
  summary: string | null;
  key_decisions: string[];
  action_items: any[];
  status: string;
};

type DetectedTask = {
  title: string;
  description?: string;
  assigned_to?: string;
  priority: string;
  deadline_hint?: string;
};

type OpsProject = {
  id: string;
  title: string;
};

export default function Pulse({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<VoiceRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<VoiceRoom | null>(null);
  const [activeSession, setActiveSession] = useState<VoiceSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewRoom, setShowNewRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomType, setNewRoomType] = useState<string>("group");
  const [newRoomProject, setNewRoomProject] = useState<string>("");
  const [projects, setProjects] = useState<OpsProject[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [detectedTasks, setDetectedTasks] = useState<DetectedTask[]>([]);
  const [creatingTask, setCreatingTask] = useState<number | null>(null);
  const [sessionSummary, setSessionSummary] = useState<any>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<string>("");

  useEffect(() => {
    if (user) {
      fetchRooms();
      fetchProjects();
    }
  }, [user]);

  // Call duration timer
  useEffect(() => {
    if (isInCall) {
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isInCall]);

  const fetchRooms = async () => {
    setLoading(true);
    const { data } = await supabase.from("voice_rooms").select("*").order("created_at", { ascending: false });
    if (data) setRooms(data as unknown as VoiceRoom[]);
    setLoading(false);
  };

  const fetchProjects = async () => {
    const { data } = await supabase.from("ops_projects").select("id, title").order("created_at", { ascending: false });
    if (data) setProjects(data as unknown as OpsProject[]);
  };

  const createRoom = async () => {
    if (!newRoomName.trim() || !user) return;
    const { data, error } = await supabase.from("voice_rooms").insert({
      name: newRoomName,
      created_by: user.id,
      room_type: newRoomType,
      project_id: newRoomProject && newRoomProject !== "none" ? newRoomProject : null,
    }).select().single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    const room = data as unknown as VoiceRoom;
    setRooms(prev => [room, ...prev]);
    setSelectedRoom(room);
    setNewRoomName("");
    setNewRoomProject("");
    setShowNewRoom(false);
    toast({ title: "Room created" });
  };

  const joinCall = async () => {
    if (!selectedRoom || !user) return;
    // Create voice session
    const { data, error } = await supabase.from("voice_sessions").insert({
      room_id: selectedRoom.id,
      user_id: user.id,
      status: "active",
    }).select().single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }

    const session = data as unknown as VoiceSession;
    setActiveSession(session);
    setIsInCall(true);
    setTranscript("");
    setDetectedTasks([]);
    setSessionSummary(null);
    transcriptRef.current = "";

    // Add participant
    await supabase.from("voice_participants").insert({
      session_id: session.id,
      user_id: user.id,
    });

    toast({ title: "Joined call", description: "Voice session started. Provider integration pending." });

    // Simulate transcript for demo (in production, this comes from WebRTC + STT)
    simulateTranscript();
  };

  const simulateTranscript = () => {
    const lines = [
      "[You] Let's discuss the inventory updates for this week.",
      "[You] We need to add the new product line by Friday.",
      "[You] John should handle the supplier contact for pricing.",
      "[You] Also, create a promotion campaign for the launch.",
      "[You] Let's schedule a follow-up on Wednesday.",
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i >= lines.length) { clearInterval(interval); return; }
      const line = lines[i];
      transcriptRef.current += (transcriptRef.current ? "\n" : "") + line;
      setTranscript(transcriptRef.current);
      i++;

      // Detect tasks after a few lines
      if (i === 3 || i === 5) {
        detectTasks(transcriptRef.current);
      }
    }, 3000);
  };

  const leaveCall = async () => {
    if (!activeSession || !user) return;
    setIsInCall(false);

    // Update session
    await supabase.from("voice_sessions").update({
      end_time: new Date().toISOString(),
      status: "ended",
      transcript: transcriptRef.current,
    }).eq("id", activeSession.id);

    // Update participant
    await supabase.from("voice_participants").update({
      left_at: new Date().toISOString(),
    }).eq("session_id", activeSession.id).eq("user_id", user.id);

    // Generate summary
    if (transcriptRef.current.trim()) {
      await generateSummary(transcriptRef.current);
    }
  };

  const detectTasks = async (text: string) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/pulse-summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_KEY}` },
        body: JSON.stringify({ transcript: text, type: "detect_tasks" }),
      });
      if (!res.ok) return;
      const result = await res.json();
      if (result.tasks?.length) {
        setDetectedTasks(prev => {
          const existing = new Set(prev.map(t => t.title));
          const newTasks = result.tasks.filter((t: DetectedTask) => !existing.has(t.title));
          return [...prev, ...newTasks];
        });
      }
    } catch { /* silent */ }
  };

  const generateSummary = async (text: string) => {
    setSummarizing(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/pulse-summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_KEY}` },
        body: JSON.stringify({ transcript: text, type: "summarize" }),
      });
      if (!res.ok) throw new Error("Summary failed");
      const result = await res.json();
      setSessionSummary(result);

      // Save summary to session
      if (activeSession) {
        await supabase.from("voice_sessions").update({
          summary: result.summary,
          key_decisions: result.key_decisions || [],
          action_items: result.action_items || [],
        }).eq("id", activeSession.id);
      }
    } catch (e: any) {
      toast({ title: "Summary failed", description: e.message, variant: "destructive" });
    } finally {
      setSummarizing(false);
    }
  };

  const acceptTask = async (index: number) => {
    const task = detectedTasks[index];
    if (!task || !user || !selectedRoom) return;
    setCreatingTask(index);
    try {
      const projectId = selectedRoom.project_id;
      if (projectId) {
        const { data: taskData } = await supabase.from("ops_tasks").insert({
          project_id: projectId,
          user_id: user.id,
          title: task.title,
          description: task.description || null,
          assigned_to: task.assigned_to || null,
          priority: task.priority || "medium",
          status: "not_started",
          sort_order: 0,
        }).select().single();

        if (taskData && activeSession) {
          await supabase.from("linked_tasks").insert({
            task_id: (taskData as any).id,
            session_id: activeSession.id,
          });
        }
        toast({ title: "Task created!", description: `"${task.title}" added to project.` });
      } else {
        toast({ title: "No project linked", description: "Link this room to a project first.", variant: "destructive" });
      }
      setDetectedTasks(prev => prev.filter((_, i) => i !== index));
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setCreatingTask(null);
    }
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const groupRooms = rooms.filter(r => r.room_type === "group");
  const projectRooms = rooms.filter(r => r.project_id);
  const directRooms = rooms.filter(r => r.room_type === "direct");

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary" /> Pulse
          </h1>
          <p className="text-xs text-muted-foreground">Voice collaboration that turns conversations into action</p>
        </div>
      </div>

      <div className="flex gap-0 border rounded-lg overflow-hidden h-[calc(100%-3.5rem)] bg-card">
        {/* Left Sidebar - Rooms */}
        <div className={`${sidebarOpen ? "w-56" : "w-0"} border-r flex-shrink-0 flex flex-col transition-all overflow-hidden`}>
          <div className="p-3 border-b">
            <Button size="sm" className="w-full gap-1.5" onClick={() => setShowNewRoom(true)}>
              <Plus className="h-3.5 w-3.5" /> Create Room
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-3">
              {/* Voice Rooms */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">Voice Rooms</p>
                {groupRooms.length === 0 && <p className="text-xs text-muted-foreground/50 px-2">No rooms yet</p>}
                {groupRooms.map(r => (
                  <button key={r.id} onClick={() => { setSelectedRoom(r); setSessionSummary(null); }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left ${selectedRoom?.id === r.id ? "bg-accent text-accent-foreground" : "hover:bg-muted/50 text-muted-foreground"}`}>
                    <Volume2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{r.name}</span>
                  </button>
                ))}
              </div>

              {/* Project Rooms */}
              {projectRooms.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">Project Rooms</p>
                  {projectRooms.map(r => (
                    <button key={r.id} onClick={() => { setSelectedRoom(r); setSessionSummary(null); }}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left ${selectedRoom?.id === r.id ? "bg-accent text-accent-foreground" : "hover:bg-muted/50 text-muted-foreground"}`}>
                      <ListTodo className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{r.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Direct Calls */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">Direct Calls</p>
                {directRooms.length === 0 && <p className="text-xs text-muted-foreground/50 px-2">No direct calls</p>}
                {directRooms.map(r => (
                  <button key={r.id} onClick={() => { setSelectedRoom(r); setSessionSummary(null); }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left ${selectedRoom?.id === r.id ? "bg-accent text-accent-foreground" : "hover:bg-muted/50 text-muted-foreground"}`}>
                    <User className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{r.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Main Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedRoom ? (
            <>
              {/* Top Bar */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b">
                <div className="flex items-center gap-2 min-w-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7 md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <Headphones className="h-4 w-4" />
                  </Button>
                  <Volume2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <h2 className="font-medium text-sm truncate">{selectedRoom.name}</h2>
                  <Badge variant="outline" className="text-[10px] shrink-0">{selectedRoom.room_type}</Badge>
                  {selectedRoom.project_id && (
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      Linked to Project
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isInCall && (
                    <Badge variant="destructive" className="text-xs font-mono">
                      <Radio className="h-3 w-3 mr-1 animate-pulse" />
                      {formatDuration(callDuration)}
                    </Badge>
                  )}
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                    <Users className="h-3 w-3" /> 1
                  </Button>
                </div>
              </div>

              {/* Call area */}
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                {sessionSummary ? (
                  /* End of Call Summary */
                  <div className="w-full max-w-lg space-y-4">
                    <div className="text-center mb-4">
                      <FileText className="h-10 w-10 mx-auto text-primary mb-2" />
                      <h3 className="text-lg font-semibold">Call Summary</h3>
                      <p className="text-xs text-muted-foreground">Session ended • {formatDuration(callDuration)} duration</p>
                    </div>

                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Summary</p>
                          <p className="text-sm">{sessionSummary.summary}</p>
                        </div>

                        {sessionSummary.key_decisions?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Key Decisions</p>
                            <ul className="space-y-1">
                              {sessionSummary.key_decisions.map((d: string, i: number) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                                  {d}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {sessionSummary.action_items?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Action Items</p>
                            <ul className="space-y-1">
                              {sessionSummary.action_items.map((a: any, i: number) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                  <ListTodo className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                  <span>{a.title}{a.assigned_to ? ` → ${a.assigned_to}` : ""}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Button className="w-full" onClick={() => { setSessionSummary(null); setActiveSession(null); }}>
                      Done
                    </Button>
                  </div>
                ) : summarizing ? (
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Generating call summary...</p>
                  </div>
                ) : (
                  /* Call Controls */
                  <div className="text-center space-y-6">
                    {/* Participant avatars */}
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium">{selectedRoom.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isInCall ? "In call" : "Ready to join"}
                      </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-4">
                      {isInCall && (
                        <Button
                          variant={isMuted ? "destructive" : "outline"}
                          size="icon"
                          className="h-12 w-12 rounded-full"
                          onClick={() => setIsMuted(!isMuted)}
                        >
                          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        </Button>
                      )}

                      {isInCall ? (
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-14 w-14 rounded-full"
                          onClick={leaveCall}
                        >
                          <PhoneOff className="h-6 w-6" />
                        </Button>
                      ) : (
                        <Button
                          className="h-14 w-14 rounded-full"
                          size="icon"
                          onClick={joinCall}
                        >
                          <Phone className="h-6 w-6" />
                        </Button>
                      )}
                    </div>

                    {!isInCall && (
                      <p className="text-[10px] text-muted-foreground max-w-xs mx-auto">
                        Voice provider integration pending. Demo mode shows simulated transcription and AI task detection.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Radio className="h-12 w-12 mx-auto text-muted-foreground/20 mb-3" />
                <h3 className="text-sm font-medium text-muted-foreground">Select a room or create a new one</h3>
                <p className="text-xs text-muted-foreground/60 mt-1">Conversations that become structured work</p>
                <Button size="sm" className="mt-4 gap-1.5" onClick={() => setShowNewRoom(true)}>
                  <Plus className="h-3.5 w-3.5" /> Create Room
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - AI Panel (visible when in call) */}
        {isInCall && (
          <div className="w-72 border-l flex flex-col overflow-hidden">
            <div className="p-3 border-b">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">AI Panel</span>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-3 space-y-4">
                {/* Live Transcript */}
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Live Transcript</p>
                  {transcript ? (
                    <div className="space-y-1.5">
                      {transcript.split("\n").map((line, i) => (
                        <p key={i} className="text-xs text-foreground/80">{line}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground/50">Waiting for speech...</p>
                  )}
                </div>

                <Separator />

                {/* Detected Tasks */}
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Detected Tasks ({detectedTasks.length})
                  </p>
                  {detectedTasks.length === 0 ? (
                    <p className="text-xs text-muted-foreground/50">Listening for tasks...</p>
                  ) : (
                    <div className="space-y-2">
                      {detectedTasks.map((task, i) => (
                        <Card key={i} className="border-primary/20 bg-primary/5">
                          <CardContent className="p-2.5 space-y-1.5">
                            <p className="text-xs font-medium">{task.title}</p>
                            {task.assigned_to && (
                              <p className="text-[10px] text-muted-foreground">→ {task.assigned_to}</p>
                            )}
                            {task.deadline_hint && (
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" /> {task.deadline_hint}
                              </p>
                            )}
                            <div className="flex gap-1.5 pt-1">
                              <Button size="sm" className="h-6 text-[10px] px-2" onClick={() => acceptTask(i)} disabled={creatingTask === i}>
                                {creatingTask === i ? <Loader2 className="h-3 w-3 animate-spin" /> : <>
                                  <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Accept
                                </>}
                              </Button>
                              <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => setDetectedTasks(prev => prev.filter((_, idx) => idx !== i))}>
                                Dismiss
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* New Room Dialog */}
      <Dialog open={showNewRoom} onOpenChange={setShowNewRoom}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Voice Room</DialogTitle>
            <DialogDescription>Start a new voice collaboration space.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Room name"
              value={newRoomName}
              onChange={e => setNewRoomName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && createRoom()}
            />
            <Select value={newRoomType} onValueChange={setNewRoomType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="group">Voice Room</SelectItem>
                <SelectItem value="direct">Direct Call</SelectItem>
              </SelectContent>
            </Select>
            {projects.length > 0 && (
              <Select value={newRoomProject} onValueChange={setNewRoomProject}>
                <SelectTrigger><SelectValue placeholder="Link to project (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No project</SelectItem>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewRoom(false)}>Cancel</Button>
              <Button onClick={createRoom} disabled={!newRoomName.trim()}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
