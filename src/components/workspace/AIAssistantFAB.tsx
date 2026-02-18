import { useState } from "react";
import { Sparkles, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function AIAssistantFAB() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hey! I'm your Zyquence assistant. Ask me anything about your schedule, goals, finances, or creative projects." },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text: message },
      { role: "ai", text: "I'm thinking about that... This feature is coming soon with full AI integration!" },
    ]);
    setMessage("");
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
          open
            ? "bg-destructive text-destructive-foreground"
            : "bg-primary text-primary-foreground hover:scale-105"
        )}
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-80 h-96 rounded-2xl border border-border bg-card shadow-xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-card">
            <h3 className="text-sm font-semibold text-card-foreground">Ask Zyquence</h3>
            <p className="text-[10px] text-muted-foreground">Your AI assistant</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "text-xs px-3 py-2 rounded-xl max-w-[85%]",
                  msg.role === "ai"
                    ? "glass-bubble text-card-foreground"
                    : "bg-primary text-primary-foreground ml-auto"
                )}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-border flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask anything..."
              className="h-8 text-xs rounded-lg"
            />
            <Button size="icon" className="h-8 w-8 shrink-0 rounded-lg" onClick={handleSend}>
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
