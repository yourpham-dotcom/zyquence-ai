import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import MiniGame from "@/components/studio/MiniGame";
import { GameType } from "@/pages/Studio";

const MiniGames = () => {
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);

  const games = [
    {
      id: "basketball" as GameType,
      title: "🏀 Basketball",
      description: "Shoot hoops and score points!",
      color: "from-orange-500 to-red-500"
    },
    {
      id: "racing" as GameType,
      title: "🏎️ Racing",
      description: "Dodge cars and collect points!",
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: "pingpong" as GameType,
      title: "🏓 Ping Pong",
      description: "Keep the ball bouncing!",
      color: "from-green-500 to-emerald-500"
    },
    {
      id: "golf" as GameType,
      title: "⛳ Golf",
      description: "Hit targets on the driving range!",
      color: "from-emerald-500 to-teal-500"
    }
  ];

  if (selectedGame) {
    return (
      <div className="h-screen bg-background">
        <div className="p-4">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedGame(null)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Games
          </Button>
        </div>
        <MiniGame game={selectedGame} onClose={() => setSelectedGame(null)} />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background overflow-y-auto">
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/gaming-intelligence")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Mini Games</h1>
          <p className="text-muted-foreground">Choose a game to play and have fun!</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Card 
              key={game.id} 
              className="group cursor-pointer hover:border-primary/50 transition-all"
              onClick={() => setSelectedGame(game.id)}
            >
              <div className="p-6 space-y-4">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-4xl group-hover:scale-110 transition-transform`}>
                  {game.title.split(" ")[0]}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{game.title}</h3>
                  <p className="text-muted-foreground text-sm">{game.description}</p>
                </div>
                <Button variant="ghost" className="w-full group-hover:bg-muted">
                  Play Now →
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MiniGames;
