import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";

const Journal = () => {
  const navigate = useNavigate();
  const [entry, setEntry] = useState("");
  const [mood, setMood] = useState(5);
  const [entries, setEntries] = useState<Array<{date: string, text: string, mood: number}>>([]);

  const saveEntry = () => {
    if (entry.trim()) {
      setEntries([
        { date: new Date().toLocaleDateString(), text: entry, mood },
        ...entries
      ]);
      setEntry("");
      toast.success("Entry saved!");
    }
  };

  const moods = [
    { emoji: "😢", label: "Very Low", value: 1 },
    { emoji: "😔", label: "Low", value: 2 },
    { emoji: "😐", label: "Neutral", value: 3 },
    { emoji: "🙂", label: "Good", value: 4 },
    { emoji: "😊", label: "Great", value: 5 },
  ];

  const prompts = [
    "What made you smile today?",
    "What are you grateful for?",
    "What creative idea inspires you?",
    "What challenge did you overcome?",
    "What do you want to accomplish?",
    "What kindness did you experience?"
  ];

  return (
    <div className="h-screen bg-background overflow-y-auto">
      <div className="container mx-auto p-6 space-y-8 max-w-4xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/gaming-intelligence")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Creative Journal</h1>
          </div>
          <p className="text-muted-foreground">Express yourself, track moods, and reflect</p>
        </div>

        <Tabs defaultValue="write" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="entries">Entries</TabsTrigger>
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
          </TabsList>

          <TabsContent value="write" className="space-y-4 mt-4">
            <Card className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">How are you feeling?</h3>
                <div className="flex gap-2 justify-between">
                  {moods.map((m) => (
                    <Button
                      key={m.value}
                      variant={mood === m.value ? "default" : "outline"}
                      className="flex-1 h-auto flex-col gap-1 py-3"
                      onClick={() => setMood(m.value)}
                    >
                      <span className="text-2xl">{m.emoji}</span>
                      <span className="text-xs">{m.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Your thoughts...</h3>
                <Textarea
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  placeholder="Write about your day, your feelings, your dreams..."
                  className="min-h-[200px]"
                />
              </div>

              <Button onClick={saveEntry} className="w-full">
                <Heart className="w-4 h-4 mr-2" />
                Save Entry
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="entries" className="space-y-4 mt-4">
            {entries.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No entries yet. Start writing!</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {entries.map((e, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline">{e.date}</Badge>
                      <span className="text-2xl">{moods.find(m => m.value === e.mood)?.emoji}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{e.text}</p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="prompts" className="space-y-4 mt-4">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Writing Prompts</h3>
              </div>
              <div className="space-y-2">
                {prompts.map((prompt, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => {
                      setEntry(prompt + "\n\n");
                      toast.success("Prompt added to your entry!");
                    }}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Journal;
