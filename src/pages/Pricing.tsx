import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const TIERS = {
  free: {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with the essentials",
    features: [
      "Access to Studio workspace",
      "3 mini-games",
      "Basic AI chat",
      "Community support",
      "Limited daily usage",
    ],
  },
  pro: {
    name: "Pro",
    price: "$19.99",
    period: "/month",
    priceId: "price_1SypbXFUdBQ9XG67UB4zbdVa",
    productId: "prod_Twj36mQhOR4juQ",
    description: "Unlimited access to everything",
    features: [
      "Everything in Free",
      "Unlimited AI features",
      "Music Studio with 10+ tracks",
      "Sports & recruiting tools",
      "Cybersecurity lab",
      "Clutch Mode scheduling",
      "Priority support",
      "All future features",
    ],
  },
};

const Pricing = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [subscription, setSubscription] = useState<{
    subscribed: boolean;
    product_id: string | null;
  } | null>(null);
  const [isCheckingSub, setIsCheckingSub] = useState(false);

  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user]);

  const checkSubscription = async () => {
    setIsCheckingSub(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setSubscription(data);
    } catch (err) {
      console.error("Failed to check subscription:", err);
    } finally {
      setIsCheckingSub(false);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setIsCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: TIERS.pro.priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      console.error("Portal error:", err);
      toast.error("Failed to open subscription manager.");
    }
  };

  const isProSubscribed = subscription?.subscribed && subscription?.product_id === TIERS.pro.productId;

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,hsl(var(--cyber-blue)/0.08),transparent_50%)]" />

      <div className="relative z-10">
        {/* Header */}
        <div className="container mx-auto px-6 py-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </button>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 pb-24">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground/70">
              Choose Your Plan
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Start free, upgrade when you're ready for the full experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <Card className="relative p-8 bg-card/50 backdrop-blur-sm border-border flex flex-col">
              <div className="space-y-4 flex-1">
                <h3 className="text-2xl font-bold">{TIERS.free.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{TIERS.free.price}</span>
                  <span className="text-muted-foreground">{TIERS.free.period}</span>
                </div>
                <p className="text-muted-foreground">{TIERS.free.description}</p>

                <ul className="space-y-3 pt-4">
                  {TIERS.free.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant="outline"
                className="w-full mt-8"
                onClick={() => navigate(user ? "/studio" : "/auth")}
              >
                {user ? "Go to Studio" : "Get Started"}
              </Button>
            </Card>

            {/* Pro Tier */}
            <Card className="relative p-8 bg-card/50 backdrop-blur-sm border-primary/30 flex flex-col ring-1 ring-primary/20">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  <Sparkles className="h-3 w-3" />
                  Most Popular
                </span>
              </div>

              <div className="space-y-4 flex-1">
                <h3 className="text-2xl font-bold">{TIERS.pro.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{TIERS.pro.price}</span>
                  <span className="text-muted-foreground">{TIERS.pro.period}</span>
                </div>
                <p className="text-muted-foreground">{TIERS.pro.description}</p>

                <ul className="space-y-3 pt-4">
                  {TIERS.pro.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {isProSubscribed ? (
                <div className="mt-8 space-y-2">
                  <div className="text-center text-sm text-primary font-medium">
                    ✓ Your current plan
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleManageSubscription}
                  >
                    Manage Subscription
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full mt-8 bg-primary hover:bg-primary/90"
                  onClick={handleCheckout}
                  disabled={isCheckingOut || isCheckingSub}
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : !user ? (
                    "Sign up to Subscribe"
                  ) : (
                    "Subscribe to Pro"
                  )}
                </Button>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
