import { 
  Smartphone, 
  Star, 
  Music, 
  Dumbbell, 
  FolderOpen,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ModuleType } from "@/pages/AIBuilderHub";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface AIBuilderSidebarProps {
  activeModule: ModuleType;
  onModuleChange: (module: ModuleType) => void;
  onShowMyBuilds: () => void;
  showMyBuilds: boolean;
}

const modules = [
  { 
    id: "app-builder" as ModuleType, 
    label: "App Builder", 
    icon: Smartphone,
    gradient: "from-blue-500 to-cyan-500"
  },
  { 
    id: "nil-builder" as ModuleType, 
    label: "NIL Builder", 
    icon: Star,
    gradient: "from-purple-500 to-pink-500"
  },
  { 
    id: "artist-catalog" as ModuleType, 
    label: "Artist Catalog", 
    icon: Music,
    gradient: "from-orange-500 to-red-500"
  },
  { 
    id: "athlete-resources" as ModuleType, 
    label: "Athlete Resources", 
    icon: Dumbbell,
    gradient: "from-green-500 to-emerald-500"
  },
];

const AIBuilderSidebar = ({ 
  activeModule, 
  onModuleChange, 
  onShowMyBuilds,
  showMyBuilds 
}: AIBuilderSidebarProps) => {
  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">AI Builder Hub</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-2">
          Modules
        </p>
        
        {modules.map((module) => (
          <button
            key={module.id}
            onClick={() => onModuleChange(module.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200",
              activeModule === module.id && !showMyBuilds
                ? "bg-primary/10 text-primary border border-primary/20"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br",
              module.gradient
            )}>
              <module.icon className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium text-sm">{module.label}</span>
          </button>
        ))}

        <div className="pt-4 mt-4 border-t border-border">
          <button
            onClick={onShowMyBuilds}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200",
              showMyBuilds
                ? "bg-primary/10 text-primary border border-primary/20"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-slate-500 to-slate-700">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium text-sm">My Builds</span>
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        <Button variant="outline" className="w-full" asChild>
          <Link to="/">← Back to Home</Link>
        </Button>
      </div>
    </aside>
  );
};

export default AIBuilderSidebar;
