import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import ProGate from "@/components/ProGate";
import { CISidebar } from "@/components/creative-intelligence/CISidebar";
import { Outlet } from "react-router-dom";

const CreativeIntelligence = () => {
  const { isPro, loading } = useSubscription();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isPro) return <ProGate />;

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <CISidebar />
      <main className="flex-1 overflow-y-auto p-6 min-h-0">
        <Outlet />
      </main>
    </div>
  );
};

export default CreativeIntelligence;
