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

    // Click to shoot
    const handleClick = (e: MouseEvent) => {
      if (game.shooting) return;

      const hoopCenterX = game.hoop.x + game.hoop.width / 2;
      const hoopY = game.hoop.y + 12;
      const dx = hoopCenterX - game.ball.x;
      const dy = hoopY - game.ball.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const spread = (Math.random() - 0.5) * 2;
      const power = 0.85 + Math.random() * 0.15;

      game.velocity.x = (dx / dist) * 8 * power + spread;
      game.velocity.y = (dy / dist) * 8 * power - 3;
      game.shooting = true;
    };

    canvas.addEventListener("click", handleClick);

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

      // Draw backboard
      const hoopCenterX = game.hoop.x + game.hoop.width / 2;
      const hoopY = game.hoop.y;
      const backboardWidth = 90;
      const backboardHeight = 60;
      
      // Backboard glow
      ctx.shadowColor = "rgba(255, 120, 30, 0.5)";
      ctx.shadowBlur = 15;
      ctx.strokeStyle = "#ff7830";
      ctx.lineWidth = 3;
      ctx.strokeRect(hoopCenterX - backboardWidth / 2, hoopY - backboardHeight + 10, backboardWidth, backboardHeight);
      ctx.shadowBlur = 0;
      
      // Backboard fill
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.fillRect(hoopCenterX - backboardWidth / 2, hoopY - backboardHeight + 10, backboardWidth, backboardHeight);
      
      // Inner backboard square
      ctx.strokeStyle = "#ff7830";
      ctx.lineWidth = 2;
      ctx.strokeRect(hoopCenterX - 18, hoopY - 26, 36, 28);
      
      // Pole
      ctx.fillStyle = "#4a7ab5";
      ctx.fillRect(hoopCenterX - 4, hoopY + 10, 8, 30);
      
      // Rim
      ctx.strokeStyle = "#ff5500";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(hoopCenterX, hoopY + 12, 20, 0, Math.PI * 2);
      ctx.stroke();
      
      // Net strings
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const rx = Math.cos(angle) * 20;
        const ry = Math.sin(angle) * 20;
        ctx.beginPath();
        ctx.moveTo(hoopCenterX + rx, hoopY + 12 + ry);
        ctx.lineTo(hoopCenterX + rx * 0.3, hoopY + 45);
        ctx.stroke();
      }

      // Draw basketball
      const bx = game.ball.x;
      const by = game.ball.y;
      const br = game.ball.radius;

      // Ball base
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      const ballGrad = ctx.createRadialGradient(bx - 4, by - 4, 2, bx, by, br);
      ballGrad.addColorStop(0, "#f5903a");
      ballGrad.addColorStop(0.7, "#e86a17");
      ballGrad.addColorStop(1, "#b84d0a");
      ctx.fillStyle = ballGrad;
      ctx.fill();
      ctx.strokeStyle = "#6b3005";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.closePath();

      // Horizontal seam
      ctx.beginPath();
      ctx.moveTo(bx - br, by);
      ctx.lineTo(bx + br, by);
      ctx.strokeStyle = "#6b3005";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Vertical seam
      ctx.beginPath();
      ctx.moveTo(bx, by - br);
      ctx.lineTo(bx, by + br);
      ctx.stroke();

      // Curved seams
      ctx.beginPath();
      ctx.arc(bx, by, br * 0.7, -0.5, 0.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(bx, by, br * 0.7, Math.PI - 0.5, Math.PI + 0.5);
      ctx.stroke();

      // Bounce indicator when ready
      if (!game.shooting) {
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("TAP!", bx, by - br - 8);
      }

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
      canvas.removeEventListener("click", handleClick);
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
        Tap anywhere to shoot the ball
      </p>
    </div>
  );
};

export default Basketball;
