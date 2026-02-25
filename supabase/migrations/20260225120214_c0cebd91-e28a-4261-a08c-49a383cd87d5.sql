
-- Team members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Employee',
  department TEXT DEFAULT 'General',
  tier_level TEXT NOT NULL DEFAULT 'employee',
  manager_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  avatar_url TEXT,
  responsibilities TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own team members" ON public.team_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own team members" ON public.team_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own team members" ON public.team_members FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own team members" ON public.team_members FOR DELETE USING (auth.uid() = user_id);

-- Org departments table
CREATE TABLE public.org_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.org_departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own departments" ON public.org_departments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own departments" ON public.org_departments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own departments" ON public.org_departments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own departments" ON public.org_departments FOR DELETE USING (auth.uid() = user_id);
