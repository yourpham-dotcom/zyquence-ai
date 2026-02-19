import { useState } from "react";
import { X, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OutputLine {
  type: "log" | "error" | "warn" | "info" | "result";
  content: string;
  timestamp: number;
}

interface Props {
  onClose: () => void;
  code: string;
  language: string;
}

const CodeStudioOutput = ({ onClose, code, language }: Props) => {
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [running, setRunning] = useState(false);

  const runCode = () => {
    setOutput([]);
    setRunning(true);

    if (!["javascript", "typescript"].includes(language)) {
      setOutput([{
        type: "warn",
        content: `⚠ Only JavaScript/TypeScript can be run in the browser. "${language}" requires a backend runtime (coming soon).`,
        timestamp: Date.now(),
      }]);
      setRunning(false);
      return;
    }

    const lines: OutputLine[] = [];
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    const capture = (type: OutputLine["type"]) => (...args: unknown[]) => {
      lines.push({
        type,
        content: args.map((a) => {
          if (typeof a === "object") {
            try { return JSON.stringify(a, null, 2); } catch { return String(a); }
          }
          return String(a);
        }).join(" "),
        timestamp: Date.now(),
      });
    };

    console.log = capture("log");
    console.error = capture("error");
    console.warn = capture("warn");
    console.info = capture("info");

    try {
      // Strip TypeScript type annotations for basic execution
      let execCode = code;
      if (language === "typescript") {
        execCode = code
          .replace(/:\s*\w+(\[\])?\s*=/g, " =")
          .replace(/:\s*\w+(\[\])?\s*\)/g, ")")
          .replace(/:\s*\w+(\[\])?\s*,/g, ",")
          .replace(/:\s*\w+(\[\])?\s*{/g, " {")
          .replace(/<\w+>/g, "")
          .replace(/\binterface\s+\w+\s*{[^}]*}/g, "")
          .replace(/\btype\s+\w+\s*=\s*[^;]+;/g, "");
      }

      const result = new Function(execCode)();
      if (result !== undefined) {
        lines.push({
          type: "result",
          content: typeof result === "object" ? JSON.stringify(result, null, 2) : String(result),
          timestamp: Date.now(),
        });
      }
    } catch (e) {
      lines.push({
        type: "error",
        content: e instanceof Error ? `${e.name}: ${e.message}` : String(e),
        timestamp: Date.now(),
      });
    }

    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
    console.info = originalInfo;

    if (lines.length === 0) {
      lines.push({ type: "info", content: "✓ Code executed successfully (no output)", timestamp: Date.now() });
    }

    setOutput(lines);
    setRunning(false);
  };

  const colorMap: Record<OutputLine["type"], string> = {
    log: "text-[#cccccc]",
    error: "text-[#f14c4c]",
    warn: "text-[#cca700]",
    info: "text-[#3794ff]",
    result: "text-[#4ec9b0]",
  };

  return (
    <div className="h-48 border-t border-[#3c3c3c] bg-[#1e1e1e] flex flex-col shrink-0">
      <div className="flex items-center justify-between px-3 py-1 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-[#cccccc]/50 font-medium">Output</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost" size="icon"
            className="h-5 w-5 text-[#4ec9b0] hover:bg-[#3c3c3c]"
            onClick={runCode}
            disabled={running}
            title="Run code"
          >
            <Play className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost" size="icon"
            className="h-5 w-5 text-[#cccccc]/40 hover:bg-[#3c3c3c]"
            onClick={() => setOutput([])}
            title="Clear output"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost" size="icon"
            className="h-5 w-5 text-[#cccccc]/40 hover:bg-[#3c3c3c]"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 p-3 font-mono text-xs">
        {output.length === 0 ? (
          <p className="text-[#cccccc]/30">Click ▶ Run to execute your code...</p>
        ) : (
          output.map((line, i) => (
            <div key={i} className={`${colorMap[line.type]} mb-0.5`}>
              <span className="text-[#555] mr-2">[{line.type}]</span>
              <pre className="inline whitespace-pre-wrap">{line.content}</pre>
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  );
};

export default CodeStudioOutput;
