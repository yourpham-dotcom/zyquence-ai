import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-40 bg-background overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(200_80%_50%/0.04),transparent_60%)]" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto space-y-8"
        >
          <h2
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Start Building Your Future Today
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Join thousands creating with the most advanced personal operating system ever built.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 text-base px-8 h-14 rounded-xl font-medium group"
              asChild
            >
              <a href="/auth">
                Create Account
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border/50 text-foreground hover:bg-foreground/5 text-base px-8 h-14 rounded-xl font-medium"
              asChild
            >
              <a href="/mission">
                <Compass className="mr-2 w-4 h-4" />
                Explore Zyquence
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
