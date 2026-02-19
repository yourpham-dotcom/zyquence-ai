import { useState } from "react";
import { Youtube, Instagram, Music2, Globe, BookOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";
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

  const handleLinkClick = (link: typeof links[0]) => {
    if (link.id === "youtube") {
      setExpanded(!expanded);
    } else if (link.href) {
      window.open(link.href, "_blank");
    }
  };

  return (
    <div className="border-t border-border bg-background shrink-0 flex flex-col">
      {/* YouTube Panel */}
      {expanded && (
        <div className="relative bg-black animate-in slide-in-from-bottom-2 duration-200" style={{ height: "70vh" }}>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 h-8 w-8 bg-black/60 hover:bg-black/80 text-white"
            onClick={() => setExpanded(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <iframe
            src="https://www.youtube.com"
            className="w-full h-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            title="YouTube"
          />
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
              link.id === "youtube" && expanded && "bg-accent/50"
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
