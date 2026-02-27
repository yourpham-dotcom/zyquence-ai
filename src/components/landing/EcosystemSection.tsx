import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Brain, Heart, TrendingUp, Palette, Cpu, Code2,
} from "lucide-react";

const features = [
  { icon: Heart, title: "LifeOS", desc: "Plan your life with intelligent calendars, event coordination, and habit systems." },
  { icon: TrendingUp, title: "FinanceOS", desc: "Track spending, set goals, and get AI-powered financial coaching." },
  { icon: Brain, title: "AthleteOS", desc: "Mental coaching, recruiting profiles, and performance analytics." },
  { icon: Palette, title: "CreatorOS", desc: "Music production, lyrics writing, photo/video editing in one workspace." },
  { icon: Cpu, title: "AI Engine", desc: "Contextual AI assistants embedded across every module." },
  { icon: Code2, title: "Developer Tools", desc: "Code studio, SQL lab, cybersecurity practice environments." },
];

const EcosystemSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-32 bg-background overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(200_80%_50%/0.03),transparent_60%)]" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-[hsl(200_80%_60%)] mb-4">
            Platform
          </p>
          <h2
            className="text-4xl md:text-6xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            The Zyquence Ecosystem
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="group relative p-8 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm hover:border-[hsl(200_80%_60%/0.3)] hover:bg-card/50 transition-all duration-500 cursor-default"
            >
              <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_top_left,hsl(200_80%_60%/0.04),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-xl bg-[hsl(200_80%_60%/0.08)] border border-[hsl(200_80%_60%/0.1)] flex items-center justify-center mb-6 group-hover:bg-[hsl(200_80%_60%/0.12)] transition-colors">
                  <f.icon className="h-5 w-5 text-[hsl(200_80%_60%)]" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EcosystemSection;
