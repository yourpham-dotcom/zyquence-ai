
-- Create a table for manual pro access overrides
CREATE TABLE public.pro_access_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  granted_by TEXT,
  reason TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pro_access_overrides ENABLE ROW LEVEL SECURITY;

-- Only service role can manage this table (no public access)
-- The edge function uses service role key so it can read this table
