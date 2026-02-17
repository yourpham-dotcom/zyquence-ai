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
let fetchInFlight = false;

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

  const [state, setState] = useState<SubscriptionState>(
    cachedState && cachedUserId === userId
      ? cachedState
      : { subscribed: false, productId: null, subscriptionEnd: null, loading: !!userId, isPro: false }
  );

  useEffect(() => {
    if (!userId) {
      cachedUserId = null;
      cachedState = null;
      fetchInFlight = false;
      setState({ subscribed: false, productId: null, subscriptionEnd: null, loading: false, isPro: false });
      return;
    }

    // Already cached for this user — apply immediately
    if (cachedUserId === userId && cachedState) {
      setState(cachedState);
      return;
    }

    // Prevent duplicate fetches
    if (fetchInFlight && cachedUserId === userId) return;

    cachedUserId = userId;
    fetchInFlight = true;
    setState(prev => ({ ...prev, loading: true }));

    fetchSubscription().then((result) => {
      cachedState = result;
      fetchInFlight = false;
      // Always update — don't use cancelled flag so navigated-to pages get the result
      setState(result);
    });
  }, [userId]);

  // Sync from cache on mount if another instance already fetched
  useEffect(() => {
    if (cachedState && cachedUserId === userId && state.loading) {
      setState(cachedState);
    }
  });

  const refresh = useCallback(async () => {
    cachedState = null;
    cachedUserId = null;
    fetchInFlight = false;
    if (!userId) return;
    setState(prev => ({ ...prev, loading: true }));
    const result = await fetchSubscription();
    cachedState = result;
    cachedUserId = userId;
    setState(result);
  }, [userId]);

  return { ...state, refresh };
};
