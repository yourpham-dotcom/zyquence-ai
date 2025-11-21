import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Key, AlertTriangle } from "lucide-react";

const CybersecurityLab = () => {
  const challenges = [
    { id: 1, title: "SQL Injection Defense", difficulty: "Beginner", icon: Lock },
    { id: 2, title: "Password Cracking", difficulty: "Intermediate", icon: Key },
    { id: 3, title: "Network Security", difficulty: "Advanced", icon: Shield },
    { id: 4, title: "XSS Prevention", difficulty: "Intermediate", icon: AlertTriangle },
  ];

  return (
    <div className="h-full flex flex-col p-6 gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Cybersecurity Lab</h2>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((challenge) => (
            <Card key={challenge.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <challenge.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{challenge.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Difficulty: <span className="text-foreground">{challenge.difficulty}</span>
                  </p>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Start Challenge
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CybersecurityLab;
