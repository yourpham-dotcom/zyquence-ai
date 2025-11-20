import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Music, Film, Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const MediaPlayer = () => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaType, setMediaType] = useState<"spotify" | "movies">("spotify");

  const handleConnect = (service: string) => {
    toast({
      title: `${service} Integration`,
      description: `In the full version, this will connect to ${service} for real-time playback.`,
    });
  };

  return (
    <div className="h-24 border-t border-border bg-muted/30 backdrop-blur-sm">
      <Tabs value={mediaType} onValueChange={(v) => setMediaType(v as "spotify" | "movies")} className="h-full">
        <div className="px-6 py-2 flex items-center justify-between h-full">
          <div className="flex items-center gap-4">
            <TabsList className="bg-muted">
              <TabsTrigger value="spotify" className="data-[state=active]:bg-cyber-blue data-[state=active]:text-white">
                <Music className="w-4 h-4 mr-2" />
                Spotify
              </TabsTrigger>
              <TabsTrigger value="movies" className="data-[state=active]:bg-cyber-blue data-[state=active]:text-white">
                <Film className="w-4 h-4 mr-2" />
                Movies
              </TabsTrigger>
            </TabsList>

            <div className="text-sm">
              {mediaType === "spotify" ? (
                <div>
                  <p className="font-medium text-foreground">No track playing</p>
                  <p className="text-xs text-muted-foreground">Connect Spotify to play music</p>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-foreground">No video selected</p>
                  <p className="text-xs text-muted-foreground">Browse movies or YouTube</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button 
              size="icon" 
              className="bg-cyber-blue hover:bg-cyber-blue/90"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <SkipForward className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Volume2 className="w-4 h-4" />
            </Button>
          </div>

          <Button 
            variant="outline" 
            onClick={() => handleConnect(mediaType === "spotify" ? "Spotify" : "YouTube/Netflix")}
            className="border-cyber-blue text-cyber-blue hover:bg-cyber-blue hover:text-white"
          >
            Connect {mediaType === "spotify" ? "Spotify" : "Media"}
          </Button>
        </div>
      </Tabs>
    </div>
  );
};

export default MediaPlayer;
