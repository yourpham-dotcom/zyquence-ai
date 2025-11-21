import { useState, useEffect } from "react";
import { FolderOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProjectManagerProps {
  onLoadProject: (projectId: string) => void;
  onClose: () => void;
}

const ProjectManager = ({ onLoadProject, onClose }: ProjectManagerProps) => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from("music_projects")
      .select("*")
      .order("updated_at", { ascending: false });

    if (!error && data) {
      setProjects(data);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from("music_projects")
        .delete()
        .eq("id", id);

      if (error) throw error;

      loadProjects();
      toast({ title: "Project deleted" });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Could not delete project",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Load Project</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No saved projects</p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => onLoadProject(project.id)}
                >
                  <div>
                    <h4 className="font-medium">{project.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {project.bpm} BPM • {project.time_signature} • 
                      {new Date(project.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(project.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectManager;