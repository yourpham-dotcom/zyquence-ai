import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface BasketballProps {
  compact?: boolean;
}

const Basketball = ({ compact = false }: BasketballProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const gameRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current || !gameStarted) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Game state
    const game = {
      ball: { x: canvas.width / 2, y: canvas.height - 50, radius: 15, grabbed: false },
      hoop: { x: canvas.width / 2 - 40, y: 80, width: 80, height: 10 },
      shooting: false,
      velocity: { x: 0, y: 0 },
      gravity: 0.5,
      score: 0,
      running: true,
      startTime: Date.now(),
    };

    gameRef.current = game;

    // Mouse controls
    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const dist = Math.sqrt((mouseX - game.ball.x) ** 2 + (mouseY - game.ball.y) ** 2);
      if (dist < game.ball.radius && !game.shooting) {
        game.ball.grabbed = true;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (game.ball.grabbed) {
        game.ball.grabbed = false;
        game.shooting = true;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        game.velocity.x = (mouseX - game.ball.x) * 0.1;
        game.velocity.y = (mouseY - game.ball.y) * 0.1;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (game.ball.grabbed) {
        const rect = canvas.getBoundingClientRect();
        game.ball.x = e.clientX - rect.left;
        game.ball.y = e.clientY - rect.top;
      }
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);

    // Timer
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - game.startTime) / 1000);
      const remaining = Math.max(0, 30 - elapsed);
      setTimeLeft(remaining);
      if (remaining === 0) {
        game.running = false;
        setGameStarted(false);
      }
    }, 100);

    // Game loop
    const gameLoop = () => {
      if (!game.running) return;

      // Clear canvas
      ctx.fillStyle = "hsl(var(--muted))";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw hoop
      ctx.fillStyle = "hsl(var(--primary))";
      ctx.fillRect(game.hoop.x, game.hoop.y, game.hoop.width, game.hoop.height);
      ctx.strokeStyle = "hsl(var(--primary))";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(game.hoop.x + game.hoop.width / 2, game.hoop.y, 30, 0, Math.PI, true);
      ctx.stroke();

      // Draw ball
      ctx.beginPath();
      ctx.arc(game.ball.x, game.ball.y, game.ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = "hsl(25, 95%, 53%)";
      ctx.fill();
      ctx.strokeStyle = "hsl(0, 0%, 0%)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();

      // Ball physics
      if (game.shooting) {
        game.ball.x += game.velocity.x;
        game.ball.y += game.velocity.y;
        game.velocity.y += game.gravity;

        // Check if scored
        if (
          game.ball.y > game.hoop.y &&
          game.ball.y < game.hoop.y + 30 &&
          game.ball.x > game.hoop.x &&
          game.ball.x < game.hoop.x + game.hoop.width
        ) {
          game.score++;
          setScore(game.score);
          game.shooting = false;
          game.ball.x = canvas.width / 2;
          game.ball.y = canvas.height - 50;
          game.velocity = { x: 0, y: 0 };
        }

        // Reset if out of bounds
        if (game.ball.y > canvas.height + 100) {
          game.shooting = false;
          game.ball.x = canvas.width / 2;
          game.ball.y = canvas.height - 50;
          game.velocity = { x: 0, y: 0 };
        }
      }

      requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      game.running = false;
      clearInterval(timer);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [gameStarted]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameStarted(true);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
      <div className="flex items-center gap-4">
        <div className="text-lg font-bold">Score: {score}</div>
        <div className="text-lg font-bold">Time: {timeLeft}s</div>
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
        Click and drag the ball to shoot
      </p>
    </div>
  );
};

export default Basketball;
