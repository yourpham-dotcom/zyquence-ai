import { Newspaper, Users, MessageCircle, UsersRound, UserCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { ConnectTab } from "@/pages/community/ConnectLayout";

const tabs: { id: ConnectTab; label: string; icon: React.ElementType }[] = [
  { id: "feed", label: "Feed", icon: Newspaper },
  { id: "connections", label: "Connections", icon: Users },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "groups", label: "Groups", icon: UsersRound },
  { id: "profile", label: "Profile", icon: UserCircle },
];

interface Props {
  activeTab: ConnectTab;
  onTabChange: (tab: ConnectTab) => void;
}

const ConnectSidebar = ({ activeTab, onTabChange }: Props) => {
  const navigate = useNavigate();

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/dashboard")} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Zyquence Connect</h1>
            <p className="text-[11px] text-muted-foreground">Community & Networking</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              activeTab === tab.id
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            <tab.icon className="h-4 w-4 shrink-0" />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center">Build connections. Grow together.</p>
      </div>
    </aside>
  );
};

export default ConnectSidebar;
