import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import ConnectSidebar from "@/components/connect/ConnectSidebar";
import ConnectFeed from "@/components/connect/ConnectFeed";
import ConnectConnections from "@/components/connect/ConnectConnections";
import ConnectMessages from "@/components/connect/ConnectMessages";
import ConnectGroups from "@/components/connect/ConnectGroups";
import ConnectProfile from "@/components/connect/ConnectProfile";

export type ConnectTab = "feed" | "connections" | "messages" | "groups" | "profile";

const ConnectLayout = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<ConnectTab>("feed");

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const renderTab = () => {
    switch (activeTab) {
      case "feed": return <ConnectFeed />;
      case "connections": return <ConnectConnections />;
      case "messages": return <ConnectMessages />;
      case "groups": return <ConnectGroups />;
      case "profile": return <ConnectProfile />;
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <ConnectSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-y-auto">
        {renderTab()}
      </main>
    </div>
  );
};

export default ConnectLayout;
