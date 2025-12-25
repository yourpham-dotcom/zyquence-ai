import { Card } from "@/components/ui/card";
import { Brain, Zap } from "lucide-react";

const Mission = () => {
  return (
    <section id="mission" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--cyber-green)/0.05),transparent_50%)]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="text-gradient">Our Mission</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Empowering everyone to unlock their creative potential and develop real skills
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-16">
            <Card className="p-8 bg-card/50 backdrop-blur-sm border-border card-glow">
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-lg bg-cyber-green/10 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-cyber-green" />
                </div>
                <h3 className="text-2xl font-bold">The Zyquence Approach</h3>
                <div className="text-muted-foreground space-y-4 leading-relaxed">
                  <p>
                    My friends and I love playing mini-games, and I realized they actually help us focus, 
                    reset, and stay motivated. So I decided to build a workshop where people can:
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Practice Python, SQL, and cybersecurity</li>
                    <li>Develop real tech skills</li>
                    <li>Stay engaged through mini-games</li>
                    <li>Learn at their own pace</li>
                    <li>Build confidence and creativity</li>
                  </ul>
                  <p className="text-cyber-cyan font-semibold">
                    Zyquence is for people who learn differently. People with ADHD. People with disabilities. 
                    People who want to build confidence without needing permission from anyone.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-8 bg-gradient-to-br from-cyber-blue/10 to-cyber-green/10 backdrop-blur-sm border-cyber-blue/30 card-glow">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-lg bg-cyber-blue/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-8 h-8 text-cyber-blue" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold mb-3">Our Goal</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Empower anyone, anywhere, to develop new skills through a fun, aesthetic, ADHD-friendly 
                  platform that blends learning with mini-games, creativity, and focus. We're building the 
                  operating system for personal growth.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Mission;
