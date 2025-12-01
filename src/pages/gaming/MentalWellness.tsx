import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Brain, Moon, Focus, Heart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const MentalWellness = () => {
  const [sessionLength, setSessionLength] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [breathCount, setBreathCount] = useState(0);
  const [breathPhase, setBreathPhase] = useState<"in" | "hold" | "out">("in");
  const [isBreathing, setIsBreathing] = useState(false);
  const [moodLevel, setMoodLevel] = useState([5]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const breathRef = useRef<NodeJS.Timeout | null>(null);

  // Focus Timer Logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            toast.success("Focus session complete! Great work! 🎉");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  // Breathing Exercise Logic
  useEffect(() => {
    if (isBreathing) {
      const cycleBreath = () => {
        setBreathPhase("in");
        setTimeout(() => setBreathPhase("hold"), 4000);
        setTimeout(() => setBreathPhase("out"), 8000);
        setTimeout(() => {
          if (isBreathing) {
            setBreathCount((prev) => prev + 1);
          }
        }, 12000);
      };

      cycleBreath();
      breathRef.current = setInterval(cycleBreath, 12000);
    } else {
      if (breathRef.current) clearInterval(breathRef.current);
      setBreathPhase("in");
    }

    return () => {
      if (breathRef.current) clearInterval(breathRef.current);
    };
  }, [isBreathing]);

  const startTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(sessionLength * 60);
    }
    setIsRunning(true);
    toast.success("Focus session started!");
  };

  const pauseTimer = () => {
    setIsRunning(false);
    toast("Timer paused");
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(sessionLength * 60);
    toast("Timer reset");
  };

  const handleSessionLengthChange = (val: number[]) => {
    setSessionLength(val[0]);
    if (!isRunning) {
      setTimeLeft(val[0] * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getBreathText = () => {
    switch (breathPhase) {
      case "in":
        return "Breathe in...";
      case "hold":
        return "Hold...";
      case "out":
        return "Breathe out...";
    }
  };

  const getBreathScale = () => {
    switch (breathPhase) {
      case "in":
        return "scale-150";
      case "hold":
        return "scale-150";
      case "out":
        return "scale-100";
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
          <div>
            <h1 className="text-3xl font-bold">Mental Wellness Lab</h1>
            <p className="text-muted-foreground">ADHD support, focus training & mental health tools</p>
          </div>
        </div>

        <Tabs defaultValue="focus" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="focus">
              <Focus className="w-4 h-4 mr-2" />
              Focus
            </TabsTrigger>
            <TabsTrigger value="sleep">
              <Moon className="w-4 h-4 mr-2" />
              Sleep
            </TabsTrigger>
            <TabsTrigger value="adhd">
              <Brain className="w-4 h-4 mr-2" />
              ADHD Tools
            </TabsTrigger>
            <TabsTrigger value="mood">
              <Heart className="w-4 h-4 mr-2" />
              Mood
            </TabsTrigger>
          </TabsList>

          <TabsContent value="focus" className="space-y-4">
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Focus className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="text-xl font-semibold">Pomodoro Focus Timer</h2>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-6xl font-bold mb-4">{formatTime(timeLeft)}</div>
                  <div className="space-y-2">
                    <label className="text-sm">Session Length (minutes)</label>
                    <Slider
                      value={[sessionLength]}
                      onValueChange={handleSessionLengthChange}
                      min={5}
                      max={60}
                      step={5}
                      className="w-full"
                      disabled={isRunning}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    className="w-full" 
                    onClick={startTimer}
                    disabled={isRunning}
                  >
                    Start
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={pauseTimer}
                    disabled={!isRunning}
                  >
                    Pause
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={resetTimer}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="font-semibold">Breathing Exercise</h3>
              <div className="text-center space-y-4">
                <div 
                  className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center transition-all duration-4000 ${getBreathScale()}`}
                  style={{ 
                    transition: breathPhase === "in" ? "transform 4s ease-in-out" : 
                               breathPhase === "hold" ? "transform 0.5s ease-in-out" :
                               "transform 4s ease-in-out"
                  }}
                >
                  <span className="text-white text-4xl font-bold">{breathCount}</span>
                </div>
                <p className="text-sm text-muted-foreground font-medium">{getBreathText()}</p>
                <Button 
                  onClick={() => {
                    setIsBreathing(!isBreathing);
                    if (!isBreathing) {
                      setBreathCount(0);
                      toast.success("Breathing exercise started");
                    } else {
                      toast("Exercise stopped");
                    }
                  }}
                  variant={isBreathing ? "outline" : "default"}
                >
                  {isBreathing ? "Stop Exercise" : "Start Exercise"}
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="sleep" className="space-y-4">
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Moon className="w-5 h-5 text-indigo-500" />
                </div>
                <h2 className="text-xl font-semibold">Sleep Support</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">White Noise</h4>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => toast.success("🌧️ Playing rain sounds...")}
                  >
                    Play Rain Sounds
                  </Button>
                </Card>
                <Card className="p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Sleep Stories</h4>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => toast.success("📖 Starting sleep story...")}
                  >
                    Listen Now
                  </Button>
                </Card>
                <Card className="p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Meditation</h4>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => toast.success("🧘 Starting 5-minute meditation...")}
                  >
                    5-Min Bedtime
                  </Button>
                </Card>
                <Card className="p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Sleep Tracker</h4>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => toast.success("😴 Sleep logged successfully!")}
                  >
                    Log Sleep
                  </Button>
                </Card>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="adhd" className="space-y-4">
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-500" />
                </div>
                <h2 className="text-xl font-semibold">ADHD Support Tools</h2>
              </div>

              <div className="space-y-3">
                <Card className="p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Task Breakdown Helper</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Break big tasks into manageable micro-steps
                  </p>
                  <Button 
                    className="w-full"
                    onClick={() => toast.success("Opening task breakdown tool...")}
                  >
                    Start Breaking Down
                  </Button>
                </Card>

                <Card className="p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Fidget Zone</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Interactive fidget tools for focus
                  </p>
                  <Button 
                    className="w-full"
                    onClick={() => toast.success("Opening fidget tools...")}
                  >
                    Open Fidget Tools
                  </Button>
                </Card>

                <Card className="p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Hyperfocus Timer</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Ride your hyperfocus waves effectively
                  </p>
                  <Button 
                    className="w-full"
                    onClick={() => toast.success("Hyperfocus timer set!")}
                  >
                    Set Timer
                  </Button>
                </Card>

                <Card className="p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Visual Schedule</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Color-coded daily planner
                  </p>
                  <Button 
                    className="w-full"
                    onClick={() => toast.success("Opening visual schedule...")}
                  >
                    Create Schedule
                  </Button>
                </Card>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="mood" className="space-y-4">
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-pink-500" />
                </div>
                <h2 className="text-xl font-semibold">Mood Tracker</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm mb-2 block">How are you feeling? (1-10)</label>
                  <Slider
                    value={moodLevel}
                    onValueChange={setMoodLevel}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Very Low</span>
                    <span className="text-lg font-bold">{moodLevel[0]}</span>
                    <span>Great!</span>
                  </div>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => toast.success(`Mood logged: ${moodLevel[0]}/10 💝`)}
                >
                  Log Mood
                </Button>

                <Card className="p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Quick Mood Boost</h4>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toast.success("🙏 Take a moment to be grateful...")}
                    >
                      Gratitude
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toast.success("✨ You are amazing and capable!")}
                    >
                      Affirmations
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toast.success("🎵 Playing mood-boosting music...")}
                    >
                      Music
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toast.success("🏃 Time to move and energize!")}
                    >
                      Movement
                    </Button>
                  </div>
                </Card>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MentalWellness;
