import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const layers = [
  { label: "User Experience Layer", desc: "Dashboard, Studio, Mobile", color: "hsl(200 80% 60%)" },
  { label: "Application Layer", desc: "LifeOS, FinanceOS, CreatorOS, AthleteOS", color: "hsl(200 70% 55%)" },
  { label: "AI Engine", desc: "Contextual AI, NLP, Vision, Recommendations", color: "hsl(200 60% 50%)" },
  { label: "Data Layer", desc: "Real-time sync, Cloud storage, Analytics", color: "hsl(200 50% 45%)" },
  { label: "Integration Layer", desc: "APIs, Webhooks, Third-party connectors", color: "hsl(200 40% 40%)" },
];

const ArchitectureSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-[hsl(200_80%_60%)] mb-4">
            Architecture
          </p>
          <h2
            className="text-4xl md:text-6xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Platform Architecture
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {layers.map((layer, i) => (
            <motion.div
              key={layer.label}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.6 }}
              className="relative group"
            >
              <div className="flex items-center gap-6 p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-[hsl(200_80%_60%/0.25)] transition-all duration-300">
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: layer.color }}
                />
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-base font-semibold text-foreground"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {layer.label}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{layer.desc}</p>
                </div>
                <div className="hidden md:block text-xs text-muted-foreground/40 font-mono">
                  L{layers.length - i}
                </div>
              </div>

              {/* Connecting line */}
              {i < layers.length - 1 && (
                <div className="absolute left-[2.05rem] top-full h-4 w-px bg-border/30" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArchitectureSection;
