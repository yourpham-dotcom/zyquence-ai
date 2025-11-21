import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Play, ArrowLeft, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SQLLab = () => {
  const [query, setQuery] = useState("SELECT * FROM dataset LIMIT 10");
  const [selectedDataset, setSelectedDataset] = useState("");
  const [datasets, setDatasets] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
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

  const executeQuery = () => {
    if (!selectedDataset) {
      toast({ title: "Please select a dataset first", variant: "destructive" });
      return;
    }

    const dataset = datasets.find(d => d.id === selectedDataset);
    if (!dataset?.data) return;

    try {
      // Simple SQL parser for demo - in production use a proper SQL engine
      let data = dataset.data;
      
      // Handle SELECT
      if (query.toUpperCase().includes("SELECT")) {
        const limitMatch = query.match(/LIMIT\s+(\d+)/i);
        if (limitMatch) {
          data = data.slice(0, parseInt(limitMatch[1]));
        }
      }

      if (data.length > 0) {
        setColumns(Object.keys(data[0]));
        setResults(data);
        toast({ title: "Query executed successfully" });
      }
    } catch (error: any) {
      toast({ title: "Query error", description: error.message, variant: "destructive" });
    }
  };

  const saveQuery = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("di_sql_queries").insert({
      user_id: user.id,
      name: "Query " + new Date().toLocaleDateString(),
      query,
      dataset_id: selectedDataset || null,
      results: results.slice(0, 5)
    });

    if (error) {
      toast({ title: "Error saving query", variant: "destructive" });
    } else {
      toast({ title: "Query saved to portfolio" });
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
            <h1 className="text-3xl font-bold">SQL Lab</h1>
            <p className="text-muted-foreground">Practice SQL with real datasets</p>
          </div>
        </div>

        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Dataset</label>
            <Select value={selectedDataset} onValueChange={setSelectedDataset}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a dataset" />
              </SelectTrigger>
              <SelectContent>
                {datasets.map((ds) => (
                  <SelectItem key={ds.id} value={ds.id}>
                    {ds.name} ({ds.row_count} rows)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">SQL Query</label>
              <div className="flex gap-2">
                <Button onClick={saveQuery} variant="outline" size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button onClick={executeQuery} size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Run Query
                </Button>
              </div>
            </div>
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="font-mono min-h-32"
              placeholder="SELECT * FROM dataset WHERE ..."
            />
          </div>

          {results.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Results ({results.length} rows)</label>
              <div className="border rounded-lg overflow-auto max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((col) => (
                        <TableHead key={col}>{col}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((row, i) => (
                      <TableRow key={i}>
                        {columns.map((col) => (
                          <TableCell key={col}>{row[col]}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SQLLab;
