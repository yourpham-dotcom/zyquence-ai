import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, MessageSquare, Send, Loader2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const RecruitingProfile = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI recruiting profile builder. I'll help you create a compelling athletic profile for college recruiters. Let's start - what sport do you play?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke("athlete-mental-coach", {
        body: { 
          input: input,
          type: "recruiting_profile",
          conversationHistory: messages
        },
      });

      if (error) throw error;

      const assistantMessage: Message = { 
        role: "assistant", 
        content: data.response 
      };
      setMessages(prev => [...prev, assistantMessage]);

      if (data.profileData) {
        setProfileData(data.profileData);
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      toast({
        title: "Message Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateProfile = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("athlete-mental-coach", {
        body: { 
          type: "generate_recruiting_profile",
          conversationHistory: messages
        },
      });

      if (error) throw error;

      setProfileData(data.profile);
      toast({
        title: "Profile Generated!",
        description: "Your recruiting profile is ready to download",
      });
    } catch (error: any) {
      console.error("Generation error:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 gap-6 bg-background">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">AI Recruiting Profile Builder</h2>
            <p className="text-sm text-muted-foreground">Chat-based profile creation for college recruitment</p>
          </div>
        </div>
        {messages.length > 4 && (
          <Button 
            onClick={handleGenerateProfile}
            disabled={isProcessing}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Profile
          </Button>
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-6 bg-card border-border flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground p-3 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Type your response..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
            <Button 
              onClick={handleSend}
              disabled={isProcessing || !input.trim()}
              size="icon"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Profile Progress</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Personal Info</span>
                <span className="text-foreground font-semibold">
                  {profileData?.personalInfo ? "✓" : "Pending"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Athletic Stats</span>
                <span className="text-foreground font-semibold">
                  {profileData?.stats ? "✓" : "Pending"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Achievements</span>
                <span className="text-foreground font-semibold">
                  {profileData?.achievements ? "✓" : "Pending"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Academic Info</span>
                <span className="text-foreground font-semibold">
                  {profileData?.academic ? "✓" : "Pending"}
                </span>
              </div>
            </div>

            <Card className="p-4 bg-primary/5 border-primary/20">
              <h4 className="font-semibold text-foreground text-sm mb-2">Tips</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Be specific about your achievements</li>
                <li>• Include measurable statistics</li>
                <li>• Mention academic honors</li>
                <li>• Highlight leadership roles</li>
              </ul>
            </Card>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RecruitingProfile;
