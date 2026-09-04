import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative bg-background py-40 md:py-56 px-6 md:px-12 overflow-hidden zy-grid-bg">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--zy-glow)", opacity: 0.15 }}
      />
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-4xl"
      >
        <h2
          className="text-5xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-foreground leading-[0.9] mb-12"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Start building
          <span className="block zy-neon-text text-[hsl(var(--zy-cyan))]">your future.</span>
        </h2>

        <div className="flex gap-4">
          <a
            href="/auth"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[hsl(var(--zy-cyan))] text-background text-sm font-medium hover:brightness-110 transition-all shadow-[0_0_30px_hsl(var(--zy-cyan)/0.4)]"
          >
            Create Account
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;
