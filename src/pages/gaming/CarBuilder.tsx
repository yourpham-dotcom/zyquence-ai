import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Car, Zap } from "lucide-react";
import { toast } from "sonner";

const CarBuilder = () => {
  const navigate = useNavigate();
  const [budget, setBudget] = useState(50000);
  const [speed, setSpeed] = useState(0);
  const [handling, setHandling] = useState(0);

  const addPart = (part: string, cost: number, speedBoost: number, handlingBoost: number) => {
    if (budget >= cost) {
      setBudget(budget - cost);
      setSpeed(speed + speedBoost);
      setHandling(handling + handlingBoost);
      toast.success(`${part} installed!`);
    } else {
      toast.error("Not enough budget!");
    }
  };

  const engines = [
    { name: "V6 Engine", cost: 5000, speed: 20, handling: 5, icon: "⚙️" },
    { name: "V8 Engine", cost: 10000, speed: 40, handling: 10, icon: "🔧" },
    { name: "Turbo Kit", cost: 8000, speed: 35, handling: 15, icon: "💨" },
    { name: "Supercharger", cost: 12000, speed: 50, handling: 20, icon: "⚡" }
  ];

  const body = [
    { name: "Aerodynamic Kit", cost: 3000, speed: 10, handling: 20, icon: "🏎️" },
    { name: "Spoiler", cost: 2000, speed: 5, handling: 15, icon: "🔰" },
    { name: "Custom Paint", cost: 1500, speed: 0, handling: 5, icon: "🎨" },
    { name: "Racing Stripes", cost: 1000, speed: 0, handling: 5, icon: "🏁" }
  ];

  const wheels = [
    { name: "Sport Wheels", cost: 2500, speed: 10, handling: 15, icon: "⭕" },
    { name: "Racing Tires", cost: 3500, speed: 15, handling: 25, icon: "🛞" },
    { name: "Alloy Rims", cost: 2000, speed: 5, handling: 10, icon: "⚙️" },
    { name: "Off-Road Tires", cost: 3000, speed: 10, handling: 20, icon: "🌄" }
  ];

  return (
    <div className="h-screen bg-background overflow-y-auto">
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/gaming-intelligence")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Car className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Car Builder Studio</h1>
          </div>
          <p className="text-muted-foreground">Build, customize & race your dream car</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-lg">💰 ${budget.toLocaleString()}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Available Budget</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <Badge variant="secondary" className="text-lg">{speed}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Speed Rating</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-lg">🎯 {handling}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Handling Rating</p>
          </Card>
        </div>

        <Tabs defaultValue="engine" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="engine">Engine</TabsTrigger>
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="wheels">Wheels</TabsTrigger>
          </TabsList>

          <TabsContent value="engine" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              {engines.map((item) => (
                <Card key={item.name} className="p-4 hover:border-primary/50 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{item.icon}</span>
                      <h3 className="font-semibold">{item.name}</h3>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cost:</span>
                      <span className="font-medium">${item.cost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Speed:</span>
                      <span className="font-medium text-yellow-600">+{item.speed}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Handling:</span>
                      <span className="font-medium text-blue-600">+{item.handling}</span>
                    </div>
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => addPart(item.name, item.cost, item.speed, item.handling)}
                    >
                      Install
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="body" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              {body.map((item) => (
                <Card key={item.name} className="p-4 hover:border-primary/50 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{item.icon}</span>
                      <h3 className="font-semibold">{item.name}</h3>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cost:</span>
                      <span className="font-medium">${item.cost.toLocaleString()}</span>
                    </div>
                    {item.speed > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Speed:</span>
                        <span className="font-medium text-yellow-600">+{item.speed}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Handling:</span>
                      <span className="font-medium text-blue-600">+{item.handling}</span>
                    </div>
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => addPart(item.name, item.cost, item.speed, item.handling)}
                    >
                      Install
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="wheels" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              {wheels.map((item) => (
                <Card key={item.name} className="p-4 hover:border-primary/50 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{item.icon}</span>
                      <h3 className="font-semibold">{item.name}</h3>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cost:</span>
                      <span className="font-medium">${item.cost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Speed:</span>
                      <span className="font-medium text-yellow-600">+{item.speed}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Handling:</span>
                      <span className="font-medium text-blue-600">+{item.handling}</span>
                    </div>
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => addPart(item.name, item.cost, item.speed, item.handling)}
                    >
                      Install
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Button className="w-full" size="lg">
          🏁 Race Your Car
        </Button>
      </div>
    </div>
  );
};

export default CarBuilder;
