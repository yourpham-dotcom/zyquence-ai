import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Brain, Save, Zap, Mic, Upload, Image, FileText, Loader2, MicOff, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCreativeIdeas } from "@/hooks/useCreativeIdeas";

type CaptureMode = "text" | "voice" | "file" | "image";

const CIIdeaCapture = () => {
  const [ideaText, setIdeaText] = useState("");
  const [title, setTitle] = useState("");
  const [captureMode, setCaptureMode] = useState<CaptureMode>("text");
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { saveIdea, analyzeIdea, generateStrategy } = useCreativeIdeas();
  const navigate = useNavigate();

  const handleModeSwitch = (mode: CaptureMode) => {
    if (mode === "voice") {
      setCaptureMode("voice");
    } else if (mode === "file") {
      setCaptureMode("file");
      fileInputRef.current?.click();
    } else if (mode === "image") {
      setCaptureMode("image");
      imageInputRef.current?.click();
    } else {
      setCaptureMode("text");
    }
  };

  // --- Voice recording ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await transcribeAudio(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast({ title: "Recording started", description: "Speak your idea clearly." });
    } catch {
      toast({ title: "Microphone access denied", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const transcribeAudio = async (blob: Blob) => {
    toast({ title: "Transcribing…" });
    // Convert audio to base64 and send to AI for transcription
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data, error } = await supabase.functions.invoke("creative-intelligence", {
          body: { action: "transcribe", audio: base64 },
        });
        if (error) throw error;
        const transcription = data?.result?.text || data?.result || "";
        if (transcription) {
          setIdeaText((prev) => (prev ? prev + "\n\n" + transcription : transcription));
          toast({ title: "Transcription complete!" });
        } else {
          toast({ title: "Could not transcribe audio", variant: "destructive" });
        }
      } catch (e: any) {
        console.error("Transcribe error:", e);
        toast({ title: "Transcription failed", description: e.message, variant: "destructive" });
      }
    };
    reader.readAsDataURL(blob);
  };

  // --- File upload ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);

    try {
      const text = await file.text();
      setIdeaText((prev) => (prev ? prev + "\n\n" + text : text));
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
      toast({ title: `File "${file.name}" loaded` });
    } catch {
      toast({ title: "Could not read file", variant: "destructive" });
    }
    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  // --- Image upload ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);

    toast({ title: "Analyzing image…" });
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data, error } = await supabase.functions.invoke("creative-intelligence", {
          body: { action: "analyze_image", image: base64, mimeType: file.type },
        });
        if (error) throw error;
        const description = data?.result?.text || data?.result || "";
        if (description) {
          setIdeaText((prev) => (prev ? prev + "\n\n" + description : description));
          toast({ title: "Image analyzed!" });
        } else {
          toast({ title: "Could not analyze image", variant: "destructive" });
        }
      } catch (e: any) {
        console.error("Image analysis error:", e);
        toast({ title: "Image analysis failed", description: e.message, variant: "destructive" });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSave = () => {
    if (!title.trim() || !ideaText.trim()) {
      toast({ title: "Enter a title and description", variant: "destructive" });
      return;
    }
    saveIdea.mutate({ title, description: ideaText }, {
      onSuccess: () => { setTitle(""); setIdeaText(""); setUploadedFileName(null); }
    });
  };

  const handleAnalyze = () => {
    if (!title.trim() || !ideaText.trim()) {
      toast({ title: "Enter a title and description", variant: "destructive" });
      return;
    }
    analyzeIdea.mutate({ title, description: ideaText }, {
      onSuccess: () => {
        setTitle(""); setIdeaText(""); setUploadedFileName(null);
        navigate("/creative-intelligence/analysis");
      }
    });
  };

  const handleConvertToStrategy = () => {
    if (!title.trim() || !ideaText.trim()) {
      toast({ title: "Enter a title and description", variant: "destructive" });
      return;
    }
    analyzeIdea.mutate({ title, description: ideaText }, {
      onSuccess: (data) => {
        generateStrategy.mutate({
          id: data.id,
          title,
          description: ideaText,
          idea_score: data.result.idea_score,
        } as any, {
          onSuccess: () => {
            setTitle(""); setIdeaText(""); setUploadedFileName(null);
            navigate("/creative-intelligence/strategy");
          }
        });
      }
    });
  };

  const isProcessing = analyzeIdea.isPending || saveIdea.isPending || generateStrategy.isPending;

  const modes: { mode: CaptureMode; icon: any; label: string }[] = [
    { mode: "text", icon: FileText, label: "Text" },
    { mode: "voice", icon: Mic, label: "Voice" },
    { mode: "file", icon: Upload, label: "File" },
    { mode: "image", icon: Image, label: "Image" },
  ];

  return (
    <div className="space-y-8 max-w-3xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Idea Capture</h1>
        <p className="text-muted-foreground mt-1 text-sm">Capture ideas in any format. AI will analyze and structure them.</p>
      </div>

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" className="hidden" accept=".txt,.md,.csv,.json,.xml,.html,.doc,.docx" onChange={handleFileUpload} />
      <input ref={imageInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {modes.map((f) => (
          <Card
            key={f.label}
            onClick={() => handleModeSwitch(f.mode)}
            className={`cursor-pointer transition-all border-border/50 hover:border-primary/50 ${captureMode === f.mode ? "bg-primary/10 border-primary/40" : "bg-card/60"}`}
          >
            <CardContent className="p-4 flex flex-col items-center gap-2">
              <f.icon className={`h-5 w-5 ${captureMode === f.mode ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-xs font-medium">{f.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Voice recording controls */}
      {captureMode === "voice" && (
        <Card className="bg-card/60 backdrop-blur border-border/50">
          <CardContent className="p-4 flex items-center gap-4">
            {isRecording ? (
              <>
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm text-foreground">Recording… speak your idea</span>
                <Button size="sm" variant="destructive" onClick={stopRecording} className="ml-auto gap-2">
                  <MicOff className="h-4 w-4" /> Stop
                </Button>
              </>
            ) : (
              <>
                <Mic className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to record your idea via voice</span>
                <Button size="sm" onClick={startRecording} className="ml-auto gap-2">
                  <Mic className="h-4 w-4" /> Record
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Uploaded file indicator */}
      {uploadedFileName && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>Loaded: {uploadedFileName}</span>
          <button onClick={() => setUploadedFileName(null)} className="text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <Card className="bg-card/60 backdrop-blur border-border/50">
        <CardContent className="p-6 space-y-4">
          <Input
            placeholder="Idea title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-background/50 border-border/50 text-foreground"
            disabled={isProcessing}
          />
          <Textarea
            placeholder="Describe your idea in detail. What problem does it solve? Who is the target audience? What makes it unique?"
            value={ideaText}
            onChange={(e) => setIdeaText(e.target.value)}
            className="min-h-[200px] bg-background/50 border-border/50 text-foreground resize-none"
            disabled={isProcessing}
          />
          <div className="flex flex-wrap gap-3 pt-2">
            <Button onClick={handleAnalyze} className="gap-2" disabled={isProcessing}>
              {analyzeIdea.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
              Analyze Idea
            </Button>
            <Button variant="secondary" onClick={handleSave} className="gap-2" disabled={isProcessing}>
              {saveIdea.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Idea
            </Button>
            <Button variant="outline" onClick={handleConvertToStrategy} className="gap-2" disabled={isProcessing}>
              {generateStrategy.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Convert to Strategy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CIIdeaCapture;
