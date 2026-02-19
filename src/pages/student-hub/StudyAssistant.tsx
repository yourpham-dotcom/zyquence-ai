import { useState } from "react";
import { Brain, FileText, Lightbulb, HelpCircle, BookOpen, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Mode = "summary" | "flashcards" | "quiz" | "study_guide";

export default function StudyAssistant() {
  const [sourceText, setSourceText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("summary");
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!sourceText.trim()) { toast({ title: "Paste your notes first", variant: "destructive" }); return; }
    setLoading(true);
    setResult("");

    try {
      const resp = await supabase.functions.invoke("student-ai", {
        body: { mode, text: sourceText.trim() },
      });
      if (resp.error) throw resp.error;
      setResult(resp.data?.result || "No result generated.");
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to generate", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modeConfig: Record<Mode, { label: string; icon: any; desc: string }> = {
    summary: { label: "Summary", icon: FileText, desc: "Condense notes into key points" },
    flashcards: { label: "Flashcards", icon: Lightbulb, desc: "Generate Q&A flashcards" },
    quiz: { label: "Practice Quiz", icon: HelpCircle, desc: "Create practice questions" },
    study_guide: { label: "Study Guide", icon: BookOpen, desc: "Build a structured study guide" },
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Brain className="h-6 w-6 text-purple-500" />AI Study Assistant</h1>
        <p className="text-muted-foreground text-sm">Paste your notes and let AI help you study smarter</p>
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
        <TabsList className="grid grid-cols-4 w-full">
          {(Object.keys(modeConfig) as Mode[]).map((m) => {
            const cfg = modeConfig[m];
            return <TabsTrigger key={m} value={m} className="text-xs gap-1"><cfg.icon className="h-3 w-3" />{cfg.label}</TabsTrigger>;
          })}
        </TabsList>
      </Tabs>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{modeConfig[mode].desc}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Paste your notes, textbook content, or lecture material here..."
            rows={8}
            className="resize-none"
          />
          <Button onClick={generate} disabled={loading} className="w-full">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</> : `Generate ${modeConfig[mode].label}`}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Result</CardTitle>
            <Button variant="ghost" size="sm" onClick={copyResult}>
              {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}{copied ? "Copied" : "Copy"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{result}</div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-center">⚠️ AI-generated content is for study aid purposes. Always verify with your course materials.</p>
    </div>
  );
}
