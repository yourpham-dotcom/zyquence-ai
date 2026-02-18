import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Bot } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

const AssistantPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [message, setMessage] = useState(initialQuery);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hi! I'm your Zyquence AI assistant. I can help you plan your day, track goals, manage finances, or brainstorm creative projects. What would you like to do?" },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text: message },
      { role: "ai", text: "Great question! Full AI integration is coming soon. For now, explore the tools in your sidebar to get started." },
    ]);
    setMessage("");
  };

  const suggestions = [
    "Plan my week",
    "Create a budget",
    "Set fitness goals",
    "Start a new project",
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 h-full flex flex-col">
      <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-500" />
        AI Assistant
      </h1>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === "ai" && (
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            <div
              className={cn(
                "px-4 py-3 rounded-2xl text-sm max-w-[80%]",
                msg.role === "ai"
                  ? "glass-bubble text-foreground"
                  : "bg-primary text-primary-foreground"
              )}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Suggestion chips */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 pt-4">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setMessage(s);
                }}
                className="px-3 py-1.5 rounded-full text-xs border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-4 border-t border-border">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask Zyquence anything..."
          className="rounded-xl"
        />
        <Button onClick={handleSend} className="rounded-xl shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AssistantPage;
