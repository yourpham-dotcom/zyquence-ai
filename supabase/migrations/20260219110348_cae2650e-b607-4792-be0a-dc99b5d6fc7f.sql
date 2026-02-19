
-- Projects table
CREATE TABLE public.code_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  language TEXT DEFAULT 'javascript',
  github_repo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.code_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON public.code_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON public.code_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.code_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.code_projects FOR DELETE USING (auth.uid() = user_id);

-- Files table (supports folders via path)
CREATE TABLE public.code_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.code_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL DEFAULT '/',
  content TEXT DEFAULT '',
  language TEXT DEFAULT 'plaintext',
  is_folder BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.code_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own files" ON public.code_files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own files" ON public.code_files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own files" ON public.code_files FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own files" ON public.code_files FOR DELETE USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_code_files_project ON public.code_files(project_id);
CREATE INDEX idx_code_projects_user ON public.code_projects(user_id);
