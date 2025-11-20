import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Save, Plus, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
}

const Journal = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: "1",
      title: "My First Day at Zyquence",
      content: "Today I started exploring the Zyquence Creative Studio. It's amazing how I can code, practice Python, and journal all in one place!",
      date: new Date().toLocaleDateString(),
    },
  ]);
  const [currentEntry, setCurrentEntry] = useState<JournalEntry>({
    id: "",
    title: "",
    content: "",
    date: new Date().toLocaleDateString(),
  });

  const saveEntry = () => {
    if (!currentEntry.title.trim() || !currentEntry.content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please add a title and content to your entry.",
        variant: "destructive",
      });
      return;
    }

    const newEntry = {
      ...currentEntry,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
    };

    setEntries([newEntry, ...entries]);
    setCurrentEntry({ id: "", title: "", content: "", date: new Date().toLocaleDateString() });
    
    toast({
      title: "Entry Saved",
      description: "Your journal entry has been saved successfully.",
    });
  };

  const newEntry = () => {
    setCurrentEntry({ id: "", title: "", content: "", date: new Date().toLocaleDateString() });
  };

  return (
    <div className="h-full flex flex-col p-6 gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Personal Journal</h2>
        <div className="flex gap-2">
          <Button onClick={newEntry} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </Button>
          <Button onClick={saveEntry} size="sm" className="bg-cyber-blue hover:bg-cyber-blue/90">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
        {/* New Entry Editor */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Input
            value={currentEntry.title}
            onChange={(e) => setCurrentEntry({ ...currentEntry, title: e.target.value })}
            placeholder="Entry Title..."
            className="text-lg font-semibold bg-muted border-border"
          />
          <Textarea
            value={currentEntry.content}
            onChange={(e) => setCurrentEntry({ ...currentEntry, content: e.target.value })}
            placeholder="Write your thoughts here... Use this space to reflect on your day, track your goals, or brainstorm ideas."
            className="flex-1 resize-none bg-muted border-border"
          />
        </div>

        {/* Previous Entries */}
        <div className="flex flex-col gap-2 overflow-auto">
          <h3 className="text-sm font-medium text-muted-foreground">Previous Entries</h3>
          {entries.map((entry) => (
            <Card
              key={entry.id}
              className="cursor-pointer hover:bg-muted/50 transition-all"
              onClick={() => setCurrentEntry(entry)}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-sm">{entry.title}</CardTitle>
                <CardDescription className="text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {entry.date}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {entry.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Journal;
