import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Dumbbell, Trophy } from "lucide-react";
import { toast } from "sonner";

const SportsArena = () => {
  const navigate = useNavigate();
  const [budget, setBudget] = useState(100000);
  const [capacity, setCapacity] = useState(0);

  const addItem = (item: string, cost: number, seats: number) => {
    if (budget >= cost) {
      setBudget(budget - cost);
      setCapacity(capacity + seats);
      toast.success(`${item} added to your arena!`);
    } else {
      toast.error("Not enough budget!");
    }
  };

  const courts = [
    { name: "Basketball Court", cost: 25000, capacity: 0, icon: "🏀" },
    { name: "Training Facility", cost: 15000, capacity: 0, icon: "💪" },
    { name: "Locker Rooms", cost: 10000, capacity: 0, icon: "🚿" },
    { name: "Practice Court", cost: 12000, capacity: 0, icon: "⛹️" }
  ];

  const seating = [
    { name: "Lower Bowl", cost: 20000, capacity: 500, icon: "🪑" },
    { name: "Upper Deck", cost: 15000, capacity: 800, icon: "🏟️" },
    { name: "Luxury Suites", cost: 30000, capacity: 100, icon: "⭐" },
    { name: "Courtside Seats", cost: 40000, capacity: 50, icon: "💺" }
  ];

  const features = [
    { name: "Jumbotron", cost: 35000, capacity: 0, icon: "📺" },
    { name: "Concessions", cost: 8000, capacity: 0, icon: "🍿" },
    { name: "Pro Shop", cost: 10000, capacity: 0, icon: "👕" },
    { name: "Press Box", cost: 12000, capacity: 0, icon: "📰" }
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
            <Dumbbell className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Sports Arena Builder</h1>
          </div>
          <p className="text-muted-foreground">Design professional basketball gyms and stadiums</p>
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
              <Badge variant="secondary" className="text-lg">👥 {capacity}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total Capacity</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-lg">🏆 Level 1</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Arena Level</p>
          </Card>
        </div>

        <Tabs defaultValue="courts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="courts">Courts & Facilities</TabsTrigger>
            <TabsTrigger value="seating">Seating</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          <TabsContent value="courts" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              {courts.map((item) => (
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
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => addItem(item.name, item.cost, item.capacity)}
                    >
                      Build
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="seating" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              {seating.map((item) => (
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
                      <span className="text-muted-foreground">Capacity:</span>
                      <span className="font-medium">+{item.capacity}</span>
                    </div>
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => addItem(item.name, item.cost, item.capacity)}
                    >
                      Build
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((item) => (
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
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => addItem(item.name, item.cost, item.capacity)}
                    >
                      Build
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SportsArena;
