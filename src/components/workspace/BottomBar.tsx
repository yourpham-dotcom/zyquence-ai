import { useState, useRef } from "react";
import { Youtube, Instagram, Music2, Globe, BookOpen, ChevronUp, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const links = [
  { label: "YouTube", icon: Youtube, id: "youtube", color: "text-red-500" },
  { label: "Instagram", icon: Instagram, href: "https://www.instagram.com", color: "text-pink-500" },
  { label: "Spotify", icon: Music2, href: "https://open.spotify.com", color: "text-green-500" },
  { label: "Browse", icon: Globe, href: "https://www.google.com", color: "text-blue-500" },
  { label: "Learn", icon: BookOpen, href: "https://www.khanacademy.org", color: "text-orange-500" },
];

export function BottomBar() {
  const [expanded, setExpanded] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [embedId, setEmbedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleLoadVideo = () => {
    const id = extractVideoId(youtubeUrl.trim());
    if (id) {
      setEmbedId(id);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Open YouTube search in the embed
      setEmbedId(null);
      setYoutubeUrl("");
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`, "_blank");
    }
  };

  const handleLinkClick = (link: typeof links[0]) => {
    if (link.id === "youtube") {
      if (activePanel === "youtube") {
        setExpanded(!expanded);
      } else {
        setActivePanel("youtube");
        setExpanded(true);
      }
    } else if (link.href) {
      window.open(link.href, "_blank");
    }
  };

  const handleClose = () => {
    setExpanded(false);
    setActivePanel(null);
    setEmbedId(null);
  };

  return (
    <div className="border-t border-border bg-background shrink-0 flex flex-col">
      {/* Expanded Panel */}
      {expanded && activePanel === "youtube" && (
        <div className="border-b border-border bg-muted/30 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div className="flex items-center gap-2">
              <Youtube className="h-4 w-4 text-red-500" />
              <span className="text-sm font-semibold text-foreground">YouTube Player</span>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="px-4 pb-3 flex gap-2">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Paste YouTube URL or video ID..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLoadVideo()}
                className="h-8 text-xs"
              />
              <Button size="sm" className="h-8 text-xs px-3" onClick={handleLoadVideo}>
                Play
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Search YouTube..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="h-8 text-xs w-48"
              />
              <Button size="sm" variant="outline" className="h-8 text-xs px-3" onClick={handleSearch}>
                <Search className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {embedId && (
            <div className="px-4 pb-4">
              <div className="rounded-lg overflow-hidden bg-black aspect-video max-h-[300px]">
                <iframe
                  src={`https://www.youtube.com/embed/${embedId}?autoplay=1&rel=0`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                  title="YouTube Player"
                />
              </div>
            </div>
          )}

          {!embedId && (
            <div className="px-4 pb-4">
              <div className="rounded-lg bg-muted/50 flex items-center justify-center h-24 text-xs text-muted-foreground">
                Paste a YouTube URL above to start watching
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Icon Bar */}
      <div className="flex items-center justify-center gap-2 px-4 py-2">
        {links.map((link) => (
          <button
            key={link.label}
            onClick={() => handleLinkClick(link)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg hover:bg-accent/50 transition-colors group",
              activePanel === link.id && expanded && "bg-accent/50"
            )}
          >
            <link.icon className={cn("h-5 w-5", link.color)} />
            <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {link.label}
            </span>
          </button>
        ))}

        {expanded && (
          <button
            onClick={() => setExpanded(false)}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg hover:bg-accent/50 transition-colors ml-2"
          >
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground">Collapse</span>
          </button>
        )}
      </div>
    </div>
  );
}
