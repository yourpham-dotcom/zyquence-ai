
-- Assignments table for the Student Hub
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_hours NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assignments" ON public.assignments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own assignments" ON public.assignments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assignments" ON public.assignments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own assignments" ON public.assignments FOR DELETE USING (auth.uid() = user_id);

-- Study materials table
CREATE TABLE public.study_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  material_type TEXT NOT NULL DEFAULT 'notes' CHECK (material_type IN ('notes', 'summary', 'flashcards', 'quiz', 'study_guide')),
  subject TEXT,
  source_text TEXT,
  ai_generated BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own study materials" ON public.study_materials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own study materials" ON public.study_materials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own study materials" ON public.study_materials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own study materials" ON public.study_materials FOR DELETE USING (auth.uid() = user_id);

-- Saved careers / resumes table
CREATE TABLE public.student_careers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  career_title TEXT NOT NULL,
  description TEXT,
  education_path JSONB DEFAULT '[]'::jsonb,
  salary_range JSONB DEFAULT '{}'::jsonb,
  skills_needed JSONB DEFAULT '[]'::jsonb,
  match_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.student_careers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own careers" ON public.student_careers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own careers" ON public.student_careers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own careers" ON public.student_careers FOR DELETE USING (auth.uid() = user_id);

-- Resumes table
CREATE TABLE public.student_resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'My Resume',
  content JSONB DEFAULT '{}'::jsonb,
  cover_letter TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.student_resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own resumes" ON public.student_resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own resumes" ON public.student_resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resumes" ON public.student_resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resumes" ON public.student_resumes FOR DELETE USING (auth.uid() = user_id);
