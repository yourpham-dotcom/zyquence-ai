import { useState, useRef, useEffect } from "react";
import { Music, Search, Play, Pause, SkipBack, SkipForward, LogIn, LogOut, X, ChevronLeft, ChevronDown, ChevronRight, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSpotify, SpotifyTrack } from "@/hooks/useSpotify";

export function SidebarSpotify() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"home" | "search" | "playlist">("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingPlaylistId, setViewingPlaylistId] = useState<string | null>(null);
  const [trackList, setTrackList] = useState<SpotifyTrack[]>([]);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spotify = useSpotify();

  useEffect(() => {
    if (!spotify.isConnected) return;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!searchQuery.trim()) {
      spotify.search("");
      return;
    }
    searchTimeout.current = setTimeout(() => {
      spotify.search(searchQuery);
    }, 400);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [searchQuery, spotify.isConnected]);

  // Get the current active track list for skip functionality
  const getCurrentTrackList = (): SpotifyTrack[] => {
    if (view === "search" && spotify.searchResults.length > 0) return spotify.searchResults;
    if (view === "playlist" && spotify.playlistTracks.length > 0) return spotify.playlistTracks;
    return trackList;
  };

  const handleTrackClick = (track: SpotifyTrack) => {
    // Remember the current list context for skip
    const list = view === "search" ? spotify.searchResults : view === "playlist" ? spotify.playlistTracks : [];
    setTrackList(list);
    spotify.playTrack(track);
  };

  const handleSkipNext = () => {
    const list = getCurrentTrackList();
    if (!spotify.currentTrack || list.length === 0) {
      spotify.skipNext();
      return;
    }
    const idx = list.findIndex(t => t.id === spotify.currentTrack?.id);
    if (idx >= 0 && idx < list.length - 1) {
      spotify.playTrack(list[idx + 1]);
    } else if (list.length > 0) {
      spotify.playTrack(list[0]); // wrap around
    }
  };

  const handleSkipPrev = () => {
    const list = getCurrentTrackList();
    if (!spotify.currentTrack || list.length === 0) {
      spotify.skipPrev();
      return;
    }
    const idx = list.findIndex(t => t.id === spotify.currentTrack?.id);
    if (idx > 0) {
      spotify.playTrack(list[idx - 1]);
    } else if (list.length > 0) {
      spotify.playTrack(list[list.length - 1]); // wrap around
    }
  };

  const openPlaylist = (id: string) => {
    setViewingPlaylistId(id);
    setView("playlist");
    spotify.fetchPlaylistTracks(id);
  };

  const formatMs = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  };

  return (
    <div className="px-3 py-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider hover:text-sidebar-foreground transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Music className="h-3.5 w-3.5" />
          Spotify
        </span>
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>

      {open && (
        <div className="mt-2 rounded-lg bg-sidebar-accent/30 overflow-hidden flex flex-col" style={{ height: 340 }}>
          {/* Not connected */}
          {!spotify.isConnected ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4">
              <Music className="h-8 w-8 text-sidebar-foreground/30" />
              <p className="text-[11px] text-sidebar-foreground/50 text-center">Connect your Spotify Premium account to play music</p>
              <Button
                size="sm"
                className="h-7 text-[10px] gap-1"
                onClick={spotify.connect}
                disabled={spotify.isLoading}
              >
                <LogIn className="w-3 h-3" />
                {spotify.isLoading ? "Connecting..." : "Login to Spotify"}
              </Button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-1 px-2 pt-2 pb-1">
                {view !== "home" && (
                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => { setView("home"); setViewingPlaylistId(null); }}>
                    <ChevronLeft className="w-3 h-3" />
                  </Button>
                )}
                <div className="flex-1 flex items-center gap-1 min-w-0">
                  {spotify.user?.image && (
                    <img src={spotify.user.image} alt="" className="w-4 h-4 rounded-full" />
                  )}
                  <span className="text-[10px] text-sidebar-foreground/60 truncate">{spotify.user?.name}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setView(view === "search" ? "home" : "search")}>
                  <Search className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={spotify.disconnect}>
                  <LogOut className="w-3 h-3" />
                </Button>
              </div>

              {/* Search bar */}
              {view === "search" && (
                <div className="px-2 pb-1">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tracks..."
                    className="h-6 text-[10px] bg-sidebar-accent/50 border-sidebar-border"
                    autoFocus
                  />
                </div>
              )}

              {/* Content */}
              <ScrollArea className="flex-1 min-h-0">
                {view === "search" && (
                  <div className="px-1 py-1 space-y-0.5">
                    {spotify.searchResults.map((track) => (
                      <TrackItem key={track.id} track={track} onClick={() => handleTrackClick(track)} formatMs={formatMs} isPlaying={spotify.currentTrack?.id === track.id && spotify.isPlaying} />
                    ))}
                    {searchQuery && spotify.searchResults.length === 0 && (
                      <p className="text-[10px] text-sidebar-foreground/40 text-center py-3">No results</p>
                    )}
                    {!searchQuery && (
                      <p className="text-[10px] text-sidebar-foreground/40 text-center py-3">Type to search</p>
                    )}
                  </div>
                )}

                {view === "home" && (
                  <div className="px-1 py-1 space-y-0.5">
                    {spotify.playlists.map((pl) => (
                      <button
                        key={pl.id}
                        onClick={() => openPlaylist(pl.id)}
                        className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-sidebar-accent/60 transition-colors text-left"
                      >
                        {pl.image ? (
                          <img src={pl.image} alt="" className="w-8 h-8 rounded object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-sidebar-accent flex items-center justify-center">
                            <ListMusic className="w-4 h-4 text-sidebar-foreground/40" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium truncate text-sidebar-foreground">{pl.name}</p>
                          <p className="text-[9px] text-sidebar-foreground/50">{pl.trackCount} tracks</p>
                        </div>
                      </button>
                    ))}
                    {spotify.playlists.length === 0 && (
                      <p className="text-[10px] text-sidebar-foreground/40 text-center py-3">No playlists</p>
                    )}
                  </div>
                )}

                {view === "playlist" && (
                  <div className="px-1 py-1 space-y-0.5">
                    <p className="text-[10px] font-semibold text-sidebar-foreground/70 px-1.5 pb-1 truncate">
                      {spotify.playlists.find(p => p.id === viewingPlaylistId)?.name}
                    </p>
                    {spotify.playlistTracks.map((track) => (
                      <TrackItem key={track.id} track={track} onClick={() => handleTrackClick(track)} formatMs={formatMs} isPlaying={spotify.currentTrack?.id === track.id && spotify.isPlaying} />
                    ))}
                    {spotify.playlistTracks.length === 0 && (
                      <p className="text-[10px] text-sidebar-foreground/40 text-center py-3">Loading...</p>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Now Playing & Controls */}
              <div className="border-t border-sidebar-border px-2 py-1.5 space-y-1">
                {spotify.currentTrack ? (
                  <div className="flex items-center gap-2">
                    <img src={spotify.currentTrack.albumArt} alt="" className="w-7 h-7 rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium truncate text-sidebar-foreground">{spotify.currentTrack.name}</p>
                      <p className="text-[9px] text-sidebar-foreground/50 truncate">{spotify.currentTrack.artist}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[9px] text-sidebar-foreground/40">
                    {spotify.sdkReady ? "Pick a track" : "Initializing..."}
                  </p>
                )}
                <div className="flex items-center justify-center gap-1">
                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleSkipPrev} disabled={!spotify.currentTrack}>
                    <SkipBack className="w-3 h-3" />
                  </Button>
                  <Button size="icon" className="h-6 w-6 bg-primary text-primary-foreground hover:bg-primary/90" onClick={spotify.togglePlay} disabled={!spotify.isConnected}>
                    {spotify.isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleSkipNext} disabled={!spotify.currentTrack}>
                    <SkipForward className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function TrackItem({ track, onClick, formatMs, isPlaying }: { track: SpotifyTrack; onClick: () => void; formatMs: (ms: number) => string; isPlaying: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 p-1.5 rounded hover:bg-sidebar-accent/60 transition-colors text-left ${isPlaying ? "bg-sidebar-accent/50" : ""}`}
    >
      <img src={track.albumArt} alt="" className="w-7 h-7 rounded object-cover" />
      <div className="flex-1 min-w-0">
        <p className={`text-[10px] font-medium truncate ${isPlaying ? "text-primary" : "text-sidebar-foreground"}`}>{track.name}</p>
        <p className="text-[9px] text-sidebar-foreground/50 truncate">{track.artist}</p>
      </div>
      <span className="text-[9px] text-sidebar-foreground/40">{formatMs(track.duration)}</span>
    </button>
  );
}
