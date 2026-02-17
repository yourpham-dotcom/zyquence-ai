import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
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

// Singleton subscription cache shared across all hook instances
let sharedState: SubscriptionState = {
  subscribed: false,
  productId: null,
  subscriptionEnd: null,
  loading: true,
  isPro: false,
};
let checkedUserId: string | null = null;
let listeners: Array<() => void> = [];
let checking = false;

function notifyListeners() {
  listeners.forEach((l) => l());
}

function setSharedState(next: SubscriptionState) {
  sharedState = next;
  notifyListeners();
}

async function checkSubscription(userId: string | null) {
  if (!userId) {
    checkedUserId = null;
    setSharedState({ subscribed: false, productId: null, subscriptionEnd: null, loading: false, isPro: false });
    return;
  }

  if (checkedUserId === userId || checking) return;
  checkedUserId = userId;
  checking = true;

  try {
    const { data, error } = await supabase.functions.invoke("check-subscription");
    if (error) throw error;

    const isPro = data?.subscribed && data?.product_id === PRO_PRODUCT_ID;
    setSharedState({
      subscribed: data?.subscribed ?? false,
      productId: data?.product_id ?? null,
      subscriptionEnd: data?.subscription_end ?? null,
      loading: false,
      isPro,
    });
  } catch (err) {
    console.error("Subscription check failed:", err);
    setSharedState({ ...sharedState, loading: false });
  } finally {
    checking = false;
  }
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot() {
  return sharedState;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const state = useSyncExternalStore(subscribe, getSnapshot);

  useEffect(() => {
    checkSubscription(userId);
  }, [userId]);

  const refresh = useCallback(async () => {
    checkedUserId = null;
    checking = false;
    await checkSubscription(userId);
  }, [userId]);

  return { ...state, refresh };
};
