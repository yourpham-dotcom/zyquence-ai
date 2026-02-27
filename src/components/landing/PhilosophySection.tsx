import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const PhilosophySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative bg-background overflow-hidden py-12">
      {/* Marquee band */}
      <div className="border-y border-foreground/10 py-6 overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap gap-16"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="text-6xl md:text-8xl font-bold tracking-tighter text-foreground/[0.04]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Zyquence
            </span>
          ))}
        </motion.div>
      </div>

      {/* Philosophy text */}
      <div className="px-6 md:px-12 py-32 md:py-48">
        <div className="max-w-4xl mx-auto md:ml-[15%]">
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            This platform has evolved{" "}
            <span className="text-foreground/20">considerably over the years.</span>{" "}
            From idea to ecosystem,{" "}
            <span className="text-foreground/20">from tools to intelligence.</span>
          </motion.p>
        </div>
      </div>

      {/* Second marquee */}
      <div className="border-y border-foreground/10 py-6 overflow-hidden">
        <motion.div
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap gap-16"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="text-6xl md:text-8xl font-bold tracking-tighter text-foreground/[0.04]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Zyquence
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PhilosophySection;
