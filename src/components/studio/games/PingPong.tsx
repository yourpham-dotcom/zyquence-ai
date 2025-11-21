import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface PingPongProps {
  compact?: boolean;
}

const PingPong = ({ compact = false }: PingPongProps) => {
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
      ball: { x: canvas.width / 2, y: canvas.height / 2, radius: 8, dx: 4, dy: -4 },
      paddle: { x: canvas.width / 2 - 40, y: canvas.height - 30, width: 80, height: 10 },
      score: 0,
      running: true,
    };

    gameRef.current = game;

    // Mouse control
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      game.paddle.x = e.clientX - rect.left - game.paddle.width / 2;
      if (game.paddle.x < 0) game.paddle.x = 0;
      if (game.paddle.x + game.paddle.width > canvas.width) {
        game.paddle.x = canvas.width - game.paddle.width;
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    // Game loop
    const gameLoop = () => {
      if (!game.running) return;

      // Clear canvas
      ctx.fillStyle = "hsl(var(--muted))";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw ball
      ctx.beginPath();
      ctx.arc(game.ball.x, game.ball.y, game.ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = "hsl(var(--primary))";
      ctx.fill();
      ctx.closePath();

      // Draw paddle
      ctx.fillStyle = "hsl(var(--primary))";
      ctx.fillRect(game.paddle.x, game.paddle.y, game.paddle.width, game.paddle.height);

      // Move ball
      game.ball.x += game.ball.dx;
      game.ball.y += game.ball.dy;

      // Wall collision
      if (game.ball.x + game.ball.radius > canvas.width || game.ball.x - game.ball.radius < 0) {
        game.ball.dx = -game.ball.dx;
      }
      if (game.ball.y - game.ball.radius < 0) {
        game.ball.dy = -game.ball.dy;
      }

      // Paddle collision
      if (
        game.ball.y + game.ball.radius > game.paddle.y &&
        game.ball.x > game.paddle.x &&
        game.ball.x < game.paddle.x + game.paddle.width
      ) {
        game.ball.dy = -game.ball.dy;
        game.score++;
        setScore(game.score);
      }

      // Game over
      if (game.ball.y + game.ball.radius > canvas.height) {
        game.running = false;
        setGameStarted(false);
      }

      requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      game.running = false;
      canvas.removeEventListener("mousemove", handleMouseMove);
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
        width={compact ? 240 : 400}
        height={compact ? 320 : 500}
        className="border-2 border-border rounded-lg"
      />
      <p className="text-xs text-muted-foreground text-center">
        Move your mouse to control the paddle
      </p>
    </div>
  );
};

export default PingPong;
