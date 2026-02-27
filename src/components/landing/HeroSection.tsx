import { motion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden px-6 md:px-16 lg:px-24">
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse,hsl(210_80%_50%/0.08),transparent_70%)]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide border border-[hsl(210_60%_50%/0.2)] bg-[hsl(210_60%_50%/0.06)] text-[hsl(210_60%_80%)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(210_80%_60%)] animate-pulse" />
            The Intelligence Platform
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] font-bold leading-[0.95] tracking-[-0.04em] text-foreground mb-8"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Build the future
          <br />
          <span className="bg-gradient-to-r from-[hsl(210_80%_65%)] to-[hsl(190_80%_55%)] bg-clip-text text-transparent">
            with intelligence.
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg md:text-xl text-foreground/50 max-w-xl leading-relaxed mb-12"
        >
          An AI-powered operating system for life, work, and creation. 
          Detection, automation, and intelligence — unified in one platform.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-wrap gap-4"
        >
          <a
            href="/auth"
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-[hsl(210_80%_55%)] to-[hsl(200_75%_50%)] text-white text-sm font-semibold hover:shadow-[0_0_30px_hsl(210_80%_55%/0.4)] transition-all duration-300"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="/mission"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-foreground/10 text-foreground/70 text-sm font-medium hover:bg-foreground/5 hover:border-foreground/20 transition-all duration-300"
          >
            Explore Platform
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="w-4 h-4 text-foreground/20" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
