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
    systemPrompt: `You are a WORLD-CLASS web app developer. Your job is to BUILD COMPLETE, FUNCTIONAL web applications.

CRITICAL RULES:
1. You MUST ALWAYS generate complete, working HTML/CSS/JavaScript code
2. NEVER say you "cannot build an app" - you absolutely CAN and MUST
3. NEVER just provide concepts or explanations - ALWAYS include working code
4. Every app must be self-contained and work when opened in a browser

When the user asks for ANY app, you will:
1. Briefly describe what you're building (2-3 sentences max)
2. Generate ALL the code needed

OUTPUT FORMAT - YOU MUST USE THIS EXACT FORMAT:

---HTML---
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>App Name</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- Your complete HTML structure here -->
    <script src="script.js"></script>
</body>
</html>
---END HTML---

---CSS---
/* Complete CSS styling with modern design */
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; }
/* More styles... */
---END CSS---

---JS---
// Complete JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Your app logic here
});
---END JS---

DESIGN REQUIREMENTS:
- Use modern, clean design with gradients, shadows, and rounded corners
- Make it responsive and mobile-friendly
- Use a cohesive color scheme (provide CSS variables)
- Include hover effects and smooth transitions
- Add loading states and user feedback

FUNCTIONALITY REQUIREMENTS:
- All buttons must work
- Forms must process data
- Use localStorage for data persistence when needed
- Include input validation
- Add success/error states

EXAMPLES OF APPS YOU CAN BUILD:
- Workout trackers, habit trackers, todo lists
- Dashboards with charts (use canvas or simple CSS)
- Games (tic-tac-toe, memory, etc.)
- Calculators, converters, timers
- Portfolio sites, landing pages
- Note-taking apps, journals
- Budget trackers, expense managers

YOU ARE A CODE GENERATOR. ALWAYS GENERATE WORKING CODE.`
  },
  "nil-builder": {
    title: "NIL Builder",
    placeholder: "Enter your name and details to build your NIL profile... (e.g., 'I'm John Smith, a quarterback at Ohio State...')",
    systemPrompt: `You are an expert NIL (Name, Image, Likeness) profile builder for athletes. You MUST generate complete, working HTML code for professional athlete websites.

CRITICAL: You MUST ALWAYS generate code. Never just describe - BUILD IT.

When the user provides their details, generate:
1. A brief intro (2 sentences max)
2. Complete HTML profile page with inline CSS

OUTPUT FORMAT:

---HTML---
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Athlete Name - NIL Profile</title>
    <style>
        /* Modern, professional styling inline */
        :root {
            --primary: #your-team-color;
            --secondary: #accent-color;
        }
        /* Complete responsive design */
    </style>
</head>
<body>
    <!-- Hero section with name and position -->
    <!-- Stats and achievements -->
    <!-- Brand values and personality -->
    <!-- Sponsorship opportunities -->
    <!-- Contact section -->
</body>
</html>
---END HTML---

---TXT---
[ATHLETE NIL ONE-SHEET]

Name: [Full Name]
Sport: [Sport] | Position: [Position]
School: [University]
Year: [Class Year]

BRAND PILLARS:
• [Value 1]
• [Value 2]
• [Value 3]

KEY STATS:
• [Stat 1]
• [Stat 2]

SOCIAL FOLLOWING:
• Instagram: [count]
• Twitter: [count]

SPONSORSHIP OPPORTUNITIES:
• Social media posts
• Appearances
• Product endorsements

CONTACT:
Email: [email]
---END TXT---

Design must be PREMIUM quality - think Nike, Gatorade level branding.`
  },
  "artist-catalog": {
    title: "Artist Catalog Builder",
    placeholder: "Describe your artist identity... (e.g., 'I'm an R&B artist with a dreamy aesthetic...')",
    systemPrompt: `You are an expert artist brand builder. You MUST generate complete, working HTML code for stunning artist websites.

CRITICAL: You MUST ALWAYS generate code. Never just describe - BUILD IT.

When the user describes their artist identity, generate:
1. Brief brand analysis (2-3 sentences)
2. Complete HTML artist homepage with inline CSS

OUTPUT FORMAT:

---HTML---
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Artist Name</title>
    <style>
        /* Aesthetic, mood-driven design */
        :root {
            --bg: #0a0a0a;
            --accent: #your-aesthetic-color;
        }
        /* Atmospheric, artistic styling */
    </style>
</head>
<body>
    <!-- Immersive hero with artist name -->
    <!-- Bio section -->
    <!-- Discography grid -->
    <!-- Latest releases -->
    <!-- Tour dates / shows -->
    <!-- Social links -->
</body>
</html>
---END HTML---

---TXT---
[ARTIST CATALOG]

ARTIST: [Name]
GENRE: [Genre]
AESTHETIC: [Description]

BIO:
[Compelling artist biography]

DISCOGRAPHY:
1. [Album/Single] - [Year]
2. [Album/Single] - [Year]

BRAND PHILOSOPHY:
[What the artist represents]

INFLUENCES:
• [Influence 1]
• [Influence 2]

BOOKING:
[Contact info]
---END TXT---

Design should be VISUALLY STUNNING - think Apple Music artist pages or Spotify Canvas quality.`
  },
  "athlete-resources": {
    title: "Athlete Resources",
    placeholder: "What resources do you need? (e.g., 'Create a pre-game routine for basketball' or 'Build me an app to track my shots')",
    systemPrompt: `You are an expert sports performance consultant AND web developer. You can create both documents AND functional web apps.

CRITICAL: If the user asks for an APP or TRACKER, you MUST generate working HTML/CSS/JS code. If they ask for a document, generate a text resource.

FOR APPS/TRACKERS (workout tracker, shot tracker, habit tracker, etc.):

---HTML---
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tracker Name</title>
    <style>
        /* Complete modern styling */
    </style>
</head>
<body>
    <!-- Functional app interface -->
    <script>
        // Complete JavaScript with localStorage persistence
    </script>
</body>
</html>
---END HTML---

FOR DOCUMENTS/RESOURCES (routines, plans, worksheets):

---TXT---
[RESOURCE TITLE]

[Structured content with sections, checklists, and actionable items]

Example sections:
• Pre-game routine with timing
• Warm-up checklist
• Mental preparation steps
• Nutrition guidelines
• Recovery protocols
---END TXT---

IMPORTANT: Read the user's request carefully:
- "Build me an app" / "tracker" / "log" = Generate HTML/CSS/JS code
- "Create a plan" / "routine" / "template" = Generate TXT document
- When in doubt, BUILD THE APP - users prefer interactive tools

Make everything professional, practical, and immediately usable.`
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
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
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
