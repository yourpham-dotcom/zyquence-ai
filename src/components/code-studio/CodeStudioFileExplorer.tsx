import { useState, useMemo } from "react";
import {
  FilePlus, FolderPlus, Trash2, Pencil, ChevronRight, ChevronDown,
  FileCode2, FileText, FileJson, Folder, FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CodeFileRecord } from "@/hooks/useCodeProjects";

interface Props {
  files: CodeFileRecord[];
  activeFileId: string | null;
  projectName: string;
  onFileClick: (id: string) => void;
  onCreateFile: (name: string, path: string, isFolder: boolean) => void;
  onRenameFile: (id: string, name: string) => void;
  onDeleteFile: (id: string) => void;
}

const getFileIcon = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["js", "ts", "tsx", "jsx", "py", "java", "cpp", "go", "rs", "rb"].includes(ext))
    return <FileCode2 className="h-3.5 w-3.5 text-[#519aba]" />;
  if (["json"].includes(ext))
    return <FileJson className="h-3.5 w-3.5 text-[#cbcb41]" />;
  if (["html", "htm"].includes(ext))
    return <FileCode2 className="h-3.5 w-3.5 text-[#e37933]" />;
  if (["css", "scss"].includes(ext))
    return <FileCode2 className="h-3.5 w-3.5 text-[#56b6c2]" />;
  return <FileText className="h-3.5 w-3.5 text-[#a9b7c6]" />;
};

interface TreeNode {
  file: CodeFileRecord;
  children: TreeNode[];
}

function buildTree(files: CodeFileRecord[]): TreeNode[] {
  const folders = files.filter((f) => f.is_folder);
  const regularFiles = files.filter((f) => !f.is_folder);

  const rootFolders: TreeNode[] = folders
    .filter((f) => f.path === "/")
    .map((f) => ({
      file: f,
      children: getChildren(f, files),
    }));

  const rootFiles: TreeNode[] = regularFiles
    .filter((f) => f.path === "/")
    .map((f) => ({ file: f, children: [] }));

  return [...rootFolders, ...rootFiles];
}

function getChildren(folder: CodeFileRecord, allFiles: CodeFileRecord[]): TreeNode[] {
  const folderPath = folder.path === "/" ? `/${folder.name}` : `${folder.path}/${folder.name}`;
  const children = allFiles.filter((f) => f.path === folderPath && f.id !== folder.id);
  const childFolders = children.filter((f) => f.is_folder).map((f) => ({
    file: f,
    children: getChildren(f, allFiles),
  }));
  const childFiles = children.filter((f) => !f.is_folder).map((f) => ({
    file: f,
    children: [],
  }));
  return [...childFolders, ...childFiles];
}

