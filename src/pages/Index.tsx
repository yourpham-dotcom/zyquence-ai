import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Mission from "@/components/Mission";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { isPro, loading: subLoading } = useSubscription();

  // Show loading while checking auth
  if (authLoading || (user && subLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect logged-in users to their dashboard
  if (user) {
    return <Navigate to={isPro ? "/pro-dashboard" : "/free-dashboard"} replace />;
  }

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
