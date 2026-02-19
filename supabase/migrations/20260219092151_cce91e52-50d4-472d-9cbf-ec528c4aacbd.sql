
-- Create focus areas table (the previous migration partially succeeded - this is a retry for just the table)
-- If table already exists from partial success, this will be a no-op handled by IF NOT EXISTS
CREATE TABLE IF NOT EXISTS public.user_focus_areas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  focus_areas text[] NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Ensure RLS is enabled (idempotent)
ALTER TABLE public.user_focus_areas ENABLE ROW LEVEL SECURITY;

-- Policies may already exist, so use DO blocks
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_focus_areas' AND policyname = 'Users can view own focus areas') THEN
    CREATE POLICY "Users can view own focus areas" ON public.user_focus_areas FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_focus_areas' AND policyname = 'Users can insert own focus areas') THEN
    CREATE POLICY "Users can insert own focus areas" ON public.user_focus_areas FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_focus_areas' AND policyname = 'Users can update own focus areas') THEN
    CREATE POLICY "Users can update own focus areas" ON public.user_focus_areas FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;
