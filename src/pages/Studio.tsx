import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Home, MessageSquare, Code, BookOpen, Book, Video, 
  Image, Shield, Database, Palette, Gamepad2, Music, Sparkles 
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
import MusicStudio from "@/components/studio/MusicStudio";
import IdentityStyleIntelligence from "@/components/studio/IdentityStyleIntelligence";

export type ToolType = "chat" | "code" | "python" | "journal" | "video" | "photo" | "security" | "sql" | "art" | "music" | "style";
export type GameType = "pingpong" | "basketball" | "racing" | null;

const Studio = () => {
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState<ToolType>("chat");
  const [activeGame, setActiveGame] = useState<GameType>(null);
  const [showGames, setShowGames] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(64);
  const [isResizing, setIsResizing] = useState(false);
  const [mediaPlayerHeight, setMediaPlayerHeight] = useState(80);
  const [isResizingPlayer, setIsResizingPlayer] = useState(false);

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handlePlayerMouseDown = () => {
    setIsResizingPlayer(true);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = e.clientX;
        if (newWidth >= 64 && newWidth <= 300) {
          setSidebarWidth(newWidth);
        }
      }
      if (isResizingPlayer) {
        const newHeight = window.innerHeight - e.clientY;
        if (newHeight >= 80 && newHeight <= 400) {
          setMediaPlayerHeight(newHeight);
        }
      }
    };

    const handleGlobalMouseUp = () => {
      setIsResizing(false);
      setIsResizingPlayer(false);
    };

    if (isResizing || isResizingPlayer) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isResizing, isResizingPlayer]);

  const tools = [
    { id: "chat" as ToolType, icon: MessageSquare, label: "AI Chat" },
    { id: "code" as ToolType, icon: Code, label: "Code Editor" },
    { id: "python" as ToolType, icon: BookOpen, label: "Python Practice" },
    { id: "journal" as ToolType, icon: Book, label: "Journal" },
    { id: "music" as ToolType, icon: Music, label: "Music Studio" },
    { id: "video" as ToolType, icon: Video, label: "Video Editor" },
    { id: "photo" as ToolType, icon: Image, label: "Photo Studio" },
    { id: "style" as ToolType, icon: Sparkles, label: "Style Intelligence" },
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
      case "music":
        return <MusicStudio />;
      case "video":
        return <VideoEditor />;
      case "photo":
        return <PhotoStudio />;
      case "style":
        return <IdentityStyleIntelligence />;
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
          <div className="w-64 border-r border-border bg-card p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Mini Games</h3>
              {activeGame && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setActiveGame(null)}
                >
                  Back
                </Button>
              )}
            </div>
            
            {!activeGame ? (
              <div className="space-y-2">
                {games.map((game) => (
                  <Button
                    key={game.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveGame(game.id)}
                  >
                    {game.label}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="flex-1 overflow-hidden">
                <MiniGame game={activeGame} onClose={() => setActiveGame(null)} compact />
              </div>
            )}
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            {renderTool()}
          </div>

          {/* Media Player Resizer Handle */}
          <div 
            className="h-1 bg-border hover:bg-primary cursor-row-resize relative group transition-colors"
            onMouseDown={handlePlayerMouseDown}
          >
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-3 flex items-center justify-center">
              <div className="h-1 w-12 rounded-full bg-muted-foreground/20 group-hover:bg-primary/50 transition-colors" />
            </div>
          </div>

          {/* Bottom Media Player */}
          <div style={{ height: `${mediaPlayerHeight}px` }}>
            <MediaPlayer />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Studio;
