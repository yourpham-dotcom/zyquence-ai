import { useEffect, useState } from "react";

interface GolfScore {
  player: string;
  score: string;
  position: number;
  thru: string;
  today: string;
}

const mockLeaderboard: GolfScore[] = [
  { player: "S. Scheffler", score: "-12", position: 1, thru: "F", today: "-4" },
  { player: "R. McIlroy", score: "-10", position: 2, thru: "F", today: "-3" },
  { player: "X. Schauffele", score: "-9", position: 3, thru: "16", today: "-5" },
  { player: "C. Morikawa", score: "-8", position: 4, thru: "F", today: "-2" },
  { player: "J. Rahm", score: "-7", position: 5, thru: "F", today: "-1" },
  { player: "V. Hovland", score: "-7", position: 5, thru: "15", today: "-3" },
  { player: "B. DeChambeau", score: "-6", position: 7, thru: "F", today: "E" },
  { player: "T. Fleetwood", score: "-5", position: 8, thru: "F", today: "-2" },
  { player: "J. Spieth", score: "-4", position: 9, thru: "14", today: "-1" },
  { player: "T. Woods", score: "-3", position: 10, thru: "F", today: "+1" },
  { player: "B. Koepka", score: "-3", position: 10, thru: "F", today: "-2" },
  { player: "M. Fitzpatrick", score: "-2", position: 12, thru: "17", today: "E" },
];

const GolfTicker = () => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => prev - 1);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const tickerContent = mockLeaderboard.map((g) => (
    `#${g.position} ${g.player} (${g.score}) Thru ${g.thru} Today: ${g.today}`
  )).join("   ⛳   ");

  const doubled = `${tickerContent}   ⛳   ${tickerContent}`;

  return (
    <div className="w-full overflow-hidden bg-accent/50 border-b border-border shrink-0">
      <div className="flex items-center h-7">
        <div className="shrink-0 px-3 py-1 bg-primary/20 border-r border-border flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">⛳ Golf</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div
            className="whitespace-nowrap text-[11px] text-muted-foreground font-medium"
            style={{
              transform: `translateX(${offset % (tickerContent.length * 6)}px)`,
            }}
          >
            {doubled}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GolfTicker;
