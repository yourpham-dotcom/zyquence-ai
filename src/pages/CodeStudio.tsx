import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, PanelRightOpen, PanelRightClose, Play,
  Terminal, GitBranch, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CodeStudioFileExplorer from "@/components/code-studio/CodeStudioFileExplorer";
import CodeStudioTabs from "@/components/code-studio/CodeStudioTabs";
import CodeStudioEditor from "@/components/code-studio/CodeStudioEditor";
import CodeStudioAIPanel from "@/components/code-studio/CodeStudioAIPanel";
import CodeStudioOutput from "@/components/code-studio/CodeStudioOutput";
import CodeStudioProjectSwitcher from "@/components/code-studio/CodeStudioProjectSwitcher";
import { useCodeProjects } from "@/hooks/useCodeProjects";
import { useAuth } from "@/hooks/useAuth";

const CodeStudio = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const {
    projects, activeProject, setActiveProject, files, loading,
    createProject, deleteProject, createFile, renameFile, deleteFile, updateFileContent,
  } = useCodeProjects();

  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  // Auto-open first file when project files load
  useEffect(() => {
    const firstFile = files.find((f) => !f.is_folder);
    if (firstFile && openTabs.length === 0) {
      setOpenTabs([firstFile.id]);
      setActiveFileId(firstFile.id);
    }
  }, [files]);

  // Reset tabs when project switches
  useEffect(() => {
    setOpenTabs([]);
    setActiveFileId(null);
  }, [activeProject?.id]);

  const activeFile = files.find((f) => f.id === activeFileId);

  const openFile = useCallback((id: string) => {
    if (!openTabs.includes(id)) setOpenTabs((prev) => [...prev, id]);
    setActiveFileId(id);
  }, [openTabs]);

  const closeTab = useCallback((id: string) => {
    setOpenTabs((prev) => {
      const next = prev.filter((t) => t !== id);
      if (activeFileId === id && next.length > 0) setActiveFileId(next[next.length - 1]);
      else if (next.length === 0) setActiveFileId(null);
      return next;
    });
  }, [activeFileId]);

  const handleCreateFile = useCallback(async (name: string, path: string, isFolder: boolean) => {
    const file = await createFile(name, path, isFolder);
    if (file && !file.is_folder) openFile(file.id);
  }, [createFile, openFile]);

  const insertCode = useCallback((code: string) => {
    if (activeFile) {
      updateFileContent(activeFile.id, activeFile.content + "\n" + code);
    }
  }, [activeFile, updateFileContent]);

  // Auto-create first project if none exist and user is logged in
  useEffect(() => {
    if (!loading && projects.length === 0 && session?.user) {
      createProject("My First Project");
    }
  }, [loading, projects.length, session?.user]);

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1e1e1e] text-[#cccccc]">
        <div className="text-center space-y-4">
          <p className="text-sm">Sign in to use Code Studio</p>
          <Button onClick={() => navigate("/auth")} className="bg-[#007acc] hover:bg-[#005a9e]">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1e1e1e] text-[#cccccc]">
        <Loader2 className="h-6 w-6 animate-spin text-[#007acc]" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-[#cccccc] select-none">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#252526] border-b border-[#3c3c3c] shrink-0">
        <Button
          variant="ghost" size="icon"
          className="h-7 w-7 text-[#cccccc] hover:bg-[#3c3c3c]"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <span className="text-xs font-medium text-[#cccccc]/80">Code Studio</span>
        <span className="text-[10px] text-[#cccccc]/40">—</span>

        <CodeStudioProjectSwitcher
          projects={projects}
          activeProject={activeProject}
          onSelectProject={setActiveProject}
          onCreateProject={createProject}
          onDeleteProject={deleteProject}
        />

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost" size="sm"
            className="h-7 text-xs text-[#4ec9b0] hover:bg-[#3c3c3c] gap-1.5 px-2"
            onClick={() => setShowOutput(true)}
          >
            <Play className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Run</span>
          </Button>

          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 text-[#cccccc]/40 hover:bg-[#3c3c3c]"
            title="GitHub (coming soon)"
            disabled
          >
            <GitBranch className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost" size="icon"
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
          projectName={activeProject?.name ?? "Project"}
          onFileClick={openFile}
          onCreateFile={handleCreateFile}
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
              <div className="h-full flex flex-col items-center justify-center text-[#cccccc]/20 gap-2">
                <Terminal className="h-12 w-12" />
                <p className="text-sm">Open a file to start coding</p>
                <p className="text-[10px] text-[#cccccc]/15">Files auto-save as you type</p>
              </div>
            )}
          </div>

          {/* Output panel */}
          {showOutput && (
            <CodeStudioOutput
              onClose={() => setShowOutput(false)}
              code={activeFile?.content ?? ""}
              language={activeFile?.language ?? "plaintext"}
            />
          )}
        </div>

        {/* AI Assistant Panel */}
        {showAI && (
          <CodeStudioAIPanel
            activeFile={activeFile}
            allFiles={files}
            projectName={activeProject?.name ?? ""}
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
          <span className="opacity-50">Auto-save enabled</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="opacity-70">{activeFile ? `${activeFile.path}/${activeFile.name}` : ""}</span>
          <span className="opacity-70">UTF-8</span>
          <span className="opacity-70">Spaces: 2</span>
        </div>
      </div>
    </div>
  );
};

export default CodeStudio;
