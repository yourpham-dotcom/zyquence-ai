import { Youtube, Instagram, Music2, Globe, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { label: "YouTube", icon: Youtube, href: "https://www.youtube.com", color: "text-red-500" },
  { label: "Instagram", icon: Instagram, href: "https://www.instagram.com", color: "text-pink-500" },
  { label: "Spotify", icon: Music2, href: "https://open.spotify.com", color: "text-green-500" },
  { label: "Browse", icon: Globe, href: "https://www.google.com", color: "text-blue-500" },
  { label: "Learn", icon: BookOpen, href: "https://www.khanacademy.org", color: "text-orange-500" },
];

export function BottomBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/90 backdrop-blur-lg">
      <div className="flex items-center justify-center gap-2 px-4 py-2">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg hover:bg-accent/50 transition-colors group"
          >
            <link.icon className={cn("h-5 w-5", link.color)} />
            <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {link.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
