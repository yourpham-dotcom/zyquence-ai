import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Music, Film, Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

const MediaPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([70]);
  const [mediaType, setMediaType] = useState<"spotify" | "movies">("spotify");

  return (
    <div className="h-full border-t border-border bg-card px-6 flex items-center gap-6 overflow-hidden">
      <Tabs value={mediaType} onValueChange={(v) => setMediaType(v as "spotify" | "movies")} className="flex-1">
        <div className="flex items-center gap-6">
          <TabsList className="bg-transparent border-0 h-auto p-0">
            <TabsTrigger 
              value="spotify" 
              className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none"
            >
              <Music className="w-4 h-4 mr-2" />
              Music
            </TabsTrigger>
            <TabsTrigger 
              value="movies" 
              className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none"
            >
              <Film className="w-4 h-4 mr-2" />
              Video
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent">
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button 
                size="icon"
                className="h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent">
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 max-w-md">
              <p className="text-sm font-medium mb-1 text-muted-foreground">
                {mediaType === "spotify" ? "No music playing" : "No video playing"}
              </p>
              <Slider value={[0]} max={100} step={1} className="w-full" />
            </div>

            <div className="flex items-center gap-2 w-32">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="flex-1" />
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default MediaPlayer;
