import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative bg-background py-40 md:py-56 px-6 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl"
      >
        <h2
          className="text-5xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-foreground leading-[0.9] mb-12"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Start building
          <span className="block text-foreground/20">your future.</span>
        </h2>

        <div className="flex gap-4">
          <a
            href="/auth"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            Create Account
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="/mission"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-foreground/15 text-foreground text-sm font-medium hover:bg-foreground/5 transition-colors"
          >
            Explore Zyquence
          </a>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;
