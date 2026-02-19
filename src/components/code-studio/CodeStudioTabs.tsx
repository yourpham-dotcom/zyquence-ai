import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CodeFile } from "@/pages/CodeStudio";

interface Props {
  files: CodeFile[];
  openTabs: string[];
  activeFileId: string;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
}

const CodeStudioTabs = ({ files, openTabs, activeFileId, onTabClick, onTabClose }: Props) => {
  return (
    <div className="flex items-center bg-[#252526] border-b border-[#3c3c3c] overflow-x-auto shrink-0">
      {openTabs.map((tabId) => {
        const file = files.find((f) => f.id === tabId);
        if (!file) return null;
        const isActive = tabId === activeFileId;
        return (
          <div
            key={tabId}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer border-r border-[#3c3c3c] shrink-0 group transition-colors",
              isActive
                ? "bg-[#1e1e1e] text-[#ffffff] border-t-2 border-t-[#007acc]"
                : "bg-[#2d2d2d] text-[#cccccc]/60 hover:bg-[#2a2d2e] border-t-2 border-t-transparent"
            )}
            onClick={() => onTabClick(tabId)}
          >
            <span className="truncate max-w-[120px]">{file.name}</span>
            <button
              className="p-0.5 rounded hover:bg-[#3c3c3c] opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tabId);
              }}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default CodeStudioTabs;
