import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileCode, Download, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

const ProjectManager = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([
    { id: 1, name: "My First Game", type: "Game", date: "2024-12-01" },
    { id: 2, name: "Python Challenge", type: "Code", date: "2024-11-28" },
    { id: 3, name: "Concert Venue", type: "Builder", date: "2024-11-25" },
  ]);
  const [newProjectName, setNewProjectName] = useState("");

  const deleteProject = (id: number) => {
    setProjects(projects.filter(p => p.id !== id));
    toast.success("Project deleted");
  };

  const downloadProject = (name: string) => {
    toast.success(`Downloading ${name}...`);
  };

  const createProject = () => {
    if (newProjectName.trim()) {
      setProjects([
        ...projects,
        {
          id: Date.now(),
          name: newProjectName,
          type: "New",
          date: new Date().toISOString().split('T')[0]
        }
      ]);
      setNewProjectName("");
      toast.success("Project created!");
    }
  };

  return (
    <div className="h-screen bg-background overflow-y-auto">
      <div className="container mx-auto p-6 space-y-8 max-w-4xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/gaming-intelligence")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <FileCode className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Project Manager</h1>
          </div>
          <p className="text-muted-foreground">Save, manage & download all your projects</p>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Create New Project</h3>
          <div className="flex gap-2">
            <Input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Enter project name..."
              onKeyPress={(e) => e.key === 'Enter' && createProject()}
            />
            <Button onClick={createProject}>Create</Button>
          </div>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Projects</h2>
          {projects.map((project) => (
            <Card key={project.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileCode className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{project.name}</h3>
                    <div className="flex gap-2 items-center">
                      <Badge variant="secondary" className="text-xs">{project.type}</Badge>
                      <span className="text-xs text-muted-foreground">{project.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toast.success("Opening editor...")}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadProject(project.name)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteProject(project.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 bg-gradient-to-r from-primary/10 to-background border-primary/20">
          <h3 className="text-lg font-semibold mb-2">💡 Pro Tip</h3>
          <p className="text-sm text-muted-foreground">
            Projects are automatically saved as you work. You can download them at any time to keep a local backup!
          </p>
        </Card>
      </div>
    </div>
  );
};

export default ProjectManager;
