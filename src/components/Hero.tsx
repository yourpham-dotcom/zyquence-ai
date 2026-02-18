import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(var(--cyber-blue)/0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--cyber-cyan)/0.06),transparent_50%)]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex flex-col items-center gap-4 px-8 py-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 max-w-3xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
                Multi-Industry Creative Intelligence Engine
              </span>
            </div>
            <p className="text-lg md:text-xl text-foreground/80 leading-relaxed text-center">
              A digital growth engine blending AI, performance coaching, creative tools, and intelligent pathways
              for artists, athletes, creators, and students.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 text-lg px-8 h-14 group rounded-xl"
              asChild
            >
              <a href="/pricing">
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
