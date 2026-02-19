import { useState, lazy, Suspense } from "react";
import { Gamepad2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

const Basketball = lazy(() => import("@/components/studio/games/Basketball"));
const PingPong = lazy(() => import("@/components/studio/games/PingPong"));
const Racing = lazy(() => import("@/components/studio/games/Racing"));

const games = [
  { label: "Basketball", id: "basketball" },
  { label: "Ping Pong", id: "pingpong" },
  { label: "Racing", id: "racing" },
];

export function SidebarMiniGames() {
  const [open, setOpen] = useState(false);
  const [activeGame, setActiveGame] = useState("basketball");
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  if (collapsed) return null;

  const renderGame = () => {
    switch (activeGame) {
      case "basketball": return <Basketball compact />;
      case "pingpong": return <PingPong compact />;
      case "racing": return <Racing compact />;
      default: return null;
    }
  };

  return (
    <div className="px-3 py-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-xs font-semibold text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors px-1 py-1"
      >
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-3.5 w-3.5" />
          <span>Mini Games</span>
        </div>
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {open && (
        <div className="mt-2 space-y-2 animate-in slide-in-from-top-1 duration-150">
          <div className="flex gap-1">
            {games.map((g) => (
              <Button
                key={g.id}
                variant={activeGame === g.id ? "default" : "outline"}
                size="sm"
                className="h-6 text-[10px] px-2 flex-1"
                onClick={() => setActiveGame(g.id)}
              >
                {g.label}
              </Button>
            ))}
          </div>
          <div className="rounded-lg overflow-auto bg-sidebar-accent/30" style={{ height: 420 }}>
            <Suspense fallback={<div className="flex items-center justify-center h-full text-[10px] text-sidebar-foreground/50">Loading...</div>}>
              {renderGame()}
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}
