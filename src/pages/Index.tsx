import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ShowcaseSection from "@/components/landing/ShowcaseSection";
import CTASection from "@/components/landing/CTASection";
import LandingFooter from "@/components/landing/LandingFooter";
import ParticleGrid from "@/components/landing/ParticleGrid";
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
    <div className="min-h-screen bg-background text-foreground">
      <ParticleGrid />
      <LandingNav />
      <div className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <ShowcaseSection />
        <CTASection />
        <LandingFooter />
      </div>
    </div>
  );
};

export default Index;
