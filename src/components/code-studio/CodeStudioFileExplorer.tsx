import { useState } from "react";
import { FilePlus, Trash2, Pencil, ChevronRight, ChevronDown, FileCode2, FileText, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CodeFile } from "@/pages/CodeStudio";

interface Props {
  files: CodeFile[];
  activeFileId: string;
  onFileClick: (id: string) => void;
  onCreateFile: (name: string) => void;
  onRenameFile: (id: string, name: string) => void;
  onDeleteFile: (id: string) => void;
}

const getFileIcon = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["js", "ts", "tsx", "jsx", "py", "java", "cpp", "go", "rs", "rb"].includes(ext))
    return <FileCode2 className="h-3.5 w-3.5 text-[#519aba]" />;
  if (["json"].includes(ext))
    return <FileJson className="h-3.5 w-3.5 text-[#cbcb41]" />;
  return <FileText className="h-3.5 w-3.5 text-[#a9b7c6]" />;
};

const CodeStudioFileExplorer = ({
  files,
  activeFileId,
  onFileClick,
  onCreateFile,
  onRenameFile,
  onDeleteFile,
}: Props) => {
  const [expanded, setExpanded] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");

  const handleCreate = () => {
    const name = newName.trim();
    if (name) {
      onCreateFile(name);
      setNewName("");
    }
    setCreating(false);
  };

  const handleRename = (id: string) => {
    const name = renameVal.trim();
    if (name) onRenameFile(id, name);
    setRenamingId(null);
  };

  return (
    <div className="w-56 bg-[#252526] border-r border-[#3c3c3c] flex flex-col shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-[10px] uppercase tracking-wider text-[#cccccc]/50 font-semibold">Explorer</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-[#cccccc]/50 hover:bg-[#3c3c3c]"
          onClick={() => setCreating(true)}
        >
          <FilePlus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Project folder */}
      <button
        className="flex items-center gap-1 px-3 py-1 text-xs text-[#cccccc]/70 hover:bg-[#2a2d2e] w-full text-left"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        <span className="font-semibold uppercase text-[10px] tracking-wide">Project</span>
      </button>

      {/* File list */}
      {expanded && (
        <div className="flex-1 overflow-y-auto">
          {creating && (
            <div className="px-6 py-1">
              <Input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") setCreating(false);
                }}
                onBlur={handleCreate}
                placeholder="filename.ext"
                className="h-6 text-xs bg-[#3c3c3c] border-[#007acc] text-[#cccccc] px-1.5"
              />
            </div>
          )}

          {files.map((file) => (
            <div
              key={file.id}
              className={cn(
                "group flex items-center gap-2 px-6 py-[5px] text-xs cursor-pointer transition-colors",
                activeFileId === file.id
                  ? "bg-[#37373d] text-[#ffffff]"
                  : "text-[#cccccc]/80 hover:bg-[#2a2d2e]"
              )}
              onClick={() => onFileClick(file.id)}
            >
              {renamingId === file.id ? (
                <Input
                  autoFocus
                  value={renameVal}
                  onChange={(e) => setRenameVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename(file.id);
                    if (e.key === "Escape") setRenamingId(null);
                  }}
                  onBlur={() => handleRename(file.id)}
                  className="h-5 text-xs bg-[#3c3c3c] border-[#007acc] text-[#cccccc] px-1"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  {getFileIcon(file.name)}
                  <span className="flex-1 truncate">{file.name}</span>
                  <div className="hidden group-hover:flex items-center gap-0.5">
                    <button
                      className="p-0.5 hover:bg-[#3c3c3c] rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenamingId(file.id);
                        setRenameVal(file.name);
                      }}
                    >
                      <Pencil className="h-3 w-3 text-[#cccccc]/50" />
                    </button>
                    <button
                      className="p-0.5 hover:bg-[#3c3c3c] rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFile(file.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-[#f14c4c]" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CodeStudioFileExplorer;
