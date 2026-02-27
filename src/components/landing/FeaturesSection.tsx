import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, Zap, Shield, BarChart3, Layers, Globe } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Intelligence",
    description: "Adaptive intelligence that learns your patterns and automates your workflow across every domain.",
  },
  {
    icon: Zap,
    title: "Real-Time Automation",
    description: "Instant task detection and execution with zero latency. From idea to action in milliseconds.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption and privacy-first architecture. Your data never leaves your control.",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description: "Comprehensive data intelligence with visual dashboards, experiments, and predictive insights.",
  },
  {
    icon: Layers,
    title: "Unified Workspace",
    description: "One platform for code, music, finance, academics, and life management. Everything connected.",
  },
  {
    icon: Globe,
    title: "Global Scale",
    description: "Built for individuals and teams. Scale from personal use to enterprise deployment seamlessly.",
  },
];

const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-32 md:py-44 px-6 md:px-16 lg:px-24">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-[hsl(210_60%_60%)] mb-4 block">
            Capabilities
          </span>
          <h2
            className="text-4xl md:text-6xl font-bold tracking-[-0.03em] text-foreground leading-[1.1]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Everything you need.
            <br />
            <span className="text-foreground/30">Nothing you don't.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 * i }}
              className="group relative p-8 rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] backdrop-blur-sm hover:border-[hsl(210_60%_50%/0.2)] hover:bg-foreground/[0.04] transition-all duration-500"
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_top,hsl(210_80%_50%/0.05),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[hsl(210_60%_50%/0.1)] border border-[hsl(210_60%_50%/0.15)] flex items-center justify-center mb-6">
                  <feature.icon className="w-5 h-5 text-[hsl(210_60%_65%)]" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm text-foreground/40 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
