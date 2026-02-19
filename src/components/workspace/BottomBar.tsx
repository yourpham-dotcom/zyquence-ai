import { useState, useCallback, useRef } from "react";
import { Youtube, Globe, BookOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PanelType = "youtube" | null;

const links = [
  { label: "YouTube", id: "youtube" as const, icon: Youtube, color: "text-red-500" },
  { label: "Browse", id: "open" as const, icon: Globe, href: "https://www.google.com", color: "text-blue-500" },
  { label: "Learn", id: "open" as const, icon: BookOpen, href: "https://www.khanacademy.org", color: "text-orange-500" },
];

const MIN_HEIGHT = 150;
const MAX_HEIGHT = 600;
const DEFAULT_HEIGHT = 350;

export function BottomBar() {
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [embedId, setEmbedId] = useState<string | null>(null);
  const [panelHeight, setPanelHeight] = useState(DEFAULT_HEIGHT);
  const [isDragging, setIsDragging] = useState(false);
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
    if (link.id === "youtube") {
      setActivePanel(activePanel === "youtube" ? null : "youtube");
    } else if ("href" in link && link.href) {
      window.open(link.href, "_blank");
    }
  };

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startY.current = e.clientY;
    startHeight.current = panelHeight;

    const onMove = (ev: MouseEvent) => {
      const delta = startY.current - ev.clientY;
      const newH = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startHeight.current + delta));
      setPanelHeight(newH);
    };

    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [panelHeight]);

  return (
    <div className="border-t border-border bg-background shrink-0 flex flex-col relative">
      {isDragging && <div className="fixed inset-0 z-50 cursor-ns-resize" />}

      {/* YouTube Panel */}
      {activePanel === "youtube" && (
        <div className="border-b border-border bg-muted/30 animate-in slide-in-from-bottom-2 duration-200 flex flex-col">
          <div
            onMouseDown={onDragStart}
            className="flex items-center justify-center py-2 cursor-ns-resize hover:bg-accent/30 transition-colors select-none"
          >
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>
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
              link.id === "youtube" && activePanel === "youtube" && "bg-accent/50"
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
