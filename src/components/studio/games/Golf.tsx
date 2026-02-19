import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface GolfProps {
  compact?: boolean;
}

type GameMode = "classic" | "timeAttack" | "practice";
type GameState = "menu" | "playing" | "gameOver";

interface Target {
  x: number;
  y: number;
  radius: number;
  points: number;
  color: string;
  label: string;
}

interface Ball {
  x: number;
  y: number;
  z: number; // height
  vx: number;
  vy: number;
  vz: number;
  active: boolean;
  trail: { x: number; y: number; z: number }[];
  landed: boolean;
  landX: number;
  landY: number;
}

const Golf = ({ compact = false }: GolfProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>("menu");
  const [gameMode, setGameMode] = useState<GameMode>("classic");
  const [score, setScore] = useState(0);
  const [shotsLeft, setShotsLeft] = useState(10);
  const [timeLeft, setTimeLeft] = useState(60);
  const [lastPoints, setLastPoints] = useState(0);
  const [lastDistance, setLastDistance] = useState(0);
  const [combo, setCombo] = useState(0);
  const [power, setPower] = useState(0);
  const [aim, setAim] = useState(0); // -1 to 1
  const [charging, setCharging] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const gameRef = useRef<{
    ball: Ball;
    targets: Target[];
    running: boolean;
    power: number;
    aim: number;
    charging: boolean;
    score: number;
    combo: number;
    shotsLeft: number;
    timeLeft: number;
    mode: GameMode;
    startTime: number;
    powerDir: number;
    showResult: boolean;
    resultTimer: number;
  } | null>(null);

  const W = compact ? 280 : 500;
  const H = compact ? 380 : 550;

  // Audio (simple oscillator-based)
  const playSound = useCallback((type: "hit" | "land" | "score") => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === "hit") {
        osc.frequency.value = 220;
        osc.type = "triangle";
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start(); osc.stop(ctx.currentTime + 0.15);
      } else if (type === "land") {
        osc.frequency.value = 150;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(); osc.stop(ctx.currentTime + 0.2);
      } else {
        osc.frequency.value = 523;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
        // second note
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2); gain2.connect(ctx.destination);
        osc2.frequency.value = 659;
        osc2.type = "sine";
        gain2.gain.setValueAtTime(0, ctx.currentTime + 0.1);
        gain2.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc2.start(ctx.currentTime + 0.1); osc2.stop(ctx.currentTime + 0.4);
      }
    } catch {}
  }, []);

  const createTargets = useCallback((): Target[] => {
    const cw = W;
    const rangeTop = H * 0.08;
    const rangeBot = H * 0.55;
    return [
      { x: cw * 0.5, y: rangeTop + (rangeBot - rangeTop) * 0.15, radius: compact ? 14 : 20, points: 50, color: "#ef4444", label: "50" },
      { x: cw * 0.25, y: rangeTop + (rangeBot - rangeTop) * 0.3, radius: compact ? 18 : 26, points: 30, color: "#f97316", label: "30" },
      { x: cw * 0.75, y: rangeTop + (rangeBot - rangeTop) * 0.3, radius: compact ? 18 : 26, points: 30, color: "#f97316", label: "30" },
      { x: cw * 0.4, y: rangeTop + (rangeBot - rangeTop) * 0.55, radius: compact ? 22 : 30, points: 20, color: "#eab308", label: "20" },
      { x: cw * 0.65, y: rangeTop + (rangeBot - rangeTop) * 0.55, radius: compact ? 22 : 30, points: 20, color: "#eab308", label: "20" },
      { x: cw * 0.2, y: rangeTop + (rangeBot - rangeTop) * 0.75, radius: compact ? 26 : 35, points: 10, color: "#22c55e", label: "10" },
      { x: cw * 0.5, y: rangeTop + (rangeBot - rangeTop) * 0.8, radius: compact ? 26 : 35, points: 10, color: "#22c55e", label: "10" },
      { x: cw * 0.8, y: rangeTop + (rangeBot - rangeTop) * 0.75, radius: compact ? 26 : 35, points: 10, color: "#22c55e", label: "10" },
    ];
  }, [W, H, compact]);

  const startGame = (mode: GameMode) => {
    setGameMode(mode);
    setScore(0);
    setShotsLeft(mode === "classic" ? 10 : 999);
    setTimeLeft(60);
    setLastPoints(0);
    setLastDistance(0);
    setCombo(0);
    setPower(0);
    setAim(0);
    setCharging(false);
    setShowResult(false);
    setGameState("playing");
  };

  useEffect(() => {
    if (gameState !== "playing" || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const targets = createTargets();

    const teeX = W / 2;
    const teeY = H * 0.82;

    const game = {
      ball: { x: teeX, y: teeY, z: 0, vx: 0, vy: 0, vz: 0, active: false, trail: [] as any[], landed: false, landX: 0, landY: 0 },
      targets,
      running: true,
      power: 0,
      aim: 0,
      charging: false,
      score: 0,
      combo: 0,
      shotsLeft: gameMode === "classic" ? 10 : 999,
      timeLeft: 60,
      mode: gameMode,
      startTime: Date.now(),
      powerDir: 1,
      showResult: false,
      resultTimer: 0,
    };
    gameRef.current = game;

    // Input handlers
    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (game.ball.active || game.showResult) return;
      game.charging = true;
      game.power = 0;
      game.powerDir = 1;
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (game.ball.active) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0]?.clientX : e.clientX;
      if (!clientX) return;
      const mx = clientX - rect.left;
      game.aim = ((mx / W) - 0.5) * 2; // -1 to 1
      setAim(game.aim);
    };

    const handleMouseUp = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!game.charging || game.ball.active || game.showResult) return;
      game.charging = false;
      setCharging(false);

      // Launch ball
      const p = game.power;
      const aimAngle = game.aim * 0.4; // max ~23 degrees
      const speed = p * (compact ? 4 : 6);
      
      game.ball.vx = Math.sin(aimAngle) * speed * 0.5;
      game.ball.vy = -speed;
      game.ball.vz = speed * 0.7;
      game.ball.active = true;
      game.ball.trail = [];
      game.ball.landed = false;

      if (game.mode === "classic") {
        game.shotsLeft--;
        setShotsLeft(game.shotsLeft);
      }

      playSound("hit");
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("touchstart", handleMouseDown, { passive: false });
    canvas.addEventListener("touchmove", handleMouseMove, { passive: false });
    canvas.addEventListener("touchend", handleMouseUp, { passive: false });

    // Timer for time attack
    let timerInterval: any = null;
    if (gameMode === "timeAttack") {
      timerInterval = setInterval(() => {
        if (!game.running) return;
        const elapsed = Math.floor((Date.now() - game.startTime) / 1000);
        const remaining = Math.max(0, 60 - elapsed);
        game.timeLeft = remaining;
        setTimeLeft(remaining);
        if (remaining === 0) {
          game.running = false;
          setGameState("gameOver");
        }
      }, 100);
    }

    // Game loop
    let animId: number;
    const loop = () => {
      if (!game.running) return;

      // Power meter animation
      if (game.charging) {
        game.power += game.powerDir * 0.025;
        if (game.power >= 1) { game.power = 1; game.powerDir = -1; }
        if (game.power <= 0) { game.power = 0; game.powerDir = 1; }
        setPower(game.power);
        setCharging(true);
      }

      // === DRAW ===
      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.5);
      skyGrad.addColorStop(0, "#87CEEB");
      skyGrad.addColorStop(1, "#B0E0E6");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H * 0.5);

      // Distant hills
      ctx.fillStyle = "#5a8f4a";
      ctx.beginPath();
      ctx.moveTo(0, H * 0.35);
      ctx.quadraticCurveTo(W * 0.25, H * 0.28, W * 0.5, H * 0.33);
      ctx.quadraticCurveTo(W * 0.75, H * 0.27, W, H * 0.32);
      ctx.lineTo(W, H * 0.5);
      ctx.lineTo(0, H * 0.5);
      ctx.fill();

      // Main grass field (driving range)
      const grassGrad = ctx.createLinearGradient(0, H * 0.35, 0, H);
      grassGrad.addColorStop(0, "#4a9e3a");
      grassGrad.addColorStop(0.5, "#3d8a30");
      grassGrad.addColorStop(1, "#2d6b22");
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, H * 0.35, W, H * 0.65);

      // Grass stripes
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      for (let i = 0; i < 12; i++) {
        if (i % 2 === 0) {
          const sy = H * 0.35 + (i / 12) * H * 0.65;
          ctx.fillRect(0, sy, W, (H * 0.65) / 12);
        }
      }

      // Distance markers
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.font = `${compact ? 9 : 11}px sans-serif`;
      ctx.textAlign = "right";
      const distances = [50, 100, 150, 200];
      distances.forEach((d, i) => {
        const y = H * 0.08 + (i / distances.length) * (H * 0.55 - H * 0.08);
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(W * 0.05, y);
        ctx.lineTo(W * 0.95, y);
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillText(`${d} yd`, W - 8, y - 3);
      });

      // Draw targets
      game.targets.forEach(t => {
        // Outer glow
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.radius + 4, 0, Math.PI * 2);
        ctx.fillStyle = `${t.color}33`;
        ctx.fill();
        // Outer ring
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${t.color}66`;
        ctx.fill();
        ctx.strokeStyle = t.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        // Inner ring
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `${t.color}aa`;
        ctx.fill();
        // Center dot
        ctx.beginPath();
        ctx.arc(t.x, t.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        // Label
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${compact ? 10 : 13}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(t.label, t.x, t.y + (t.radius + (compact ? 14 : 18)));
      });

      // Tee area
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(W * 0.2, H * 0.72, W * 0.6, H * 0.2);
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;
      ctx.strokeRect(W * 0.2, H * 0.72, W * 0.6, H * 0.2);

      // Aim indicator
      if (!game.ball.active && !game.showResult) {
        const aimX = teeX + game.aim * (W * 0.35);
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(teeX, teeY);
        ctx.lineTo(aimX, H * 0.15);
        ctx.stroke();
        ctx.setLineDash([]);
        // Crosshair at end
        const chY = H * 0.15;
        ctx.strokeStyle = "rgba(255,255,255,0.6)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(aimX - 8, chY); ctx.lineTo(aimX + 8, chY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(aimX, chY - 8); ctx.lineTo(aimX, chY + 8); ctx.stroke();
      }

      // Ball trail
      if (game.ball.active || game.ball.landed) {
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        game.ball.trail.forEach((p, i) => {
          const shadow = p.z * 0.15;
          const drawY = p.y - shadow;
          if (i === 0) ctx.moveTo(p.x, drawY);
          else ctx.lineTo(p.x, drawY);
        });
        ctx.stroke();
      }

      // Ball physics
      if (game.ball.active) {
        game.ball.trail.push({ x: game.ball.x, y: game.ball.y, z: game.ball.z });
        if (game.ball.trail.length > 60) game.ball.trail.shift();

        game.ball.x += game.ball.vx;
        game.ball.y += game.ball.vy;
        game.ball.z += game.ball.vz;
        game.ball.vz -= 0.25; // gravity
        game.ball.vy *= 0.995; // slight drag

        // Ball has landed
        if (game.ball.z <= 0 && game.ball.vz < 0) {
          game.ball.z = 0;
          game.ball.active = false;
          game.ball.landed = true;
          game.ball.landX = game.ball.x;
          game.ball.landY = game.ball.y;

          playSound("land");

          // Check target hits
          let hitPoints = 0;
          let bestTarget: Target | null = null;
          game.targets.forEach(t => {
            const dx = game.ball.x - t.x;
            const dy = game.ball.y - t.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < t.radius) {
              const centerBonus = dist < t.radius * 0.3 ? 2 : 1;
              const pts = t.points * centerBonus;
              if (pts > hitPoints) {
                hitPoints = pts;
                bestTarget = t;
              }
            }
          });

          const distFromTee = Math.sqrt(
            (game.ball.x - teeX) ** 2 + (game.ball.y - teeY) ** 2
          );
          const yardage = Math.round(distFromTee * (compact ? 0.8 : 0.6));

          if (hitPoints > 0) {
            game.combo++;
            const comboMultiplier = Math.min(game.combo, 5);
            const totalPts = hitPoints * comboMultiplier;
            game.score += totalPts;
            setScore(game.score);
            setLastPoints(totalPts);
            setCombo(game.combo);
            playSound("score");
          } else {
            game.combo = 0;
            setLastPoints(0);
            setCombo(0);
          }
          setLastDistance(yardage);

          // Show result briefly
          game.showResult = true;
          game.resultTimer = 80;
          setShowResult(true);
        }
      }

      // Result timer → reset ball
      if (game.showResult) {
        game.resultTimer--;
        if (game.resultTimer <= 0) {
          game.showResult = false;
          setShowResult(false);
          game.ball = { x: teeX, y: teeY, z: 0, vx: 0, vy: 0, vz: 0, active: false, trail: [], landed: false, landX: 0, landY: 0 };
          
          // Check game over
          if (game.mode === "classic" && game.shotsLeft <= 0) {
            game.running = false;
            setGameState("gameOver");
            return;
          }
        }
      }

      // Draw ball (with shadow/height effect)
      if (!game.showResult || game.ball.landed) {
        const bx = game.ball.landed && !game.ball.active ? game.ball.landX : game.ball.x;
        const by = game.ball.landed && !game.ball.active ? game.ball.landY : game.ball.y;
        const bz = game.ball.z;
        const shadowScale = Math.max(0.3, 1 - bz * 0.01);
        const ballDraw = by - bz * 0.15;

        // Shadow
        ctx.beginPath();
        ctx.ellipse(bx, by, 5 * shadowScale, 3 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fill();

        // Ball
        const ballR = compact ? 5 : 6;
        ctx.beginPath();
        ctx.arc(bx, ballDraw, ballR, 0, Math.PI * 2);
        const ballGrad = ctx.createRadialGradient(bx - 1, ballDraw - 1, 1, bx, ballDraw, ballR);
        ballGrad.addColorStop(0, "#ffffff");
        ballGrad.addColorStop(1, "#d4d4d4");
        ctx.fillStyle = ballGrad;
        ctx.fill();
        ctx.strokeStyle = "#999";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Ball at tee when not active
      if (!game.ball.active && !game.ball.landed && !game.showResult) {
        const ballR = compact ? 5 : 6;
        ctx.beginPath();
        ctx.arc(teeX, teeY, ballR, 0, Math.PI * 2);
        const ballGrad = ctx.createRadialGradient(teeX - 1, teeY - 1, 1, teeX, teeY, ballR);
        ballGrad.addColorStop(0, "#ffffff");
        ballGrad.addColorStop(1, "#d4d4d4");
        ctx.fillStyle = ballGrad;
        ctx.fill();
        ctx.strokeStyle = "#999";
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Tee
        ctx.fillStyle = "#d4a574";
        ctx.fillRect(teeX - 1.5, teeY + ballR, 3, 8);
      }

      // Landing result display
      if (game.showResult && game.ball.landed) {
        const rx = game.ball.landX;
        const ry = game.ball.landY;
        
        // Landing circle
        ctx.beginPath();
        ctx.arc(rx, ry, 12, 0, Math.PI * 2);
        ctx.strokeStyle = lastPoints > 0 ? "#22c55e" : "#ef4444";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Power meter (left side)
      const pmX = compact ? 12 : 20;
      const pmY = H * 0.55;
      const pmH = H * 0.35;
      const pmW = compact ? 14 : 18;

      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.roundRect(pmX - 2, pmY - 2, pmW + 4, pmH + 4, 4);
      ctx.fill();

      // Power meter gradient
      const pmGrad = ctx.createLinearGradient(0, pmY + pmH, 0, pmY);
      pmGrad.addColorStop(0, "#22c55e");
      pmGrad.addColorStop(0.5, "#eab308");
      pmGrad.addColorStop(1, "#ef4444");
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(pmX, pmY, pmW, pmH);
      
      const fillH = pmH * game.power;
      ctx.fillStyle = pmGrad;
      ctx.fillRect(pmX, pmY + pmH - fillH, pmW, fillH);

      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(pmX, pmY, pmW, pmH);

      // Power label
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = `bold ${compact ? 8 : 10}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("PWR", pmX + pmW / 2, pmY - 6);
      ctx.fillText(`${Math.round(game.power * 100)}%`, pmX + pmW / 2, pmY + pmH + 14);

      // HUD - Score
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.roundRect(W - (compact ? 90 : 130), 8, compact ? 82 : 122, compact ? 50 : 60, 6);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${compact ? 12 : 16}px sans-serif`;
      ctx.textAlign = "right";
      ctx.fillText(`${game.score} pts`, W - 14, compact ? 28 : 32);
      
      ctx.font = `${compact ? 9 : 11}px sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      if (game.mode === "classic") {
        ctx.fillText(`Shots: ${game.shotsLeft}`, W - 14, compact ? 44 : 50);
      } else if (game.mode === "timeAttack") {
        ctx.fillText(`Time: ${game.timeLeft}s`, W - 14, compact ? 44 : 50);
      } else {
        ctx.fillText(`Practice`, W - 14, compact ? 44 : 50);
      }

      // Combo display
      if (game.combo > 1) {
        ctx.fillStyle = "#fbbf24";
        ctx.font = `bold ${compact ? 11 : 14}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(`🔥 ${game.combo}x COMBO`, W / 2, H * 0.68);
      }

      // Last shot result
      if (game.showResult) {
        ctx.textAlign = "center";
        if (lastPoints > 0) {
          ctx.fillStyle = "#22c55e";
          ctx.font = `bold ${compact ? 18 : 26}px sans-serif`;
          ctx.fillText(`+${lastPoints}`, W / 2, H * 0.63);
        } else {
          ctx.fillStyle = "#ef4444";
          ctx.font = `bold ${compact ? 14 : 18}px sans-serif`;
          ctx.fillText(`MISS`, W / 2, H * 0.63);
        }
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.font = `${compact ? 9 : 11}px sans-serif`;
        ctx.fillText(`${lastDistance} yards`, W / 2, H * 0.63 + (compact ? 16 : 22));
      }

      // Instructions
      if (!game.ball.active && !game.showResult) {
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = `${compact ? 9 : 11}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("Move to aim • Hold to charge • Release to swing", W / 2, H * 0.96);
      }

      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => {
      if (gameRef.current) gameRef.current.running = false;
      cancelAnimationFrame(animId);
      if (timerInterval) clearInterval(timerInterval);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("touchstart", handleMouseDown);
      canvas.removeEventListener("touchmove", handleMouseMove);
      canvas.removeEventListener("touchend", handleMouseUp);
    };
  }, [gameState, gameMode, W, H, compact, createTargets, playSound]);

  // Menu screen
  if (gameState === "menu") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
        <div className="text-center space-y-2">
          <div className="text-5xl">⛳</div>
          <h2 className="text-2xl font-bold">Golf Arcade</h2>
          <p className="text-muted-foreground text-sm">Hit targets on the driving range!</p>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-[200px]">
          <Button onClick={() => startGame("classic")} className="w-full bg-emerald-600 hover:bg-emerald-700">
            🏆 Classic (10 shots)
          </Button>
          <Button onClick={() => startGame("timeAttack")} variant="outline" className="w-full">
            ⏱️ Time Attack (60s)
          </Button>
          <Button onClick={() => startGame("practice")} variant="ghost" className="w-full">
            🎯 Practice
          </Button>
        </div>
      </div>
    );
  }

  // Game over screen
  if (gameState === "gameOver") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
        <div className="text-center space-y-2">
          <div className="text-5xl">🏌️</div>
          <h2 className="text-2xl font-bold">Game Over!</h2>
          <p className="text-4xl font-bold text-primary">{score} pts</p>
          <p className="text-muted-foreground text-sm">
            {score >= 200 ? "🔥 Amazing!" : score >= 100 ? "👏 Great round!" : "Keep practicing!"}
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-[200px]">
          <Button onClick={() => startGame(gameMode)} className="w-full bg-emerald-600 hover:bg-emerald-700">
            Play Again
          </Button>
          <Button onClick={() => setGameState("menu")} variant="outline" className="w-full">
            Change Mode
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 p-2">
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold">⛳ Score: {score}</span>
        {gameMode === "classic" && <span className="text-sm text-muted-foreground">Shots: {shotsLeft}</span>}
        {gameMode === "timeAttack" && <span className="text-sm text-muted-foreground">Time: {timeLeft}s</span>}
        {gameMode === "practice" && (
          <Button size="sm" variant="ghost" onClick={() => setGameState("menu")} className="text-xs h-6">
            Exit
          </Button>
        )}
      </div>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="border-2 border-border rounded-lg cursor-crosshair"
        style={{ touchAction: "none" }}
      />
    </div>
  );
};

export default Golf;
