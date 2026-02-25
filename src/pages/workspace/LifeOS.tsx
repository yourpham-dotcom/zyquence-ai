import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Send, Loader2, Plus, CalendarDays, Users, MapPin, Clock,
  Trash2, ScanLine, PartyPopper, CheckCircle2, HelpCircle, XCircle,
  AlertCircle, ArrowLeft, ImageIcon
} from "lucide-react";
import { format } from "date-fns";
import LifeScanDrop from "@/components/lifeos/LifeScanDrop";

type LifeEvent = {
  id: string;
  name: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
  host: string | null;
  notes: string | null;
  status: string;
  created_at: string;
};

type Guest = {
  id: string;
  event_id: string;
  guest_name: string;
  status: string;
  added_by: string;
  updated_at: string;
};

type EventUpdate = {
  id: string;
  event_id: string;
  change_description: string;
  created_at: string;
};

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  attending: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: <CheckCircle2 className="h-3 w-3" />, label: "Attending" },
  maybe: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: <HelpCircle className="h-3 w-3" />, label: "Maybe" },
  cancelled: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: <XCircle className="h-3 w-3" />, label: "Cancelled" },
  unknown: { color: "bg-muted text-muted-foreground border-border", icon: <AlertCircle className="h-3 w-3" />, label: "Unknown" },
};

