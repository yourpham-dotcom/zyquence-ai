import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle } from "lucide-react";

const challenges = [
  {
    id: 1,
    title: "Print Hello World",
    description: "Write a Python function that prints 'Hello, World!'",
    difficulty: "Easy",
    solution: "print('Hello, World!')",
  },
  {
    id: 2,
    title: "Calculate Sum",
    description: "Write a function that takes two numbers and returns their sum",
    difficulty: "Easy",
    solution: "def add(a, b):\n    return a + b",
  },
  {
    id: 3,
    title: "Reverse String",
    description: "Write a function that reverses a string",
    difficulty: "Medium",
    solution: "def reverse_string(s):\n    return s[::-1]",
  },
];

const PythonPractice = () => {
  const [selectedChallenge, setSelectedChallenge] = useState(challenges[0]);
  const [userCode, setUserCode] = useState("");
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);

  const checkAnswer = () => {
    const isCorrect = userCode.trim().includes(selectedChallenge.solution.trim());
    setResult(isCorrect ? "correct" : "incorrect");
  };

  return (
    <div className="h-full flex flex-col p-6 gap-4">
      <h2 className="text-lg font-semibold text-foreground">Python Practice Challenges</h2>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
        {/* Challenge List */}
        <div className="space-y-2 overflow-auto">
          {challenges.map((challenge) => (
            <Card
              key={challenge.id}
              className={`cursor-pointer transition-all ${
                selectedChallenge.id === challenge.id
                  ? "ring-2 ring-cyber-blue bg-cyber-blue/5"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => {
                setSelectedChallenge(challenge);
                setUserCode("");
                setResult(null);
              }}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-sm">{challenge.title}</CardTitle>
                <CardDescription className="text-xs">
                  {challenge.difficulty}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Challenge Details & Code Area */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{selectedChallenge.title}</CardTitle>
              <CardDescription>{selectedChallenge.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                placeholder="Write your solution here..."
                className="h-32 font-mono text-sm bg-muted border-border"
              />

              <div className="flex items-center justify-between">
                <Button onClick={checkAnswer} className="bg-cyber-blue hover:bg-cyber-blue/90">
                  Check Solution
                </Button>

                {result && (
                  <div className="flex items-center gap-2">
                    {result === "correct" ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-green-500 font-medium">Correct! 🎉</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-500" />
                        <span className="text-red-500 font-medium">Try again!</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PythonPractice;
