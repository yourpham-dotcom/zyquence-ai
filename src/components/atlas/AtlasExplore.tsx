import { useState } from "react";
import { Search, MapPin, Coffee, ShoppingBag, Utensils, Landmark, Filter, Zap, Eye, Clock, Heart, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const AtlasExplore = () => {
  const [activeCategory, setActiveCategory] = useState<string>("food");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [tasteProfile, setTasteProfile] = useState({
    foodVibe: "clean",
    energy: "low",
    style: "streetwear",
    intent: "chill",
  });
  const [showProfile, setShowProfile] = useState(false);

  const categories = [
    { id: "food", label: "Food", icon: Utensils },
    { id: "shopping", label: "Shopping", icon: ShoppingBag },
    { id: "coffee", label: "Coffee & Chill", icon: Coffee },
    { id: "culture", label: "Culture", icon: Landmark },
  ];

  const athleteFilters = [
    { id: "safe", label: "Safe & Discreet", icon: Eye },
    { id: "quick", label: "Quick In-and-Out", icon: Clock },
    { id: "low-distraction", label: "Low Distraction", icon: Zap },
    { id: "recovery", label: "Recovery-Aligned", icon: Heart },
    { id: "content", label: "Content-Friendly", icon: Camera },
  ];

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const foodPlaces = [
    { name: "Green Kitchen", type: "Game-Day Approved", tags: ["clean eating", "quick"], rating: "Recovery-friendly", distance: "0.8 mi" },
    { name: "Midnight Fuel", type: "Late-Night Safe", tags: ["protein-heavy", "discreet"], rating: "Athlete favorite", distance: "1.2 mi" },
    { name: "The Harvest Table", type: "Recovery-Friendly", tags: ["organic", "low-key"], rating: "Low distraction", distance: "2.1 mi" },
    { name: "Sakura Bowl", type: "Game-Day Approved", tags: ["lean", "quick in-and-out"], rating: "Pre-game ready", distance: "0.5 mi" },
  ];

  const shoppingPlaces = [
    { name: "Tier Zero", type: "Sneakers", tags: ["exclusive drops", "discreet"], rating: "VIP access", distance: "1.5 mi" },
    { name: "Local Thread", type: "Local Designers", tags: ["streetwear", "unique"], rating: "Low-key", distance: "0.9 mi" },
    { name: "Luxe District", type: "Luxury", tags: ["high-end", "private shopping"], rating: "Appointment only", distance: "3.2 mi" },
  ];

  const coffeePlaces = [
    { name: "Analog Coffee", type: "Chill Spot", tags: ["quiet", "good wifi"], rating: "Low energy", distance: "0.4 mi" },
    { name: "The Reading Room", type: "Coffee & Books", tags: ["no crowds", "relaxing"], rating: "Recovery vibe", distance: "1.1 mi" },
  ];

  const culturePlaces = [
    { name: "City Art Museum", type: "Art", tags: ["low energy", "inspiring"], rating: "Walkable", distance: "2.0 mi" },
    { name: "Historic Quarter", type: "Exploration", tags: ["cultural", "photo-worthy"], rating: "Content-friendly", distance: "1.8 mi" },
  ];

  const getPlaces = () => {
    const map: Record<string, typeof foodPlaces> = {
      food: foodPlaces,
      shopping: shoppingPlaces,
      coffee: coffeePlaces,
      culture: culturePlaces,
    };
    let places = map[activeCategory] || foodPlaces;
    if (searchQuery) {
      places = places.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return places;
  };

  const profileOptions = {
    foodVibe: ["Clean", "Comfort", "Adventurous", "Quick"],
    energy: ["Low", "Medium", "High"],
    style: ["Streetwear", "Luxury", "Casual", "Local"],
    intent: ["Chill", "Explore", "Fuel Up", "Content"],
  };

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search places..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
              activeCategory === cat.id
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:border-foreground/30"
            }`}
          >
            <cat.icon className="h-3.5 w-3.5" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Athlete Filters */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            Athlete Filters
          </div>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="text-xs text-foreground/70 hover:text-foreground transition-colors"
          >
            {showProfile ? "Hide" : "Taste"} Profile
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {athleteFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => toggleFilter(filter.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-all ${
                activeFilters.includes(filter.id)
                  ? "bg-foreground/10 border-foreground/30 text-foreground"
                  : "border-border/50 text-muted-foreground hover:border-border"
              }`}
            >
              <filter.icon className="h-3 w-3" />
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Taste Profile */}
      {showProfile && (
        <Card className="border-border/50">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-medium">Your Taste Profile</p>
            {Object.entries(profileOptions).map(([key, options]) => (
              <div key={key} className="space-y-1.5">
                <p className="text-xs text-muted-foreground capitalize">{key === "foodVibe" ? "Food Vibe" : key}</p>
                <div className="flex gap-1.5 flex-wrap">
                  {options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setTasteProfile((prev) => ({ ...prev, [key]: opt.toLowerCase() }))}
                      className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                        tasteProfile[key as keyof typeof tasteProfile] === opt.toLowerCase()
                          ? "bg-foreground text-background border-foreground"
                          : "border-border text-muted-foreground hover:border-foreground/30"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Places List */}
      <div className="space-y-3">
        {getPlaces().map((place, i) => (
          <Card key={i} className="border-border/50 hover:border-foreground/15 transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <p className="text-sm font-medium">{place.name}</p>
                  <p className="text-xs text-muted-foreground">{place.type}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {place.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {place.distance}
                  </div>
                  <p className="text-[10px] text-foreground/60">{place.rating}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AtlasExplore;
