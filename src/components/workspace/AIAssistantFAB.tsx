import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useNavigate } from "react-router-dom";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assistant-chat`;

const QUICK_ACTIONS = [
  "What can Zyquence help me with?",
  "Help me set up my goals",
  "Show me my finances",
  "Build a workflow for me",
  "What tools do I have access to?",
];

// Parse [LINK:Label|/path] tokens out of AI text
function parseMessage(text: string): {
  parts: ({ type: "text"; content: string } | { type: "link"; label: string; path: string })[];
} {
  const parts: ({ type: "text"; content: string } | { type: "link"; label: string; path: string })[] = [];
  const regex = /\[LINK:([^\|]+)\|([^\]]+)\]/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push({ type: "text", content: text.slice(last, match.index) });
    parts.push({ type: "link", label: match[1].trim(), path: match[2].trim() });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: "text", content: text.slice(last) });
  return { parts };
}

export function AIAssistantFAB() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { profile } = useOnboarding();
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      inputRef.current?.focus();
    }
  }, [open, messages]);

  const systemContext = profile
    ? [
        profile.account_type && `Account type: ${profile.account_type}`,
        profile.industry && `Industry: ${profile.industry}`,
        profile.description && `Goals: ${profile.description}`,
        profile.problems && `Problems they want to solve: ${profile.problems}`,
        profile.interests && `Interests: ${profile.interests}`,
        profile.desired_features && `Desired features: ${profile.desired_features}`,
      ]
        .filter(Boolean)
        .join("\n")
    : undefined;

  const handleSend = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || isLoading) return;
    setInput("");

    const userMsg: Msg = { role: "user", content };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: updated, systemContext }),
      });

      if (!resp.ok || !resp.body) throw new Error("Request failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;

      while (!done) {
        const { done: rDone, value } = await reader.read();
        if (rDone) break;
        buf += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (c) {
              assistantSoFar += c;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return [...prev.slice(0, -1), { role: "assistant", content: assistantSoFar }];
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch { break; }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    }

    setIsLoading(false);
  };

  const hasMessages = messages.length > 0;
  const userName = user?.email?.split("@")[0] ?? "";

  return (
    <>
      {/* FAB button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
          open
            ? "bg-destructive text-destructive-foreground rotate-0"
            : "bg-primary text-primary-foreground hover:scale-105"
        )}
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-[340px] h-[500px] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border bg-card/95 backdrop-blur shrink-0 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-card-foreground">Ask Zyquence</h3>
              <p className="text-[10px] text-muted-foreground">AI assistant · can navigate & build</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* Welcome + quick actions */}
            {!hasMessages && (
              <div className="space-y-2.5">
                <div className="text-xs px-3 py-2.5 rounded-xl bg-accent/50 text-card-foreground leading-relaxed">
                  Hey{userName ? ` ${userName}` : ""}! I can help you navigate Zyquence, build workflows, set up goals, and find the right tools for your needs. What would you like to do?
                </div>
                <div className="space-y-1">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action}
                      onClick={() => handleSend(action)}
                      disabled={isLoading}
                      className="w-full text-left text-[11px] px-3 py-2 rounded-lg border border-border/60 hover:bg-accent/40 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-between group"
                    >
                      <span>{action}</span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message history */}
            {messages.map((msg, i) => {
              if (msg.role === "user") {
                return (
                  <div key={i} className="flex justify-end">
                    <div className="text-xs px-3 py-2.5 rounded-xl bg-primary text-primary-foreground max-w-[85%] leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                );
              }

              const { parts } = parseMessage(msg.content);
              const textOnly = parts.filter((p) => p.type === "text").map((p) => (p as any).content).join("").trim();
              const links = parts.filter((p) => p.type === "link") as { type: "link"; label: string; path: string }[];

              return (
                <div key={i} className="space-y-1.5 max-w-[92%]">
                  {textOnly && (
                    <div className="text-xs px-3 py-2.5 rounded-xl bg-accent/50 text-card-foreground leading-relaxed whitespace-pre-wrap">
                      {textOnly}
                    </div>
                  )}
                  {links.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-1">
                      {links.map((link, j) => (
                        <button
                          key={j}
                          onClick={() => { navigate(link.path); setOpen(false); }}
                          className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-colors font-medium"
                        >
                          <ArrowRight className="h-2.5 w-2.5 shrink-0" />
                          {link.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing indicator */}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-1 px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-card/95 shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
                placeholder="Ask anything..."
                disabled={isLoading}
                className="flex-1 bg-accent/30 border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
              <Button
                size="icon"
                className="h-8 w-8 shrink-0 rounded-xl"
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
