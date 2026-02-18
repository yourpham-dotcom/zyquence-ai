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
  const [bgOrange, setBgOrange] = useState(true);
  const gameRef = useRef<any>(null);
  const bgRef = useRef(true);

  // Keep ref in sync
  useEffect(() => {
    bgRef.current = bgOrange;
  }, [bgOrange]);

  useEffect(() => {
    if (!canvasRef.current || !gameStarted) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const game = {
      ball: { x: canvas.width / 2, y: canvas.height - 50, radius: 15 },
      hoop: { x: canvas.width / 2 - 40, y: 80, width: 80, height: 10 },
      shooting: false,
      dragging: false,
      velocity: { x: 0, y: 0 },
      gravity: 0.5,
      score: 0,
      running: true,
      startTime: Date.now(),
    };

    gameRef.current = game;

    // Drag to aim (left/right only), release or tap to shoot
    const handleMouseDown = (e: MouseEvent) => {
      if (game.shooting) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const dist = Math.sqrt((mx - game.ball.x) ** 2 + (my - game.ball.y) ** 2);
      if (dist < game.ball.radius + 20) {
        game.dragging = true;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!game.dragging || game.shooting) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      // Clamp within canvas
      game.ball.x = Math.max(game.ball.radius, Math.min(canvas.width - game.ball.radius, mx));
    };

    const handleMouseUp = () => {
      if (game.dragging && !game.shooting) {
        game.dragging = false;
        // Shoot!
        const hoopCenterX = game.hoop.x + game.hoop.width / 2;
        const hoopY = game.hoop.y + 12;
        const dx = hoopCenterX - game.ball.x;
        const dy = hoopY - game.ball.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const spread = (Math.random() - 0.5) * 1.5;
        const power = 0.9 + Math.random() * 0.1;
        game.velocity.x = (dx / dist) * 12 * power + spread;
        game.velocity.y = (dy / dist) * 12 * power - 5;
        game.shooting = true;
      }
    };

    // Touch support
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (game.shooting) return;
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      const mx = t.clientX - rect.left;
      const my = t.clientY - rect.top;
      const dist = Math.sqrt((mx - game.ball.x) ** 2 + (my - game.ball.y) ** 2);
      if (dist < game.ball.radius + 30) {
        game.dragging = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!game.dragging || game.shooting) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.touches[0].clientX - rect.left;
      game.ball.x = Math.max(game.ball.radius, Math.min(canvas.width - game.ball.radius, mx));
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      handleMouseUp();
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

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

      // Background
      if (bgRef.current) {
        ctx.fillStyle = "#e8813a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Court lines
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height * 0.6, 60, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * 0.35);
        ctx.lineTo(canvas.width, canvas.height * 0.35);
        ctx.stroke();
      } else {
        ctx.fillStyle = "hsl(var(--muted))";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw backboard
      const hoopCenterX = game.hoop.x + game.hoop.width / 2;
      const hoopY = game.hoop.y;
      const backboardWidth = 90;
      const backboardHeight = 60;

      ctx.shadowColor = "rgba(255, 120, 30, 0.5)";
      ctx.shadowBlur = 15;
      ctx.strokeStyle = "#ff7830";
      ctx.lineWidth = 3;
      ctx.strokeRect(hoopCenterX - backboardWidth / 2, hoopY - backboardHeight + 10, backboardWidth, backboardHeight);
      ctx.shadowBlur = 0;

      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.fillRect(hoopCenterX - backboardWidth / 2, hoopY - backboardHeight + 10, backboardWidth, backboardHeight);

      ctx.strokeStyle = "#ff7830";
      ctx.lineWidth = 2;
      ctx.strokeRect(hoopCenterX - 18, hoopY - 26, 36, 28);

      ctx.fillStyle = "#4a7ab5";
      ctx.fillRect(hoopCenterX - 4, hoopY + 10, 8, 30);

      ctx.strokeStyle = "#ff5500";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(hoopCenterX, hoopY + 12, 20, 0, Math.PI * 2);
      ctx.stroke();

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

      // Seams
      ctx.strokeStyle = "#6b3005";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(bx - br, by); ctx.lineTo(bx + br, by); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx, by - br); ctx.lineTo(bx, by + br); ctx.stroke();
      ctx.beginPath(); ctx.arc(bx, by, br * 0.7, -0.5, 0.5); ctx.stroke();
      ctx.beginPath(); ctx.arc(bx, by, br * 0.7, Math.PI - 0.5, Math.PI + 0.5); ctx.stroke();

      // Aim indicator
      if (!game.shooting) {
        // Arrow pointing up
        ctx.strokeStyle = "rgba(255,255,255,0.6)";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(bx, by - br - 5);
        ctx.lineTo(bx, by - br - 35);
        ctx.stroke();
        ctx.setLineDash([]);
        // Drag hint
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("← DRAG TO AIM →", bx, by + br + 16);
      }

      // Ball physics
      if (game.shooting) {
        game.ball.x += game.velocity.x;
        game.ball.y += game.velocity.y;
        game.velocity.y += game.gravity;

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

        if (game.ball.y > canvas.height + 100 || game.ball.x < -50 || game.ball.x > canvas.width + 50) {
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
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [gameStarted]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameStarted(true);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <div className="text-lg font-bold">Score: {score}</div>
        <div className="text-lg font-bold">Time: {timeLeft}s</div>
        {!gameStarted && (
          <Button onClick={startGame} className="bg-primary hover:bg-primary/90">
            {score > 0 ? "Play Again" : "Start Game"}
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Court</span>
        <button
          onClick={() => setBgOrange(!bgOrange)}
          className={`relative w-10 h-5 rounded-full transition-colors ${bgOrange ? "bg-orange-500" : "bg-muted-foreground/30"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${bgOrange ? "translate-x-5" : ""}`} />
        </button>
        <span className="text-xs text-muted-foreground">Clear</span>
      </div>
      <canvas
        ref={canvasRef}
        width={compact ? 240 : 400}
        height={compact ? 320 : 500}
        className="border-2 border-border rounded-lg cursor-grab active:cursor-grabbing"
      />
      <p className="text-xs text-muted-foreground text-center">
        Drag ball left/right to aim, release to shoot
      </p>
    </div>
  );
};

export default Basketball;
