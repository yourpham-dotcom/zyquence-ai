import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Database, Play, CheckCircle2 } from "lucide-react";

const SQLPractice = () => {
  const [query, setQuery] = useState("SELECT * FROM users WHERE");
  const [result, setResult] = useState<string | null>(null);

  const challenges = [
    { id: 1, title: "Basic SELECT", description: "Select all users from the database" },
    { id: 2, title: "JOIN Tables", description: "Join users with their orders" },
    { id: 3, title: "Aggregate Functions", description: "Count total orders per user" },
  ];

  const runQuery = () => {
    setResult("Query executed successfully!\n\n| id | name | email |\n|---|---|---|\n| 1 | John | john@example.com |");
  };

  return (
    <div className="h-full flex flex-col p-6 gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Database className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">SQL Practice</h2>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        <Card className="w-1/3 p-4 overflow-auto">
          <h3 className="font-semibold mb-4">Challenges</h3>
          <div className="space-y-2">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer"
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-sm">{challenge.title}</p>
                    <p className="text-xs text-muted-foreground">{challenge.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="flex-1 p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Query Editor</h3>
            <Button onClick={runQuery} size="sm" className="bg-primary hover:bg-primary/90">
              <Play className="w-4 h-4 mr-2" />
              Run Query
            </Button>
          </div>
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 font-mono text-sm"
            placeholder="Write your SQL query here..."
          />
          {result && (
            <div className="border border-border rounded-lg p-4 bg-muted/50">
              <h4 className="font-semibold mb-2 text-sm">Results</h4>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{result}</pre>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SQLPractice;
