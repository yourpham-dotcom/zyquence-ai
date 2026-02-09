import { Suspense, lazy } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const AbstractShape3D = lazy(() => import("@/components/AbstractShape3D"));

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Subtle background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(var(--cyber-blue)/0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--cyber-cyan)/0.06),transparent_50%)]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-4">
          {/* Text content */}
          <div className="flex-1 text-center lg:text-left space-y-8 max-w-2xl">
            {/* Floating badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border/50">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Multi-Industry Creative Intelligence Engine
              </span>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              <span className="block text-foreground/70">Innovating the</span>
              <span className="block text-foreground/70">Next Level of</span>
              <span className="block text-foreground/70">Creative Intelligence</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              A digital growth engine blending AI, performance coaching, creative tools, and intelligent pathways
              for artists, athletes, creators, and students.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 lg:justify-start justify-center items-center pt-2">
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
              <Button
                size="lg"
                variant="outline"
                className="border-border hover:bg-muted text-lg px-8 h-14 rounded-xl"
              >
                Explore Products
              </Button>
            </div>
          </div>

          {/* 3D Shape */}
          <div className="flex-1 w-full h-[400px] md:h-[500px] lg:h-[600px] relative">
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-muted/30 animate-pulse" />
                </div>
              }
            >
              <AbstractShape3D />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
