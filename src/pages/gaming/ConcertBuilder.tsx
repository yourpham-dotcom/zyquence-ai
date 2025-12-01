import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Music, Lightbulb, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";

const ConcertBuilder = () => {
  const navigate = useNavigate();
  const [budget, setBudget] = useState(50000);
  const [venueCapacity, setVenueCapacity] = useState(0);

  const addItem = (item: string, cost: number, capacity: number) => {
    if (budget >= cost) {
      setBudget(budget - cost);
      setVenueCapacity(venueCapacity + capacity);
      toast.success(`${item} added to your venue!`);
    } else {
      toast.error("Not enough budget!");
    }
  };

  const stageItems = [
    { name: "Basic Stage", cost: 5000, capacity: 100, icon: "🎤" },
    { name: "LED Wall", cost: 15000, capacity: 0, icon: "📺" },
    { name: "Professional Sound", cost: 10000, capacity: 0, icon: "🔊" },
    { name: "Lighting Rig", cost: 8000, capacity: 0, icon: "💡" }
  ];

  const seatingItems = [
    { name: "Floor Seating", cost: 3000, capacity: 200, icon: "🪑" },
    { name: "VIP Lounge", cost: 12000, capacity: 50, icon: "⭐" },
    { name: "Balcony Section", cost: 8000, capacity: 150, icon: "🏛️" },
    { name: "Standing Area", cost: 2000, capacity: 300, icon: "👥" }
  ];

  const amenities = [
    { name: "Bar & Drinks", cost: 5000, capacity: 0, icon: "🍹" },
    { name: "Food Court", cost: 7000, capacity: 0, icon: "🍔" },
    { name: "Merch Store", cost: 4000, capacity: 0, icon: "👕" },
    { name: "Photo Booth", cost: 2000, capacity: 0, icon: "📸" }
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
            <Music className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Concert Venue Builder</h1>
          </div>
          <p className="text-muted-foreground">Design and build your dream concert venue</p>
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
              <Badge variant="secondary" className="text-lg">👥 {venueCapacity}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total Capacity</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-lg">✨ Level 1</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Venue Level</p>
          </Card>
        </div>

        <Tabs defaultValue="stage" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stage">Stage & Tech</TabsTrigger>
            <TabsTrigger value="seating">Seating</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
          </TabsList>

          <TabsContent value="stage" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              {stageItems.map((item) => (
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
                    {item.capacity > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Capacity:</span>
                        <span className="font-medium">+{item.capacity}</span>
                      </div>
                    )}
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => addItem(item.name, item.cost, item.capacity)}
                    >
                      Add to Venue
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="seating" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              {seatingItems.map((item) => (
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
                      Add to Venue
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="amenities" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              {amenities.map((item) => (
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
                      Add to Venue
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

export default ConcertBuilder;
