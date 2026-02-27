import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const stats = [
  { value: "10+", label: "Integrated Modules" },
  { value: "∞", label: "Possibilities" },
  { value: "1", label: "Unified Platform" },
  { value: "24/7", label: "AI Availability" },
];

const ShowcaseSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-32 md:py-44 px-6 md:px-16 lg:px-24">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-[hsl(210_60%_50%/0.3)] to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-[hsl(210_60%_60%)] mb-4 block">
              Platform
            </span>
            <h2
              className="text-4xl md:text-5xl font-bold tracking-[-0.03em] text-foreground leading-[1.1] mb-6"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              One platform,
              <br />
              infinite potential.
            </h2>
            <p className="text-foreground/40 text-lg leading-relaxed mb-10 max-w-md">
              From code studios to music production, financial planning to academic management — 
              Zyquence unifies every dimension of your digital life.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                >
                  <div className="text-3xl md:text-4xl font-bold text-foreground tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-foreground/30 mt-1 tracking-wide">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] backdrop-blur-sm overflow-hidden aspect-[4/3]">
              {/* Mock interface */}
              <div className="absolute inset-0 p-6">
                {/* Top bar */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
                  <div className="flex-1 h-6 rounded-lg bg-foreground/[0.04] mx-4" />
                </div>
                {/* Sidebar + content mock */}
                <div className="flex gap-4 h-[calc(100%-3rem)]">
                  <div className="w-1/4 space-y-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className={`h-8 rounded-lg ${i === 1 ? 'bg-[hsl(210_60%_50%/0.15)] border border-[hsl(210_60%_50%/0.2)]' : 'bg-foreground/[0.03]'}`} />
                    ))}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="h-1/2 rounded-xl bg-foreground/[0.03] border border-foreground/[0.04] p-4">
                      <div className="h-4 w-1/3 rounded bg-foreground/[0.06] mb-3" />
                      <div className="h-3 w-2/3 rounded bg-foreground/[0.04] mb-2" />
                      <div className="h-3 w-1/2 rounded bg-foreground/[0.03]" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 h-1/3">
                      <div className="rounded-xl bg-[hsl(210_60%_50%/0.06)] border border-[hsl(210_60%_50%/0.1)]" />
                      <div className="rounded-xl bg-foreground/[0.03] border border-foreground/[0.04]" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
