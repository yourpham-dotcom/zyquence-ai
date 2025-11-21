import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface RacingProps {
  compact?: boolean;
}

const Racing = ({ compact = false }: RacingProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const gameRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current || !gameStarted) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Game state
    const game = {
      car: { x: canvas.width / 2 - 20, y: canvas.height - 80, width: 40, height: 60, speed: 5 },
      obstacles: [] as Array<{ x: number; y: number; width: number; height: number }>,
      score: 0,
      running: true,
      keys: { left: false, right: false },
    };

    gameRef.current = game;

    // Create initial obstacles
    for (let i = 0; i < 3; i++) {
      game.obstacles.push({
        x: Math.random() * (canvas.width - 40),
        y: -100 - i * 200,
        width: 40,
        height: 60,
      });
    }

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") game.keys.left = true;
      if (e.key === "ArrowRight") game.keys.right = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") game.keys.left = false;
      if (e.key === "ArrowRight") game.keys.right = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Game loop
    const gameLoop = () => {
      if (!game.running) return;

      // Clear canvas
      ctx.fillStyle = "hsl(var(--muted))";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw road lines
      ctx.strokeStyle = "hsl(var(--border))";
      ctx.lineWidth = 4;
      ctx.setLineDash([20, 20]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Move car
      if (game.keys.left && game.car.x > 0) {
        game.car.x -= game.car.speed;
      }
      if (game.keys.right && game.car.x + game.car.width < canvas.width) {
        game.car.x += game.car.speed;
      }

      // Draw player car
      ctx.fillStyle = "hsl(var(--primary))";
      ctx.fillRect(game.car.x, game.car.y, game.car.width, game.car.height);
      ctx.fillStyle = "hsl(var(--background))";
      ctx.fillRect(game.car.x + 5, game.car.y + 10, 10, 15);
      ctx.fillRect(game.car.x + 25, game.car.y + 10, 10, 15);

      // Move and draw obstacles
      game.obstacles.forEach((obstacle, index) => {
        obstacle.y += 5;

        // Draw obstacle
        ctx.fillStyle = "hsl(var(--destructive))";
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        ctx.fillStyle = "hsl(var(--background))";
        ctx.fillRect(obstacle.x + 5, obstacle.y + 10, 10, 15);
        ctx.fillRect(obstacle.x + 25, obstacle.y + 10, 10, 15);

        // Check collision
        if (
          game.car.x < obstacle.x + obstacle.width &&
          game.car.x + game.car.width > obstacle.x &&
          game.car.y < obstacle.y + obstacle.height &&
          game.car.y + game.car.height > obstacle.y
        ) {
          game.running = false;
          setGameStarted(false);
        }

        // Reset obstacle and increase score
        if (obstacle.y > canvas.height) {
          obstacle.y = -100;
          obstacle.x = Math.random() * (canvas.width - 40);
          game.score++;
          setScore(game.score);
        }
      });

      requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      game.running = false;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameStarted]);

  const startGame = () => {
    setScore(0);
    setGameStarted(true);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
      <div className="flex items-center gap-4">
        <div className="text-2xl font-bold">Score: {score}</div>
        {!gameStarted && (
          <Button onClick={startGame} className="bg-primary hover:bg-primary/90">
            {score > 0 ? "Play Again" : "Start Game"}
          </Button>
        )}
      </div>
      <canvas
        ref={canvasRef}
        width={compact ? 240 : 300}
        height={compact ? 320 : 500}
        className="border-2 border-border rounded-lg"
      />
      <p className="text-xs text-muted-foreground text-center">
        Use Arrow Keys to move left/right
      </p>
    </div>
  );
};

export default Racing;
