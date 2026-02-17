
-- Artist Profiles (Module 1 - Creator Profile Setup)
CREATE TABLE public.artist_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stage_name TEXT,
  background TEXT,
  personality_traits JSONB DEFAULT '[]'::jsonb,
  lifestyle TEXT,
  inspirations TEXT[],
  music_goals TEXT,
  preferred_genres TEXT[],
  voice_type TEXT,
  experience_level TEXT DEFAULT 'beginner',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.artist_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.artist_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own profile" ON public.artist_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.artist_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON public.artist_profiles FOR DELETE USING (auth.uid() = user_id);

-- Identity Results (Module 2 - Identity Analyzer)
CREATE TABLE public.identity_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  profile_id UUID REFERENCES public.artist_profiles(id) ON DELETE CASCADE,
  archetype TEXT,
  brand_personality TEXT,
  audience_profile TEXT,
  stage_name_suggestions TEXT[],
  visual_aesthetic TEXT,
  messaging_tone TEXT,
  full_analysis JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.identity_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own identity" ON public.identity_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own identity" ON public.identity_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own identity" ON public.identity_results FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own identity" ON public.identity_results FOR DELETE USING (auth.uid() = user_id);

-- Sound Recommendations (Module 3 - Sound & Style Direction)
CREATE TABLE public.sound_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  profile_id UUID REFERENCES public.artist_profiles(id) ON DELETE CASCADE,
  genre_scores JSONB DEFAULT '{}'::jsonb,
  bpm_range JSONB DEFAULT '{}'::jsonb,
  beat_styles TEXT[],
  vocal_guidance TEXT,
  flow_ideas TEXT[],
  comparable_artists TEXT[],
  music_lane_summary TEXT,
  full_analysis JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sound_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sound recs" ON public.sound_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sound recs" ON public.sound_recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sound recs" ON public.sound_recommendations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sound recs" ON public.sound_recommendations FOR DELETE USING (auth.uid() = user_id);

-- Readiness Scores (Module 5)
CREATE TABLE public.readiness_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  profile_id UUID REFERENCES public.artist_profiles(id) ON DELETE CASCADE,
  overall_score INTEGER DEFAULT 0,
  brand_clarity INTEGER DEFAULT 0,
  voice_potential INTEGER DEFAULT 0,
  consistency INTEGER DEFAULT 0,
  market_positioning INTEGER DEFAULT 0,
  story_authenticity INTEGER DEFAULT 0,
  ai_explanation TEXT,
  recommendations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.readiness_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scores" ON public.readiness_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own scores" ON public.readiness_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scores" ON public.readiness_scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scores" ON public.readiness_scores FOR DELETE USING (auth.uid() = user_id);

-- Strategy Plans (Module 6)
CREATE TABLE public.strategy_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  profile_id UUID REFERENCES public.artist_profiles(id) ON DELETE CASCADE,
  content_strategy JSONB DEFAULT '[]'::jsonb,
  release_roadmap JSONB DEFAULT '[]'::jsonb,
  brand_positioning TEXT,
  growth_recommendations JSONB DEFAULT '[]'::jsonb,
  audience_conversion JSONB DEFAULT '[]'::jsonb,
  next_steps JSONB DEFAULT '[]'::jsonb,
  priority_actions JSONB DEFAULT '[]'::jsonb,
  long_term_strategy TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.strategy_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own strategy" ON public.strategy_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own strategy" ON public.strategy_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own strategy" ON public.strategy_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own strategy" ON public.strategy_plans FOR DELETE USING (auth.uid() = user_id);

-- Feedback Sessions (Module 7)
CREATE TABLE public.feedback_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  profile_id UUID REFERENCES public.artist_profiles(id) ON DELETE CASCADE,
  lyrics_input TEXT,
  feedback_type TEXT DEFAULT 'lyrics',
  flow_score INTEGER,
  authenticity_score INTEGER,
  energy_score INTEGER,
  commercial_appeal_score INTEGER,
  improvement_suggestions JSONB DEFAULT '[]'::jsonb,
  full_feedback JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback" ON public.feedback_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own feedback" ON public.feedback_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own feedback" ON public.feedback_sessions FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_artist_profiles_updated_at BEFORE UPDATE ON public.artist_profiles FOR EACH ROW EXECUTE FUNCTION public.update_di_updated_at();
CREATE TRIGGER update_identity_results_updated_at BEFORE UPDATE ON public.identity_results FOR EACH ROW EXECUTE FUNCTION public.update_di_updated_at();
CREATE TRIGGER update_sound_recommendations_updated_at BEFORE UPDATE ON public.sound_recommendations FOR EACH ROW EXECUTE FUNCTION public.update_di_updated_at();
CREATE TRIGGER update_readiness_scores_updated_at BEFORE UPDATE ON public.readiness_scores FOR EACH ROW EXECUTE FUNCTION public.update_di_updated_at();
CREATE TRIGGER update_strategy_plans_updated_at BEFORE UPDATE ON public.strategy_plans FOR EACH ROW EXECUTE FUNCTION public.update_di_updated_at();
