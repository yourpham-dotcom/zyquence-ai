import { useState } from "react";
import AIBuilderSidebar from "@/components/ai-builder/AIBuilderSidebar";
import AIBuilderChat from "@/components/ai-builder/AIBuilderChat";
import AIBuilderExports from "@/components/ai-builder/AIBuilderExports";
import AIBuilderMyBuilds from "@/components/ai-builder/AIBuilderMyBuilds";
import { SidebarProvider } from "@/components/ui/sidebar";

export type ModuleType = "app-builder" | "nil-builder" | "artist-catalog" | "athlete-resources";

export interface GeneratedFile {
  id: string;
  name: string;
  type: "html" | "css" | "js" | "json" | "txt" | "pdf";
  content: string;
  previewable: boolean;
  createdAt: Date;
}

export interface Build {
  id: string;
  module: ModuleType;
  title: string;
  files: GeneratedFile[];
  createdAt: Date;
  deployedUrl?: string;
}

const AIBuilderHub = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>("app-builder");
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [myBuilds, setMyBuilds] = useState<Build[]>([]);
  const [showMyBuilds, setShowMyBuilds] = useState(false);

  const handleFilesGenerated = (files: GeneratedFile[]) => {
    setGeneratedFiles(files);
  };

  const handleSaveBuild = (title: string) => {
    if (generatedFiles.length === 0) return;
    
    const newBuild: Build = {
      id: crypto.randomUUID(),
      module: activeModule,
      title,
      files: [...generatedFiles],
      createdAt: new Date(),
    };
    
    setMyBuilds(prev => [newBuild, ...prev]);
  };

  const handleDeploy = (buildId: string) => {
    const fakeUrl = `https://${buildId.slice(0, 8)}.zyquence.app`;
    setMyBuilds(prev => 
      prev.map(b => b.id === buildId ? { ...b, deployedUrl: fakeUrl } : b)
    );
    return fakeUrl;
  };

  const handleLoadBuild = (build: Build) => {
    setActiveModule(build.module);
    setGeneratedFiles(build.files);
    setShowMyBuilds(false);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AIBuilderSidebar 
          activeModule={activeModule} 
          onModuleChange={setActiveModule}
          onShowMyBuilds={() => setShowMyBuilds(!showMyBuilds)}
          showMyBuilds={showMyBuilds}
        />
        
        <main className="flex-1 flex">
          {showMyBuilds ? (
            <AIBuilderMyBuilds 
              builds={myBuilds} 
              onLoadBuild={handleLoadBuild}
              onDeploy={handleDeploy}
            />
          ) : (
            <>
              <AIBuilderChat 
                activeModule={activeModule}
                onFilesGenerated={handleFilesGenerated}
                onSaveBuild={handleSaveBuild}
              />
              <AIBuilderExports 
                files={generatedFiles}
                onDeploy={() => {
                  if (generatedFiles.length > 0) {
                    const title = `Build ${new Date().toLocaleDateString()}`;
                    handleSaveBuild(title);
                    const lastBuild = myBuilds[0];
                    if (lastBuild) {
                      return handleDeploy(lastBuild.id);
                    }
                  }
                  return null;
                }}
              />
            </>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AIBuilderHub;
