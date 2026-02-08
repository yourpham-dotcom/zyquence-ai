import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { HouseParams } from "./HouseModel3D";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface HouseBuilderChatProps {
  onHouseGenerated: (params: HouseParams) => void;
}

const stripMarkdown = (text: string): string => {
  return text
    .replace(/#{1,6}\s?/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\*\s/g, "- ")
    .replace(/\*$/gm, "")
    .trim();
};

const quickPrompts = [
  "Build a modern luxury villa with a pool and 3 stories",
  "Create a cozy 1-story minimalist house with a big terrace",
  "Design a Mediterranean 2-story home with a garage",
  "Build a colonial style mansion with a balcony and pool",
];

export default function HouseBuilderChat({ onHouseGenerated }: HouseBuilderChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to the 3D House Builder! Describe your dream home and I'll generate a 3D model for you. Try something like: 'Build me a modern 2-story luxury villa with a pool and terrace.'",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async (text?: string) => {
    const message = text || input;
    if (!message.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: message };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("house-builder", {
        body: { input: message },
      });

      if (error) throw error;

      const assistantMsg: Message = {
        role: "assistant",
        content: stripMarkdown(data.description || "Here's your custom 3D house!"),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (data.houseParams) {
        onHouseGenerated(data.houseParams);
        toast({ title: "3D Model Generated", description: "Your dream home is ready!" });
      }
    } catch (error: any) {
      console.error("House builder error:", error);
      const errMsg: Message = {
        role: "assistant",
        content: "Sorry, I couldn't generate that house. Please try again with a different description.",
      };
      setMessages((prev) => [...prev, errMsg]);
      toast({
        title: "Generation Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-full border-border bg-card">
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm text-foreground">AI House Builder</h3>
      </div>

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
              )}
              <div
                className={`rounded-lg px-3 py-2 max-w-[80%] text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-foreground" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 justify-start">
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="rounded-lg px-3 py-2 bg-muted text-foreground text-sm flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Designing your house...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="px-3 pb-2">
          <p className="text-xs text-muted-foreground mb-2">Quick ideas:</p>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
              >
                {prompt.slice(0, 35)}...
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your dream house..."
            className="resize-none min-h-[40px] max-h-[80px] text-sm"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            onClick={() => handleSend()}
            size="icon"
            className="h-10 w-10 flex-shrink-0"
            disabled={!input.trim() || isLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
