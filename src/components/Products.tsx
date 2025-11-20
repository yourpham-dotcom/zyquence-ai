import { Card } from "@/components/ui/card";
import { Music, Trophy, Gamepad2, Shield, TrendingUp } from "lucide-react";

const products = [
  {
    icon: Music,
    title: "Zyquence Music",
    description: "Full studio experience software with AI-powered recording, YouTube integration, and creative tools for artists.",
    color: "cyber-blue",
  },
  {
    icon: Trophy,
    title: "Zyquence Sports",
    description: "Athlete development platform with mental readiness tools, recruiting profiles, and brand architect features.",
    color: "cyber-cyan",
  },
  {
    icon: Gamepad2,
    title: "Zyquence Gaming",
    description: "ADHD-friendly learning through mini-games. Master Python, SQL, cybersecurity while staying focused and entertained.",
    color: "cyber-green",
  },
  {
    icon: Shield,
    title: "Zyquence Cybersecurity",
    description: "Protect your digital identity with fraud detection, secure vaults, and AI-powered threat monitoring.",
    color: "neon",
  },
  {
    icon: TrendingUp,
    title: "Zyquence Tech Sales",
    description: "Skill development software with CRM simulations and cold-calling practice for career advancement.",
    color: "cyber-cyan",
  },
];

const Products = () => {
  return (
    <section id="products" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-gradient">Product Ecosystem</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Five powerful platforms working together to accelerate your growth across multiple industries
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {products.map((product, index) => (
            <Card
              key={product.title}
              className="group relative p-8 bg-card/50 backdrop-blur-sm border-border hover:border-cyber-blue/50 transition-all duration-300 card-glow hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
              
              <div className="relative z-10 space-y-4">
                <div className={`w-14 h-14 rounded-lg bg-${product.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <product.icon className={`w-7 h-7 text-${product.color}`} />
                </div>
                
                <h3 className="text-2xl font-bold">{product.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;
