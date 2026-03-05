
CREATE TABLE public.ci_ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  idea_score INTEGER,
  market_potential INTEGER,
  execution_complexity INTEGER,
  risk_level INTEGER,
  trend_alignment INTEGER,
  ai_analysis JSONB,
  ai_strategy JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ci_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ideas" ON public.ci_ideas FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ideas" ON public.ci_ideas FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ideas" ON public.ci_ideas FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ideas" ON public.ci_ideas FOR DELETE TO authenticated USING (auth.uid() = user_id);
