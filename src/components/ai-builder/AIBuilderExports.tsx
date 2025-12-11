import { 
  FileCode, 
  FileText, 
  Download, 
  ExternalLink, 
  Rocket,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GeneratedFile } from "@/pages/AIBuilderHub";
import { toast } from "sonner";
import JSZip from "jszip";

interface AIBuilderExportsProps {
  files: GeneratedFile[];
  onDeploy: () => string | null;
}

const fileIcons = {
  html: FileCode,
  css: FileCode,
  js: FileCode,
  json: FileCode,
  txt: FileText,
  pdf: FileText
};

const AIBuilderExports = ({ files, onDeploy }: AIBuilderExportsProps) => {
  const downloadFile = (file: GeneratedFile) => {
    const blob = new Blob([file.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${file.name}`);
  };

  const downloadAllAsZip = async () => {
    if (files.length === 0) return;
    
    const zip = new JSZip();
    files.forEach(file => {
      zip.file(file.name, file.content);
    });
    
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "build.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded all files as ZIP");
  };

  const previewFile = (file: GeneratedFile) => {
    if (!file.previewable) return;
    
    let htmlContent = file.content;
    
    const cssFile = files.find(f => f.type === "css");
    const jsFile = files.find(f => f.type === "js");
    
    if (cssFile && !htmlContent.includes("<style>")) {
      htmlContent = htmlContent.replace("</head>", `<style>${cssFile.content}</style></head>`);
    }
    
    if (jsFile && !htmlContent.includes("<script>")) {
      htmlContent = htmlContent.replace("</body>", `<script>${jsFile.content}</script></body>`);
    }
    
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const handleDeploy = () => {
    const url = onDeploy();
    if (url) {
      toast.success(`Deployed to ${url}`, {
        description: "Your build is now live (mock deployment)"
      });
    }
  };

  return (
    <aside className="w-80 bg-card border-l border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold flex items-center gap-2">
          <Package className="w-4 h-4" />
          Generated Files
        </h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        {files.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileCode className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No files generated yet</p>
            <p className="text-xs mt-1">Start a conversation to generate files</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => {
              const Icon = fileIcons[file.type] || FileText;
              return (
                <div 
                  key={file.id} 
                  className="bg-background border border-border rounded-lg p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm flex-1">{file.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 h-8 text-xs"
                      onClick={() => downloadFile(file)}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                    {file.previewable && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-xs"
                        onClick={() => previewFile(file)}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {files.length > 0 && (
        <div className="p-4 border-t border-border space-y-2">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={downloadAllAsZip}
          >
            <Package className="w-4 h-4 mr-2" />
            Download ZIP
          </Button>
          <Button 
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            onClick={handleDeploy}
          >
            <Rocket className="w-4 h-4 mr-2" />
            Deploy to Web (Mock)
          </Button>
        </div>
      )}
    </aside>
  );
};

export default AIBuilderExports;
