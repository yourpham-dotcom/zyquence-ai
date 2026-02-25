
CREATE TABLE public.vault_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_income_monthly NUMERIC NOT NULL DEFAULT 0,
  monthly_savings NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vault_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vault profile" ON public.vault_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own vault profile" ON public.vault_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vault profile" ON public.vault_profiles FOR UPDATE USING (auth.uid() = user_id);
