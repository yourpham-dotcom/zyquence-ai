import { useEffect, useRef, useState } from "react";

// ─── Shared: respects prefers-reduced-motion ───
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

// ─── Rainfall Canvas Animation ───
export function RainfallBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const getCount = () => (w < 768 ? 60 : w < 1200 ? 100 : 150);
    let drops: { x: number; y: number; l: number; s: number; o: number }[] = [];
    const initDrops = () => {
      const count = getCount();
      drops = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        l: 10 + Math.random() * 20, s: 2 + Math.random() * 4, o: 0.08 + Math.random() * 0.15,
      }));
    };
    initDrops();

    let paused = false;
    const onVis = () => { paused = document.hidden; };
    document.addEventListener("visibilitychange", onVis);

    const draw = () => {
      if (paused) { animRef.current = requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, w, h);
      for (const d of drops) {
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + 0.5, d.y + d.l);
        ctx.strokeStyle = `rgba(174, 194, 224, ${d.o})`; ctx.lineWidth = 1; ctx.stroke();
        d.y += d.s;
        if (d.y > h) { d.y = -d.l; d.x = Math.random() * w; }
      }
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); document.removeEventListener("visibilitychange", onVis); };
  }, [reduced]);

  if (reduced) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" aria-hidden="true" />;
}

// ─── Coastal Canvas Animation ───
export function CoastalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    let paused = false;
    const onVis = () => { paused = document.hidden; };
    document.addEventListener("visibilitychange", onVis);

    // Floating light particles
    const getCount = () => (w < 768 ? 25 : w < 1200 ? 40 : 60);
    type Particle = { x: number; y: number; r: number; dx: number; dy: number; o: number; hue: number };
    let particles: Particle[] = [];

    const init = () => {
      const count = getCount();
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1.5 + Math.random() * 3,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.15,
        o: 0.06 + Math.random() * 0.14,
        hue: 180 + Math.random() * 40, // teal-to-cyan range
      }));
    };
    init();

    let time = 0;

    const draw = () => {
      if (paused) { animRef.current = requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, w, h);
      time += 0.005;

      // Draw two subtle wave bands
      for (let band = 0; band < 2; band++) {
        const baseY = h * (0.65 + band * 0.12);
        const amp = 8 + band * 4;
        const alpha = 0.04 - band * 0.01;
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 4) {
          const y = baseY + Math.sin(x * 0.003 + time * (1.2 + band * 0.3)) * amp
                          + Math.sin(x * 0.007 - time * 0.8) * (amp * 0.5);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = `hsla(195, 50%, 55%, ${alpha})`;
        ctx.fill();
      }

      // Draw floating particles
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 40%, 70%, ${p.o})`;
        ctx.fill();

        p.x += p.dx + Math.sin(time + p.y * 0.01) * 0.1;
        p.y += p.dy;

        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); document.removeEventListener("visibilitychange", onVis); };
  }, [reduced]);

  if (reduced) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" aria-hidden="true" />;
}
