import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GameType } from "@/pages/Studio";

interface StudioSidebarProps {
  activeGame: GameType;
  setActiveGame: (game: GameType) => void;
}

const StudioSidebar = ({ activeGame, setActiveGame }: StudioSidebarProps) => {
  const games = [
    { id: "pingpong" as GameType, emoji: "🏓", name: "Ping Pong" },
    { id: "basketball" as GameType, emoji: "🏀", name: "Basketball" },
    { id: "racing" as GameType, emoji: "🏎️", name: "Racing" },
  ];

  return (
    <div className="w-20 bg-muted/50 border-r border-border flex flex-col items-center py-4 gap-4">
      {games.map((game) => (
        <Tooltip key={game.id}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`w-14 h-14 text-3xl rounded-xl transition-all ${
                activeGame === game.id
                  ? "bg-cyber-blue/20 ring-2 ring-cyber-blue"
                  : "hover:bg-muted"
              }`}
              onClick={() => setActiveGame(game.id)}
            >
              {game.emoji}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{game.name}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

export default StudioSidebar;
