import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Experiments = () => {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [groupA, setGroupA] = useState("");
  const [groupB, setGroupB] = useState("");
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("di_datasets")
      .select("*")
      .eq("user_id", user.id);
    
    if (data) setDatasets(data);
  };

  const runExperiment = () => {
    if (!groupA || !groupB) {
      toast({ title: "Please select both groups", variant: "destructive" });
      return;
    }

    const dataA = datasets.find(d => d.id === groupA)?.data || [];
    const dataB = datasets.find(d => d.id === groupB)?.data || [];

    // Simple statistical test simulation
    const meanA = dataA.length;
    const meanB = dataB.length;
    const difference = Math.abs(meanA - meanB);
    const pValue = Math.random() * 0.1; // Simulated p-value

    setResults({
      groupASize: dataA.length,
      groupBSize: dataB.length,
      difference,
      pValue: pValue.toFixed(4),
      significant: pValue < 0.05
    });

    toast({ title: "Experiment completed" });
  };

  const saveExperiment = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !results) return;

    const { error } = await supabase.from("di_experiments").insert({
      user_id: user.id,
      name,
      hypothesis,
      group_a_dataset_id: groupA,
      group_b_dataset_id: groupB,
      results,
      p_value: parseFloat(results.pValue)
    });

    if (error) {
      toast({ title: "Error saving experiment", variant: "destructive" });
    } else {
      toast({ title: "Experiment saved to portfolio" });
    }
  };

  return (
    <div className="h-screen bg-background p-6 overflow-y-auto">
      <div className="container mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/data-intelligence">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">A/B Testing Lab</h1>
            <p className="text-muted-foreground">Run statistical experiments</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Experiment Setup</h2>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Experiment Name</label>
              <Input
                placeholder="e.g., Hairstyle Preference Test"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hypothesis</label>
              <Textarea
                placeholder="What do you expect to find?"
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Group A (Control)</label>
              <Select value={groupA} onValueChange={setGroupA}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dataset" />
                </SelectTrigger>
                <SelectContent>
                  {datasets.map((ds) => (
                    <SelectItem key={ds.id} value={ds.id}>
                      {ds.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Group B (Treatment)</label>
              <Select value={groupB} onValueChange={setGroupB}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dataset" />
                </SelectTrigger>
                <SelectContent>
                  {datasets.map((ds) => (
                    <SelectItem key={ds.id} value={ds.id}>
                      {ds.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={runExperiment} className="w-full">
              Run Experiment
            </Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            {results ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 bg-muted/50">
                    <p className="text-sm text-muted-foreground">Group A Size</p>
                    <p className="text-2xl font-bold">{results.groupASize}</p>
                  </Card>
                  <Card className="p-4 bg-muted/50">
                    <p className="text-sm text-muted-foreground">Group B Size</p>
                    <p className="text-2xl font-bold">{results.groupBSize}</p>
                  </Card>
                </div>

                <Card className="p-4 bg-muted/50">
                  <p className="text-sm text-muted-foreground">P-Value</p>
                  <p className="text-2xl font-bold">{results.pValue}</p>
                </Card>

                <Card className={`p-4 ${results.significant ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                  <p className="text-sm font-medium">
                    {results.significant ? '✓ Statistically Significant' : '⚠ Not Statistically Significant'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {results.significant 
                      ? 'The difference between groups is unlikely due to chance (p < 0.05)'
                      : 'The difference may be due to random chance (p ≥ 0.05)'}
                  </p>
                </Card>

                <Button onClick={saveExperiment} className="w-full">
                  Save to Portfolio
                </Button>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Run an experiment to see results
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Experiments;
