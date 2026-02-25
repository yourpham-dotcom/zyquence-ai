import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Send, Loader2, Plus, CalendarDays, MapPin, Clock, Users,
  ArrowLeft, Trash2, CheckCircle2, HelpCircle, XCircle, AlertCircle,
  Search, UserPlus, MessageCircle,
} from "lucide-react";
import { format } from "date-fns";

interface SyncEvent {
  id: string;
  name: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
  host_id: string;
  notes: string | null;
  status: string;
  created_at: string;
}

interface Participant {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  role: string;
  display_name?: string;
}

interface ChatMessage {
  id: string;
  event_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  created_at: string;
  sender_name?: string;
}

interface CommunityProfile {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
}

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  attending: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: <CheckCircle2 className="h-3 w-3" />, label: "Attending" },
  maybe: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: <HelpCircle className="h-3 w-3" />, label: "Maybe" },
  cancelled: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: <XCircle className="h-3 w-3" />, label: "Cancelled" },
  pending: { color: "bg-muted text-muted-foreground border-border", icon: <AlertCircle className="h-3 w-3" />, label: "Pending" },
};

const LifeSync = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<SyncEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<SyncEvent | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [profiles, setProfiles] = useState<Record<string, CommunityProfile>>({});

  // Create event
  const [createOpen, setCreateOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: "", event_date: "", event_time: "", location: "", notes: "" });
  const [creating, setCreating] = useState(false);

  // Chat
  const [chatMsg, setChatMsg] = useState("");
  const [sending, setSending] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Add participant
  const [addOpen, setAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CommunityProfile[]>([]);
  const [searching, setSearching] = useState(false);

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Fetch events where user is host
    const { data: hosted } = await supabase
      .from("lifesync_events")
      .select("*")
      .eq("host_id", user.id)
      .order("event_date", { ascending: true });

    // Fetch events where user is participant
    const { data: participantRows } = await supabase
      .from("lifesync_participants")
      .select("event_id")
      .eq("user_id", user.id);

    let participantEvents: SyncEvent[] = [];
    if (participantRows && participantRows.length > 0) {
      const eventIds = participantRows.map(p => p.event_id);
      const { data: pEvents } = await supabase
        .from("lifesync_events")
        .select("*")
        .in("id", eventIds)
        .order("event_date", { ascending: true });
      participantEvents = (pEvents || []) as SyncEvent[];
    }

    // Merge and dedupe
    const allEvents = [...(hosted || []), ...participantEvents];
    const unique = Array.from(new Map(allEvents.map(e => [e.id, e])).values());
    setEvents(unique as SyncEvent[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) fetchEvents();
  }, [user, fetchEvents]);

  const loadEventDetails = useCallback(async (eventId: string) => {
    // Load participants
    const { data: parts } = await supabase
      .from("lifesync_participants")
      .select("*")
      .eq("event_id", eventId);
    
    const participantList = (parts || []) as Participant[];

    // Load messages
    const { data: msgs } = await supabase
      .from("lifesync_messages")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    // Get all user IDs we need profiles for
    const userIds = new Set<string>();
    participantList.forEach(p => userIds.add(p.user_id));
    (msgs || []).forEach((m: any) => userIds.add(m.sender_id));

    if (userIds.size > 0) {
      const { data: profs } = await supabase
        .from("community_profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", Array.from(userIds));

      const profileMap: Record<string, CommunityProfile> = {};
      (profs || []).forEach((p: any) => { profileMap[p.user_id] = p; });
      setProfiles(prev => ({ ...prev, ...profileMap }));
    }

    setParticipants(participantList);
    setMessages((msgs || []) as ChatMessage[]);
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    if (!selectedEvent) return;

    const msgChannel = supabase
      .channel(`lifesync-msgs-${selectedEvent.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "lifesync_messages",
        filter: `event_id=eq.${selectedEvent.id}`,
      }, (payload) => {
        const newMsg = payload.new as ChatMessage;
        setMessages(prev => [...prev, newMsg]);
        // Load profile if unknown
        if (!profiles[newMsg.sender_id]) {
          supabase.from("community_profiles")
            .select("user_id, display_name, avatar_url")
            .eq("user_id", newMsg.sender_id)
            .single()
            .then(({ data }) => {
              if (data) setProfiles(prev => ({ ...prev, [data.user_id]: data as CommunityProfile }));
            });
        }
      })
      .subscribe();

    const partChannel = supabase
      .channel(`lifesync-parts-${selectedEvent.id}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "lifesync_participants",
        filter: `event_id=eq.${selectedEvent.id}`,
      }, () => {
        loadEventDetails(selectedEvent.id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(partChannel);
    };
  }, [selectedEvent, profiles, loadEventDetails]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (selectedEvent) loadEventDetails(selectedEvent.id);
  }, [selectedEvent, loadEventDetails]);

  const createSyncEvent = async () => {
    if (!user || !newEvent.name || !newEvent.event_date) return;
    setCreating(true);

    const { data: ev, error } = await supabase.from("lifesync_events").insert({
      host_id: user.id,
      name: newEvent.name,
      event_date: newEvent.event_date,
      event_time: newEvent.event_time || null,
      location: newEvent.location || null,
      notes: newEvent.notes || null,
    }).select("id").single();

    if (error) {
      toast({ title: "Error creating event", description: error.message, variant: "destructive" });
    } else if (ev) {
      // Add host as participant
      await supabase.from("lifesync_participants").insert({
        event_id: ev.id,
        user_id: user.id,
        status: "attending",
        role: "host",
      });
      toast({ title: "Event created" });
      setNewEvent({ name: "", event_date: "", event_time: "", location: "", notes: "" });
      setCreateOpen(false);
      fetchEvents();
    }
    setCreating(false);
  };

  const searchUsers = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    setSearching(true);

    const { data } = await supabase
      .from("community_profiles")
      .select("user_id, display_name, avatar_url")
      .ilike("display_name", `%${query}%`)
      .limit(10);

    const existingIds = new Set(participants.map(p => p.user_id));
    setSearchResults(((data || []) as CommunityProfile[]).filter(p => !existingIds.has(p.user_id) && p.user_id !== user?.id));
    setSearching(false);
  };

  const addParticipant = async (profile: CommunityProfile) => {
    if (!selectedEvent || !user) return;
    const { error } = await supabase.from("lifesync_participants").insert({
      event_id: selectedEvent.id,
      user_id: profile.user_id,
      status: "pending",
      role: "participant",
    });
    if (error) {
      toast({ title: "Error adding participant", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Added ${profile.display_name}` });
      setSearchQuery("");
      setSearchResults([]);
      loadEventDetails(selectedEvent.id);
    }
  };

  const updateParticipantStatus = async (participantId: string, status: string) => {
    await supabase.from("lifesync_participants")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", participantId);
    loadEventDetails(selectedEvent!.id);
  };

  const removeParticipant = async (participantId: string) => {
    await supabase.from("lifesync_participants").delete().eq("id", participantId);
    loadEventDetails(selectedEvent!.id);
  };

  const sendMessage = async () => {
    if (!chatMsg.trim() || !selectedEvent || !user) return;
    const msg = chatMsg.trim();
    setChatMsg("");
    setSending(true);

    const { error } = await supabase.from("lifesync_messages").insert({
      event_id: selectedEvent.id,
      sender_id: user.id,
      content: msg,
    });

    if (error) {
      toast({ title: "Failed to send", description: error.message, variant: "destructive" });
      setChatMsg(msg);
    } else {
      // Run AI attendance detection in background
      supabase.functions.invoke("lifesync-ai", {
        body: {
          message: msg,
          eventId: selectedEvent.id,
          userId: user.id,
          participants: participants.map(p => ({
            user_id: p.user_id,
            display_name: profiles[p.user_id]?.display_name || "Unknown",
            status: p.status,
          })),
        },
      }).then(({ data }) => {
        if (data?.detected && data.changes?.length > 0) {
          toast({ title: "Attendance updated by AI", description: data.changes.map((c: any) => c.reason || `Status → ${c.status}`).join(", ") });
          loadEventDetails(selectedEvent.id);
        }
      }).catch(() => {});
    }
    setSending(false);
  };

  const deleteEvent = async (id: string) => {
    await supabase.from("lifesync_events").delete().eq("id", id);
    if (selectedEvent?.id === id) setSelectedEvent(null);
    fetchEvents();
  };

  const getProfileName = (userId: string) => profiles[userId]?.display_name || "Unknown";
  const getInitials = (userId: string) => {
    const name = getProfileName(userId);
    return name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Event detail view with group chat
  if (selectedEvent) {
    const isHost = selectedEvent.host_id === user?.id;
    const attendingCount = participants.filter(p => p.status === "attending").length;

    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)} className="gap-1.5 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to LifeSync
        </Button>

        {/* Event header */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <h2 className="text-xl font-bold text-foreground">{selectedEvent.name}</h2>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{format(new Date(selectedEvent.event_date), "MMM d, yyyy")}</span>
              {selectedEvent.event_time && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{selectedEvent.event_time}</span>}
              {selectedEvent.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{selectedEvent.location}</span>}
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{attendingCount}/{participants.length} attending</span>
            </div>
            {selectedEvent.notes && <p className="text-sm text-muted-foreground mt-1">{selectedEvent.notes}</p>}
          </div>
          {isHost && (
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={() => setAddOpen(true)}>
              <UserPlus className="h-4 w-4" /> Add People
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-5 gap-4">
          {/* Group Chat - main area */}
          <Card className="border-border/50 lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageCircle className="h-4 w-4" /> Group Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[45vh] px-4" ref={chatRef}>
                <div className="space-y-3 py-3">
                  {messages.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8 italic">
                      No messages yet. Start the conversation!
                    </p>
                  )}
                  {messages.map((msg) => {
                    const isMe = msg.sender_id === user?.id;
                    const senderName = getProfileName(msg.sender_id);
                    return (
                      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                          {!isMe && (
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[8px] bg-muted">{getInitials(msg.sender_id)}</AvatarFallback>
                              </Avatar>
                              <span className="text-[11px] font-medium text-muted-foreground">{senderName}</span>
                            </div>
                          )}
                          <div className={`px-3 py-2 rounded-2xl text-sm ${
                            isMe
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-secondary/60 text-foreground rounded-bl-md"
                          }`}>
                            {msg.content}
                          </div>
                          <span className="text-[10px] text-muted-foreground mt-0.5 block px-1">
                            {format(new Date(msg.created_at), "h:mm a")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              <div className="flex gap-2 p-3 border-t border-border/50">
                <Input
                  value={chatMsg}
                  onChange={e => setChatMsg(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  className="text-sm"
                />
                <Button size="icon" onClick={sendMessage} disabled={sending || !chatMsg.trim()}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Participants sidebar */}
          <Card className="border-border/50 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" /> Participants ({participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[40vh]">
                <div className="space-y-2">
                  {participants.map(p => {
                    const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
                    const name = getProfileName(p.user_id);
                    const isMe = p.user_id === user?.id;
                    return (
                      <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className="text-[10px] bg-muted">{getInitials(p.user_id)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground truncate block">
                            {name} {isMe && "(you)"} {p.role === "host" && "👑"}
                          </span>
                        </div>
                        {isMe ? (
                          <select
                            value={p.status}
                            onChange={e => updateParticipantStatus(p.id, e.target.value)}
                            className="text-xs bg-background border border-border rounded px-1.5 py-1 text-foreground shrink-0"
                          >
                            <option value="attending">Attending</option>
                            <option value="maybe">Maybe</option>
                            <option value="cancelled">Can't go</option>
                            <option value="pending">Pending</option>
                          </select>
                        ) : (
                          <Badge className={`text-[10px] ${sc.color} gap-1 shrink-0`}>{sc.icon}{sc.label}</Badge>
                        )}
                        {isHost && !isMe && (
                          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => removeParticipant(p.id)}>
                            <Trash2 className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Add Participant Dialog */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Add Participants</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={e => searchUsers(e.target.value)}
                  placeholder="Search Zyquence users..."
                  className="pl-9 text-sm"
                />
              </div>
              {searching && <Loader2 className="h-4 w-4 animate-spin mx-auto text-muted-foreground" />}
              <ScrollArea className="max-h-60">
                <div className="space-y-1.5">
                  {searchResults.map(p => (
                    <div key={p.user_id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[10px] bg-muted">{p.display_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="flex-1 text-sm text-foreground">{p.display_name}</span>
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => addParticipant(p)}>
                        <UserPlus className="h-3 w-3" /> Add
                      </Button>
                    </div>
                  ))}
                  {searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
                    <p className="text-sm text-muted-foreground text-center py-4">No users found</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Event list view
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5" /> LifeSync
          </h2>
          <p className="text-xs text-muted-foreground">Collaborative event planning with group chat</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New Event
        </Button>
      </div>

      {events.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-8 text-center">
            <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-3">No LifeSync events yet. Create one and invite friends!</p>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Create Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {events.map(ev => (
            <Card
              key={ev.id}
              className="border-border/50 hover:border-primary/30 transition-all cursor-pointer group"
              onClick={() => setSelectedEvent(ev)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground text-sm truncate">{ev.name}</h3>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{format(new Date(ev.event_date), "MMM d")}</span>
                      {ev.event_time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ev.event_time}</span>}
                      {ev.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ev.location}</span>}
                    </div>
                  </div>
                  {ev.host_id === user?.id && (
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0"
                      onClick={e => { e.stopPropagation(); deleteEvent(ev.id); }}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-[10px]">
                    <MessageCircle className="h-2.5 w-2.5 mr-1" /> Group Chat
                  </Badge>
                  {ev.host_id === user?.id && (
                    <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30">Host</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Event Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Create LifeSync Event</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Event Name *</Label>
              <Input value={newEvent.name} onChange={e => setNewEvent(p => ({ ...p, name: e.target.value }))} placeholder="Dinner, Party, Hangout..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Date *</Label>
                <Input type="date" value={newEvent.event_date} onChange={e => setNewEvent(p => ({ ...p, event_date: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Time</Label>
                <Input type="time" value={newEvent.event_time} onChange={e => setNewEvent(p => ({ ...p, event_time: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Location</Label>
              <Input value={newEvent.location} onChange={e => setNewEvent(p => ({ ...p, location: e.target.value }))} placeholder="Where?" />
            </div>
            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea value={newEvent.notes} onChange={e => setNewEvent(p => ({ ...p, notes: e.target.value }))} placeholder="Any details..." rows={2} />
            </div>
            <Button onClick={createSyncEvent} disabled={creating || !newEvent.name || !newEvent.event_date} className="w-full">
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              Create Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LifeSync;
