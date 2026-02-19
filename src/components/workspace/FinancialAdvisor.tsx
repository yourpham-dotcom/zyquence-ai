import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Loader2, BotMessageSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/financial-advisor`;

interface BudgetData {
  income: number;
  expenses: number;
  netWorth: number;
  savings: number;
  categories: { name: string; spent: number; budget: number; items: { description: string; amount: number }[] }[];
}

async function streamChat({
  messages,
  budgetData,
  onDelta,
  onDone,
}: {
  messages: Msg[];
  budgetData: BudgetData;
  onDelta: (text: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, budgetData }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  if (!resp.body) throw new Error("No response body");

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
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { done = true; break; }
      try {
        const parsed = JSON.parse(json);
        const c = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (c) onDelta(c);
      } catch {
        buf = line + "\n" + buf;
        break;
      }
    }
  }
  onDone();
}

interface FinancialAdvisorProps {
  budgetData: BudgetData;
}

const FinancialAdvisor = ({ budgetData }: FinancialAdvisorProps) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getInitialAnalysis = () => {
    if (messages.length > 0) return;
    setIsLoading(true);
    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [{ role: "assistant", content: assistantSoFar }];
      });
    };

    streamChat({
      messages: [{ role: "user", content: "Analyze my current budget and give me personalized financial advice. Be specific with numbers." }],
      budgetData,
      onDelta: upsert,
      onDone: () => setIsLoading(false),
    }).catch((e) => {
      console.error(e);
      toast.error(e.message || "Failed to get analysis");
      setIsLoading(false);
    });
  };

  const handleOpen = () => {
    setOpen(true);
    setTimeout(getInitialAnalysis, 100);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");

    const userMsg: Msg = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setIsLoading(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length === updated.length + 1) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: updated,
        budgetData,
        onDelta: upsert,
        onDone: () => setIsLoading(false),
      });
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to get response");
      setIsLoading(false);
    }
  };

  if (!open) {
    return (
      <Button onClick={handleOpen} className="rounded-xl gap-2" variant="outline">
        <BotMessageSquare className="h-4 w-4" />
        Financial Advisor
      </Button>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <BotMessageSquare className="h-4 w-4 text-primary" />
          Financial Advisor
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setOpen(false)}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "px-3 py-2 rounded-xl text-xs max-w-[85%] whitespace-pre-wrap",
                  msg.role === "assistant"
                    ? "bg-accent/50 text-foreground"
                    : "bg-primary text-primary-foreground"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && messages.length === 0 && (
            <div className="flex justify-start">
              <div className="px-3 py-2 rounded-xl bg-accent/50">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your finances..."
            className="rounded-xl text-xs h-8"
            disabled={isLoading}
          />
          <Button onClick={handleSend} size="icon" className="h-8 w-8 rounded-xl shrink-0" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialAdvisor;
