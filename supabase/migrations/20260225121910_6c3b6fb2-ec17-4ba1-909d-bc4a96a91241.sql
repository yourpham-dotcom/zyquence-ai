-- Add entity_type to team_members
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS entity_type text NOT NULL DEFAULT 'employee';
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS goals text NULL;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS notes text NULL;

-- Create client_assignments table
CREATE TABLE IF NOT EXISTS public.client_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  client_id uuid NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'Staff',
  responsibilities text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.client_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own client assignments" ON public.client_assignments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own client assignments" ON public.client_assignments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own client assignments" ON public.client_assignments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own client assignments" ON public.client_assignments FOR DELETE USING (auth.uid() = user_id);