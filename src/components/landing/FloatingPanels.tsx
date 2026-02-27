import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import { MessageSquare, Calendar, BarChart3, Workflow } from "lucide-react";

const panels = [
  {
    icon: MessageSquare,
    title: "AI Assistant",
    lines: ["How can I help you today?", "Analyze my weekly schedule", "Optimizing your calendar..."],
    offset: -40,
    rotate: -3,
  },
  {
    icon: Calendar,
    title: "Life Planner",
    lines: ["Mon: Team Sync 9AM", "Tue: Gym 6:30AM", "Wed: Project Review"],
    offset: 30,
    rotate: 2,
  },
  {
    icon: BarChart3,
    title: "Analytics",
    lines: ["Productivity: +23%", "Goals completed: 8/12", "Streak: 14 days"],
    offset: -20,
    rotate: -1.5,
  },
  {
    icon: Workflow,
    title: "Workflow Engine",
    lines: ["Trigger: New task", "Action: Auto-assign", "Status: Running"],
    offset: 50,
    rotate: 2.5,
  },
];

const FloatingPanels = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  return (
    <section ref={containerRef} className="relative py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-[hsl(200_80%_60%)] mb-4">
            Interface
          </p>
          <h2
            className="text-4xl md:text-6xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Intelligence at Every Layer
          </h2>
        </motion.div>

        <div className="relative h-[500px] max-w-5xl mx-auto">
          {panels.map((p, i) => {
            const y = useTransform(scrollYProgress, [0, 1], [p.offset * 2, p.offset * -1]);

            return (
              <motion.div
                key={p.title}
                style={{ y }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="absolute w-72 md:w-80"
                // Position panels in a scattered layout
                {...(i === 0 && { style: { y, left: "5%", top: "5%" } })}
                {...(i === 1 && { style: { y, right: "5%", top: "0%" } })}
                {...(i === 2 && { style: { y, left: "10%", bottom: "5%" } })}
                {...(i === 3 && { style: { y, right: "10%", bottom: "10%" } })}
              >
                <div
                  className="p-6 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-[0_8px_40px_hsl(200_80%_50%/0.06)]"
                  style={{ transform: `rotate(${p.rotate}deg)` }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-[hsl(200_80%_60%/0.1)] flex items-center justify-center">
                      <p.icon className="h-4 w-4 text-[hsl(200_80%_60%)]" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{p.title}</span>
                  </div>
                  <div className="space-y-2">
                    {p.lines.map((line, li) => (
                      <div
                        key={li}
                        className="text-xs text-muted-foreground py-1.5 px-3 rounded-lg bg-background/50"
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FloatingPanels;
