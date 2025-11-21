import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Database, Code, BarChart3, FlaskConical, Trophy, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Portfolio = () => {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [queries, setQueries] = useState<any[]>([]);
  const [dashboards, setDashboards] = useState<any[]>([]);
  const [experiments, setExperiments] = useState<any[]>([]);
  const [completions, setCompletions] = useState<any[]>([]);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [datasetsData, queriesData, dashboardsData, experimentsData, completionsData] = await Promise.all([
      supabase.from("di_datasets").select("*").eq("user_id", user.id),
      supabase.from("di_sql_queries").select("*").eq("user_id", user.id),
      supabase.from("di_dashboards").select("*").eq("user_id", user.id),
      supabase.from("di_experiments").select("*").eq("user_id", user.id),
      supabase.from("di_mission_completions").select("*, di_missions(*)").eq("user_id", user.id).eq("status", "completed")
    ]);

    if (datasetsData.data) setDatasets(datasetsData.data);
    if (queriesData.data) setQueries(queriesData.data);
    if (dashboardsData.data) setDashboards(dashboardsData.data);
    if (experimentsData.data) setExperiments(experimentsData.data);
    if (completionsData.data) setCompletions(completionsData.data);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/data-intelligence">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Portfolio</h1>
              <p className="text-muted-foreground">Showcase your data work</p>
            </div>
          </div>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>

        <Tabs defaultValue="datasets" className="space-y-4">
          <TabsList>
            <TabsTrigger value="datasets">
              <Database className="w-4 h-4 mr-2" />
              Datasets ({datasets.length})
            </TabsTrigger>
            <TabsTrigger value="queries">
              <Code className="w-4 h-4 mr-2" />
              SQL Queries ({queries.length})
            </TabsTrigger>
            <TabsTrigger value="dashboards">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboards ({dashboards.length})
            </TabsTrigger>
            <TabsTrigger value="experiments">
              <FlaskConical className="w-4 h-4 mr-2" />
              Experiments ({experiments.length})
            </TabsTrigger>
            <TabsTrigger value="missions">
              <Trophy className="w-4 h-4 mr-2" />
              Missions ({completions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="datasets" className="space-y-4">
            {datasets.map((dataset) => (
              <Card key={dataset.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{dataset.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{dataset.description}</p>
                    <div className="flex gap-4">
                      <Badge variant="outline">{dataset.row_count} rows</Badge>
                      <Badge variant="outline">{dataset.column_count} columns</Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="queries" className="space-y-4">
            {queries.map((query) => (
              <Card key={query.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold">{query.name}</h3>
                  <Badge>{new Date(query.created_at).toLocaleDateString()}</Badge>
                </div>
                <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-auto">
                  {query.query}
                </pre>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="dashboards" className="space-y-4">
            {dashboards.map((dashboard) => (
              <Card key={dashboard.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{dashboard.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{dashboard.description}</p>
                    <Badge variant="outline">{dashboard.charts?.length || 0} charts</Badge>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="experiments" className="space-y-4">
            {experiments.map((exp) => (
              <Card key={exp.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{exp.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{exp.hypothesis}</p>
                    <div className="flex gap-4">
                      <Badge variant="outline">p-value: {exp.p_value?.toFixed(4)}</Badge>
                      <Badge className={exp.p_value < 0.05 ? 'bg-green-500' : 'bg-yellow-500'}>
                        {exp.p_value < 0.05 ? 'Significant' : 'Not Significant'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="missions" className="space-y-4">
            {completions.map((completion: any) => (
              <Card key={completion.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{completion.di_missions?.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{completion.di_missions?.description}</p>
                      <Badge className="bg-green-500">Completed</Badge>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-yellow-500">
                    +{completion.di_missions?.xp_reward} XP
                  </Badge>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Portfolio;
