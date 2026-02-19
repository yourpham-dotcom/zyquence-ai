import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface TradeEntry {
  id: string;
  user_id: string;
  asset_type: "stock" | "crypto" | "forex";
  symbol: string;
  trade_type: "buy" | "sell";
  entry_price: number;
  exit_price: number | null;
  position_size: number;
  trade_date: string;
  timeframe: "scalp" | "day_trade" | "swing";
  strategy_used: string | null;
  setup_description: string | null;
  confidence_level: number | null;
  emotion_before: string | null;
  emotion_after: string | null;
  mistakes_made: string | null;
  what_went_well: string | null;
  what_went_wrong: string | null;
  lesson_learned: string | null;
  screenshot_url: string | null;
  ai_feedback: string | null;
  profit_loss: number | null;
  created_at: string;
  updated_at: string;
}

export type TradeInsert = Omit<TradeEntry, "id" | "profit_loss" | "created_at" | "updated_at" | "ai_feedback">;

export function useTradingJournal() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const trades = useQuery({
    queryKey: ["trading-journal", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trading_journal_entries")
        .select("*")
        .order("trade_date", { ascending: false });
      if (error) throw error;
      return data as TradeEntry[];
    },
    enabled: !!user,
  });

  const createTrade = useMutation({
    mutationFn: async (trade: Omit<TradeInsert, "user_id">) => {
      const { data, error } = await supabase
        .from("trading_journal_entries")
        .insert({ ...trade, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as TradeEntry;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trading-journal"] });
      toast({ title: "Trade logged successfully" });
    },
    onError: (e) => toast({ title: "Error saving trade", description: e.message, variant: "destructive" }),
  });

  const updateTrade = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TradeEntry> & { id: string }) => {
      const { data, error } = await supabase
        .from("trading_journal_entries")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as TradeEntry;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trading-journal"] });
    },
  });

  const deleteTrade = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("trading_journal_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trading-journal"] });
      toast({ title: "Trade deleted" });
    },
  });

  return { trades, createTrade, updateTrade, deleteTrade };
}
