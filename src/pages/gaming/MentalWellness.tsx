import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Brain, Moon, Focus, Heart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const MentalWellness = () => {
  const [focusTimer, setFocusTimer] = useState(25);
  const [breathCount, setBreathCount] = useState(0);
  const [moodLevel, setMoodLevel] = useState([5]);

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
                  <div className="text-6xl font-bold mb-4">{focusTimer}:00</div>
                  <div className="space-y-2">
                    <label className="text-sm">Session Length (minutes)</label>
                    <Slider
                      value={[focusTimer]}
                      onValueChange={(val) => setFocusTimer(val[0])}
                      min={5}
                      max={60}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button className="w-full">Start</Button>
                  <Button variant="outline" className="w-full">Pause</Button>
                  <Button variant="outline" className="w-full">Reset</Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="font-semibold">Breathing Exercise</h3>
              <div className="text-center space-y-4">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center animate-pulse">
                  <span className="text-white text-4xl font-bold">{breathCount}</span>
                </div>
                <p className="text-sm text-muted-foreground">Breathe in... hold... breathe out...</p>
                <Button onClick={() => setBreathCount(breathCount + 1)}>Complete Breath</Button>
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
                  <Button className="w-full" variant="outline">Play Rain Sounds</Button>
                </Card>
                <Card className="p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Sleep Stories</h4>
                  <Button className="w-full" variant="outline">Listen Now</Button>
                </Card>
                <Card className="p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Meditation</h4>
                  <Button className="w-full" variant="outline">5-Min Bedtime</Button>
                </Card>
                <Card className="p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Sleep Tracker</h4>
                  <Button className="w-full" variant="outline">Log Sleep</Button>
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
                  <Button className="w-full">Start Breaking Down</Button>
                </Card>

                <Card className="p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Fidget Zone</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Interactive fidget tools for focus
                  </p>
                  <Button className="w-full">Open Fidget Tools</Button>
                </Card>

                <Card className="p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Hyperfocus Timer</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Ride your hyperfocus waves effectively
                  </p>
                  <Button className="w-full">Set Timer</Button>
                </Card>

                <Card className="p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Visual Schedule</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Color-coded daily planner
                  </p>
                  <Button className="w-full">Create Schedule</Button>
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

                <Button className="w-full">Log Mood</Button>

                <Card className="p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Quick Mood Boost</h4>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <Button variant="outline" size="sm">Gratitude</Button>
                    <Button variant="outline" size="sm">Affirmations</Button>
                    <Button variant="outline" size="sm">Music</Button>
                    <Button variant="outline" size="sm">Movement</Button>
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
