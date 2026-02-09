import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const PRO_PRODUCT_ID = "prod_Twj36mQhOR4juQ";

interface SubscriptionState {
  subscribed: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
  isPro: boolean;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    productId: null,
    subscriptionEnd: null,
    loading: true,
    isPro: false,
  });

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setState({ subscribed: false, productId: null, subscriptionEnd: null, loading: false, isPro: false });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;

      const isPro = data?.subscribed && data?.product_id === PRO_PRODUCT_ID;
      setState({
        subscribed: data?.subscribed ?? false,
        productId: data?.product_id ?? null,
        subscriptionEnd: data?.subscription_end ?? null,
        loading: false,
        isPro,
      });
    } catch (err) {
      console.error("Subscription check failed:", err);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  return { ...state, refresh: checkSubscription };
};
