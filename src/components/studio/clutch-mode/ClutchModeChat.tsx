import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, Loader2, CalendarClock } from "lucide-react";
import type { ChatMessage, ClutchPlan, ClutchIntakeData } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClutchModeChatProps {
  plan: ClutchPlan;
  intakeData: ClutchIntakeData;
  onPlanUpdate: (plan: ClutchPlan) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const ClutchModeChat = ({ plan, intakeData, onPlanUpdate }: ClutchModeChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: generateId(),
      role: "assistant",
      content: "Your plan is ready. If anything changes — new task, lost time, energy shift — just tell me and I will update your schedule instantly.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = { id: generateId(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const chatMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const { data: result, error } = await supabase.functions.invoke("clutch-mode", {
        body: {
          mode: "chat",
          chatMessages,
          currentPlan: plan,
          intakeContext: intakeData,
        },
      });

      if (error) throw error;

      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: result.message || "Got it.",
        updatedPlan: result.updatedPlan || undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (result.updatedPlan) {
        onPlanUpdate(result.updatedPlan);
        toast.success("Schedule updated.");
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      toast.error("Failed to get response. Try again.");
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="py-4 space-y-3 max-w-xl mx-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="h-3.5 w-3.5" />
                ) : (
                  <Bot className="h-3.5 w-3.5" />
                )}
              </div>
              <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === "user" ? "items-end" : ""}`}>
                <Card
                  className={`px-3 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-foreground"
                  }`}
                >
                  {msg.content}
                </Card>
                {msg.updatedPlan && (
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <CalendarClock className="h-3 w-3" />
                    <span>Schedule updated</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2.5">
              <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <Card className="px-3 py-2 bg-card border-border">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border shrink-0">
        <div className="flex gap-2 max-w-xl mx-auto">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Something changed? Tell me..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClutchModeChat;
