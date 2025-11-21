import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Code, Database, Shield, Play, Download, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const CodePractice = () => {
  const [pythonCode, setPythonCode] = useState("# Write your Python code here\n");
  const [sqlQuery, setSqlQuery] = useState("-- Write your SQL query here\n");
  const [output, setOutput] = useState("");
  const { toast } = useToast();

  const challenges = {
    python: [
      { id: 1, title: "FizzBuzz Challenge", difficulty: "Beginner", xp: 50 },
      { id: 2, title: "Data Analysis with Pandas", difficulty: "Intermediate", xp: 150 },
      { id: 3, title: "Build a Web Scraper", difficulty: "Advanced", xp: 300 }
    ],
    sql: [
      { id: 1, title: "Basic SELECT Queries", difficulty: "Beginner", xp: 50 },
      { id: 2, title: "JOIN Operations", difficulty: "Intermediate", xp: 150 },
      { id: 3, title: "Complex Aggregations", difficulty: "Advanced", xp: 300 }
    ],
    cybersecurity: [
      { id: 1, title: "Password Security Basics", difficulty: "Beginner", xp: 50 },
      { id: 2, title: "Encryption Challenge", difficulty: "Intermediate", xp: 150 },
      { id: 3, title: "Network Security Audit", difficulty: "Advanced", xp: 300 }
    ]
  };

  const runCode = () => {
    setOutput("Code executed successfully!\nOutput: Hello World");
    toast({ title: "Code executed", description: "Check the output below" });
  };

  const saveProject = () => {
    toast({ title: "Project saved", description: "Your code has been saved" });
  };

  const downloadPDF = () => {
    toast({ title: "Downloading PDF", description: "Your project will download shortly" });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-500";
      case "Intermediate": return "bg-yellow-500";
      case "Advanced": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="h-screen bg-background p-6 overflow-y-auto">
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/gaming-intelligence">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Code Practice Arena</h1>
              <p className="text-muted-foreground">Master Python, SQL & Cybersecurity</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={saveProject} variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button onClick={downloadPDF}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        <Tabs defaultValue="python" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="python">
              <Code className="w-4 h-4 mr-2" />
              Python
            </TabsTrigger>
            <TabsTrigger value="sql">
              <Database className="w-4 h-4 mr-2" />
              SQL
            </TabsTrigger>
            <TabsTrigger value="cybersecurity">
              <Shield className="w-4 h-4 mr-2" />
              Cybersecurity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="python" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-4">
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Python Editor</h3>
                    <Button onClick={runCode} size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      Run Code
                    </Button>
                  </div>
                  <Textarea
                    value={pythonCode}
                    onChange={(e) => setPythonCode(e.target.value)}
                    className="font-mono min-h-64"
                    placeholder="Write your Python code here..."
                  />
                </Card>

                {output && (
                  <Card className="p-4 bg-muted/50">
                    <h4 className="text-sm font-medium mb-2">Output:</h4>
                    <pre className="text-sm">{output}</pre>
                  </Card>
                )}
              </div>

              <Card className="p-6 space-y-4">
                <h3 className="font-semibold">Python Challenges</h3>
                <div className="space-y-3">
                  {challenges.python.map((challenge) => (
                    <Card key={challenge.id} className="p-4 bg-muted/50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{challenge.title}</h4>
                        <Badge className={getDifficultyColor(challenge.difficulty)}>
                          {challenge.difficulty}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">+{challenge.xp} XP</span>
                        <Button size="sm" variant="outline">Start</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sql" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-4">
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">SQL Editor</h3>
                    <Button onClick={runCode} size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      Execute Query
                    </Button>
                  </div>
                  <Textarea
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    className="font-mono min-h-64"
                    placeholder="Write your SQL query here..."
                  />
                </Card>

                {output && (
                  <Card className="p-4 bg-muted/50">
                    <h4 className="text-sm font-medium mb-2">Query Results:</h4>
                    <pre className="text-sm">{output}</pre>
                  </Card>
                )}
              </div>

              <Card className="p-6 space-y-4">
                <h3 className="font-semibold">SQL Challenges</h3>
                <div className="space-y-3">
                  {challenges.sql.map((challenge) => (
                    <Card key={challenge.id} className="p-4 bg-muted/50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{challenge.title}</h4>
                        <Badge className={getDifficultyColor(challenge.difficulty)}>
                          {challenge.difficulty}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">+{challenge.xp} XP</span>
                        <Button size="sm" variant="outline">Start</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cybersecurity" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-4">
                <Card className="p-6 space-y-4">
                  <h3 className="font-semibold">Cybersecurity Labs</h3>
                  <div className="space-y-3">
                    <Card className="p-4 bg-muted/50">
                      <h4 className="font-medium mb-2">Password Strength Analyzer</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Build a tool to analyze password security
                      </p>
                      <Button className="w-full">Open Lab</Button>
                    </Card>

                    <Card className="p-4 bg-muted/50">
                      <h4 className="font-medium mb-2">Encryption Workshop</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Learn about encryption algorithms
                      </p>
                      <Button className="w-full">Start Workshop</Button>
                    </Card>

                    <Card className="p-4 bg-muted/50">
                      <h4 className="font-medium mb-2">Network Security Scanner</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Simulate network vulnerability scanning
                      </p>
                      <Button className="w-full">Launch Scanner</Button>
                    </Card>
                  </div>
                </Card>
              </div>

              <Card className="p-6 space-y-4">
                <h3 className="font-semibold">Security Challenges</h3>
                <div className="space-y-3">
                  {challenges.cybersecurity.map((challenge) => (
                    <Card key={challenge.id} className="p-4 bg-muted/50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{challenge.title}</h4>
                        <Badge className={getDifficultyColor(challenge.difficulty)}>
                          {challenge.difficulty}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">+{challenge.xp} XP</span>
                        <Button size="sm" variant="outline">Start</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CodePractice;
