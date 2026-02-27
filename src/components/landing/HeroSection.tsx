import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative h-screen flex flex-col justify-between bg-background overflow-hidden px-6 md:px-12 pt-20 pb-8">
      {/* Main hero text — right-aligned, massive */}
      <div className="flex-1 flex items-center">
        <div className="w-full">
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(3.5rem,12vw,12rem)] font-bold leading-[0.85] tracking-tighter text-foreground text-center"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Zyquence
          </motion.h1>
        </div>
      </div>

      {/* Bottom row — description left, version right */}
      <div className="flex items-end justify-between gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md space-y-6"
        >
          <div className="flex gap-3">
            <a
              href="/auth"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              Start Free
            </a>
            <a
              href="/mission"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-foreground/20 text-foreground text-sm font-medium hover:bg-foreground/5 transition-colors"
            >
              Read Documentation
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="hidden md:flex flex-col items-end gap-1"
        >
          <p className="text-sm text-foreground/40 max-w-xs text-right leading-relaxed">
            An AI-powered operating system for life, work, and creation. Detection, automation, and intelligence — all in one platform.
          </p>
          <span className="text-xs text-foreground/20 font-mono mt-2">Version 1.0</span>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="w-4 h-4 text-foreground/20" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
