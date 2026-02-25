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
  ScanLine, Upload, Loader2, X, Check, AlertTriangle,
  ImageIcon, Workflow, Megaphone
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type DetectedProduct = {
  name: string;
  size: string;
  price: number;
  cost: number;
  quantity: number;
  notes: string;
  status: string;
  confidence: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemsAdded: () => void;
};

type Step = "upload" | "scanning" | "confirm" | "done";

export default function ScanDrop({ open, onOpenChange, onItemsAdded }: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("upload");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [products, setProducts] = useState<DetectedProduct[]>([]);
  const [lowConfidence, setLowConfidence] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const reset = () => {
    setStep("upload");
    setImagePreview(null);
    setProducts([]);
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
      const { data, error } = await supabase.functions.invoke("scandrop", {
        body: { imageBase64: imagePreview },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const detected: DetectedProduct[] = (data.products || []).map((p: any) => ({
        name: p.name || "Unknown Product",
        size: p.size || "",
        price: p.price || 0,
        cost: p.cost || 0,
        quantity: p.quantity || 1,
        notes: p.notes || "",
        status: "Available",
        confidence: p.confidence || 0,
      }));

      if (detected.length === 0) {
        setLowConfidence(true);
        setProducts([{ name: "", size: "", price: 0, cost: 0, quantity: 1, notes: "", status: "Available", confidence: 0 }]);
        setStep("confirm");
      } else {
        const allHighConfidence = detected.every(p => p.confidence >= 0.7 && p.name.trim());
        setLowConfidence(detected.some(p => p.confidence < 0.5));
        setProducts(detected);

        if (allHighConfidence && user) {
          // Auto-save when AI is confident
          setSaving(true);
          try {
            const inserts = detected.map(p => ({
              user_id: user.id,
              name: p.name || "Unnamed Product",
              size: p.size || null,
              unit_price: p.price || 0,
              cost: p.cost || 0,
              quantity: p.quantity || 1,
              notes: p.notes || null,
              status: p.status === "Sold" ? "sold" : "in_stock",
              category: "ScanDrop",
            }));
            const { error: insertErr } = await supabase.from("inventory_items").insert(inserts as any);
            if (insertErr) throw insertErr;
            toast({ title: "Auto-detected & saved!", description: `${detected.length} item(s) added to inventory.` });
            setStep("done");
            onItemsAdded();
          } catch (saveErr: any) {
            toast({ title: "Auto-save failed", description: saveErr.message, variant: "destructive" });
            setStep("confirm");
          } finally {
            setSaving(false);
          }
        } else {
          setStep("confirm");
        }
      }
    } catch (e: any) {
      toast({ title: "Scan failed", description: e.message, variant: "destructive" });
      setStep("upload");
    }
  };

  const updateProduct = (idx: number, field: keyof DetectedProduct, value: any) => {
    setProducts(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const saveToInventory = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const inserts = products.map(p => ({
        user_id: user.id,
        name: p.name || "Unnamed Product",
        size: p.size || null,
        unit_price: p.price || 0,
        cost: p.cost || 0,
        quantity: p.quantity || 1,
        notes: p.notes || null,
        status: p.status === "Sold" ? "sold" : "in_stock",
        category: "ScanDrop",
      }));

      const { error } = await supabase.from("inventory_items").insert(inserts as any);
      if (error) throw error;

      toast({ title: "Items added!", description: `${products.length} item(s) added to inventory.` });
      setStep("done");
      onItemsAdded();
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
            <ScanLine className="h-5 w-5 text-primary" /> ScanDrop
          </DialogTitle>
          <DialogDescription>
            Upload a product image and automatically extract inventory details using AI.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-2">
          {/* UPLOAD STEP */}
          {step === "upload" && (
            <div className="space-y-4">
              <div
                ref={dropRef}
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
              <Button className="w-full" disabled={!imagePreview} onClick={scanImage}>
                <ScanLine className="h-4 w-4 mr-2" /> Scan & Detect
              </Button>
            </div>
          )}

          {/* SCANNING STEP */}
          {step === "scanning" && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">Analyzing image with AI...</p>
              {imagePreview && <img src={imagePreview} alt="Scanning" className="max-h-32 mx-auto rounded-lg opacity-50 object-contain" />}
            </div>
          )}

          {/* CONFIRM STEP */}
          {step === "confirm" && (
            <div className="space-y-4">
              {lowConfidence && (
                <Card className="border-amber-500/30 bg-amber-500/5">
                  <CardContent className="p-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="text-xs text-amber-500">Unable to fully detect details. Please review and fill manually.</span>
                  </CardContent>
                </Card>
              )}

              {products.map((p, idx) => (
                <Card key={idx} className="border-border">
                  <CardContent className="p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-[10px]">Item {idx + 1}</Badge>
                      {p.confidence > 0 && (
                        <Badge variant={p.confidence >= 0.7 ? "default" : "secondary"} className="text-[10px]">
                          {Math.round(p.confidence * 100)}% match
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2">
                        <label className="text-[10px] text-muted-foreground mb-1 block">Product Name</label>
                        <Input className="h-8 text-xs" value={p.name} onChange={e => updateProduct(idx, "name", e.target.value)} placeholder="Product name" />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Size</label>
                        <Input className="h-8 text-xs" value={p.size} onChange={e => updateProduct(idx, "size", e.target.value)} placeholder="S, M, L..." />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Quantity</label>
                        <Input className="h-8 text-xs" type="number" value={p.quantity} onChange={e => updateProduct(idx, "quantity", parseInt(e.target.value) || 0)} />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Cost (optional)</label>
                        <Input className="h-8 text-xs" type="number" step="0.01" value={p.cost} onChange={e => updateProduct(idx, "cost", parseFloat(e.target.value) || 0)} />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Selling Price</label>
                        <Input className="h-8 text-xs" type="number" step="0.01" value={p.price} onChange={e => updateProduct(idx, "price", parseFloat(e.target.value) || 0)} />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Status</label>
                        <Select value={p.status} onValueChange={v => updateProduct(idx, "status", v)}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Available">Available</SelectItem>
                            <SelectItem value="Sold">Sold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Notes</label>
                        <Input className="h-8 text-xs" value={p.notes} onChange={e => updateProduct(idx, "notes", e.target.value)} placeholder="Description..." />
                      </div>
                    </div>
                    {products.length > 1 && (
                      <Button variant="ghost" size="sm" className="text-destructive text-xs h-7" onClick={() => setProducts(prev => prev.filter((_, i) => i !== idx))}>
                        <X className="h-3 w-3 mr-1" /> Remove
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { reset(); }}>Cancel</Button>
                <Button className="flex-1" onClick={saveToInventory} disabled={saving || products.every(p => !p.name.trim())}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                  Add to Inventory
                </Button>
              </div>
            </div>
          )}

          {/* DONE STEP */}
          {step === "done" && (
            <div className="py-6 space-y-4 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium">Items added successfully!</p>
              <p className="text-xs text-muted-foreground">Smart suggestions:</p>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => handleClose(false)}>
                  <Workflow className="h-3 w-3 mr-1" /> Create Sales Workflow
                </Button>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => handleClose(false)}>
                  <Megaphone className="h-3 w-3 mr-1" /> Create Promotion Tasks
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleClose(false)}>Done</Button>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
