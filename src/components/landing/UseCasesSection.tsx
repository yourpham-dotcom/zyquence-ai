import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { GraduationCap, Trophy, Palette, Briefcase, Building2, Code2 } from "lucide-react";

const cases = [
  { icon: GraduationCap, title: "Students", desc: "Academic planning, study tools, and career exploration." },
  { icon: Trophy, title: "Athletes", desc: "Performance coaching, recruiting, and mental wellness." },
  { icon: Palette, title: "Creators", desc: "Music, video, design tools with AI collaboration." },
  { icon: Briefcase, title: "Professionals", desc: "Project management, finance tracking, and productivity." },
  { icon: Building2, title: "Businesses", desc: "Team ops, inventory, workflow automation at scale." },
  { icon: Code2, title: "Developers", desc: "Code studio, SQL lab, and cybersecurity sandbox." },
];

const UseCasesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-[hsl(200_80%_60%)] mb-4">
            For Everyone
          </p>
          <h2
            className="text-4xl md:text-6xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Built for Every Ambition
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {cases.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group flex items-start gap-4 p-6 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm hover:border-[hsl(200_80%_60%/0.2)] hover:bg-card/40 transition-all duration-300 cursor-default"
            >
              <div className="h-10 w-10 rounded-lg bg-[hsl(200_80%_60%/0.08)] border border-[hsl(200_80%_60%/0.1)] flex items-center justify-center shrink-0 group-hover:bg-[hsl(200_80%_60%/0.12)] transition-colors">
                <c.icon className="h-4 w-4 text-[hsl(200_80%_60%)]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{c.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
