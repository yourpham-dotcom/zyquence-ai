import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Gamepad2, Brain, Palette, Code, Shield, Home, Car, 
  Music, Utensils, Trophy, Sparkles, BookOpen, Dumbbell,
  FileCode, Camera, Building, Loader2
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import ProGate from "@/components/ProGate";

const GamingIntelligence = () => {
  const { isPro, loading: subLoading } = useSubscription();

  if (subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isPro) {
    return <ProGate />;
  }

  const features = [
    {
      icon: Gamepad2,
      title: "Mini Games",
      description: "Basketball, Racing, Ping Pong & More",
      path: "/gaming-intelligence/mini-games",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Brain,
      title: "Mental Wellness Lab",
      description: "ADHD support, focus training, sleep aids",
      path: "/gaming-intelligence/mental-wellness",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Sparkles,
      title: "Creative Superpower",
      description: "Unlock hidden talents & creative abilities",
      path: "/gaming-intelligence/creative-superpower",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Code,
      title: "Code Practice",
      description: "Python, SQL, Cybersecurity challenges",
      path: "/gaming-intelligence/code-practice",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Music,
      title: "Concert Venue Builder",
      description: "Build & decorate your dream concert venue",
      path: "/gaming-intelligence/concert-builder",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: Dumbbell,
      title: "Sports Arena Builder",
      description: "Design basketball gyms & stadiums",
      path: "/gaming-intelligence/sports-arena",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Building,
      title: "Real Estate Empire",
      description: "Build properties, Airbnb, real estate portfolio",
      path: "/gaming-intelligence/real-estate",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: Trophy,
      title: "Artist Career Simulator",
      description: "Record deals, contracts, cybersecurity",
      path: "/gaming-intelligence/artist-career",
      color: "from-purple-500 to-violet-500"
    },
    {
      icon: Car,
      title: "Car Builder Studio",
      description: "Build, customize & race your cars",
      path: "/gaming-intelligence/car-builder",
      color: "from-gray-500 to-slate-500"
    },
    {
      icon: Utensils,
      title: "Food Intelligence",
      description: "Restaurant finder, content creator ML tools",
      path: "/gaming-intelligence/food-intelligence",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: BookOpen,
      title: "Creative Journal",
      description: "Art journal, mood tracking, reflection",
      path: "/gaming-intelligence/journal",
      color: "from-teal-500 to-cyan-500"
    },
    {
      icon: FileCode,
      title: "Project Manager",
      description: "Save, manage & download your projects",
      path: "/gaming-intelligence/projects",
      color: "from-violet-500 to-purple-500"
    }
  ];

  return (
    <div className="h-screen bg-background overflow-y-auto">
      <div className="container mx-auto p-6 space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Gaming Intelligence Engine</h1>
              <p className="text-muted-foreground">Learn, create, and unlock your potential through gaming</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link key={feature.path} to={feature.path}>
              <Card className="group relative overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 h-full">
                <div className="p-6 space-y-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                  <Button variant="ghost" className="w-full group-hover:bg-muted">
                    Launch →
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* AI Agent Assistant Card */}
        <Card className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">AI Gaming Assistant</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Get personalized recommendations, learning paths, and real-time assistance across all gaming intelligence features. 
                Your AI companion adapts to your learning style and helps unlock your creative potential.
              </p>
              <Button size="sm" className="bg-primary">
                Activate AI Assistant
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GamingIntelligence;
