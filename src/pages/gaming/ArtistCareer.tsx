import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Trophy, Shield, DollarSign, Users, Music } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const ArtistCareer = () => {
  const { toast } = useToast();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [reputation, setReputation] = useState(350);
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null);

  const recordDeals = [
    {
      id: "indie",
      label: "Independent Label",
      upfront: "$50,000",
      royaltyRate: "70%",
      creativeControl: "Full",
      isCorrect: false,
      pros: ["High creative freedom", "Better royalty rate", "Direct fan connection"],
      cons: ["Limited marketing budget", "Less industry connections", "Self-funded tours"]
    },
    {
      id: "major",
      label: "Major Label Deal",
      upfront: "$500,000",
      royaltyRate: "15%",
      creativeControl: "Limited",
      isCorrect: true,
      pros: ["Large marketing budget", "Industry connections", "Professional team"],
      cons: ["Low royalty rate", "Limited creative control", "Long contract terms"]
    },
    {
      id: "distribution",
      label: "Distribution Deal",
      upfront: "$25,000",
      royaltyRate: "85%",
      creativeControl: "Full",
      isCorrect: false,
      pros: ["Highest royalty rate", "Full creative control", "Flexible terms"],
      cons: ["Minimal support", "Self-marketing", "No advance recoupment help"]
    },
    {
      id: "360",
      label: "360 Deal",
      upfront: "$750,000",
      royaltyRate: "10%",
      creativeControl: "Minimal",
      isCorrect: false,
      pros: ["Huge upfront payment", "All-inclusive support", "Maximum exposure"],
      cons: ["Label takes from all revenue", "Lowest royalty rate", "Long-term commitment"]
    }
  ];

  const checkAnswer = (dealId: string) => {
    setSelectedDeal(dealId);
    const deal = recordDeals.find(d => d.id === dealId);
    
    if (deal?.isCorrect) {
      toast({
        title: "Correct! 🎉",
        description: "For a new artist, a major label provides the best balance of support and growth potential.",
      });
      setReputation(reputation + 100);
    } else {
      toast({
        title: "Not quite...",
        description: "Think about what a new artist needs most: exposure, marketing, and professional support.",
        variant: "destructive"
      });
    }
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
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Artist Career Simulator</h1>
            <p className="text-muted-foreground">Learn the music industry & protect your career</p>
          </div>
          <div className="flex gap-4">
            <Badge variant="outline">
              <Trophy className="w-3 h-3 mr-1" />
              Level {currentLevel}
            </Badge>
            <Badge variant="outline">
              <Users className="w-3 h-3 mr-1" />
              {reputation} Rep
            </Badge>
          </div>
        </div>

        {/* Record Deal Quiz */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Music className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Record Deal Decision</h2>
              <p className="text-sm text-muted-foreground">
                You're an upcoming artist who just went viral. Four labels are offering deals. Which is best?
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {recordDeals.map((deal) => (
              <Card 
                key={deal.id}
                className={`p-6 cursor-pointer transition-all ${
                  selectedDeal === deal.id 
                    ? deal.isCorrect 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-red-500 bg-red-500/10'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => checkAnswer(deal.id)}
              >
                <h3 className="font-semibold text-lg mb-4">{deal.label}</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Upfront Payment:</span>
                    <span className="font-medium">{deal.upfront}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Royalty Rate:</span>
                    <span className="font-medium">{deal.royaltyRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Creative Control:</span>
                    <span className="font-medium">{deal.creativeControl}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-green-600 mb-1">Pros:</p>
                    <ul className="text-xs space-y-1">
                      {deal.pros.map((pro, i) => (
                        <li key={i}>• {pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-red-600 mb-1">Cons:</p>
                    <ul className="text-xs space-y-1">
                      {deal.cons.map((con, i) => (
                        <li key={i}>• {con}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {selectedDeal === deal.id && (
                  <Button className="w-full mt-4" variant={deal.isCorrect ? "default" : "destructive"}>
                    {deal.isCorrect ? "Correct Answer! ✓" : "Try Again"}
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </Card>

        {/* Cybersecurity for Artists */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Artist Cybersecurity</h2>
              <p className="text-sm text-muted-foreground">
                Protect your music, social accounts, and income streams
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Social Media Security</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Learn to protect your accounts from hackers
              </p>
              <Button className="w-full" variant="outline">Start Module</Button>
            </Card>

            <Card className="p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Copyright Protection</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Safeguard your music and intellectual property
              </p>
              <Button className="w-full" variant="outline">Learn More</Button>
            </Card>

            <Card className="p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Financial Security</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Protect your royalties and income
              </p>
              <Button className="w-full" variant="outline">Get Started</Button>
            </Card>
          </div>
        </Card>

        {/* Career Progress */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Your Career Progress</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Industry Knowledge</span>
                <span>65%</span>
              </div>
              <Progress value={65} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Business Acumen</span>
                <span>40%</span>
              </div>
              <Progress value={40} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Security Awareness</span>
                <span>30%</span>
              </div>
              <Progress value={30} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ArtistCareer;