const FileItem = ({
  node, depth, activeFileId, expandedFolders, toggleFolder,
  onFileClick, onRenameFile, onDeleteFile,
  renamingId, setRenamingId, renameVal, setRenameVal,
}: {
  node: TreeNode;
  depth: number;
  activeFileId: string | null;
  expandedFolders: Set<string>;
  toggleFolder: (id: string) => void;
  onFileClick: (id: string) => void;
  onRenameFile: (id: string, name: string) => void;
  onDeleteFile: (id: string) => void;
  renamingId: string | null;
  setRenamingId: (id: string | null) => void;
  renameVal: string;
  setRenameVal: (v: string) => void;
}) => {
  const { file } = node;
  const isExpanded = expandedFolders.has(file.id);
  const paddingLeft = 12 + depth * 16;

  const handleRename = () => {
    const name = renameVal.trim();
    if (name) onRenameFile(file.id, name);
    setRenamingId(null);
  };

  return (
    <>
      <div
        className={cn(
          "group flex items-center gap-1.5 py-[3px] pr-2 text-xs cursor-pointer transition-colors",
          !file.is_folder && activeFileId === file.id
            ? "bg-[#37373d] text-white"
            : "text-[#cccccc]/80 hover:bg-[#2a2d2e]"
        )}
        style={{ paddingLeft }}
        onClick={() => {
          if (file.is_folder) toggleFolder(file.id);
          else onFileClick(file.id);
        }}
      >
        {file.is_folder && (
          isExpanded
            ? <ChevronDown className="h-3 w-3 shrink-0" />
            : <ChevronRight className="h-3 w-3 shrink-0" />
        )}
        {file.is_folder
          ? (isExpanded
            ? <FolderOpen className="h-3.5 w-3.5 text-[#dcb67a] shrink-0" />
            : <Folder className="h-3.5 w-3.5 text-[#dcb67a] shrink-0" />)
          : getFileIcon(file.name)
        }

        {renamingId === file.id ? (
          <Input
            autoFocus
            value={renameVal}
            onChange={(e) => setRenameVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") setRenamingId(null);
            }}
            onBlur={handleRename}
            className="h-5 text-xs bg-[#3c3c3c] border-[#007acc] text-[#cccccc] px-1 flex-1"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <>
            <span className="flex-1 truncate">{file.name}</span>
            <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
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

      {file.is_folder && isExpanded && node.children.map((child) => (
        <FileItem
          key={child.file.id}
          node={child}
          depth={depth + 1}
          activeFileId={activeFileId}
          expandedFolders={expandedFolders}
          toggleFolder={toggleFolder}
          onFileClick={onFileClick}
          onRenameFile={onRenameFile}
          onDeleteFile={onDeleteFile}
          renamingId={renamingId}
          setRenamingId={setRenamingId}
          renameVal={renameVal}
          setRenameVal={setRenameVal}
        />
      ))}
    </>
  );
};

const CodeStudioFileExplorer = ({
  files, activeFileId, projectName, onFileClick,
  onCreateFile, onRenameFile, onDeleteFile,
}: Props) => {
  const [expanded, setExpanded] = useState(true);
  const [creating, setCreating] = useState<"file" | "folder" | null>(null);
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const tree = useMemo(() => buildTree(files), [files]);

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreate = () => {
    const name = newName.trim();
    if (name) onCreateFile(name, "/", creating === "folder");
    setNewName("");
    setCreating(null);
  };

  return (
    <div className="w-56 bg-[#252526] border-r border-[#3c3c3c] flex flex-col shrink-0">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-[10px] uppercase tracking-wider text-[#cccccc]/50 font-semibold">Explorer</span>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost" size="icon"
            className="h-5 w-5 text-[#cccccc]/50 hover:bg-[#3c3c3c]"
            onClick={() => setCreating("file")}
            title="New File"
          >
            <FilePlus className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost" size="icon"
            className="h-5 w-5 text-[#cccccc]/50 hover:bg-[#3c3c3c]"
            onClick={() => setCreating("folder")}
            title="New Folder"
          >
            <FolderPlus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <button
        className="flex items-center gap-1 px-3 py-1 text-xs text-[#cccccc]/70 hover:bg-[#2a2d2e] w-full text-left"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        <span className="font-semibold uppercase text-[10px] tracking-wide truncate">{projectName}</span>
      </button>

      {expanded && (
        <div className="flex-1 overflow-y-auto">
          {creating && (
            <div className="px-4 py-1">
              <Input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") setCreating(null);
                }}
                onBlur={handleCreate}
                placeholder={creating === "folder" ? "folder name" : "filename.ext"}
                className="h-6 text-xs bg-[#3c3c3c] border-[#007acc] text-[#cccccc] px-1.5"
              />
            </div>
          )}

          {tree.map((node) => (
            <FileItem
              key={node.file.id}
              node={node}
              depth={0}
              activeFileId={activeFileId}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              onFileClick={onFileClick}
              onRenameFile={onRenameFile}
              onDeleteFile={onDeleteFile}
              renamingId={renamingId}
              setRenamingId={setRenamingId}
              renameVal={renameVal}
              setRenameVal={setRenameVal}
            />
          ))}

          {files.length === 0 && !creating && (
            <div className="px-6 py-4 text-[10px] text-[#cccccc]/30 text-center">
              No files yet. Create one to start.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CodeStudioFileExplorer;
