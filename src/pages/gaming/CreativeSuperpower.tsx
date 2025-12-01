import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Palette, Music, Camera, PenTool } from "lucide-react";
import { toast } from "sonner";

const CreativeSuperpower = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState({
    art: 25,
    music: 40,
    photography: 15,
    design: 30
  });

  const unlockSkill = (skillName: string) => {
    toast.success(`${skillName} skill level increased! Keep practicing!`);
    setSkills(prev => ({
      ...prev,
      [skillName]: Math.min(100, prev[skillName as keyof typeof prev] + 10)
    }));
  };

  const talents = [
    {
      icon: Palette,
      name: "Visual Art",
      skill: "art",
      level: skills.art,
      color: "from-purple-500 to-pink-500",
      challenges: ["Draw with symmetry", "Color theory master", "Abstract expression"]
    },
    {
      icon: Music,
      name: "Music Creation",
      skill: "music",
      level: skills.music,
      color: "from-blue-500 to-cyan-500",
      challenges: ["Compose a melody", "Beat making", "Harmony practice"]
    },
    {
      icon: Camera,
      name: "Photography",
      skill: "photography",
      level: skills.photography,
      color: "from-orange-500 to-red-500",
      challenges: ["Rule of thirds", "Golden hour shots", "Portrait mastery"]
    },
    {
      icon: PenTool,
      name: "Digital Design",
      skill: "design",
      level: skills.design,
      color: "from-green-500 to-emerald-500",
      challenges: ["Logo design", "UI patterns", "Typography skills"]
    }
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
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Creative Superpower</h1>
          </div>
          <p className="text-muted-foreground">Unlock and develop your hidden creative talents</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {talents.map((talent) => (
            <Card key={talent.skill} className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${talent.color} flex items-center justify-center`}>
                    <talent.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{talent.name}</h3>
                    <Badge variant="secondary">Level {Math.floor(talent.level / 10)}</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{talent.level}%</span>
                </div>
                <Progress value={talent.level} className="h-2" />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Challenges:</p>
                <div className="space-y-2">
                  {talent.challenges.map((challenge, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="w-full justify-start text-sm"
                      onClick={() => unlockSkill(talent.skill)}
                    >
                      {challenge}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 bg-gradient-to-r from-primary/10 to-background border-primary/20">
          <div className="flex gap-4 items-start">
            <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Daily Creative Challenge</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Complete today's challenge to unlock bonus XP and improve your creative skills!
              </p>
              <Button>Start Today's Challenge</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CreativeSuperpower;
