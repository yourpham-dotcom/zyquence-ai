import { useState } from "react";
import { Plus, Trash2, FolderKanban, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CodeProject } from "@/hooks/useCodeProjects";

interface Props {
  projects: CodeProject[];
  activeProject: CodeProject | null;
  onSelectProject: (p: CodeProject) => void;
  onCreateProject: (name: string) => void;
  onDeleteProject: (id: string) => void;
}

const CodeStudioProjectSwitcher = ({
  projects, activeProject, onSelectProject, onCreateProject, onDeleteProject,
}: Props) => {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const handleCreate = () => {
    const trimmed = name.trim();
    if (trimmed) {
      onCreateProject(trimmed);
      setName("");
    }
    setCreating(false);
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-7 text-xs text-[#cccccc]/80 hover:bg-[#3c3c3c] gap-1.5 px-2"
          >
            <FolderKanban className="h-3.5 w-3.5 text-[#007acc]" />
            <span className="max-w-[150px] truncate">{activeProject?.name ?? "No project"}</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-64 bg-[#252526] border-[#3c3c3c] text-[#cccccc]"
        >
          {projects.map((p) => (
            <DropdownMenuItem
              key={p.id}
              className="text-xs flex items-center justify-between hover:bg-[#37373d] focus:bg-[#37373d]"
              onClick={() => onSelectProject(p)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FolderKanban className="h-3.5 w-3.5 text-[#007acc] shrink-0" />
                <span className="truncate">{p.name}</span>
              </div>
              <button
                className="p-1 hover:bg-[#4c4c4c] rounded shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteProject(p.id);
                }}
              >
                <Trash2 className="h-3 w-3 text-[#f14c4c]" />
              </button>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator className="bg-[#3c3c3c]" />

          {creating ? (
            <div className="p-2">
              <Input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") setCreating(false);
                }}
                onBlur={handleCreate}
                placeholder="Project name..."
                className="h-7 text-xs bg-[#3c3c3c] border-[#007acc] text-[#cccccc] px-2"
              />
            </div>
          ) : (
            <DropdownMenuItem
              className="text-xs text-[#007acc] hover:bg-[#37373d] focus:bg-[#37373d] gap-2"
              onClick={() => setCreating(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              New Project
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CodeStudioProjectSwitcher;
