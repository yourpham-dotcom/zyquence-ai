import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Star, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Missions = () => {
  const [missions, setMissions] = useState<any[]>([]);
  const [completions, setCompletions] = useState<any[]>([]);

  useEffect(() => {
    loadMissions();
    loadCompletions();
  }, []);

  const loadMissions = async () => {
    const { data } = await supabase
      .from("di_missions")
      .select("*")
      .order("order_index");
    
    if (data) setMissions(data);
  };

  const loadCompletions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("di_mission_completions")
      .select("*")
      .eq("user_id", user.id);
    
    if (data) setCompletions(data);
  };

  const getMissionStatus = (missionId: string) => {
    return completions.find(c => c.mission_id === missionId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500";
      case "intermediate": return "bg-yellow-500";
      case "advanced": return "bg-orange-500";
      case "expert": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/data-intelligence">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Missions</h1>
            <p className="text-muted-foreground">Complete challenges and earn XP</p>
          </div>
        </div>

        <div className="grid gap-4">
          {missions.map((mission) => {
            const status = getMissionStatus(mission.id);
            const isCompleted = status?.status === "completed";
            const progress = status?.progress || 0;

            return (
              <Card key={mission.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg ${isCompleted ? 'bg-green-500/20' : 'bg-primary/10'} flex items-center justify-center`}>
                      {isCompleted ? (
                        <Trophy className="w-6 h-6 text-green-500" />
                      ) : (
                        <Star className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{mission.title}</h3>
                        <Badge className={getDifficultyColor(mission.difficulty)}>
                          {mission.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {mission.description}
                      </p>
                      
                      {mission.objectives && (
                        <div className="space-y-2 mb-4">
                          <p className="text-sm font-medium">Objectives:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {mission.objectives.map((obj: string, i: number) => (
                              <li key={i} className="text-sm text-muted-foreground">
                                {obj}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {status && !isCompleted && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className="text-yellow-500">
                      +{mission.xp_reward} XP
                    </Badge>
                    {isCompleted ? (
                      <Badge className="bg-green-500">Completed</Badge>
                    ) : (
                      <Button size="sm">Start Mission</Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}

          {missions.length === 0 && (
            <Card className="p-12 text-center">
              <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Missions Available</h3>
              <p className="text-sm text-muted-foreground">
                Check back later for new challenges
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Missions;
