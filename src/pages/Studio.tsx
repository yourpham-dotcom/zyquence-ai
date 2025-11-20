import { useState } from "react";
import StudioSidebar from "@/components/studio/StudioSidebar";
import ChatInterface from "@/components/studio/ChatInterface";
import CodeEditor from "@/components/studio/CodeEditor";
import Journal from "@/components/studio/Journal";
import PythonPractice from "@/components/studio/PythonPractice";
import MediaPlayer from "@/components/studio/MediaPlayer";
import MiniGame from "@/components/studio/MiniGame";

export type ToolType = "chat" | "code" | "python" | "journal";
export type GameType = "pingpong" | "basketball" | "racing" | null;

const Studio = () => {
  const [activeTool, setActiveTool] = useState<ToolType>("chat");
  const [activeGame, setActiveGame] = useState<GameType>(null);

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
      default:
        return <ChatInterface />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-6">
        <h1 className="text-xl font-bold text-foreground">Zyquence Creative Studio</h1>
        <select 
          value={activeTool}
          onChange={(e) => setActiveTool(e.target.value as ToolType)}
          className="bg-muted text-foreground px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-cyber-blue"
        >
          <option value="chat">AI Chat</option>
          <option value="code">Code Editor</option>
          <option value="python">Python Practice</option>
          <option value="journal">Journal</option>
        </select>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar with Mini Games */}
        <StudioSidebar activeGame={activeGame} setActiveGame={setActiveGame} />

        {/* Main Content Area */}
        <div className="flex-1 relative">
          {renderTool()}
          
          {/* Mini Game Overlay */}
          {activeGame && (
            <MiniGame game={activeGame} onClose={() => setActiveGame(null)} />
          )}
        </div>
      </div>

      {/* Bottom Media Player */}
      <MediaPlayer />
    </div>
  );
};

export default Studio;
