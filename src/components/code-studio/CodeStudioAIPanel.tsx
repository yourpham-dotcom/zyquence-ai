import { useState, useRef, useEffect } from "react";
import { Send, X, Loader2, Copy, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { CodeFile } from "@/pages/CodeStudio";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  activeFile?: CodeFile;
  onInsertCode: (code: string) => void;
  onClose: () => void;
}

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/code-studio-ai`;

const CodeStudioAIPanel = ({ activeFile, onInsertCode, onClose }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const allMsgs = [...messages, userMsg];
    setMessages(allMsgs);
    setInput("");
    setLoading(true);

    let assistantContent = "";

    try {
      const resp = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMsgs,
          context: activeFile
            ? { fileName: activeFile.name, language: activeFile.language, code: activeFile.content.slice(0, 3000) }
            : undefined,
        }),
      });

      if (resp.status === 429) {
        toast({ title: "Rate limited", description: "Please wait a moment and try again.", variant: "destructive" });
        setLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast({ title: "Credits required", description: "Please add credits to continue.", variant: "destructive" });
        setLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error("Failed to start stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to get AI response.", variant: "destructive" });
    }

    setLoading(false);
  };

  const extractCode = (content: string): string | null => {
    const match = content.match(/```[\w]*\n([\s\S]*?)```/);
    return match ? match[1].trim() : null;
  };

  return (
    <div className="w-80 bg-[#252526] border-l border-[#3c3c3c] flex flex-col shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#3c3c3c]">
        <span className="text-xs font-semibold text-[#cccccc]/80">AI Assistant</span>
        <Button variant="ghost" size="icon" className="h-5 w-5 text-[#cccccc]/40 hover:bg-[#3c3c3c]" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3">
        {messages.length === 0 && (
          <div className="text-center text-[#cccccc]/30 text-xs py-8 space-y-2">
            <p className="font-medium">AI Coding Assistant</p>
            <p>Ask questions, generate code, debug, or refactor.</p>
            {activeFile && (
              <p className="text-[10px] text-[#007acc]/80">
                Context: {activeFile.name}
              </p>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`mb-3 ${msg.role === "user" ? "text-right" : ""}`}>
            <div
              className={`inline-block max-w-[95%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#007acc] text-white"
                  : "bg-[#3c3c3c] text-[#cccccc]"
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans break-words">{msg.content}</pre>
              {msg.role === "assistant" && extractCode(msg.content) && (
                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-[#555]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] text-[#4ec9b0] hover:bg-[#2a2d2e] gap-1"
                    onClick={() => {
                      const code = extractCode(msg.content);
                      if (code) {
                        onInsertCode(code);
                        toast({ title: "Code inserted into editor" });
                      }
                    }}
                  >
                    <Plus className="h-3 w-3" /> Insert
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] text-[#cccccc]/60 hover:bg-[#2a2d2e] gap-1"
                    onClick={() => {
                      const code = extractCode(msg.content);
                      if (code) {
                        navigator.clipboard.writeText(code);
                        toast({ title: "Copied to clipboard" });
                      }
                    }}
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#cccccc]/40">
            <Loader2 className="h-3 w-3 animate-spin" />
            Thinking...
          </div>
        )}
        <div ref={scrollRef} />
      </ScrollArea>

      {/* Input */}
      <div className="p-2 border-t border-[#3c3c3c]">
        <div className="flex gap-1.5">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask anything about code..."
            className="min-h-[36px] max-h-[100px] resize-none text-xs bg-[#3c3c3c] border-[#555] text-[#cccccc] placeholder:text-[#cccccc]/30"
            rows={1}
          />
          <Button
            size="icon"
            className="h-9 w-9 bg-[#007acc] hover:bg-[#005a9e] shrink-0"
            onClick={send}
            disabled={loading || !input.trim()}
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CodeStudioAIPanel;
