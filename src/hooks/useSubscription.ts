import { useState, useEffect, useCallback, useRef } from "react";
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
  const userId = user?.id ?? null;
  const checkedRef = useRef<string | null>(null);
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    productId: null,
    subscriptionEnd: null,
    loading: true,
    isPro: false,
  });

  useEffect(() => {
    if (!userId) {
      setState({ subscribed: false, productId: null, subscriptionEnd: null, loading: false, isPro: false });
      checkedRef.current = null;
      return;
    }

    // Prevent duplicate checks for the same user
    if (checkedRef.current === userId) return;
    checkedRef.current = userId;

    const check = async () => {
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
    };

    check();
  }, [userId]);

  const refresh = useCallback(async () => {
    checkedRef.current = null;
    if (!userId) return;
    
    const { data, error } = await supabase.functions.invoke("check-subscription");
    if (error) { console.error(error); return; }

    const isPro = data?.subscribed && data?.product_id === PRO_PRODUCT_ID;
    setState({
      subscribed: data?.subscribed ?? false,
      productId: data?.product_id ?? null,
      subscriptionEnd: data?.subscription_end ?? null,
      loading: false,
      isPro,
    });
  }, [userId]);

  return { ...state, refresh };
};
