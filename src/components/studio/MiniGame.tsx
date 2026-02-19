import { Button } from "@/components/ui/button";
import { GameType } from "@/pages/Studio";
import PingPong from "./games/PingPong";
import Basketball from "./games/Basketball";
import Racing from "./games/Racing";
import Golf from "./games/Golf";

interface MiniGameProps {
  game: GameType;
  onClose: () => void;
  compact?: boolean;
}

const MiniGame = ({ game, onClose, compact = false }: MiniGameProps) => {
  const renderGame = () => {
    switch (game) {
      case "pingpong":
        return <PingPong compact={compact} />;
      case "basketball":
        return <Basketball compact={compact} />;
      case "racing":
        return <Racing compact={compact} />;
      case "golf":
        return <Golf compact={compact} />;
      default:
        return null;
    }
  };

  if (compact) {
    return (
      <div className="h-full flex flex-col">
        {renderGame()}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-card rounded-2xl border border-border p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            {game === "pingpong" ? "🏓 Ping Pong" : game === "basketball" ? "🏀 Basketball" : game === "golf" ? "⛳ Golf" : "🏎️ Racing"}
          </h2>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        {renderGame()}
      </div>
    </div>
  );
};

export default MiniGame;
