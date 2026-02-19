import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useTradingJournal } from "@/hooks/useTradingJournal";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Upload } from "lucide-react";

const emotions = ["Calm", "Confident", "Anxious", "Greedy", "Fearful", "Excited", "Neutral", "Frustrated", "FOMO"];

interface Props {
  onSuccess?: () => void;
}

export function TradingEntryForm({ onSuccess }: Props) {
  const { createTrade } = useTradingJournal();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    asset_type: "stock" as const,
    symbol: "",
    trade_type: "buy" as const,
    entry_price: "",
    exit_price: "",
    position_size: "",
    trade_date: new Date().toISOString().split("T")[0],
    timeframe: "day_trade" as const,
    strategy_used: "",
    setup_description: "",
    confidence_level: 5,
    emotion_before: "",
    emotion_after: "",
    mistakes_made: "",
    what_went_well: "",
    what_went_wrong: "",
    lesson_learned: "",
    screenshot_url: "",
  });

  const set = (key: string, val: any) => setForm((p) => ({ ...p, [key]: val }));

  const handleScreenshot = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("trade-screenshots").upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from("trade-screenshots").getPublicUrl(path);
      set("screenshot_url", data.publicUrl);
    }
    setUploading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTrade.mutate(
      {
        ...form,
        entry_price: parseFloat(form.entry_price),
        exit_price: form.exit_price ? parseFloat(form.exit_price) : null,
        position_size: parseFloat(form.position_size),
        confidence_level: form.confidence_level,
        screenshot_url: form.screenshot_url || null,
        strategy_used: form.strategy_used || null,
        setup_description: form.setup_description || null,
        emotion_before: form.emotion_before || null,
        emotion_after: form.emotion_after || null,
        mistakes_made: form.mistakes_made || null,
        what_went_well: form.what_went_well || null,
        what_went_wrong: form.what_went_wrong || null,
        lesson_learned: form.lesson_learned || null,
      },
      { onSuccess }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Trade Details */}
      <Card>
        <CardHeader><CardTitle className="text-base">Trade Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Asset Type</Label>
            <Select value={form.asset_type} onValueChange={(v) => set("asset_type", v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
                <SelectItem value="forex">Forex</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Symbol</Label>
            <Input className="h-9" placeholder="AAPL" value={form.symbol} onChange={(e) => set("symbol", e.target.value.toUpperCase())} required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Trade Type</Label>
            <Select value={form.trade_type} onValueChange={(v) => set("trade_type", v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Buy (Long)</SelectItem>
                <SelectItem value="sell">Sell (Short)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Entry Price</Label>
            <Input className="h-9" type="number" step="any" placeholder="0.00" value={form.entry_price} onChange={(e) => set("entry_price", e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Exit Price</Label>
            <Input className="h-9" type="number" step="any" placeholder="0.00" value={form.exit_price} onChange={(e) => set("exit_price", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Position Size</Label>
            <Input className="h-9" type="number" step="any" placeholder="100" value={form.position_size} onChange={(e) => set("position_size", e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Date</Label>
            <Input className="h-9" type="date" value={form.trade_date} onChange={(e) => set("trade_date", e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Timeframe</Label>
            <Select value={form.timeframe} onValueChange={(v) => set("timeframe", v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="scalp">Scalp</SelectItem>
                <SelectItem value="day_trade">Day Trade</SelectItem>
                <SelectItem value="swing">Swing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Strategy</Label>
            <Input className="h-9" placeholder="Breakout, Trend..." value={form.strategy_used} onChange={(e) => set("strategy_used", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Setup & Confidence */}
      <Card>
        <CardHeader><CardTitle className="text-base">Setup & Psychology</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Setup Description</Label>
            <Textarea placeholder="Describe the trade setup..." value={form.setup_description} onChange={(e) => set("setup_description", e.target.value)} className="min-h-[60px]" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Confidence Level: {form.confidence_level}/10</Label>
            <Slider min={1} max={10} step={1} value={[form.confidence_level]} onValueChange={([v]) => set("confidence_level", v)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Emotion Before</Label>
              <Select value={form.emotion_before} onValueChange={(v) => set("emotion_before", v)}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{emotions.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Emotion After</Label>
              <Select value={form.emotion_after} onValueChange={(v) => set("emotion_after", v)}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{emotions.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reflection */}
      <Card>
        <CardHeader><CardTitle className="text-base">Reflection</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Mistakes Made</Label>
            <Textarea placeholder="What mistakes did you make?" value={form.mistakes_made} onChange={(e) => set("mistakes_made", e.target.value)} className="min-h-[50px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">What Went Well</Label>
              <Textarea placeholder="..." value={form.what_went_well} onChange={(e) => set("what_went_well", e.target.value)} className="min-h-[50px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">What Went Wrong</Label>
              <Textarea placeholder="..." value={form.what_went_wrong} onChange={(e) => set("what_went_wrong", e.target.value)} className="min-h-[50px]" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Lesson Learned</Label>
            <Textarea placeholder="Key takeaway from this trade..." value={form.lesson_learned} onChange={(e) => set("lesson_learned", e.target.value)} className="min-h-[50px]" />
          </div>
        </CardContent>
      </Card>

      {/* Screenshot */}
      <Card>
        <CardHeader><CardTitle className="text-base">Screenshot (Optional)</CardTitle></CardHeader>
        <CardContent>
          {form.screenshot_url ? (
            <div className="space-y-2">
              <img src={form.screenshot_url} alt="Trade screenshot" className="rounded-lg max-h-48 object-contain" />
              <Button type="button" variant="outline" size="sm" onClick={() => set("screenshot_url", "")}>Remove</Button>
            </div>
          ) : (
            <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Uploading..." : "Upload screenshot"}
              <input type="file" accept="image/*" className="hidden" onChange={handleScreenshot} disabled={uploading} />
            </label>
          )}
        </CardContent>
      </Card>

      <Button type="submit" disabled={createTrade.isPending} className="w-full">
        {createTrade.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : "Log Trade"}
      </Button>
    </form>
  );
}
