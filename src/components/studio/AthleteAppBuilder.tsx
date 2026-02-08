import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wand2, Zap, MessageSquare, Send, Loader2, Code, ExternalLink, Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AthleteAppBuilder = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey athlete! 🏆 Tell me what app you want and I'll build it instantly — no questions asked. Just describe it and I'll generate a fully working app for you!"
    }
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [appCode, setAppCode] = useState<string | null>(null);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const generateAppId = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const openAppInNewTab = (htmlCode: string) => {
    const appId = generateAppId();
    const fakeUrl = `${appId}.zyquence.app`;
    setDeployedUrl(fakeUrl);

    // Inject a title bar into the HTML to show the zyquence.app branding
    const brandedHtml = htmlCode.replace(
      "<body",
      `<style>
        .zyquence-bar { 
          position: fixed; top: 0; left: 0; right: 0; z-index: 99999;
          background: linear-gradient(135deg, #1a1a2e, #16213e); 
          color: #e2e8f0; padding: 8px 16px; 
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 13px; display: flex; align-items: center; 
          justify-content: space-between; gap: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .zyquence-bar .zy-domain { 
          background: rgba(255,255,255,0.1); padding: 4px 12px; 
          border-radius: 6px; font-family: monospace; font-size: 12px;
        }
        .zyquence-bar .zy-badge {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          padding: 3px 10px; border-radius: 999px; font-size: 11px;
          font-weight: 600; letter-spacing: 0.5px;
        }
        body { padding-top: 40px !important; }
      </style>
      <body`
    ).replace(
      "<body>",
      `<body>
      <div class="zyquence-bar">
        <span class="zy-badge">⚡ ZYQUENCE</span>
        <span class="zy-domain">${fakeUrl}</span>
        <span style="opacity: 0.6; font-size: 11px;">Built with AI</span>
      </div>`
    ).replace(
      /(<body[^>]*>)/,
      (match) => {
        if (match === "<body>") return match; // already handled
        return `${match}
      <div class="zyquence-bar">
        <span class="zy-badge">⚡ ZYQUENCE</span>
        <span class="zy-domain">${fakeUrl}</span>
        <span style="opacity: 0.6; font-size: 11px;">Built with AI</span>
      </div>`;
      }
    );

    const blob = new Blob([brandedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");

    toast({
      title: "🚀 App Deployed!",
      description: `Your app is live at ${fakeUrl}`,
    });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke("athlete-mental-coach", {
        body: { 
          input: input,
          type: "app_builder",
          conversationHistory: messages
        },
      });

      if (error) throw error;

      const assistantMessage: Message = { 
        role: "assistant", 
        content: data.response || "Your app has been generated! Opening it now..."
      };
      setMessages(prev => [...prev, assistantMessage]);

      if (data.appCode) {
        setAppCode(data.appCode);
        // Auto-open in new tab
        openAppInNewTab(data.appCode);
      }

      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast({
        title: "Build Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto">
      <div className="p-4 md:p-6 space-y-5 md:space-y-6">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Wand2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg md:text-2xl font-bold text-foreground leading-tight">AI No-Code App Builder</h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Describe your app and get a live build instantly</p>
          </div>
        </div>

        {/* Chat Card */}
        <Card className="p-4 md:p-6 bg-card border-border flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">AI Copilot Chat</h3>
          </div>

          <div className="space-y-3 mb-4 max-h-[40vh] overflow-y-auto">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground p-3 rounded-lg flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Building your app...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Describe the app you want to build..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              disabled={isProcessing}
              className="flex-1 bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
            <Button 
              onClick={handleSend}
              disabled={isProcessing || !input.trim()}
              size="icon"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm"
              disabled={isProcessing}
              onClick={() => { setInput("Build me a workout tracking app"); }}
            >
              <Zap className="w-3 h-3 mr-2" />
              Workout Tracker
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled={isProcessing}
              onClick={() => { setInput("Create a meal planning app"); }}
            >
              <Zap className="w-3 h-3 mr-2" />
              Meal Planner
            </Button>
          </div>
        </Card>

        {/* Deployed App Card */}
        {deployedUrl && (
          <Card className="p-4 bg-green-500/10 border-green-500/30">
            <div className="flex items-center gap-3">
              <Rocket className="w-5 h-5 text-green-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground text-sm">App Deployed Successfully!</h4>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{deployedUrl}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => appCode && openAppInNewTab(appCode)}
                className="shrink-0"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Open
              </Button>
            </div>
          </Card>
        )}

        {/* App Preview Card */}
        <Card className="p-4 md:p-6 bg-card border-border flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Code className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">App Preview</h3>
            </div>
            {appCode && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openAppInNewTab(appCode)}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Open in Tab
              </Button>
            )}
          </div>

          {appCode ? (
            <div className="border border-border rounded-lg overflow-hidden bg-background">
              <iframe
                srcDoc={appCode}
                className="w-full h-[300px] md:h-[400px]"
                sandbox="allow-scripts allow-same-origin"
                title="App Preview"
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center bg-muted/5 py-10 md:py-16">
              <Wand2 className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm">Your app will appear here</p>
              <p className="text-muted-foreground text-xs mt-2 text-center px-4">
                Tell the AI what you need and it'll build it instantly
              </p>
            </div>
          )}
        </Card>

        {/* Example Apps Card */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex gap-3">
            <Wand2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground mb-1 text-sm">Example Apps You Can Build</h4>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Training schedulers • Nutrition trackers • Performance analyzers • Goal setters • Team communication tools • Injury recovery planners • Mental wellness journals • Competition calendars
              </p>
            </div>
          </div>
        </Card>

        <div className="h-4 md:h-0" />
      </div>
    </div>
  );
};

export default AthleteAppBuilder;
