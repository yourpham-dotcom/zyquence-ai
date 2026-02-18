import { useState, lazy, Suspense } from "react";
import { Search, MapPin, Filter, MapIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const AtlasMap = lazy(() => import("./AtlasMap"));

interface AtlasExploreProps {
  mode: string;
}

const AtlasExplore = ({ mode }: AtlasExploreProps) => {
  const [activeCategory, setActiveCategory] = useState<string>("food");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showMap, setShowMap] = useState(true);

  const categories = [
    { id: "food", label: "Food" },
    { id: "shopping", label: "Shopping" },
    { id: "coffee", label: "Coffee" },
    { id: "walkable", label: "Walkable" },
  ];

  const filters = [
    { id: "time-efficient", label: "Time Efficient" },
    { id: "low-disruption", label: "Low Disruption" },
    { id: "recovery-aware", label: "Recovery Aware" },
    { id: "athlete-pacing", label: "Athlete Pacing" },
  ];

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const getModeLabel = () => {
    switch (mode) {
      case "recovery": return "Recovery priority — lighter options shown first";
      case "exploration": return "Exploration mode — wider range, flexible pacing";
      case "low-energy": return "Low-energy — minimal movement, close proximity";
      case "travel": return "Travel day — airport and hotel area only";
      default: return "";
    }
  };

  const places: Record<string, { name: string; type: string; time: string; distance: string; tags: string[]; lat: number; lng: number }[]> = {
    food: [
      { name: "Clean Kitchen Co", type: "Pre/post-game approved", time: "25 min", distance: "0.6 mi", tags: ["lean", "quick"], lat: 34.0525, lng: -118.2551 },
      { name: "Night Fuel Bar", type: "Late-night available", time: "15 min", distance: "1.1 mi", tags: ["protein", "discreet"], lat: 34.0480, lng: -118.2590 },
      { name: "Harvest Bowl", type: "Recovery-aligned", time: "30 min", distance: "1.8 mi", tags: ["organic", "low-key"], lat: 34.0560, lng: -118.2420 },
      { name: "Sakura Grill", type: "Quick turnaround", time: "20 min", distance: "0.4 mi", tags: ["light", "efficient"], lat: 34.0510, lng: -118.2480 },
    ],
    shopping: [
      { name: "Sole Supply", type: "Footwear", time: "30 min", distance: "1.3 mi", tags: ["drops", "appointment"], lat: 34.0535, lng: -118.2610 },
      { name: "Thread Local", type: "Streetwear", time: "25 min", distance: "0.8 mi", tags: ["local", "unique"], lat: 34.0490, lng: -118.2530 },
      { name: "District Luxe", type: "High-end", time: "45 min", distance: "2.9 mi", tags: ["private", "scheduled"], lat: 34.0580, lng: -118.2350 },
    ],
    coffee: [
      { name: "Analog", type: "Low-traffic", time: "20 min", distance: "0.3 mi", tags: ["quiet", "wifi"], lat: 34.0505, lng: -118.2500 },
      { name: "The Reading Room", type: "Bookstore cafe", time: "30 min", distance: "0.9 mi", tags: ["no crowds"], lat: 34.0545, lng: -118.2560 },
    ],
    walkable: [
      { name: "Riverfront Path", type: "Light walk", time: "30 min", distance: "0.5 mi", tags: ["flat", "low traffic"], lat: 34.0470, lng: -118.2450 },
      { name: "Old Quarter", type: "Neighborhood", time: "45 min", distance: "1.2 mi", tags: ["cultural", "walkable"], lat: 34.0550, lng: -118.2400 },
      { name: "Botanical Grounds", type: "Green space", time: "40 min", distance: "1.6 mi", tags: ["quiet", "open"], lat: 34.0600, lng: -118.2500 },
    ],
  };

  const getFilteredPlaces = () => {
    let list = places[activeCategory] || [];
    if (searchQuery) {
      list = list.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return list;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">City Planner</p>
        <button
          onClick={() => setShowMap(!showMap)}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium border transition-colors ${
            showMap ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground/30"
          }`}
        >
          <MapIcon className="h-3 w-3" />
          Map
        </button>
      </div>

      {/* Map */}
      {showMap && (
        <Suspense fallback={<div className="w-full h-[300px] rounded border border-border bg-muted animate-pulse" />}>
          <AtlasMap
            center={[34.0522, -118.2437]}
            places={getFilteredPlaces().map(p => ({ name: p.name, type: p.type, lat: p.lat, lng: p.lng }))}
          />
        </Suspense>
      )}

      {/* Mode Indicator */}
      <div className="px-3 py-2 border border-border bg-muted/20 text-xs text-muted-foreground">
        {getModeLabel()}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-8 text-sm"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
              activeCategory === cat.id
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:border-foreground/30"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Filter className="h-3 w-3" />
          Filters
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => toggleFilter(f.id)}
              className={`px-2 py-1 text-[11px] font-medium border transition-colors ${
                activeFilters.includes(f.id)
                  ? "bg-foreground/10 border-foreground/30 text-foreground"
                  : "border-border/50 text-muted-foreground hover:border-border"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-2">
        {getFilteredPlaces().map((place, i) => (
          <div key={i} className="flex items-center justify-between p-3 border border-border hover:border-foreground/15 transition-colors">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{place.name}</p>
              <p className="text-[11px] text-muted-foreground">{place.type}</p>
              <div className="flex gap-1.5 mt-1">
                {place.tags.map((tag) => (
                  <span key={tag} className="text-[10px] text-muted-foreground border border-border/50 px-1.5 py-0.5">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right space-y-0.5 shrink-0 ml-3">
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {place.distance}
              </div>
              <p className="text-[11px] text-muted-foreground">{place.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AtlasExplore;
