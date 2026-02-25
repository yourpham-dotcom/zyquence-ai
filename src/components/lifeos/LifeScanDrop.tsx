import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ScanLine, Loader2, X, Check, AlertTriangle,
  ImageIcon, PartyPopper, CheckCircle2, HelpCircle, XCircle, AlertCircle
} from "lucide-react";

type DetectedGuest = {
  name: string;
  status: string;
  confidence: number;
};

type EventContext = {
  name: string | null;
  date: string | null;
  time: string | null;
  location: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  events: { id: string; name: string; event_date: string }[];
  onGuestsAdded: () => void;
};

type Step = "upload" | "scanning" | "confirm" | "done";

const STATUS_ICONS: Record<string, React.ReactNode> = {
  attending: <CheckCircle2 className="h-3 w-3 text-emerald-400" />,
  maybe: <HelpCircle className="h-3 w-3 text-amber-400" />,
  cancelled: <XCircle className="h-3 w-3 text-red-400" />,
  unknown: <AlertCircle className="h-3 w-3 text-muted-foreground" />,
};

const STATUS_COLORS: Record<string, string> = {
  attending: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  maybe: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  unknown: "bg-muted text-muted-foreground border-border",
};

export default function LifeScanDrop({ open, onOpenChange, events, onGuestsAdded }: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("upload");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [guests, setGuests] = useState<DetectedGuest[]>([]);
  const [eventContext, setEventContext] = useState<EventContext | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [createNewEvent, setCreateNewEvent] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [lowConfidence, setLowConfidence] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep("upload");
    setImagePreview(null);
    setGuests([]);
    setEventContext(null);
    setSelectedEventId("");
    setCreateNewEvent(false);
    setNewEventName("");
    setLowConfidence(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload a JPG, PNG, or WebP image.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const scanImage = async () => {
    if (!imagePreview) return;
    setStep("scanning");
    try {
      const { data, error } = await supabase.functions.invoke("lifeos-scan", {
        body: { imageBase64: imagePreview },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const detected: DetectedGuest[] = (data.guests || []).map((g: any) => ({
        name: g.name || "",
        status: g.status || "unknown",
        confidence: g.confidence || 0,
      }));

      if (detected.length === 0) {
        setLowConfidence(true);
        setGuests([{ name: "", status: "unknown", confidence: 0 }]);
      } else {
        setLowConfidence(detected.some(g => g.confidence < 0.5));
        setGuests(detected);
      }

      if (data.event_context) {
        setEventContext(data.event_context);
        if (data.event_context.name) {
          setNewEventName(data.event_context.name);
          // Try to match existing event
          const match = events.find(e =>
            e.name.toLowerCase().includes(data.event_context.name.toLowerCase()) ||
            data.event_context.name.toLowerCase().includes(e.name.toLowerCase())
          );
          if (match) {
            setSelectedEventId(match.id);
          } else {
            setCreateNewEvent(true);
          }
        }
      }

      setStep("confirm");
      // Clear image from memory for privacy
      setImagePreview(null);
    } catch (e: any) {
      toast({ title: "Scan failed", description: e.message, variant: "destructive" });
      setStep("upload");
    }
  };

  const updateGuest = (idx: number, field: keyof DetectedGuest, value: any) => {
    setGuests(prev => prev.map((g, i) => i === idx ? { ...g, [field]: value } : g));
  };

  const addEmptyGuest = () => {
    setGuests(prev => [...prev, { name: "", status: "unknown", confidence: 0 }]);
  };

  const saveGuests = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const validGuests = guests.filter(g => g.name.trim());
      if (validGuests.length === 0) {
        toast({ title: "No guests", description: "Add at least one guest.", variant: "destructive" });
        setSaving(false);
        return;
      }

      let targetEventId = selectedEventId;

      // Create new event if needed
      if (createNewEvent || !targetEventId) {
        const eventName = newEventName || eventContext?.name || "New Event";
        const { data: newEv, error: evErr } = await supabase.from("life_events").insert({
          user_id: user.id,
          name: eventName,
          event_date: eventContext?.date || new Date().toISOString().split("T")[0],
          event_time: eventContext?.time || null,
          location: eventContext?.location || null,
        }).select().single();
        if (evErr) throw evErr;
        targetEventId = newEv.id;
      }

      // Insert guests
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) throw new Error("Not authenticated");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const rows = validGuests.map(g => ({
        event_id: targetEventId,
        user_id: user.id,
        guest_name: g.name.trim(),
        status: g.status,
        added_by: "scanner",
      }));

      const insertRes = await fetch(`${supabaseUrl}/rest/v1/event_guests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${session.access_token}`,
          "Prefer": "return=representation",
        },
        body: JSON.stringify(rows),
      });

      if (!insertRes.ok) {
        const errText = await insertRes.text();
        throw new Error(`Insert failed: ${errText}`);
      }

      // Log update
      await supabase.from("event_updates").insert({
        event_id: targetEventId,
        user_id: user.id,
        change_description: `ScanDrop: Added ${validGuests.length} guest(s) — ${validGuests.map(g => g.name).join(", ")}`,
      });

      toast({ title: "Guests added!", description: `${validGuests.length} guest(s) scanned and saved.` });
      setStep("done");
      onGuestsAdded();
    } catch (e: any) {
      console.error("Save guests error:", e);
      toast({ title: "Error saving", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-primary" /> Life ScanDrop
          </DialogTitle>
          <DialogDescription>
            Upload screenshots, group chats, guest lists, or invitations to detect attendees and plans.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 max-h-[60vh] pr-2">
          {step === "upload" && (
            <div className="space-y-4">
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                {imagePreview ? (
                  <div className="space-y-3">
                    <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                    <p className="text-xs text-muted-foreground">Click to change image</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
                    <p className="text-xs text-muted-foreground">Group chats, guest lists, invitations, notes</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
              <p className="text-[10px] text-muted-foreground text-center">Images are processed temporarily and never stored permanently.</p>
              <Button className="w-full" disabled={!imagePreview} onClick={scanImage}>
                <ScanLine className="h-4 w-4 mr-2" /> Scan for Attendees
              </Button>
            </div>
          )}

          {step === "scanning" && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">Detecting attendees and event details with AI...</p>
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-4 pb-2">
              {/* Event context detected */}
              {eventContext && (eventContext.name || eventContext.date || eventContext.location) && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-3 space-y-1">
                    <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <PartyPopper className="h-3.5 w-3.5" /> Event Context Detected
                    </p>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      {eventContext.name && <p>Event: {eventContext.name}</p>}
                      {eventContext.date && <p>Date: {eventContext.date}</p>}
                      {eventContext.time && <p>Time: {eventContext.time}</p>}
                      {eventContext.location && <p>Location: {eventContext.location}</p>}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Event selection */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Add guests to:</label>
                <div className="space-y-2">
                  {events.length > 0 && (
                    <select
                      className="w-full h-9 text-sm rounded-md border border-input bg-background px-2 text-foreground"
                      value={createNewEvent ? "__new__" : selectedEventId}
                      onChange={e => {
                        if (e.target.value === "__new__") {
                          setCreateNewEvent(true);
                          setSelectedEventId("");
                        } else {
                          setCreateNewEvent(false);
                          setSelectedEventId(e.target.value);
                        }
                      }}
                    >
                      <option value="">Select an event...</option>
                      {events.map(ev => (
                        <option key={ev.id} value={ev.id}>{ev.name} ({ev.event_date})</option>
                      ))}
                      <option value="__new__">+ Create new event</option>
                    </select>
                  )}
                  {(createNewEvent || events.length === 0) && (
                    <Input
                      className="h-9 text-sm"
                      value={newEventName}
                      onChange={e => setNewEventName(e.target.value)}
                      placeholder="New event name..."
                    />
                  )}
                </div>
              </div>

              {lowConfidence && (
                <Card className="border-amber-500/30 bg-amber-500/5">
                  <CardContent className="p-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="text-xs text-amber-500">Some names had low confidence. Please review before saving.</span>
                  </CardContent>
                </Card>
              )}

              {/* Guest list */}
              {guests.map((g, idx) => (
                <Card key={idx} className="border-border">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Input
                          className="h-8 text-sm"
                          value={g.name}
                          onChange={e => updateGuest(idx, "name", e.target.value)}
                          placeholder="Guest name"
                        />
                      </div>
                      <select
                        className="h-8 text-xs rounded-md border border-input bg-background px-1.5 text-foreground"
                        value={g.status}
                        onChange={e => updateGuest(idx, "status", e.target.value)}
                      >
                        <option value="attending">Attending</option>
                        <option value="maybe">Maybe</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="unknown">Unknown</option>
                      </select>
                      <Badge className={`text-[10px] gap-1 ${STATUS_COLORS[g.status] || STATUS_COLORS.unknown}`}>
                        {STATUS_ICONS[g.status]}{g.status}
                      </Badge>
                      {g.confidence > 0 && (
                        <Badge variant={g.confidence >= 0.7 ? "default" : "secondary"} className="text-[10px]">
                          {Math.round(g.confidence * 100)}%
                        </Badge>
                      )}
                      {guests.length > 1 && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setGuests(prev => prev.filter((_, i) => i !== idx))}>
                          <X className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button variant="outline" size="sm" className="w-full text-xs" onClick={addEmptyGuest}>
                + Add another guest
              </Button>
            </div>
          )}

          {step === "done" && (
            <div className="py-6 space-y-4 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">Guests added successfully!</p>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleClose(false)}>Done</Button>
            </div>
          )}
        </ScrollArea>

        {step === "confirm" && (
          <div className="flex gap-2 pt-3 border-t border-border shrink-0">
            <Button variant="outline" className="flex-1" onClick={reset}>Cancel</Button>
            <Button
              className="flex-1"
              onClick={saveGuests}
              disabled={saving || guests.every(g => !g.name.trim()) || (!selectedEventId && !createNewEvent && events.length > 0 && !newEventName)}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
              Save {guests.filter(g => g.name.trim()).length} Guest(s)
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
