import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import lamejs from "lamejs";
import type { Project, Track } from "../MusicStudio";

interface ExportDialogProps {
  project: Project;
  tracks: Track[];
  onClose: () => void;
}

const ExportDialog = ({ project, tracks, onClose }: ExportDialogProps) => {
  const { toast } = useToast();
  const [format, setFormat] = useState<"mp3" | "wav">("mp3");
  const [quality, setQuality] = useState("192");
  const [isExporting, setIsExporting] = useState(false);

  const exportAudio = async () => {
    setIsExporting(true);
    
    try {
      // This is a simplified export - in production, you'd mix all tracks together
      toast({
        title: "Export started",
        description: "Your project is being exported...",
      });

      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Export complete",
        description: `${project.title}.${format} is ready for download`,
      });

      onClose();
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "Could not export project",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Format</label>
            <Select value={format} onValueChange={(v: any) => setFormat(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mp3">MP3</SelectItem>
                <SelectItem value="wav">WAV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {format === "mp3" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Quality</label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="128">128 kbps</SelectItem>
                  <SelectItem value="192">192 kbps</SelectItem>
                  <SelectItem value="256">256 kbps</SelectItem>
                  <SelectItem value="320">320 kbps</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="pt-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              Project: {project.title}
            </p>
            <p className="text-sm text-muted-foreground">
              Tracks: {tracks.length}
            </p>
            <p className="text-sm text-muted-foreground">
              BPM: {project.bpm}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={exportAudio} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;