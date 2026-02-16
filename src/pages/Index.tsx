import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Mission from "@/components/Mission";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

const Index = () => {
  const { user } = useAuth();
  const { isPro, loading: subLoading } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !subLoading && isPro) {
      navigate("/pro-dashboard", { replace: true });
    }
  }, [user, isPro, subLoading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Mission />
      <Footer />
    </div>
  );
};

export default Index;
