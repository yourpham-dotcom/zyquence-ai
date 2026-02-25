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
  ImageIcon, Building2
} from "lucide-react";

type DetectedMember = {
  name: string;
  title: string;
  department: string;
  manager_name: string | null;
  confidence: number;
};

const TIER_MAP: Record<string, string> = {
  ceo: "c_suite", coo: "c_suite", cfo: "c_suite", cto: "c_suite",
  cmo: "c_suite", cro: "c_suite", cio: "c_suite", cpo: "c_suite",
};

function classifyTier(title: string): string {
  const lower = title.toLowerCase();
  if (/^c[a-z]o$/i.test(lower) || /^chief\s/i.test(lower)) return "c_suite";
  for (const [key] of Object.entries(TIER_MAP)) {
    if (lower.includes(key)) return "c_suite";
  }
  if (/\b(vp|vice president|director|head of)\b/i.test(lower)) return "leadership";
  if (/\b(manager|lead|supervisor)\b/i.test(lower)) return "manager";
  if (/\b(contractor|freelancer)\b/i.test(lower)) return "contractor";
  return "employee";
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMembersAdded: () => void;
};

type Step = "upload" | "scanning" | "confirm" | "done";

export default function OrgScanDrop({ open, onOpenChange, onMembersAdded }: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("upload");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [members, setMembers] = useState<DetectedMember[]>([]);
  const [lowConfidence, setLowConfidence] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep("upload");
    setImagePreview(null);
    setMembers([]);
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

  const scanImage = async () => {
    if (!imagePreview) return;
    setStep("scanning");
    try {
      const { data, error } = await supabase.functions.invoke("scan-org", {
        body: { imageBase64: imagePreview },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const detected: DetectedMember[] = (data.members || []).map((m: any) => ({
        name: m.name || "",
        title: m.title || "Employee",
        department: m.department || "General",
        manager_name: m.manager_name || null,
        confidence: m.confidence || 0,
      }));

      if (detected.length === 0) {
        setLowConfidence(true);
        setMembers([{ name: "", title: "", department: "", manager_name: null, confidence: 0 }]);
      } else {
        setLowConfidence(detected.some(m => m.confidence < 0.5));
        setMembers(detected);
      }
      setStep("confirm");
    } catch (e: any) {
      toast({ title: "Scan failed", description: e.message, variant: "destructive" });
      setStep("upload");
    }
  };

  const updateMember = (idx: number, field: keyof DetectedMember, value: any) => {
    setMembers(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  };

  const saveMembers = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const validMembers = members.filter(m => m.name.trim());

      // Insert all members first (without manager_id)
      const inserts = validMembers.map(m => ({
        user_id: user.id,
        name: m.name,
        title: m.title || "Employee",
        department: m.department || "General",
        tier_level: classifyTier(m.title || "Employee"),
      }));

      const { data: inserted, error } = await supabase.from("team_members").insert(inserts as any).select();
      if (error) throw error;

      // Now resolve manager relationships
      if (inserted) {
        const allMembers = inserted as any[];
        for (let i = 0; i < validMembers.length; i++) {
          const mgrName = validMembers[i].manager_name;
          if (mgrName) {
            const mgr = allMembers.find(m => m.name.toLowerCase() === mgrName.toLowerCase());
            if (mgr) {
              await supabase.from("team_members").update({ manager_id: mgr.id }).eq("id", allMembers[i].id);
            } else {
              // Try existing members
              const { data: existingMgr } = await supabase
                .from("team_members")
                .select("id")
                .eq("user_id", user.id)
                .ilike("name", mgrName)
                .maybeSingle();
              if (existingMgr) {
                await supabase.from("team_members").update({ manager_id: existingMgr.id }).eq("id", allMembers[i].id);
              }
            }
          }
        }
      }

      toast({ title: "Team updated!", description: `${validMembers.length} member(s) added to your organization.` });
      setStep("done");
      onMembersAdded();
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
            <Building2 className="h-5 w-5 text-primary" /> Org Scanner
          </DialogTitle>
          <DialogDescription>
            Upload an org chart, team roster, or role sheet to auto-detect roles and positions.
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
                    <p className="text-xs text-muted-foreground">Org charts, team rosters, role sheets</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
              <p className="text-[10px] text-muted-foreground text-center">Images are processed only to extract org data and are not stored.</p>
              <Button className="w-full" disabled={!imagePreview} onClick={scanImage}>
                <ScanLine className="h-4 w-4 mr-2" /> Scan Organization
              </Button>
            </div>
          )}

          {step === "scanning" && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">Analyzing organization structure with AI...</p>
              {imagePreview && <img src={imagePreview} alt="Scanning" className="max-h-32 mx-auto rounded-lg opacity-50 object-contain" />}
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-4">
              {lowConfidence && (
                <Card className="border-amber-500/30 bg-amber-500/5">
                  <CardContent className="p-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="text-xs text-amber-500">Some roles couldn't be fully detected. Please review.</span>
                  </CardContent>
                </Card>
              )}

              {members.map((m, idx) => (
                <Card key={idx} className="border-border">
                  <CardContent className="p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-[10px]">Person {idx + 1}</Badge>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px]">{classifyTier(m.title)}</Badge>
                        {m.confidence > 0 && (
                          <Badge variant={m.confidence >= 0.7 ? "default" : "secondary"} className="text-[10px]">
                            {Math.round(m.confidence * 100)}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2">
                        <label className="text-[10px] text-muted-foreground mb-1 block">Name</label>
                        <Input className="h-8 text-xs" value={m.name} onChange={e => updateMember(idx, "name", e.target.value)} placeholder="Full name" />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Title</label>
                        <Input className="h-8 text-xs" value={m.title} onChange={e => updateMember(idx, "title", e.target.value)} placeholder="Job title" />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Department</label>
                        <Input className="h-8 text-xs" value={m.department} onChange={e => updateMember(idx, "department", e.target.value)} placeholder="Department" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-muted-foreground mb-1 block">Reports To</label>
                        <Input className="h-8 text-xs" value={m.manager_name || ""} onChange={e => updateMember(idx, "manager_name", e.target.value || null)} placeholder="Manager name (optional)" />
                      </div>
                    </div>
                    {members.length > 1 && (
                      <Button variant="ghost" size="sm" className="text-destructive text-xs h-7" onClick={() => setMembers(prev => prev.filter((_, i) => i !== idx))}>
                        <X className="h-3 w-3 mr-1" /> Remove
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={reset}>Cancel</Button>
                <Button className="flex-1" onClick={saveMembers} disabled={saving || members.every(m => !m.name.trim())}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                  Add to Organization
                </Button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="py-6 space-y-4 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium">Team members added successfully!</p>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleClose(false)}>Done</Button>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
