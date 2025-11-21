import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Utensils, TrendingUp, Star, MapPin, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const FoodIntelligence = () => {
  const { toast } = useToast();
  const [craving, setCraving] = useState("");
  const [restaurants, setRestaurants] = useState<any[]>([]);

  const generateRecommendations = () => {
    // Simulated restaurant recommendations using pandas-style ranking
    const mockRestaurants = [
      { name: "Gourmet Burger Co", score: 9.2, distance: "0.5 mi", price: "$$", cuisine: "American" },
      { name: "Tokyo Ramen House", score: 8.9, distance: "1.2 mi", price: "$$$", cuisine: "Japanese" },
      { name: "Bella Italia", score: 8.7, distance: "0.8 mi", price: "$$", cuisine: "Italian" },
      { name: "Taco Paradise", score: 8.5, distance: "0.3 mi", price: "$", cuisine: "Mexican" },
      { name: "Green Leaf Cafe", score: 8.3, distance: "1.5 mi", price: "$$", cuisine: "Healthy" }
    ];
    
    setRestaurants(mockRestaurants);
    toast({ title: "Recommendations generated!", description: "Ranked by taste, distance & price" });
  };

  const analyzeContentPotential = (restaurant: string) => {
    const scores = {
      aesthetics: Math.floor(Math.random() * 30) + 70,
      uniqueness: Math.floor(Math.random() * 30) + 70,
      viralPotential: Math.floor(Math.random() * 30) + 70
    };
    
    toast({
      title: "Content Analysis Complete",
      description: `${restaurant}: ${scores.viralPotential}% viral potential`,
    });
  };

  return (
    <div className="h-screen bg-background p-6 overflow-y-auto">
      <div className="container mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/gaming-intelligence">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Food Intelligence</h1>
            <p className="text-muted-foreground">AI-powered restaurant recommendations & content analysis</p>
          </div>
        </div>

        {/* Food A&R - Restaurant Finder */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Utensils className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Food A&R - Smart Recommendations</h2>
              <p className="text-sm text-muted-foreground">
                Tell us what you're craving, we'll rank the best options
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="What are you craving? (e.g., burgers, sushi, tacos)"
                value={craving}
                onChange={(e) => setCraving(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && generateRecommendations()}
              />
              <Button onClick={generateRecommendations}>
                Find Restaurants
              </Button>
            </div>

            {restaurants.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium">Ranked from Best to Worst (Powered by Pandas)</p>
                {restaurants.map((restaurant, index) => (
                  <Card key={index} className="p-4 bg-muted/50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                          <span className="font-bold text-sm">#{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium">{restaurant.name}</h4>
                          <p className="text-xs text-muted-foreground">{restaurant.cuisine}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-500">{restaurant.score}/10</Badge>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {restaurant.distance}
                      </span>
                      <span>{restaurant.price}</span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        Top Match
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Content Creator ML Tool */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
              <Camera className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Content Creator ML Tool</h2>
              <p className="text-sm text-muted-foreground">
                Predict restaurant viability & content performance using machine learning
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-muted/50 space-y-4">
              <h3 className="font-semibold">Restaurant Scouting</h3>
              <p className="text-sm text-muted-foreground">
                Our ML model analyzes restaurants for content potential based on:
              </p>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Visual aesthetics & Instagram-worthiness
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Unique dishes & presentation
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Location traffic & visibility
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Social media engagement potential
                </li>
              </ul>
              <Button className="w-full">Scan New Restaurant</Button>
            </Card>

            <Card className="p-6 bg-muted/50 space-y-4">
              <h3 className="font-semibold">Profitability Predictor</h3>
              <p className="text-sm text-muted-foreground">
                AI predicts success metrics for both creator & restaurant:
              </p>
              
              <div className="space-y-3 mt-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Content Performance</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '87%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Restaurant Traffic Boost</span>
                    <span className="font-medium">64%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500" style={{ width: '64%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Long-term Partnership</span>
                    <span className="font-medium">72%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '72%' }}></div>
                  </div>
                </div>
              </div>

              <Button className="w-full" variant="outline">View Full Report</Button>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["Italian Spot", "Sushi Bar", "Taco Truck", "Cafe"].map((spot) => (
              <Button
                key={spot}
                variant="outline"
                size="sm"
                onClick={() => analyzeContentPotential(spot)}
              >
                <TrendingUp className="w-3 h-3 mr-2" />
                Analyze {spot}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FoodIntelligence;
