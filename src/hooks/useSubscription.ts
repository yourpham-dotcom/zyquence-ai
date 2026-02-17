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

// Simple module-level cache
let cachedState: SubscriptionState | null = null;
let cachedUserId: string | null = null;
let pendingPromise: Promise<SubscriptionState> | null = null;

async function fetchSubscription(): Promise<SubscriptionState> {
  try {
    const { data, error } = await supabase.functions.invoke("check-subscription");
    if (error) throw error;

    const isPro = data?.subscribed && data?.product_id === PRO_PRODUCT_ID;
    return {
      subscribed: data?.subscribed ?? false,
      productId: data?.product_id ?? null,
      subscriptionEnd: data?.subscription_end ?? null,
      loading: false,
      isPro,
    };
  } catch (err) {
    console.error("Subscription check failed:", err);
    return {
      subscribed: false,
      productId: null,
      subscriptionEnd: null,
      loading: false,
      isPro: false,
    };
  }
}

export const useSubscription = () => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [state, setState] = useState<SubscriptionState>(() => {
    // Use cache if available for this user
    if (cachedState && cachedUserId === userId) {
      return cachedState;
    }
    return {
      subscribed: false,
      productId: null,
      subscriptionEnd: null,
      loading: !!userId,
      isPro: false,
    };
  });

  useEffect(() => {
    if (!userId) {
      cachedUserId = null;
      cachedState = null;
      pendingPromise = null;
      setState({ subscribed: false, productId: null, subscriptionEnd: null, loading: false, isPro: false });
      return;
    }

    // Already cached for this user
    if (cachedUserId === userId && cachedState) {
      setState(cachedState);
      return;
    }

    // Deduplicate concurrent requests
    if (!pendingPromise || cachedUserId !== userId) {
      cachedUserId = userId;
      setState(prev => ({ ...prev, loading: true }));
      pendingPromise = fetchSubscription();
    }

    let cancelled = false;
    pendingPromise.then((result) => {
      if (!cancelled) {
        cachedState = result;
        pendingPromise = null;
        setState(result);
      }
    });

    return () => { cancelled = true; };
  }, [userId]);

  const refresh = useCallback(async () => {
    cachedState = null;
    cachedUserId = null;
    pendingPromise = null;
    if (!userId) return;
    setState(prev => ({ ...prev, loading: true }));
    const result = await fetchSubscription();
    cachedState = result;
    cachedUserId = userId;
    setState(result);
  }, [userId]);

  return { ...state, refresh };
};
