import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Music, Film, Play, Pause, SkipBack, SkipForward, Volume2, Search, LogIn, LogOut, X, ListMusic, ChevronLeft } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSpotify, SpotifyTrack } from "@/hooks/useSpotify";

const MediaPlayer = () => {
  const [volume, setVolume] = useState([70]);
  const [mediaType, setMediaType] = useState<"spotify" | "soundcloud">("spotify");
  const [showSearch, setShowSearch] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scUrl, setScUrl] = useState("");
  const [scEmbedUrl, setScEmbedUrl] = useState<string | null>(null);
  const [viewingPlaylistId, setViewingPlaylistId] = useState<string | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const spotify = useSpotify();

  // Debounced Spotify search
  useEffect(() => {
    if (mediaType !== "spotify" || !spotify.isConnected) return;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!searchQuery.trim()) {
      spotify.search("");
      return;
    }
    searchTimeout.current = setTimeout(() => {
      spotify.search(searchQuery);
    }, 400);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [searchQuery, mediaType, spotify.isConnected]);

  // Sync volume to SDK
  useEffect(() => {
    spotify.setVolume(volume[0]);
  }, [volume]);

  const handleSoundCloudEmbed = () => {
    if (!scUrl.trim()) return;
    const encoded = encodeURIComponent(scUrl);
    setScEmbedUrl(
      `https://w.soundcloud.com/player/?url=${encoded}&color=%23ff5500&auto_play=true&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`
    );
  };

  const formatMs = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleTrackClick = (track: SpotifyTrack) => {
    spotify.playTrack(track);
    setShowSearch(false);
    setShowPlaylists(false);
  };

  const handleSeek = (value: number[]) => {
    if (spotify.duration > 0) {
      const positionMs = Math.floor((value[0] / 100) * spotify.duration);
      spotify.seek(positionMs);
    }
  };

  const openPlaylistTracks = (playlistId: string) => {
    setViewingPlaylistId(playlistId);
    spotify.fetchPlaylistTracks(playlistId);
  };

  return (
    <div className="h-full border-t border-border bg-card flex flex-col overflow-hidden relative">
      {/* Search Overlay */}
      {showSearch && (
        <div className="absolute inset-0 z-20 bg-card border-t border-border flex flex-col">
          <div className="flex items-center gap-2 p-3 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground" />
            {mediaType === "spotify" ? (
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Spotify tracks..."
                className="flex-1 h-8 bg-background border-border"
                autoFocus
              />
            ) : (
              <div className="flex-1 flex gap-2">
                <Input
                  value={scUrl}
                  onChange={(e) => setScUrl(e.target.value)}
                  placeholder="Paste SoundCloud track URL..."
                  className="flex-1 h-8 bg-background border-border"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleSoundCloudEmbed()}
                />
                <Button size="sm" className="h-8" onClick={handleSoundCloudEmbed}>
                  Play
                </Button>
              </div>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowSearch(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {mediaType === "spotify" && spotify.isConnected && (
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {spotify.searchResults.map((track) => (
                  <TrackRow key={track.id} track={track} onClick={() => handleTrackClick(track)} formatMs={formatMs} />
                ))}
                {searchQuery && spotify.searchResults.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No results found</p>
                )}
                {!searchQuery && (
                  <p className="text-sm text-muted-foreground text-center py-4">Type to search for tracks</p>
                )}
              </div>
            </ScrollArea>
          )}

          {mediaType === "soundcloud" && scEmbedUrl && (
            <div className="flex-1 p-2">
              <iframe
                width="100%"
                height="100%"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                src={scEmbedUrl}
                className="rounded"
              />
            </div>
          )}
        </div>
      )}

      {/* Playlists Overlay */}
      {showPlaylists && (
        <div className="absolute inset-0 z-20 bg-card border-t border-border flex flex-col">
          <div className="flex items-center gap-2 p-3 border-b border-border">
            {viewingPlaylistId ? (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewingPlaylistId(null)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
            ) : (
              <ListMusic className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="text-sm font-medium flex-1">
              {viewingPlaylistId
                ? spotify.playlists.find(p => p.id === viewingPlaylistId)?.name || "Playlist"
                : "Your Playlists"
              }
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setShowPlaylists(false); setViewingPlaylistId(null); }}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            {!viewingPlaylistId ? (
              <div className="p-2 space-y-1">
                {spotify.playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => openPlaylistTracks(playlist.id)}
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors text-left"
                  >
                    {playlist.image ? (
                      <img src={playlist.image} alt={playlist.name} className="w-10 h-10 rounded object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                        <ListMusic className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{playlist.name}</p>
                      <p className="text-xs text-muted-foreground">{playlist.trackCount} tracks</p>
                    </div>
                  </button>
                ))}
                {spotify.playlists.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No playlists found</p>
                )}
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {spotify.playlistTracks.map((track) => (
                  <TrackRow key={track.id} track={track} onClick={() => handleTrackClick(track)} formatMs={formatMs} />
                ))}
                {spotify.playlistTracks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Loading tracks...</p>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      )}

      {/* Main Player Bar */}
      <div className="flex-1 px-3 md:px-6 flex items-center gap-3 md:gap-6">
        <Tabs value={mediaType} onValueChange={(v) => setMediaType(v as "spotify" | "soundcloud")} className="flex-1">
          <div className="flex items-center gap-4 md:gap-6">
            <TabsList className="bg-transparent border-0 h-auto p-0">
              <TabsTrigger 
                value="spotify" 
                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none text-xs md:text-sm"
              >
                <Music className="w-4 h-4 mr-1 md:mr-2" />
                Spotify
              </TabsTrigger>
              <TabsTrigger 
                value="soundcloud" 
                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none text-xs md:text-sm"
              >
                <Film className="w-4 h-4 mr-1 md:mr-2" />
                SoundCloud
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2 md:gap-4 flex-1">
              {/* Connection Button */}
              {mediaType === "spotify" && (
                <>
                  {!spotify.isConnected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1"
                      onClick={spotify.connect}
                      disabled={spotify.isLoading}
                    >
                      <LogIn className="w-3 h-3" />
                      {spotify.isLoading ? "Connecting..." : "Login"}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1">
                      {spotify.user?.image && (
                        <img src={spotify.user.image} alt="" className="w-6 h-6 rounded-full" />
                      )}
                      <span className="text-xs text-muted-foreground hidden md:inline truncate max-w-[80px]">
                        {spotify.user?.name}
                      </span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={spotify.disconnect}>
                        <LogOut className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Playback Controls */}
              <div className="flex items-center gap-1 md:gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 md:h-8 md:w-8 hover:bg-accent"
                  onClick={spotify.skipPrev}
                  disabled={!spotify.isConnected && mediaType === "spotify"}
                >
                  <SkipBack className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
                <Button 
                  size="icon"
                  className="h-8 w-8 md:h-10 md:w-10 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => {
                    if (mediaType === "spotify") spotify.togglePlay();
                  }}
                  disabled={!spotify.isConnected && mediaType === "spotify"}
                >
                  {spotify.isPlaying ? <Pause className="w-4 h-4 md:w-5 md:h-5" /> : <Play className="w-4 h-4 md:w-5 md:h-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 md:h-8 md:w-8 hover:bg-accent"
                  onClick={spotify.skipNext}
                  disabled={!spotify.isConnected && mediaType === "spotify"}
                >
                  <SkipForward className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0 max-w-md">
                {mediaType === "spotify" && spotify.currentTrack ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={spotify.currentTrack.albumArt}
                      alt=""
                      className="w-8 h-8 rounded hidden md:block"
                    />
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-medium truncate">{spotify.currentTrack.name}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground truncate">{spotify.currentTrack.artist}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {mediaType === "spotify" 
                      ? (spotify.isConnected 
                          ? (spotify.sdkReady ? "Search or pick a playlist" : "Initializing player...")
                          : "Login to Spotify")
                      : "Paste a SoundCloud URL"
                    }
                  </p>
                )}
                <div className="flex items-center gap-2">
                  {spotify.currentTrack && (
                    <span className="text-[10px] text-muted-foreground hidden md:inline">{formatMs(spotify.progress)}</span>
                  )}
                  <Slider
                    value={[spotify.duration > 0 ? (spotify.progress / spotify.duration) * 100 : 0]}
                    max={100}
                    step={0.1}
                    className="flex-1 mt-1"
                    onValueChange={handleSeek}
                  />
                  {spotify.currentTrack && (
                    <span className="text-[10px] text-muted-foreground hidden md:inline">{formatMs(spotify.duration)}</span>
                  )}
                </div>
              </div>

              {/* Playlist Button */}
              {mediaType === "spotify" && spotify.isConnected && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 md:h-8 md:w-8 hover:bg-accent"
                  onClick={() => { setShowPlaylists(!showPlaylists); setShowSearch(false); }}
                >
                  <ListMusic className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
              )}

              {/* Search Button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 md:h-8 md:w-8 hover:bg-accent"
                onClick={() => { setShowSearch(!showSearch); setShowPlaylists(false); }}
              >
                <Search className="w-3 h-3 md:w-4 md:h-4" />
              </Button>

              {/* Volume */}
              <div className="hidden md:flex items-center gap-2 w-28">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="flex-1" />
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

// Extracted reusable track row component
const TrackRow = ({ track, onClick, formatMs }: { track: SpotifyTrack; onClick: () => void; formatMs: (ms: number) => string }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors text-left"
  >
    <img
      src={track.albumArt}
      alt={track.album}
      className="w-10 h-10 rounded object-cover"
    />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate">{track.name}</p>
      <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
    </div>
    <span className="text-xs text-muted-foreground">{formatMs(track.duration)}</span>
  </button>
);

export default MediaPlayer;
