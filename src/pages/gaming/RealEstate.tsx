import { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building, Home, DollarSign, Box } from "lucide-react";
import { toast } from "sonner";
import HouseBuilderChat from "@/components/gaming/HouseBuilderChat";
import type { HouseParams } from "@/components/gaming/HouseModel3D";
import { defaultHouseParams } from "@/components/gaming/HouseModel3D";

const HouseModel3D = lazy(() => import("@/components/gaming/HouseModel3D"));

const RealEstate = () => {
  const navigate = useNavigate();
  const [cash, setCash] = useState(100000);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [properties, setProperties] = useState<string[]>([]);
  const [houseParams, setHouseParams] = useState<HouseParams | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  const buyProperty = (name: string, cost: number, income: number) => {
    if (cash >= cost) {
      setCash(cash - cost);
      setMonthlyIncome(monthlyIncome + income);
      setProperties([...properties, name]);
      toast.success(`${name} purchased! +$${income}/month`);
    } else {
      toast.error("Not enough cash!");
    }
  };

  const propertyTypes = [
    { name: "Studio Apartment", cost: 50000, income: 1200, icon: "🏠", description: "Small but steady rental income" },
    { name: "Family Home", cost: 150000, income: 2500, icon: "🏡", description: "Perfect for long-term renters" },
    { name: "Airbnb Condo", cost: 200000, income: 4000, icon: "🏢", description: "High income from short stays" },
    { name: "Commercial Space", cost: 300000, income: 6000, icon: "🏬", description: "Business rental for stable income" },
    { name: "Luxury Villa", cost: 500000, income: 10000, icon: "🏰", description: "Premium property, premium rent" },
    { name: "Apartment Complex", cost: 800000, income: 15000, icon: "🏛️", description: "Multiple units, massive income" },
  ];

  return (
    <div className="h-screen bg-background overflow-y-auto">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/gaming-intelligence")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Building className="w-8 h-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">Real Estate Empire</h1>
          </div>
          <p className="text-muted-foreground">Build your property portfolio and generate passive income</p>
        </div>

        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <Card className="p-3 md:p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <Badge variant="secondary" className="text-sm md:text-lg">${cash.toLocaleString()}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Available Cash</p>
          </Card>
          <Card className="p-3 md:p-4">
            <Badge variant="secondary" className="text-sm md:text-lg text-green-600">+${monthlyIncome}/mo</Badge>
            <p className="text-xs text-muted-foreground mt-1">Monthly Income</p>
          </Card>
          <Card className="p-3 md:p-4">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-primary" />
              <Badge variant="secondary" className="text-sm md:text-lg">{properties.length}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Properties</p>
          </Card>
        </div>

        {/* 3D House Builder Section */}
        <Card className="p-4 md:p-6 border-primary/30 bg-gradient-to-r from-primary/5 to-background">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Box className="w-6 h-6 text-primary" />
              <div>
                <h2 className="text-xl font-bold">3D Dream Home Builder</h2>
                <p className="text-sm text-muted-foreground">Chat with AI to design your dream property in 3D</p>
              </div>
            </div>
            <Button
              variant={showBuilder ? "secondary" : "default"}
              onClick={() => {
                setShowBuilder(!showBuilder);
                if (!houseParams) setHouseParams(defaultHouseParams);
              }}
            >
              <Box className="w-4 h-4 mr-2" />
              {showBuilder ? "Hide Builder" : "Open Builder"}
            </Button>
          </div>

          {showBuilder && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              {/* Chat Panel */}
              <div className="h-[400px] md:h-[500px]">
                <HouseBuilderChat onHouseGenerated={(params) => setHouseParams(params)} />
              </div>

              {/* 3D Viewer */}
              <div className="h-[400px] md:h-[500px] rounded-lg overflow-hidden border border-border">
                <Suspense
                  fallback={
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <div className="text-center space-y-2">
                        <Box className="w-8 h-8 text-primary animate-pulse mx-auto" />
                        <p className="text-sm text-muted-foreground">Loading 3D viewer...</p>
                      </div>
                    </div>
                  }
                >
                  {houseParams && <HouseModel3D params={houseParams} />}
                </Suspense>
              </div>
            </div>
          )}
        </Card>

        {properties.length > 0 && (
          <Card className="p-4 md:p-6">
            <h3 className="text-lg font-semibold mb-4">Your Portfolio</h3>
            <div className="flex flex-wrap gap-2">
              {properties.map((property, idx) => (
                <Badge key={idx} variant="outline" className="text-sm">
                  {property}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        <div>
          <h2 className="text-2xl font-bold mb-4">Available Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {propertyTypes.map((property) => (
              <Card key={property.name} className="p-4 hover:border-primary/50 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl">{property.icon}</span>
                    <Badge variant="secondary">${property.income}/mo</Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{property.name}</h3>
                    <p className="text-sm text-muted-foreground">{property.description}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-medium">${property.cost.toLocaleString()}</span>
                    <Button
                      size="sm"
                      onClick={() => buyProperty(property.name, property.cost, property.income)}
                      disabled={cash < property.cost}
                    >
                      Buy
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-4 md:p-6 bg-gradient-to-r from-primary/10 to-background border-primary/20">
          <h3 className="text-lg font-semibold mb-2">💡 Investment Tip</h3>
          <p className="text-sm text-muted-foreground">
            Start with smaller properties to build steady income, then reinvest in larger properties for exponential growth!
          </p>
        </Card>
      </div>
    </div>
  );
};

export default RealEstate;
