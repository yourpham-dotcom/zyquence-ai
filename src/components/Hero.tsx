import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(var(--cyber-blue)/0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--cyber-cyan)/0.1),transparent_50%)]" />
      
      {/* Animated grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Floating badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-cyber-blue/30 animate-float">
            <Sparkles className="w-4 h-4 text-cyber-cyan" />
            <span className="text-sm text-muted-foreground">
              Multi-Industry Creative Intelligence Engine
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
            <span className="block text-foreground/70">
              Innovating the
            </span>
            <span className="block mt-2 text-foreground/70">
              Next Level of
            </span>
            <span className="block mt-2 text-foreground/70">
              Creative Intelligence
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A digital growth engine blending AI, performance coaching, creative tools, and intelligent pathways 
            for artists, athletes, creators, and students.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              className="bg-cyber-blue hover:bg-cyber-blue/90 text-lg px-8 h-14 group"
              asChild
            >
              <a href="/studio">
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-cyber-cyan/50 hover:bg-cyber-cyan/10 text-lg px-8 h-14"
            >
              Explore Products
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
