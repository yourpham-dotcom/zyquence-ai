import { useState, useCallback, useRef, lazy, Suspense } from "react";
import { Youtube, Instagram, Music2, Globe, BookOpen, X, GripHorizontal, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Basketball = lazy(() => import("@/components/studio/games/Basketball"));
const PingPong = lazy(() => import("@/components/studio/games/PingPong"));
const Racing = lazy(() => import("@/components/studio/games/Racing"));

type PanelType = "youtube" | "games" | null;

const games = [
  { label: "Basketball", id: "basketball" },
  { label: "Ping Pong", id: "pingpong" },
  { label: "Racing", id: "racing" },
];

const links = [
  { label: "YouTube", icon: Youtube, id: "youtube" as const, color: "text-red-500" },
  { label: "Games", icon: Gamepad2, id: "games" as const, color: "text-purple-500" },
  { label: "Instagram", icon: Instagram, href: "https://www.instagram.com", color: "text-pink-500" },
  { label: "Spotify", icon: Music2, href: "https://open.spotify.com", color: "text-green-500" },
  { label: "Browse", icon: Globe, href: "https://www.google.com", color: "text-blue-500" },
  { label: "Learn", icon: BookOpen, href: "https://www.khanacademy.org", color: "text-orange-500" },
];

const MIN_HEIGHT = 150;
const MAX_HEIGHT = 600;
const DEFAULT_HEIGHT = 350;

export function BottomBar() {
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [embedId, setEmbedId] = useState<string | null>(null);
  const [panelHeight, setPanelHeight] = useState(DEFAULT_HEIGHT);
  const [activeGame, setActiveGame] = useState("basketball");
  const dragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  };

  const handlePlay = () => {
    const id = extractVideoId(videoUrl.trim());
    if (id) setEmbedId(id);
  };

  const handleLinkClick = (link: typeof links[number]) => {
    if (link.id === "youtube" || link.id === "games") {
      setActivePanel(activePanel === link.id ? null : link.id);
    } else if ("href" in link && (link as any).href) {
      window.open((link as any).href, "_blank");
    }
  };

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    startY.current = e.clientY;
    startHeight.current = panelHeight;

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const delta = startY.current - ev.clientY;
      const newH = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startHeight.current + delta));
      setPanelHeight(newH);
    };

    const onUp = () => {
      dragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [panelHeight]);

  const renderGame = () => {
    switch (activeGame) {
      case "basketball": return <Basketball compact />;
      case "pingpong": return <PingPong compact />;
      case "racing": return <Racing compact />;
      default: return null;
    }
  };

  return (
    <div className="border-t border-border bg-background shrink-0 flex flex-col">
      {activePanel && (
        <div className="border-b border-border bg-muted/30 animate-in slide-in-from-bottom-2 duration-200 flex flex-col">
          {/* Drag Handle */}
          <div
            onMouseDown={onDragStart}
            className="flex items-center justify-center py-1 cursor-ns-resize hover:bg-accent/30 transition-colors"
          >
            <GripHorizontal className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* YouTube Panel */}
          {activePanel === "youtube" && (
            <>
              <div className="flex items-center justify-between px-4 pb-2">
                <div className="flex items-center gap-2">
                  <Youtube className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-semibold text-foreground">YouTube Player</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => window.open("https://www.youtube.com", "_blank")}>
                    Open YouTube
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setActivePanel(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="px-4 pb-3 flex gap-2">
                <Input
                  placeholder="Paste a YouTube URL or video ID..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePlay()}
                  className="h-8 text-xs flex-1"
                />
                <Button size="sm" className="h-8 text-xs px-4" onClick={handlePlay}>Play</Button>
              </div>
              <div className="px-4 pb-4 flex-1" style={{ height: panelHeight }}>
                {embedId ? (
                  <div className="rounded-lg overflow-hidden bg-black h-full">
                    <iframe
                      src={`https://www.youtube.com/embed/${embedId}?autoplay=1&rel=0`}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                      title="YouTube Player"
                    />
                  </div>
                ) : (
                  <div className="rounded-lg bg-muted/50 flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                    <Youtube className="h-8 w-8 text-red-500/50" />
                    <p className="text-xs">Paste a YouTube link above to watch here</p>
                    <p className="text-[10px]">Or click "Open YouTube" to browse in a new tab</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Games Panel */}
          {activePanel === "games" && (
            <>
              <div className="flex items-center justify-between px-4 pb-2">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-semibold text-foreground">Mini Games</span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setActivePanel(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="px-4 pb-2 flex gap-2">
                {games.map((g) => (
                  <Button
                    key={g.id}
                    variant={activeGame === g.id ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setActiveGame(g.id)}
                  >
                    {g.label}
                  </Button>
                ))}
              </div>
              <div className="px-4 pb-4" style={{ height: panelHeight }}>
                <div className="rounded-lg overflow-hidden h-full bg-muted/20">
                  <Suspense fallback={<div className="flex items-center justify-center h-full text-xs text-muted-foreground">Loading game...</div>}>
                    {renderGame()}
                  </Suspense>
                </div>
              </div>
            </>
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
              (link.id === activePanel) && "bg-accent/50"
            )}
          >
            <link.icon className={cn("h-5 w-5", link.color)} />
            <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {link.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
