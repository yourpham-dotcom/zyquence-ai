
-- Create trading journal entries table
CREATE TABLE public.trading_journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('stock', 'crypto', 'forex')),
  symbol TEXT NOT NULL,
  trade_type TEXT NOT NULL CHECK (trade_type IN ('buy', 'sell')),
  entry_price NUMERIC NOT NULL,
  exit_price NUMERIC,
  position_size NUMERIC NOT NULL,
  trade_date DATE NOT NULL DEFAULT CURRENT_DATE,
  timeframe TEXT NOT NULL CHECK (timeframe IN ('scalp', 'day_trade', 'swing')),
  strategy_used TEXT,
  setup_description TEXT,
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 10),
  emotion_before TEXT,
  emotion_after TEXT,
  mistakes_made TEXT,
  what_went_well TEXT,
  what_went_wrong TEXT,
  lesson_learned TEXT,
  screenshot_url TEXT,
  ai_feedback TEXT,
  profit_loss NUMERIC GENERATED ALWAYS AS (
    CASE WHEN exit_price IS NOT NULL AND trade_type = 'buy' THEN (exit_price - entry_price) * position_size
         WHEN exit_price IS NOT NULL AND trade_type = 'sell' THEN (entry_price - exit_price) * position_size
         ELSE NULL END
  ) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trading_journal_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own trades" ON public.trading_journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own trades" ON public.trading_journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trades" ON public.trading_journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trades" ON public.trading_journal_entries FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_trading_journal_user ON public.trading_journal_entries(user_id);
CREATE INDEX idx_trading_journal_date ON public.trading_journal_entries(trade_date DESC);
CREATE INDEX idx_trading_journal_symbol ON public.trading_journal_entries(symbol);

-- Updated at trigger
CREATE TRIGGER update_trading_journal_updated_at
  BEFORE UPDATE ON public.trading_journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_di_updated_at();

-- Storage bucket for trade screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('trade-screenshots', 'trade-screenshots', true);

CREATE POLICY "Users can upload trade screenshots" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'trade-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Anyone can view trade screenshots" ON storage.objects FOR SELECT USING (bucket_id = 'trade-screenshots');
CREATE POLICY "Users can delete own trade screenshots" ON storage.objects FOR DELETE USING (bucket_id = 'trade-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
