import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Visualizer = () => {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = useState("");
  const [chartType, setChartType] = useState("bar");
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [chartData, setChartData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadDatasets();
  }, []);

  useEffect(() => {
    if (selectedDataset) {
      const dataset = datasets.find(d => d.id === selectedDataset);
      if (dataset?.data?.[0]) {
        const cols = Object.keys(dataset.data[0]);
        setColumns(cols);
        if (!xAxis) setXAxis(cols[0]);
        if (!yAxis) setYAxis(cols[1] || cols[0]);
      }
    }
  }, [selectedDataset, datasets]);

  useEffect(() => {
    generateChart();
  }, [selectedDataset, xAxis, yAxis]);

  const loadDatasets = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("di_datasets")
      .select("*")
      .eq("user_id", user.id);
    
    if (data) setDatasets(data);
  };

  const generateChart = () => {
    if (!selectedDataset || !xAxis || !yAxis) return;

    const dataset = datasets.find(d => d.id === selectedDataset);
    if (!dataset?.data) return;

    const processedData = dataset.data.map((row: any) => ({
      name: row[xAxis],
      value: parseFloat(row[yAxis]) || 0
    }));

    setChartData(processedData.slice(0, 10));
  };

  const saveDashboard = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("di_dashboards").insert({
      user_id: user.id,
      name: "Dashboard " + new Date().toLocaleDateString(),
      dataset_id: selectedDataset,
      charts: [{
        type: chartType,
        xAxis,
        yAxis,
        data: chartData
      }]
    });

    if (error) {
      toast({ title: "Error saving dashboard", variant: "destructive" });
    } else {
      toast({ title: "Dashboard saved successfully" });
    }
  };

  const renderChart = () => {
    if (chartData.length === 0) return null;

    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-background p-6 overflow-y-auto">
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/data-intelligence">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Visualizer</h1>
              <p className="text-muted-foreground">Build interactive dashboards</p>
            </div>
          </div>
          <Button onClick={saveDashboard}>
            <Save className="w-4 h-4 mr-2" />
            Save Dashboard
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Dataset</label>
              <Select value={selectedDataset} onValueChange={setSelectedDataset}>
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
              <label className="text-sm font-medium">Chart Type</label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {columns.length > 0 && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">X-Axis</label>
                  <Select value={xAxis} onValueChange={setXAxis}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((col) => (
                        <SelectItem key={col} value={col}>
                          {col}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Y-Axis</label>
                  <Select value={yAxis} onValueChange={setYAxis}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((col) => (
                        <SelectItem key={col} value={col}>
                          {col}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </Card>

          <Card className="md:col-span-3 p-6">
            {chartData.length > 0 ? (
              renderChart()
            ) : (
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                Select a dataset and configure axes to see visualization
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Visualizer;
