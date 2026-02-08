import { 
  Smartphone, 
  Star, 
  Music, 
  Dumbbell,
  ExternalLink,
  Rocket,
  Clock,
  FileCode,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Build, ModuleType } from "@/pages/AIBuilderHub";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AIBuilderMyBuildsProps {
  builds: Build[];
  onLoadBuild: (build: Build) => void;
  onDeploy: (buildId: string) => string;
  onDeleteBuild: (buildId: string) => void;
}

const moduleIcons = {
  "app-builder": Smartphone,
  "nil-builder": Star,
  "artist-catalog": Music,
  "athlete-resources": Dumbbell
};

const moduleGradients = {
  "app-builder": "from-blue-500 to-cyan-500",
  "nil-builder": "from-purple-500 to-pink-500",
  "artist-catalog": "from-orange-500 to-red-500",
  "athlete-resources": "from-green-500 to-emerald-500"
};

const moduleLabels = {
  "app-builder": "App Builder",
  "nil-builder": "NIL Builder",
  "artist-catalog": "Artist Catalog",
  "athlete-resources": "Athlete Resources"
};

const AIBuilderMyBuilds = ({ builds, onLoadBuild, onDeploy, onDeleteBuild }: AIBuilderMyBuildsProps) => {
  const handleDeploy = (build: Build) => {
    if (build.deployedUrl) {
      window.open(build.deployedUrl, "_blank");
    } else {
      const url = onDeploy(build.id);
      toast.success(`Deployed to ${url}`);
    }
  };

  const handleDelete = (build: Build) => {
    onDeleteBuild(build.id);
    toast.success(`"${build.title}" has been deleted.`);
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <header className="h-14 border-b border-border flex items-center px-6">
        <h1 className="font-semibold">My Builds</h1>
      </header>

      <ScrollArea className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {builds.length === 0 ? (
            <div className="text-center py-16">
              <FileCode className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
              <h2 className="text-xl font-semibold mb-2">No builds yet</h2>
              <p className="text-muted-foreground">
                Start creating and save your builds to see them here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {builds.map((build) => {
                const Icon = moduleIcons[build.module];
                const gradient = moduleGradients[build.module];
                const label = moduleLabels[build.module];
                
                return (
                  <div 
                    key={build.id}
                    className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">{build.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{label}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {build.createdAt.toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileCode className="w-3 h-3" />
                            {build.files.length} files
                          </span>
                          {build.deployedUrl && (
                            <span className="text-green-500 flex items-center gap-1">
                              <Rocket className="w-3 h-3" />
                              Deployed
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onLoadBuild(build)}
                        >
                          Open
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeploy(build)}
                        >
                          {build.deployedUrl ? (
                            <ExternalLink className="w-4 h-4" />
                          ) : (
                            <Rocket className="w-4 h-4" />
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete build?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{build.title}". This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(build)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AIBuilderMyBuilds;
