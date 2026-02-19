import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, PanelRightOpen, PanelRightClose, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import CodeStudioFileExplorer from "@/components/code-studio/CodeStudioFileExplorer";
import CodeStudioTabs from "@/components/code-studio/CodeStudioTabs";
import CodeStudioEditor from "@/components/code-studio/CodeStudioEditor";
import CodeStudioAIPanel from "@/components/code-studio/CodeStudioAIPanel";

export interface CodeFile {
  id: string;
  name: string;
  language: string;
  content: string;
}

const DEFAULT_FILES: CodeFile[] = [
  {
    id: "1",
    name: "main.py",
    language: "python",
    content: `# Welcome to Code Studio\n# Start coding here\n\ndef hello():\n    print("Hello from Zyquence!")\n\nif __name__ == "__main__":\n    hello()\n`,
  },
  {
    id: "2",
    name: "index.html",
    language: "html",
    content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>\n`,
  },
  {
    id: "3",
    name: "styles.css",
    language: "css",
    content: `/* Stylesheet */\nbody {\n  font-family: system-ui, sans-serif;\n  background: #0a0a0a;\n  color: #e5e5e5;\n  margin: 0;\n  padding: 2rem;\n}\n`,
  },
];

const getLanguage = (name: string): string => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    py: "python",
    js: "javascript",
    ts: "typescript",
    tsx: "typescript",
    jsx: "javascript",
    html: "html",
    css: "css",
    json: "json",
    md: "markdown",
    sql: "sql",
    java: "java",
    cpp: "cpp",
    c: "c",
    rb: "ruby",
    go: "go",
    rs: "rust",
    sh: "shell",
  };
  return map[ext] ?? "plaintext";
};

const CodeStudio = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<CodeFile[]>(DEFAULT_FILES);
  const [openTabs, setOpenTabs] = useState<string[]>(["1"]);
  const [activeFileId, setActiveFileId] = useState<string>("1");
  const [showAI, setShowAI] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);

  const activeFile = files.find((f) => f.id === activeFileId);

  const openFile = useCallback((id: string) => {
    if (!openTabs.includes(id)) setOpenTabs((prev) => [...prev, id]);
    setActiveFileId(id);
  }, [openTabs]);

  const closeTab = useCallback((id: string) => {
    setOpenTabs((prev) => {
      const next = prev.filter((t) => t !== id);
      if (activeFileId === id && next.length > 0) setActiveFileId(next[next.length - 1]);
      return next;
    });
  }, [activeFileId]);

  const updateFileContent = useCallback((id: string, content: string) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, content } : f)));
  }, []);

  const createFile = useCallback((name: string) => {
    const newFile: CodeFile = {
      id: crypto.randomUUID(),
      name,
      language: getLanguage(name),
      content: "",
    };
    setFiles((prev) => [...prev, newFile]);
    openFile(newFile.id);
  }, [openFile]);

  const renameFile = useCallback((id: string, newName: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: newName, language: getLanguage(newName) } : f))
    );
  }, []);

  const deleteFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setOpenTabs((prev) => prev.filter((t) => t !== id));
    if (activeFileId === id) {
      const remaining = files.filter((f) => f.id !== id);
      if (remaining.length > 0) setActiveFileId(remaining[0].id);
    }
  }, [activeFileId, files]);

  const insertCode = useCallback((code: string) => {
    if (activeFile) {
      updateFileContent(activeFile.id, activeFile.content + "\n" + code);
    }
  }, [activeFile, updateFileContent]);

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-[#cccccc] select-none">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#252526] border-b border-[#3c3c3c] shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-[#cccccc] hover:bg-[#3c3c3c]"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-xs font-medium text-[#cccccc]/80">Code Studio</span>
        <span className="text-[10px] text-[#cccccc]/40">—</span>
        <span className="text-[10px] text-[#cccccc]/50 truncate">{activeFile?.name ?? "No file"}</span>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[#cccccc]/60 hover:bg-[#3c3c3c]"
            onClick={() => setShowTerminal(!showTerminal)}
          >
            <Terminal className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[#cccccc]/60 hover:bg-[#3c3c3c]"
            onClick={() => setShowAI(!showAI)}
          >
            {showAI ? <PanelRightClose className="h-3.5 w-3.5" /> : <PanelRightOpen className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer */}
        <CodeStudioFileExplorer
          files={files}
          activeFileId={activeFileId}
          onFileClick={openFile}
          onCreateFile={createFile}
          onRenameFile={renameFile}
          onDeleteFile={deleteFile}
        />

        {/* Editor area */}
        <div className="flex-1 flex flex-col min-w-0">
          <CodeStudioTabs
            files={files}
            openTabs={openTabs}
            activeFileId={activeFileId}
            onTabClick={setActiveFileId}
            onTabClose={closeTab}
          />
          <div className="flex-1 min-h-0">
            {activeFile ? (
              <CodeStudioEditor
                file={activeFile}
                onChange={(content) => updateFileContent(activeFile.id, content)}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-[#cccccc]/30 text-sm">
                Open a file to start coding
              </div>
            )}
          </div>

          {/* Terminal placeholder */}
          {showTerminal && (
            <div className="h-40 border-t border-[#3c3c3c] bg-[#1e1e1e] flex flex-col shrink-0">
              <div className="flex items-center justify-between px-3 py-1 bg-[#252526] border-b border-[#3c3c3c]">
                <span className="text-[10px] uppercase tracking-wider text-[#cccccc]/50 font-medium">Terminal</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-[#cccccc]/40 hover:bg-[#3c3c3c]"
                  onClick={() => setShowTerminal(false)}
                >
                  ✕
                </Button>
              </div>
              <div className="flex-1 p-3 font-mono text-xs text-[#4ec9b0]">
                <p>$ <span className="text-[#cccccc]/60">Terminal coming soon...</span></p>
                <p className="text-[#cccccc]/30 mt-1">Ready for future integration.</p>
              </div>
            </div>
          )}
        </div>

        {/* AI Assistant Panel */}
        {showAI && (
          <CodeStudioAIPanel
            activeFile={activeFile}
            onInsertCode={insertCode}
            onClose={() => setShowAI(false)}
          />
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-0.5 bg-[#007acc] text-white text-[10px] shrink-0">
        <div className="flex items-center gap-3">
          <span>Zyquence Code Studio</span>
          <span className="opacity-70">{activeFile?.language ?? ""}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="opacity-70">UTF-8</span>
          <span className="opacity-70">Spaces: 2</span>
        </div>
      </div>
    </div>
  );
};

export default CodeStudio;
