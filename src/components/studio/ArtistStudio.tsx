import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Paintbrush, Eraser, Download, Palette, Circle, Square } from "lucide-react";

const ArtistStudio = () => {
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [color, setColor] = useState("#000000");

  const colors = ["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"];

  return (
    <div className="h-full flex flex-col p-6 gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Paintbrush className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Artist Studio</h2>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        <Card className="w-48 p-4 flex flex-col gap-4">
          <div>
            <h3 className="font-semibold mb-3 text-sm">Tools</h3>
            <div className="space-y-2">
              <Button
                variant={tool === "brush" ? "default" : "outline"}
                size="sm"
                className="w-full justify-start"
                onClick={() => setTool("brush")}
              >
                <Paintbrush className="w-4 h-4 mr-2" />
                Brush
              </Button>
              <Button
                variant={tool === "eraser" ? "default" : "outline"}
                size="sm"
                className="w-full justify-start"
                onClick={() => setTool("eraser")}
              >
                <Eraser className="w-4 h-4 mr-2" />
                Eraser
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-sm">Shapes</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Circle className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Square className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-sm">Colors</h3>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  className={`w-8 h-8 rounded-lg border-2 ${
                    color === c ? "border-primary" : "border-border"
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <Button variant="outline" size="sm" className="mt-auto">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </Card>

        <Card className="flex-1 p-6">
          <div className="w-full h-full bg-background rounded-lg border-2 border-dashed border-border flex items-center justify-center">
            <div className="text-center">
              <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Canvas ready - Start creating!</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ArtistStudio;
