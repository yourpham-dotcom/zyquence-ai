import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import Hero3D from "./Hero3D";

const HeroSection = () => {
  return (
    <section className="relative h-screen flex flex-col justify-between bg-background overflow-hidden px-6 md:px-12 pt-20 pb-8">
      {/* Techy grid + 3D centerpiece backdrop */}
      <div className="absolute inset-0 zy-grid-bg" />
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[600px] opacity-80">
        <Hero3D />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 55%, transparent 0%, hsl(var(--background)) 75%)" }}
      />

      {/* Main hero text — right-aligned, massive */}
      <div className="relative flex-1 flex items-center">
        <div className="w-full">
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="zy-neon-text text-[clamp(3.5rem,12vw,12rem)] font-bold leading-[0.85] tracking-tighter text-foreground text-center"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Zyquence
          </motion.h1>
        </div>
      </div>

      {/* Bottom row — description left, version right */}
      <div className="relative flex items-end justify-between gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md space-y-6"
        >
          <div className="flex gap-3">
            <a
              href="/auth"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[hsl(var(--zy-cyan))] text-background text-sm font-medium hover:brightness-110 transition-all shadow-[0_0_30px_hsl(var(--zy-cyan)/0.4)]"
            >
              Start Free
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
          <span className="text-xs font-mono mt-2 text-[hsl(var(--zy-cyan)/0.6)]">Version 1.0</span>
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
          <ArrowDown className="w-4 h-4 text-[hsl(var(--zy-cyan)/0.5)]" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
