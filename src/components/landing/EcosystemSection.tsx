import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  { num: "01", title: "LifeOS", desc: "Calendar intelligence, event coordination, habit tracking, and life planning — all driven by AI that understands context." },
  { num: "02", title: "FinanceOS", desc: "Spending analysis, goal setting, and AI-powered financial coaching that adapts to your behavior." },
  { num: "03", title: "CreatorOS", desc: "Music production, lyrics, photo and video editing unified into a single creative workspace." },
  { num: "04", title: "AthleteOS", desc: "Performance coaching, mental wellness, recruiting profiles, and competitive analytics." },
  { num: "05", title: "AI Engine", desc: "Contextual assistants embedded across every module. Natural language to action." },
  { num: "06", title: "Developer Tools", desc: "Code studio, SQL sandbox, cybersecurity lab. Build, test, and ship from anywhere." },
];

const EcosystemSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="relative bg-background py-32 px-6 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mb-20"
      >
        <h2
          className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Built-in
          <span className="inline-block ml-4 text-[hsl(var(--zy-cyan)/0.7)]">Tools</span>
        </h2>
      </motion.div>

      <div className="max-w-5xl">
        {features.map((f, i) => (
          <motion.div
            key={f.num}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="group border-t border-[hsl(var(--zy-cyan)/0.1)] py-8 md:py-10 grid grid-cols-[auto_1fr] md:grid-cols-[60px_200px_1fr] gap-4 md:gap-8 items-start cursor-default hover:bg-[hsl(var(--zy-cyan)/0.02)] transition-colors duration-300"
          >
            <span className="text-xs font-mono text-[hsl(var(--zy-cyan)/0.4)] pt-1">{f.num}</span>
            <h3
              className="text-xl md:text-2xl font-semibold text-foreground group-hover:text-[hsl(var(--zy-cyan))] transition-colors duration-300"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {f.title}
            </h3>
            <p className="text-sm text-foreground/40 leading-relaxed md:max-w-md col-span-2 md:col-span-1">
              {f.desc}
            </p>
          </motion.div>
        ))}
        <div className="border-t border-[hsl(var(--zy-cyan)/0.1)]" />
      </div>
    </section>
  );
};

export default EcosystemSection;
