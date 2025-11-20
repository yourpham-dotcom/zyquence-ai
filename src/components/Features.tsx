import { Card } from "@/components/ui/card";
import { Code, Database, Lock, Palette, Target, Zap } from "lucide-react";

const features = [
  {
    icon: Code,
    title: "Learn to Code",
    description: "Master Python, SQL, and pandas through interactive exercises and real-world projects.",
  },
  {
    icon: Database,
    title: "Data Skills",
    description: "Build data analysis expertise with hands-on practice in data manipulation and visualization.",
  },
  {
    icon: Lock,
    title: "Cybersecurity Training",
    description: "Protect yourself and others with practical cybersecurity knowledge and simulations.",
  },
  {
    icon: Palette,
    title: "Creative Tools",
    description: "Digital A&R, recording studio, brand development, and creative intelligence features.",
  },
  {
    icon: Target,
    title: "Career Development",
    description: "Resume building, interview practice, and career pathway modeling powered by AI.",
  },
  {
    icon: Zap,
    title: "Mini-Games Sidebar",
    description: "Stay focused and relieve stress with engaging mini-games while you work and learn.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-card/20 to-background" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-gradient">Core Features</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to grow, learn, and succeed — all in one platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group p-8 bg-card/50 backdrop-blur-sm border-border hover:border-cyber-cyan/50 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-cyber-cyan/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-cyber-cyan" />
                </div>
                
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
