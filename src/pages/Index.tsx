import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import EcosystemSection from "@/components/landing/EcosystemSection";
import PhilosophySection from "@/components/landing/PhilosophySection";
import CTASection from "@/components/landing/CTASection";
import LandingFooter from "@/components/landing/LandingFooter";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { isPro, loading: subLoading } = useSubscription();

  if (authLoading || (user && subLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <HeroSection />
      <EcosystemSection />
      <PhilosophySection />
      <CTASection />
      <LandingFooter />
    </div>
  );
};

export default Index;
