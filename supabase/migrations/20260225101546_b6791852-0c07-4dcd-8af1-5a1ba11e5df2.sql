
CREATE TABLE public.financial_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  goal_description TEXT NOT NULL,
  target_amount NUMERIC NULL,
  deadline TIMESTAMP WITH TIME ZONE NULL,
  current_income NUMERIC NULL,
  phases JSONB NULL DEFAULT '[]'::jsonb,
  tasks JSONB NULL DEFAULT '[]'::jsonb,
  milestones JSONB NULL DEFAULT '[]'::jsonb,
  recommendations JSONB NULL DEFAULT '[]'::jsonb,
  notes TEXT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  progress INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own financial projects" ON public.financial_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own financial projects" ON public.financial_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own financial projects" ON public.financial_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own financial projects" ON public.financial_projects FOR DELETE USING (auth.uid() = user_id);
