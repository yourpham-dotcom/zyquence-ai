
-- Ops Projects table
CREATE TABLE public.ops_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  goal TEXT NOT NULL,
  deadline TIMESTAMPTZ,
  team_members JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  phases JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ops_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ops projects" ON public.ops_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own ops projects" ON public.ops_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ops projects" ON public.ops_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ops projects" ON public.ops_projects FOR DELETE USING (auth.uid() = user_id);

-- Ops Tasks table
CREATE TABLE public.ops_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.ops_projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT,
  status TEXT NOT NULL DEFAULT 'not_started',
  priority TEXT NOT NULL DEFAULT 'medium',
  deadline TIMESTAMPTZ,
  phase TEXT,
  dependencies JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ops_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ops tasks" ON public.ops_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own ops tasks" ON public.ops_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ops tasks" ON public.ops_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ops tasks" ON public.ops_tasks FOR DELETE USING (auth.uid() = user_id);

-- Ops Milestones table
CREATE TABLE public.ops_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.ops_projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  target_date TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ops_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ops milestones" ON public.ops_milestones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own ops milestones" ON public.ops_milestones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ops milestones" ON public.ops_milestones FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ops milestones" ON public.ops_milestones FOR DELETE USING (auth.uid() = user_id);
