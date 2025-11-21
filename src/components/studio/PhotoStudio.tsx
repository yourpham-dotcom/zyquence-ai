import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Upload, Wand2, Download, Palette } from "lucide-react";

const PhotoStudio = () => {
  const [photoFile, setPhotoFile] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col p-6 gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Image className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Photo Studio</h2>
        </div>
      </div>

      <Card className="flex-1 p-6 flex flex-col gap-4">
        {!photoFile ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-border rounded-lg">
            <Upload className="w-12 h-12 text-muted-foreground" />
            <p className="text-muted-foreground">Upload a photo to start editing</p>
            <Button className="bg-primary hover:bg-primary/90">
              <Upload className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex-1 bg-muted rounded-lg flex items-center justify-center">
              <Image className="w-16 h-16 text-muted-foreground" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Wand2 className="w-4 h-4 mr-2" />
                AI Enhance
              </Button>
              <Button variant="outline" size="sm">
                <Palette className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PhotoStudio;
