import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";

const panels = [
  { title: "AI Assistant", lines: ["Analyze my weekly schedule", "Optimizing your calendar...", "3 conflicts resolved"] },
  { title: "Life Planner", lines: ["Mon: Team Sync 9AM", "Tue: Gym 6:30AM", "Wed: Project Review 2PM"] },
  { title: "Analytics", lines: ["Productivity: +23%", "Goals completed: 8/12", "14-day streak active"] },
  { title: "Workflow", lines: ["Trigger → New task created", "Action → Auto-assign team", "Status → Running ✓"] },
];

const FloatingPanels = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-40, 40]);

  return (
    <section ref={containerRef} className="relative bg-background py-32 md:py-48 px-6 md:px-12 overflow-hidden zy-grid-bg">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-24"
      >
        <span className="text-xs font-mono text-[hsl(var(--zy-cyan)/0.6)] block mb-4">Interface Preview</span>
        <h2
          className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Intelligence at
          <span className="block text-foreground/20">every layer</span>
        </h2>
      </motion.div>

      <div className="relative grid md:grid-cols-2 gap-6 max-w-4xl">
        {panels.map((p, i) => {
          const yMotion = i % 2 === 0 ? y1 : y2;
          return (
            <motion.div
              key={p.title}
              style={{ y: yMotion }}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="zy-panel zy-neon-border p-6 rounded-xl border transition-all duration-300"
            >
              <span className="text-xs font-mono text-[hsl(var(--zy-cyan)/0.5)] block mb-4">{p.title}</span>
              <div className="space-y-2">
                {p.lines.map((line, li) => (
                  <div key={li} className="text-sm text-foreground/50 py-2 px-3 rounded-lg bg-foreground/[0.03] border border-[hsl(var(--zy-cyan)/0.08)]">
                    {line}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default FloatingPanels;
