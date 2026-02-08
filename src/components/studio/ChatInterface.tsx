import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, User, Loader2, Image as ImageIcon, Download } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
}

const IMAGE_KEYWORDS = [
  "generate an image", "generate image", "create an image", "create image",
  "make an image", "make image", "draw", "design an image", "design image",
  "picture of", "photo of", "illustration of", "artwork of",
  "generate a picture", "create a picture", "make a picture",
  "generate a photo", "create a photo", "make a photo",
  "show me an image", "show me a picture",
  "image of", "visualize", "render",
];

function isImageRequest(text: string): boolean {
  const lower = text.toLowerCase();
  return IMAGE_KEYWORDS.some(kw => lower.includes(kw));
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hello! I'm your Zyquence AI assistant. I can help you with coding, Python practice, journaling, generate images, or answer any questions you have. What would you like to work on today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleImageGeneration = async (prompt: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt, quality: "high" },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const aiResponse: ChatMessage = {
        role: "assistant",
        content: data.caption || "Here's your generated image!",
        imageUrl: data.imageUrl,
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error: any) {
      console.error("Image generation error:", error);
      toast.error(error.message || "Failed to generate image. Please try again.");
    }
  };

  const handleTextChat = async (userInput: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("athlete-mental-coach", {
        body: {
          input: userInput,
          type: "general",
          conversationHistory: messages.filter(m => !m.imageUrl).map(m => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      if (error) throw error;

      const aiResponse: ChatMessage = {
        role: "assistant",
        content: data.response || data.analysis || "I'm sorry, I couldn't generate a response. Please try again.",
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error("Failed to get a response. Please try again.");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    const userMessage: ChatMessage = { role: "user", content: userInput };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    if (isImageRequest(userInput)) {
      await handleImageGeneration(userInput);
    } else {
      await handleTextChat(userInput);
    }

    setIsLoading(false);
  };

  const handleDownloadImage = (imageUrl: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `zyquence-image-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6 py-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
              )}
              <div
                className={`rounded-lg px-4 py-3 max-w-[75%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "glass-bubble text-foreground"
                }`}
              >
                {message.content && (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                )}
                {message.imageUrl && (
                  <div className="mt-2 relative group">
                    <img
                      src={message.imageUrl}
                      alt="AI generated"
                      className="rounded-lg max-w-full w-full object-cover"
                      loading="lazy"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDownloadImage(message.imageUrl!)}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Save
                    </Button>
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
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="glass-bubble text-foreground rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    {messages[messages.length - 1]?.role === "user" && isImageRequest(messages[messages.length - 1].content)
                      ? "Generating image..."
                      : "Thinking..."}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-border bg-card p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='Ask anything or "Generate an image of..."'
                className="resize-none bg-background border-border rounded-xl pr-12 min-h-[52px]"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
            </div>
            <Button
              onClick={handleSend}
              size="icon"
              className="h-[52px] w-[52px] bg-primary hover:bg-primary/90 rounded-xl"
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

export default ChatInterface;
