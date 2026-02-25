import { useEffect, useRef, useState } from "react";

// ─── Rainfall Canvas Animation ───
export function RainfallBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) { setVisible(false); return; }
    const handler = (e: MediaQueryListEvent) => setVisible(!e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;
    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Particle count based on screen size
    const getCount = () => (w < 768 ? 60 : w < 1200 ? 100 : 150);
    let drops: { x: number; y: number; l: number; s: number; o: number }[] = [];

    const initDrops = () => {
      const count = getCount();
      drops = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        l: 10 + Math.random() * 20,
        s: 2 + Math.random() * 4,
        o: 0.08 + Math.random() * 0.15,
      }));
    };
    initDrops();

    let paused = false;
    const onVisChange = () => { paused = document.hidden; };
    document.addEventListener("visibilitychange", onVisChange);

    const draw = () => {
      if (paused) { animRef.current = requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, w, h);

      for (const d of drops) {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + 0.5, d.y + d.l);
        ctx.strokeStyle = `rgba(174, 194, 224, ${d.o})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        d.y += d.s;
        if (d.y > h) {
          d.y = -d.l;
          d.x = Math.random() * w;
        }
      }
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisChange);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
