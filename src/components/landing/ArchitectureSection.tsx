import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const layers = [
  { label: "User Experience", tag: "L5" },
  { label: "Application", tag: "L4" },
  { label: "AI Engine", tag: "L3" },
  { label: "Data", tag: "L2" },
  { label: "Integration", tag: "L1" },
];

const ArchitectureSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative bg-background py-32 px-6 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="mb-20"
      >
        <span className="text-xs font-mono text-foreground/20 block mb-4">Architecture</span>
        <h2
          className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Five layers.
          <span className="text-foreground/20"> One system.</span>
        </h2>
      </motion.div>

      <div className="max-w-2xl space-y-0">
        {layers.map((layer, i) => (
          <motion.div
            key={layer.tag}
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="flex items-center justify-between py-5 border-b border-foreground/[0.06] group cursor-default"
          >
            <div className="flex items-center gap-6">
              <span className="text-xs font-mono text-foreground/15 w-8">{layer.tag}</span>
              <span
                className="text-lg md:text-xl font-medium text-foreground group-hover:translate-x-2 transition-transform duration-300"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {layer.label}
              </span>
            </div>
            <div className="h-px flex-1 mx-8 bg-foreground/[0.04]" />
            <div className="h-2 w-2 rounded-full bg-foreground/10 group-hover:bg-foreground/30 transition-colors" />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ArchitectureSection;
