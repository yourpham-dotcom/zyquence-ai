
-- Academic profiles for student setup
CREATE TABLE public.academic_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  school_name TEXT NOT NULL,
  major TEXT NOT NULL,
  minor TEXT,
  start_semester TEXT NOT NULL,
  start_year INTEGER NOT NULL,
  expected_graduation_year INTEGER,
  is_transfer BOOLEAN DEFAULT false,
  total_required_units INTEGER DEFAULT 120,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.academic_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own academic profile" ON public.academic_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own academic profile" ON public.academic_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own academic profile" ON public.academic_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own academic profile" ON public.academic_profiles FOR DELETE USING (auth.uid() = user_id);

-- Semester plans
CREATE TABLE public.academic_semesters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  profile_id UUID REFERENCES public.academic_profiles(id) ON DELETE CASCADE,
  semester_name TEXT NOT NULL,
  semester_year INTEGER NOT NULL,
  semester_type TEXT NOT NULL DEFAULT 'fall' CHECK (semester_type IN ('fall', 'spring', 'summer', 'winter')),
  is_completed BOOLEAN DEFAULT false,
  semester_gpa NUMERIC,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.academic_semesters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own semesters" ON public.academic_semesters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own semesters" ON public.academic_semesters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own semesters" ON public.academic_semesters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own semesters" ON public.academic_semesters FOR DELETE USING (auth.uid() = user_id);

-- Courses within semesters
CREATE TABLE public.academic_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  semester_id UUID REFERENCES public.academic_semesters(id) ON DELETE CASCADE,
  course_code TEXT NOT NULL,
  course_name TEXT NOT NULL,
  units INTEGER NOT NULL DEFAULT 3,
  category TEXT DEFAULT 'major',
  grade TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'dropped', 'failed')),
  prerequisites TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.academic_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own courses" ON public.academic_courses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own courses" ON public.academic_courses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own courses" ON public.academic_courses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own courses" ON public.academic_courses FOR DELETE USING (auth.uid() = user_id);
