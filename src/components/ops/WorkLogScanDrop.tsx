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
  ImageIcon, Clock
} from "lucide-react";

type DetectedEntry = {
  employee_name: string;
  date: string;
  start_time: string;
  end_time: string;
  hours: number;
  hourly_rate: number;
  total_pay: number;
  notes: string;
  confidence: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEntriesAdded: () => void;
};

type Step = "upload" | "scanning" | "confirm" | "done";

export default function WorkLogScanDrop({ open, onOpenChange, onEntriesAdded }: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("upload");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [entries, setEntries] = useState<DetectedEntry[]>([]);
  const [lowConfidence, setLowConfidence] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep("upload");
    setImagePreview(null);
    setEntries([]);
    setLowConfidence(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload a JPG or PNG image.", variant: "destructive" });
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

  const calcHours = (start: string, end: string): number => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return Math.max(0, Math.round(((eh * 60 + em) - (sh * 60 + sm)) / 60 * 100) / 100);
  };

  const scanImage = async () => {
    if (!imagePreview) return;
    setStep("scanning");
    try {
      const { data, error } = await supabase.functions.invoke("scan-worklog", {
        body: { imageBase64: imagePreview },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const detected: DetectedEntry[] = (data.entries || []).map((e: any) => {
        const hours = e.hours || calcHours(e.start_time || "09:00", e.end_time || "17:00");
        const rate = e.hourly_rate || 0;
        return {
          employee_name: e.employee_name || "",
          date: e.date || new Date().toISOString().split("T")[0],
          start_time: e.start_time || "09:00",
          end_time: e.end_time || "17:00",
          hours,
          hourly_rate: rate,
          total_pay: Math.round(hours * rate * 100) / 100,
          notes: e.notes || "",
          confidence: e.confidence || 0,
        };
      });

      if (detected.length === 0) {
        setLowConfidence(true);
        setEntries([{ employee_name: "", date: new Date().toISOString().split("T")[0], start_time: "09:00", end_time: "17:00", hours: 8, hourly_rate: 0, total_pay: 0, notes: "", confidence: 0 }]);
      } else {
        setLowConfidence(detected.some(e => e.confidence < 0.5));
        setEntries(detected);
      }
      setStep("confirm");
    } catch (e: any) {
      toast({ title: "Scan failed", description: e.message, variant: "destructive" });
      setStep("upload");
    }
  };

  const updateEntry = (idx: number, field: keyof DetectedEntry, value: any) => {
    setEntries(prev => prev.map((e, i) => {
      if (i !== idx) return e;
      const next = { ...e, [field]: value };
      if (field === "start_time" || field === "end_time") {
        const s = field === "start_time" ? value : e.start_time;
        const en = field === "end_time" ? value : e.end_time;
        next.hours = calcHours(s, en);
        next.total_pay = Math.round(next.hours * e.hourly_rate * 100) / 100;
      }
      if (field === "hourly_rate") { next.total_pay = Math.round(e.hours * (parseFloat(value) || 0) * 100) / 100; }
      if (field === "hours") { next.total_pay = Math.round((parseFloat(value) || 0) * e.hourly_rate * 100) / 100; }
      return next;
    }));
  };

  const saveEntries = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const inserts = entries.map(e => ({
        user_id: user.id,
        employee_name: e.employee_name || "Unknown",
        work_date: e.date,
        start_time: e.start_time,
        end_time: e.end_time,
        hours: e.hours,
        hourly_rate: e.hourly_rate,
        total_pay: e.total_pay,
        notes: e.notes || null,
      }));
      const { error } = await supabase.from("work_logs").insert(inserts as any);
      if (error) throw error;
      toast({ title: "Work logs added!", description: `${entries.length} entry(s) added to spreadsheet.` });
      setStep("done");
      onEntriesAdded();
    } catch (e: any) {
      toast({ title: "Error saving", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" /> WorkLog Scanner
          </DialogTitle>
          <DialogDescription>
            Upload a timesheet or work log image to automatically extract employee hours.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-2">
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
                    <p className="text-xs text-muted-foreground">JPG, PNG supported</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
              <p className="text-[10px] text-muted-foreground text-center">Images are processed only to extract work log data and are not stored.</p>
              <Button className="w-full" disabled={!imagePreview} onClick={scanImage}>
                <ScanLine className="h-4 w-4 mr-2" /> Scan Work Log
              </Button>
            </div>
          )}

          {step === "scanning" && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">Analyzing timesheet with AI...</p>
              {imagePreview && <img src={imagePreview} alt="Scanning" className="max-h-32 mx-auto rounded-lg opacity-50 object-contain" />}
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-4">
              {lowConfidence && (
                <Card className="border-amber-500/30 bg-amber-500/5">
                  <CardContent className="p-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="text-xs text-amber-500">Some details couldn't be fully detected. Please review.</span>
                  </CardContent>
                </Card>
              )}

              {entries.map((e, idx) => (
                <Card key={idx} className="border-border">
                  <CardContent className="p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-[10px]">Entry {idx + 1}</Badge>
                      {e.confidence > 0 && (
                        <Badge variant={e.confidence >= 0.7 ? "default" : "secondary"} className="text-[10px]">
                          {Math.round(e.confidence * 100)}% match
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2">
                        <label className="text-[10px] text-muted-foreground mb-1 block">Employee Name</label>
                        <Input className="h-8 text-xs" value={e.employee_name} onChange={ev => updateEntry(idx, "employee_name", ev.target.value)} placeholder="Employee name" />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Date</label>
                        <Input className="h-8 text-xs" type="date" value={e.date} onChange={ev => updateEntry(idx, "date", ev.target.value)} />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Start Time</label>
                        <Input className="h-8 text-xs" type="time" value={e.start_time} onChange={ev => updateEntry(idx, "start_time", ev.target.value)} />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">End Time</label>
                        <Input className="h-8 text-xs" type="time" value={e.end_time} onChange={ev => updateEntry(idx, "end_time", ev.target.value)} />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Hours</label>
                        <Input className="h-8 text-xs" type="number" step="0.01" value={e.hours} onChange={ev => updateEntry(idx, "hours", parseFloat(ev.target.value) || 0)} />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Hourly Rate</label>
                        <Input className="h-8 text-xs" type="number" step="0.01" value={e.hourly_rate} onChange={ev => updateEntry(idx, "hourly_rate", parseFloat(ev.target.value) || 0)} />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Total Pay</label>
                        <div className="h-8 text-xs flex items-center px-3 bg-muted/50 rounded-md font-mono">${e.total_pay.toFixed(2)}</div>
                      </div>
                    </div>
                    {entries.length > 1 && (
                      <Button variant="ghost" size="sm" className="text-destructive text-xs h-7" onClick={() => setEntries(prev => prev.filter((_, i) => i !== idx))}>
                        <X className="h-3 w-3 mr-1" /> Remove
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={reset}>Cancel</Button>
                <Button className="flex-1" onClick={saveEntries} disabled={saving || entries.every(e => !e.employee_name.trim())}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                  Add to Spreadsheet
                </Button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="py-6 space-y-4 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium">Work logs added successfully!</p>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleClose(false)}>Done</Button>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
