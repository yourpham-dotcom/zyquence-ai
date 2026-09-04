import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const cases = [
  { emoji: "🎓", title: "Students", desc: "Academic planning and career exploration" },
  { emoji: "🏆", title: "Athletes", desc: "Performance coaching and recruiting" },
  { emoji: "🎨", title: "Creators", desc: "Music, video, and design tools" },
  { emoji: "💼", title: "Professionals", desc: "Project management and productivity" },
  { emoji: "🏢", title: "Businesses", desc: "Team ops and workflow automation" },
  { emoji: "⚡", title: "Developers", desc: "Code studio and sandbox environments" },
];

const UseCasesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="relative bg-background py-32 px-6 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="mb-20"
      >
        <span className="text-xs font-mono text-[hsl(var(--zy-cyan)/0.6)] block mb-4">Use Cases</span>
        <h2
          className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Built for
          <span className="text-foreground/20"> everyone</span>
        </h2>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[hsl(var(--zy-cyan)/0.1)] max-w-4xl rounded-xl overflow-hidden">
        {cases.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: i * 0.06, duration: 0.5 }}
            className="bg-background p-8 group cursor-default hover:bg-[hsl(var(--zy-cyan)/0.04)] transition-colors duration-300"
          >
            <span className="text-2xl mb-4 block">{c.emoji}</span>
            <h3
              className="text-base font-semibold text-foreground mb-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {c.title}
            </h3>
            <p className="text-xs text-foreground/30">{c.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default UseCasesSection;