const LifeOS = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [updates, setUpdates] = useState<EventUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<LifeEvent | null>(null);

  // Create event form
  const [createOpen, setCreateOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: "", event_date: "", event_time: "", location: "", host: "", notes: "" });
  const [creating, setCreating] = useState(false);

  // Chat
  const [chatMsg, setChatMsg] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);

  // Text Scanner
  const [scanText, setScanText] = useState("");
  const [scanning, setScanning] = useState(false);

  // ScanDrop
  const [scanDropOpen, setScanDropOpen] = useState(false);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatHistory]);

  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);
    const [evRes, gRes, uRes] = await Promise.all([
      supabase.from("life_events").select("*").eq("user_id", user.id).order("event_date", { ascending: true }),
      supabase.from("event_guests").select("*").eq("user_id", user.id),
      supabase.from("event_updates").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    ]);
    if (evRes.data) setEvents(evRes.data);
    if (gRes.data) setGuests(gRes.data);
    if (uRes.data) setUpdates(uRes.data);
    setLoading(false);
  };

  const createEvent = async () => {
    if (!user || !newEvent.name || !newEvent.event_date) return;
    setCreating(true);
    const { error } = await supabase.from("life_events").insert({
      user_id: user.id,
      name: newEvent.name,
      event_date: newEvent.event_date,
      event_time: newEvent.event_time || null,
      location: newEvent.location || null,
      host: newEvent.host || null,
      notes: newEvent.notes || null,
    });
    if (error) {
      toast({ title: "Error creating event", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Event created" });
      setNewEvent({ name: "", event_date: "", event_time: "", location: "", host: "", notes: "" });
      setCreateOpen(false);
      fetchAll();
    }
    setCreating(false);
  };

  const deleteEvent = async (id: string) => {
    await supabase.from("life_events").delete().eq("id", id);
    if (selectedEvent?.id === id) setSelectedEvent(null);
    fetchAll();
  };

  const updateGuestStatus = async (guestId: string, status: string) => {
    await supabase.from("event_guests").update({ status, updated_at: new Date().toISOString() }).eq("id", guestId);
    fetchAll();
  };

  const deleteGuest = async (guestId: string) => {
    await supabase.from("event_guests").delete().eq("id", guestId);
    fetchAll();
  };

  const sendChat = async () => {
    if (!chatMsg.trim() || !user) return;
    const msg = chatMsg.trim();
    setChatMsg("");
    setChatHistory(prev => [...prev, { role: "user", content: msg }]);
    setChatLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("lifeos-chat", {
        body: {
          message: msg,
          userId: user.id,
          eventId: selectedEvent?.id || null,
          events: events.map(e => ({ id: e.id, name: e.name, event_date: e.event_date, event_time: e.event_time, location: e.location, host: e.host })),
          guests: selectedEvent ? guests.filter(g => g.event_id === selectedEvent.id).map(g => ({ id: g.id, guest_name: g.guest_name, status: g.status })) : [],
        },
      });
      if (error) throw error;
      setChatHistory(prev => [...prev, { role: "assistant", content: data.reply || "Done." }]);
      fetchAll();
    } catch (e: any) {
      setChatHistory(prev => [...prev, { role: "assistant", content: "Error: " + (e.message || "Something went wrong") }]);
    }
    setChatLoading(false);
  };

  const runTextScan = async () => {
    if (!scanText.trim() || !user) return;
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke("lifeos-chat", {
        body: {
          message: scanText.trim(),
          userId: user.id,
          eventId: selectedEvent?.id || null,
          events: events.map(e => ({ id: e.id, name: e.name, event_date: e.event_date })),
          guests: [],
          mode: "scan",
        },
      });
      if (error) throw error;
      toast({ title: "Scan complete", description: data.reply || "Guest list updated." });
      setScanText("");
      fetchAll();
    } catch (e: any) {
      toast({ title: "Scan error", description: e.message, variant: "destructive" });
    }
    setScanning(false);
  };

  const eventGuests = (eventId: string) => guests.filter(g => g.event_id === eventId);
  const guestCount = (eventId: string, status?: string) => {
    const eg = eventGuests(eventId);
    return status ? eg.filter(g => g.status === status).length : eg.length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Detail view for a selected event
  if (selectedEvent) {
    const eg = eventGuests(selectedEvent.id);
    const eventUpdates = updates.filter(u => u.event_id === selectedEvent.id);

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)} className="gap-1.5 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">{selectedEvent.name}</h1>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{format(new Date(selectedEvent.event_date), "MMM d, yyyy")}</span>
              {selectedEvent.event_time && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{selectedEvent.event_time}</span>}
              {selectedEvent.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{selectedEvent.location}</span>}
            </div>
            {selectedEvent.notes && <p className="text-sm text-muted-foreground mt-2">{selectedEvent.notes}</p>}
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={() => setScanDropOpen(true)}>
            <ScanLine className="h-4 w-4" /> ScanDrop
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Guest List */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" /> Guest List ({eg.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[50vh]">
                <div className="space-y-2">
                  {eg.length === 0 && <p className="text-sm text-muted-foreground">No guests yet. Use chat, text scan, or ScanDrop to add.</p>}
                  {eg.map(g => {
                    const sc = STATUS_CONFIG[g.status] || STATUS_CONFIG.unknown;
                    return (
                      <div key={g.id} className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg bg-secondary/30">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs bg-muted">{g.guest_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="flex-1 text-sm font-medium text-foreground min-w-0 truncate">{g.guest_name}</span>
                        <select
                          value={g.status}
                          onChange={e => updateGuestStatus(g.id, e.target.value)}
                          className="text-xs bg-background border border-border rounded px-1.5 py-1 text-foreground shrink-0"
                        >
                          <option value="attending">Attending</option>
                          <option value="maybe">Maybe</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="unknown">Unknown</option>
                        </select>
                        <Badge className={`text-[10px] ${sc.color} gap-1 shrink-0 hidden sm:inline-flex`}>{sc.icon}{sc.label}</Badge>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => deleteGuest(g.id)}>
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat + Scanner */}
          <div className="space-y-4">
            {/* Life Chat */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Life Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48 mb-3 pr-2" ref={chatRef}>
                  <div className="space-y-2">
                    {chatHistory.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">Try: "Add Sarah and Mike" or "John can't make it"</p>
                    )}
                    {chatHistory.map((m, i) => (
                      <div key={i} className={`text-sm p-2 rounded-lg ${m.role === "user" ? "bg-primary/10 text-foreground ml-8" : "bg-secondary/50 text-foreground mr-8"}`}>
                        {m.content}
                      </div>
                    ))}
                    {chatLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Input
                    value={chatMsg}
                    onChange={e => setChatMsg(e.target.value)}
                    placeholder="Update plans using natural language..."
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendChat()}
                    className="text-sm"
                  />
                  <Button size="icon" onClick={sendChat} disabled={chatLoading || !chatMsg.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Text Scanner */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><ScanLine className="h-4 w-4" /> Text Scanner</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={scanText}
                  onChange={e => setScanText(e.target.value)}
                  placeholder="Paste a guest list or attendee names..."
                  rows={3}
                  className="text-sm mb-2"
                />
                <Button onClick={runTextScan} disabled={scanning || !scanText.trim()} size="sm" className="w-full">
                  {scanning ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <ScanLine className="h-4 w-4 mr-1.5" />}
                  Scan Text & Add Guests
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Updates */}
        {eventUpdates.length > 0 && (
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {eventUpdates.slice(0, 10).map(u => (
                  <div key={u.id} className="flex items-start gap-2 text-sm">
                    <span className="text-muted-foreground text-xs shrink-0 mt-0.5">{format(new Date(u.created_at), "h:mm a")}</span>
                    <span className="text-foreground">{u.change_description}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <LifeScanDrop
          open={scanDropOpen}
          onOpenChange={setScanDropOpen}
          events={events.map(e => ({ id: e.id, name: e.name, event_date: e.event_date }))}
          onGuestsAdded={fetchAll}
        />
      </div>
    );
  }

  // Main list view
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <PartyPopper className="h-6 w-6" /> LifeOS
          </h1>
          <p className="text-sm text-muted-foreground">Plan events, track guests, coordinate life.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setScanDropOpen(true)}>
            <ScanLine className="h-4 w-4" /> ScanDrop
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> New Event</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Create Event</DialogTitle></DialogHeader>
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
                  <Label className="text-xs">Host</Label>
                  <Input value={newEvent.host} onChange={e => setNewEvent(p => ({ ...p, host: e.target.value }))} placeholder="Who's hosting?" />
                </div>
                <div>
                  <Label className="text-xs">Notes</Label>
                  <Textarea value={newEvent.notes} onChange={e => setNewEvent(p => ({ ...p, notes: e.target.value }))} placeholder="Any details..." rows={2} />
                </div>
                <Button onClick={createEvent} disabled={creating || !newEvent.name || !newEvent.event_date} className="w-full">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                  Create Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="events">
        <TabsList className="flex-wrap">
          <TabsTrigger value="events">Upcoming Events</TabsTrigger>
          <TabsTrigger value="updates">Recent Updates</TabsTrigger>
          <TabsTrigger value="chat">Life Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="mt-4">
          {events.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-8 text-center">
                <PartyPopper className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-3">No events yet. Create one to get started.</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setScanDropOpen(true)}>
                    <ImageIcon className="h-4 w-4" /> Scan Image
                  </Button>
                  <Button size="sm" onClick={() => setCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" /> Create Event
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {events.map(ev => {
                const total = guestCount(ev.id);
                const attending = guestCount(ev.id, "attending");
                const cancelled = guestCount(ev.id, "cancelled");
                const maybe = guestCount(ev.id, "maybe");
                return (
                  <Card
                    key={ev.id}
                    className="border-border/50 hover:border-primary/30 transition-all cursor-pointer group"
                    onClick={() => setSelectedEvent(ev)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-sm truncate">{ev.name}</h3>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{format(new Date(ev.event_date), "MMM d")}</span>
                            {ev.event_time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ev.event_time}</span>}
                            {ev.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ev.location}</span>}
                          </div>
                        </div>
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0"
                          onClick={e => { e.stopPropagation(); deleteEvent(ev.id); }}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mt-3 text-xs flex-wrap">
                        <span className="flex items-center gap-1 text-muted-foreground"><Users className="h-3 w-3" />{total}</span>
                        {attending > 0 && <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] gap-1"><CheckCircle2 className="h-2.5 w-2.5" />{attending}</Badge>}
                        {maybe > 0 && <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] gap-1"><HelpCircle className="h-2.5 w-2.5" />{maybe}</Badge>}
                        {cancelled > 0 && <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px] gap-1"><XCircle className="h-2.5 w-2.5" />{cancelled}</Badge>}
                      </div>
                      {total > 0 && (
                        <div className="flex -space-x-1.5 mt-2">
                          {eventGuests(ev.id).slice(0, 6).map(g => (
                            <Avatar key={g.id} className="h-6 w-6 border-2 border-background">
                              <AvatarFallback className="text-[8px] bg-muted">{g.guest_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                          ))}
                          {total > 6 && <span className="text-[10px] text-muted-foreground ml-2 self-center">+{total - 6}</span>}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="updates" className="mt-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              {updates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No updates yet.</p>
              ) : (
                <div className="space-y-2">
                  {updates.map(u => {
                    const ev = events.find(e => e.id === u.event_id);
                    return (
                      <div key={u.id} className="flex items-start gap-3 text-sm p-2 rounded-lg bg-secondary/30">
                        <span className="text-xs text-muted-foreground shrink-0 mt-0.5">{format(new Date(u.created_at), "MMM d, h:mm a")}</span>
                        <div>
                          {ev && <span className="font-medium text-foreground">{ev.name}: </span>}
                          <span className="text-muted-foreground">{u.change_description}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="mt-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Life Chat</CardTitle>
              <p className="text-xs text-muted-foreground">Manage all your events with natural language.</p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 mb-3 pr-2" ref={chatRef}>
                <div className="space-y-2">
                  {chatHistory.length === 0 && (
                    <div className="space-y-1 text-xs text-muted-foreground italic">
                      <p>Try commands like:</p>
                      <p>"Add Alex to dinner tonight"</p>
                      <p>"John isn't coming anymore"</p>
                      <p>"Move dinner to 7pm"</p>
                      <p>"Cancel the party"</p>
                    </div>
                  )}
                  {chatHistory.map((m, i) => (
                    <div key={i} className={`text-sm p-2.5 rounded-lg ${m.role === "user" ? "bg-primary/10 text-foreground ml-8" : "bg-secondary/50 text-foreground mr-8"}`}>
                      {m.content}
                    </div>
                  ))}
                  {chatLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Input
                  value={chatMsg}
                  onChange={e => setChatMsg(e.target.value)}
                  placeholder="Update plans using natural language..."
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendChat()}
                />
                <Button size="icon" onClick={sendChat} disabled={chatLoading || !chatMsg.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <LifeScanDrop
        open={scanDropOpen}
        onOpenChange={setScanDropOpen}
        events={events.map(e => ({ id: e.id, name: e.name, event_date: e.event_date }))}
        onGuestsAdded={fetchAll}
      />
    </div>
  );
};

export default LifeOS;
