import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Save, Download } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const CodeEditor = () => {
  const { toast } = useToast();
  const [code, setCode] = useState(`# Welcome to Zyquence Code Editor
# Write your code here and run it!

def greet(name):
    return f"Hello, {name}! Welcome to Zyquence!"

print(greet("Creator"))`);
  const [output, setOutput] = useState("");

  const runCode = () => {
    setOutput("Running code...\nHello, Creator! Welcome to Zyquence!\n\nCode executed successfully! ✓");
    toast({
      title: "Code Executed",
      description: "Your code ran successfully!",
    });
  };

  const saveCode = () => {
    localStorage.setItem("zyquence-code", code);
    toast({
      title: "Code Saved",
      description: "Your code has been saved locally.",
    });
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "zyquence-code.py";
    a.click();
    toast({
      title: "Downloaded",
      description: "Code downloaded as Python file.",
    });
  };

  return (
    <div className="h-full flex flex-col p-6 gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Code Editor</h2>
        <div className="flex gap-2">
          <Button onClick={saveCode} variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button onClick={downloadCode} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button onClick={runCode} size="sm" className="bg-cyber-blue hover:bg-cyber-blue/90">
            <Play className="w-4 h-4 mr-2" />
            Run
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-muted-foreground">Code</label>
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 font-mono text-sm bg-muted border-border resize-none"
            placeholder="Write your code here..."
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-muted-foreground">Output</label>
          <div className="flex-1 p-4 bg-muted border border-border rounded-lg font-mono text-sm whitespace-pre-wrap overflow-auto">
            {output || "Output will appear here..."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
