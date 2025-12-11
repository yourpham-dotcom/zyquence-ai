import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModuleType, GeneratedFile } from "@/pages/AIBuilderHub";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  files?: GeneratedFile[];
}

interface AIBuilderChatProps {
  activeModule: ModuleType;
  onFilesGenerated: (files: GeneratedFile[]) => void;
  onSaveBuild: (title: string) => void;
}

const moduleInfo = {
  "app-builder": {
    title: "App Builder",
    placeholder: "Describe the app you want to build... (e.g., 'Build me a workout tracking app')",
    systemPrompt: `You are an expert web app builder. When the user describes an app, generate a complete functional HTML/CSS/JS prototype. 

IMPORTANT: Always structure your response with these sections:
1. First, explain what you'll build
2. Then provide the code in clearly marked sections:

---HTML---
(full HTML code here)
---END HTML---

---CSS---
(full CSS code here)
---END CSS---

---JS---
(full JavaScript code here)
---END JS---

Keep code simple, readable, and include comments. Make the app functional and visually appealing with modern styling.`
  },
  "nil-builder": {
    title: "NIL Builder",
    placeholder: "Enter your name and details to build your NIL profile... (e.g., 'I'm John Smith, a quarterback at Ohio State...')",
    systemPrompt: `You are an expert NIL (Name, Image, Likeness) profile builder for athletes. When the user provides their details, create:
1. A modern NIL landing page with their brand
2. Their athlete brand summary
3. Key strengths and personality traits
4. Sponsorship appeal points

IMPORTANT: Structure your response with:
1. Brief introduction of the profile
2. Brand summary text
3. HTML profile page:

---HTML---
(full HTML landing page with inline CSS for the athlete's NIL profile)
---END HTML---

---TXT---
(NIL One-Sheet text document with athlete info, stats, brand values, and sponsorship contact info)
---END TXT---

Make the profile modern, professional, and compelling for sponsors.`
  },
  "artist-catalog": {
    title: "Artist Catalog Builder",
    placeholder: "Describe your artist identity... (e.g., 'I'm an R&B artist with a dreamy aesthetic...')",
    systemPrompt: `You are an expert artist brand and catalog builder. When the user describes their artist identity, generate:
1. Artist bio and brand philosophy
2. Discography layout
3. Visual moodboard description
4. Complete artist homepage

IMPORTANT: Structure your response with:
1. Artist brand analysis
2. HTML homepage:

---HTML---
(full HTML artist homepage with inline CSS, including bio, discography section, and aesthetic elements)
---END HTML---

---TXT---
(Artist catalog document with bio, discography, brand philosophy, and contact info)
---END TXT---

Create something visually stunning that captures their unique aesthetic.`
  },
  "athlete-resources": {
    title: "Athlete Resources",
    placeholder: "What resources do you need? (e.g., 'Create a pre-game routine for basketball')",
    systemPrompt: `You are an expert sports performance consultant. When the user describes what they need, generate structured templates and resources like:
- Training plans
- Pre-game routines
- Mindset worksheets
- Nutrition checklists
- Recruiting email templates
- Recovery protocols

IMPORTANT: Structure your response with:
1. Brief explanation of the resource
2. The resource content:

---TXT---
(Complete formatted resource document with sections, checklists, and actionable items)
---END TXT---

Make resources practical, professional, and immediately usable.`
  }
};

const AIBuilderChat = ({ activeModule, onFilesGenerated, onSaveBuild }: AIBuilderChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevModuleRef = useRef(activeModule);

  useEffect(() => {
    if (prevModuleRef.current !== activeModule) {
      setMessages([]);
      onFilesGenerated([]);
      prevModuleRef.current = activeModule;
    }
  }, [activeModule, onFilesGenerated]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const parseFilesFromResponse = (content: string): GeneratedFile[] => {
    const files: GeneratedFile[] = [];
    
    const htmlMatch = content.match(/---HTML---([\s\S]*?)---END HTML---/);
    if (htmlMatch) {
      files.push({
        id: crypto.randomUUID(),
        name: "index.html",
        type: "html",
        content: htmlMatch[1].trim(),
        previewable: true,
        createdAt: new Date()
      });
    }

    const cssMatch = content.match(/---CSS---([\s\S]*?)---END CSS---/);
    if (cssMatch) {
      files.push({
        id: crypto.randomUUID(),
        name: "style.css",
        type: "css",
        content: cssMatch[1].trim(),
        previewable: false,
        createdAt: new Date()
      });
    }

    const jsMatch = content.match(/---JS---([\s\S]*?)---END JS---/);
    if (jsMatch) {
      files.push({
        id: crypto.randomUUID(),
        name: "script.js",
        type: "js",
        content: jsMatch[1].trim(),
        previewable: false,
        createdAt: new Date()
      });
    }

    const txtMatch = content.match(/---TXT---([\s\S]*?)---END TXT---/);
    if (txtMatch) {
      const filename = activeModule === "nil-builder" ? "nil-one-sheet.txt" :
                       activeModule === "artist-catalog" ? "artist-catalog.txt" :
                       "resource.txt";
      files.push({
        id: crypto.randomUUID(),
        name: filename,
        type: "txt",
        content: txtMatch[1].trim(),
        previewable: false,
        createdAt: new Date()
      });
    }

    return files;
  };

  const cleanContentForDisplay = (content: string): string => {
    return content
      .replace(/---HTML---[\s\S]*?---END HTML---/g, "[HTML file generated]")
      .replace(/---CSS---[\s\S]*?---END CSS---/g, "[CSS file generated]")
      .replace(/---JS---[\s\S]*?---END JS---/g, "[JS file generated]")
      .replace(/---TXT---[\s\S]*?---END TXT---/g, "[Text file generated]")
      .trim();
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke("ai-builder-chat", {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          systemPrompt: moduleInfo[activeModule].systemPrompt
        }
      });

      if (response.error) throw response.error;

      const aiContent = response.data.content;
      const files = parseFilesFromResponse(aiContent);
      const displayContent = cleanContentForDisplay(aiContent);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: displayContent,
        files: files.length > 0 ? files : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (files.length > 0) {
        onFilesGenerated(files);
        toast.success(`Generated ${files.length} file(s)!`);
      }
    } catch (error) {
      console.error("AI Error:", error);
      toast.error("Failed to get AI response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const module = moduleInfo[activeModule];

  return (
    <div className="flex-1 flex flex-col bg-background">
      <header className="h-14 border-b border-border flex items-center justify-between px-6">
        <h1 className="font-semibold">{module.title}</h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            const title = prompt("Name your build:");
            if (title) {
              onSaveBuild(title);
              toast.success("Build saved!");
            }
          }}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Build
        </Button>
      </header>

      <ScrollArea className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Welcome to {module.title}</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Describe what you want to create and I'll generate it for you instantly.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                {message.files && message.files.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-xs font-medium mb-2 opacity-70">Generated Files:</p>
                    <div className="flex flex-wrap gap-2">
                      {message.files.map(file => (
                        <span key={file.id} className="text-xs bg-background/50 px-2 py-1 rounded">
                          {file.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="bg-card border border-border rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Generating...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-border bg-card p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={module.placeholder}
              className="resize-none bg-background border-border rounded-xl min-h-[52px] max-h-32"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button 
              onClick={handleSend} 
              size="icon" 
              className="h-[52px] w-[52px] rounded-xl"
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBuilderChat;
