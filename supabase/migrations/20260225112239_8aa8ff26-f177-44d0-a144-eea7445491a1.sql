
-- Voice rooms
CREATE TABLE public.voice_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  project_id UUID REFERENCES public.ops_projects(id) ON DELETE SET NULL,
  created_by UUID NOT NULL,
  room_type TEXT NOT NULL DEFAULT 'group',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.voice_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create voice rooms" ON public.voice_rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can view own voice rooms" ON public.voice_rooms FOR SELECT TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Users can update own voice rooms" ON public.voice_rooms FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own voice rooms" ON public.voice_rooms FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Voice sessions
CREATE TABLE public.voice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.voice_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_time TIMESTAMPTZ,
  transcript TEXT,
  summary TEXT,
  key_decisions JSONB DEFAULT '[]'::jsonb,
  action_items JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create voice sessions" ON public.voice_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own voice sessions" ON public.voice_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own voice sessions" ON public.voice_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own voice sessions" ON public.voice_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Voice participants
CREATE TABLE public.voice_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.voice_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ,
  is_muted BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.voice_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create voice participants" ON public.voice_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view voice participants" ON public.voice_participants FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own participation" ON public.voice_participants FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Linked tasks (session <-> ops_tasks)
CREATE TABLE public.linked_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.ops_tasks(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES public.voice_sessions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.linked_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create linked tasks" ON public.linked_tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can view linked tasks" ON public.linked_tasks FOR SELECT TO authenticated USING (true);
