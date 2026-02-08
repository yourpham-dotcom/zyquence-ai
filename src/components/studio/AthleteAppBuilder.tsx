import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wand2, Zap, MessageSquare, Send, Loader2, Code } from "lucide-react";
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
      content: "Hey athlete! I'm your AI app builder copilot. Tell me what kind of app you need - workout tracker, meal planner, training scheduler, or anything else. I'll build it for you with no code required!"
    }
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [appPreview, setAppPreview] = useState<string | null>(null);
  const { toast } = useToast();

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
        content: data.response 
      };
      setMessages(prev => [...prev, assistantMessage]);

      if (data.appCode) {
        setAppPreview(data.appCode);
        toast({
          title: "App Component Generated!",
          description: "Your custom app is ready to preview",
        });
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      toast({
        title: "Message Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6 gap-4 md:gap-6 bg-background overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">AI No-Code App Builder</h2>
            <p className="text-sm text-muted-foreground">Build custom athlete apps with AI - no coding needed</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0 lg:min-h-0">
        <Card className="p-4 md:p-6 bg-card border-border flex flex-col min-h-[300px] lg:min-h-0">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">AI Copilot Chat</h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
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
                <div className="bg-muted text-foreground p-3 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Describe the app you want to build..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
            <Button 
              onClick={handleSend}
              disabled={isProcessing || !input.trim()}
              size="icon"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setInput("Build me a workout tracking app")}
            >
              <Zap className="w-3 h-3 mr-2" />
              Workout Tracker
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setInput("Create a meal planning app")}
            >
              <Zap className="w-3 h-3 mr-2" />
              Meal Planner
            </Button>
          </div>
        </Card>

        <Card className="p-4 md:p-6 bg-card border-border flex flex-col min-h-[250px] lg:min-h-0">
          <div className="flex items-center gap-3 mb-4">
            <Code className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">App Preview</h3>
          </div>

          {appPreview ? (
            <div className="flex-1 border-2 border-dashed border-border rounded-lg p-4 bg-muted/5 overflow-auto">
              <pre className="text-xs text-foreground whitespace-pre-wrap">{appPreview}</pre>
            </div>
          ) : (
            <div className="flex-1 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center bg-muted/5">
              <Wand2 className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm">Your app will appear here</p>
              <p className="text-muted-foreground text-xs mt-2">
                Tell the AI what you need and watch it build your app
              </p>
            </div>
          )}

          {appPreview && (
            <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
              <Code className="w-4 h-4 mr-2" />
              Deploy App
            </Button>
          )}
        </Card>
      </div>

      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex gap-3">
          <Wand2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-foreground mb-1">Example Apps You Can Build</h4>
            <p className="text-sm text-muted-foreground">
              Training schedulers • Nutrition trackers • Performance analyzers • Goal setters • Team communication tools • Injury recovery planners • Mental wellness journals • Competition calendars
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AthleteAppBuilder;
