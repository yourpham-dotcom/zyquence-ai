import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const statements = [
  "Built for Humans.",
  "Powered by Intelligence.",
  "Designed for Scale.",
];

const PhilosophySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-40 bg-background overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(200_80%_50%/0.02),transparent_50%)]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto space-y-6 text-center">
          {statements.map((s, i) => (
            <motion.h2
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.25, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground/90"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {s}
            </motion.h2>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhilosophySection;
