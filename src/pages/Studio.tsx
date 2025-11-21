import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Home, MessageSquare, Code, BookOpen, Book, Video, 
  Image, Shield, Database, Palette, Gamepad2, Music 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ChatInterface from "@/components/studio/ChatInterface";
import CodeEditor from "@/components/studio/CodeEditor";
import Journal from "@/components/studio/Journal";
import PythonPractice from "@/components/studio/PythonPractice";
import MediaPlayer from "@/components/studio/MediaPlayer";
import MiniGame from "@/components/studio/MiniGame";
import VideoEditor from "@/components/studio/VideoEditor";
import PhotoStudio from "@/components/studio/PhotoStudio";
import CybersecurityLab from "@/components/studio/CybersecurityLab";
import SQLPractice from "@/components/studio/SQLPractice";
import ArtistStudio from "@/components/studio/ArtistStudio";

export type ToolType = "chat" | "code" | "python" | "journal" | "video" | "photo" | "security" | "sql" | "art";
export type GameType = "pingpong" | "basketball" | "racing" | null;

const Studio = () => {
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState<ToolType>("chat");
  const [activeGame, setActiveGame] = useState<GameType>(null);
  const [showGames, setShowGames] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(64);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = e.clientX;
        if (newWidth >= 64 && newWidth <= 300) {
          setSidebarWidth(newWidth);
        }
      }
    };

    const handleGlobalMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isResizing]);

  const tools = [
    { id: "chat" as ToolType, icon: MessageSquare, label: "AI Chat" },
    { id: "code" as ToolType, icon: Code, label: "Code Editor" },
    { id: "python" as ToolType, icon: BookOpen, label: "Python Practice" },
    { id: "journal" as ToolType, icon: Book, label: "Journal" },
    { id: "video" as ToolType, icon: Video, label: "Video Editor" },
    { id: "photo" as ToolType, icon: Image, label: "Photo Studio" },
    { id: "security" as ToolType, icon: Shield, label: "Cybersecurity Lab" },
    { id: "sql" as ToolType, icon: Database, label: "SQL Practice" },
    { id: "art" as ToolType, icon: Palette, label: "Artist Studio" },
  ];

  const games = [
    { id: "pingpong" as GameType, label: "Ping Pong" },
    { id: "basketball" as GameType, label: "Basketball" },
    { id: "racing" as GameType, label: "Racing" },
  ];

  const renderTool = () => {
    switch (activeTool) {
      case "chat":
        return <ChatInterface />;
      case "code":
        return <CodeEditor />;
      case "python":
        return <PythonPractice />;
      case "journal":
        return <Journal />;
      case "video":
        return <VideoEditor />;
      case "photo":
        return <PhotoStudio />;
      case "security":
        return <CybersecurityLab />;
      case "sql":
        return <SQLPractice />;
      case "art":
        return <ArtistStudio />;
      default:
        return <ChatInterface />;
    }
  };

  return (
    <TooltipProvider>
      <div className="h-screen flex bg-background select-none">
        {/* Left Sidebar */}
        <div 
          className="border-r border-border flex flex-col items-center py-4 gap-2 bg-card transition-all"
          style={{ width: `${sidebarWidth}px` }}
        >
          {/* Home Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="hover:bg-accent"
              >
                <Home className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Home</TooltipContent>
          </Tooltip>

          <div className="w-8 h-px bg-border my-2" />

          {/* Tool Icons */}
          {tools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size={sidebarWidth > 64 ? "default" : "icon"}
                  onClick={() => setActiveTool(tool.id)}
                  className={`${activeTool === tool.id ? "bg-primary text-primary-foreground" : "hover:bg-accent"} ${sidebarWidth > 64 ? "w-full justify-start px-4" : ""}`}
                  style={sidebarWidth > 64 ? { width: `${sidebarWidth - 16}px` } : {}}
                >
                  <tool.icon className="h-5 w-5" />
                  {sidebarWidth > 100 && <span className="ml-2 text-sm">{tool.label}</span>}
                </Button>
              </TooltipTrigger>
              {sidebarWidth <= 100 && <TooltipContent side="right">{tool.label}</TooltipContent>}
            </Tooltip>
          ))}

          <div className="w-8 h-px bg-border my-2" />

          {/* Games Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowGames(!showGames)}
                className={showGames ? "bg-primary text-primary-foreground" : "hover:bg-accent"}
              >
                <Gamepad2 className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Mini Games</TooltipContent>
          </Tooltip>

          {/* Media Player Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="mt-auto hover:bg-accent"
              >
                <Music className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Media Player</TooltipContent>
          </Tooltip>
        </div>

        {/* Resizer Handle */}
        <div 
          className="w-1 bg-border hover:bg-primary cursor-col-resize relative group transition-colors"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-3 flex items-center justify-center">
            <div className="w-1 h-12 rounded-full bg-muted-foreground/20 group-hover:bg-primary/50 transition-colors" />
          </div>
        </div>

        {/* Games Sidebar (collapsible) */}
        {showGames && (
          <div className="w-64 border-r border-border bg-card p-4">
            <h3 className="font-semibold mb-4">Mini Games</h3>
            <div className="space-y-2">
              {games.map((game) => (
                <Button
                  key={game.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveGame(game.id);
                    setShowGames(false);
                  }}
                >
                  {game.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {renderTool()}
          
          {/* Mini Game Overlay */}
          {activeGame && (
            <MiniGame game={activeGame} onClose={() => setActiveGame(null)} />
          )}
        </div>

        {/* Bottom Media Player */}
        <MediaPlayer />
      </div>
    </TooltipProvider>
  );
};

export default Studio;
