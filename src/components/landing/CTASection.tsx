import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-40 md:py-56 px-6 md:px-16 lg:px-24">
      {/* Top divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-[hsl(210_60%_50%/0.2)] to-transparent" />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,hsl(210_80%_50%/0.06),transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto text-center"
      >
        <h2
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-[-0.04em] text-foreground leading-[0.95] mb-8"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Ready to begin?
        </h2>
        <p className="text-lg text-foreground/35 mb-12 max-w-lg mx-auto">
          Join the next generation of creators, builders, and thinkers using Zyquence to shape their future.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="/auth"
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-[hsl(210_80%_55%)] to-[hsl(200_75%_50%)] text-white text-sm font-semibold hover:shadow-[0_0_40px_hsl(210_80%_55%/0.35)] transition-all duration-300"
          >
            Create Account
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="/pricing"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-foreground/10 text-foreground/60 text-sm font-medium hover:bg-foreground/5 hover:border-foreground/20 transition-all duration-300"
          >
            View Pricing
          </a>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;
