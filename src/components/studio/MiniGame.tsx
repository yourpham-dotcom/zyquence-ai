import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { GameType } from "@/pages/Studio";

interface MiniGameProps {
  game: GameType;
  onClose: () => void;
  compact?: boolean;
}

const MiniGame = ({ game, onClose, compact = false }: MiniGameProps) => {
  const gameContent = {
    pingpong: {
      title: "🏓 Ping Pong",
      description: "A classic ping pong game to help you focus and relieve stress.",
      color: "from-yellow-500/20 to-orange-500/20",
    },
    basketball: {
      title: "🏀 Basketball Shot",
      description: "Take some shots and get in the zone!",
      color: "from-orange-500/20 to-red-500/20",
    },
    racing: {
      title: "🏎️ Racing Game",
      description: "Hit the track and clear your mind!",
      color: "from-red-500/20 to-pink-500/20",
    },
  };

  const currentGame = game && gameContent[game] ? gameContent[game] : gameContent.pingpong;

  if (compact) {
    return (
      <div className={`h-full bg-gradient-to-br ${currentGame.color} rounded-lg border border-border p-4 flex flex-col`}>
        <div className="mb-4">
          <h3 className="font-semibold text-foreground">{currentGame.title}</h3>
          <p className="text-xs text-muted-foreground">{currentGame.description}</p>
        </div>

        <div className="flex-1 flex items-center justify-center bg-muted/50 rounded-lg border border-border">
          <div className="text-center space-y-3 p-4">
            <div className="text-5xl">{game === "pingpong" ? "🏓" : game === "basketball" ? "🏀" : "🏎️"}</div>
            <p className="text-sm text-muted-foreground">Game coming soon!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className={`w-full max-w-4xl h-[80vh] bg-gradient-to-br ${currentGame.color} rounded-2xl border border-border p-6 flex flex-col`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{currentGame.title}</h2>
            <p className="text-sm text-muted-foreground">{currentGame.description}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center bg-muted/50 rounded-lg border border-border">
          <div className="text-center space-y-4">
            <div className="text-6xl">{game === "pingpong" ? "🏓" : game === "basketball" ? "🏀" : "🏎️"}</div>
            <p className="text-muted-foreground">Game coming soon!</p>
            <p className="text-sm text-muted-foreground max-w-md">
              This mini-game will help you stay focused and relieve stress while working on your projects.
              Full game implementation coming in the next update!
            </p>
            <Button variant="outline" onClick={onClose}>Close Game</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniGame;
