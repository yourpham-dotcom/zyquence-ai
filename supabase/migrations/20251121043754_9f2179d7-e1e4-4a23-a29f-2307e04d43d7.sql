-- Create enum for mission difficulty
CREATE TYPE public.mission_difficulty AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- Create enum for mission status
CREATE TYPE public.mission_status AS ENUM ('locked', 'available', 'in_progress', 'completed');

-- Create enum for chart types
CREATE TYPE public.chart_type AS ENUM ('bar', 'line', 'scatter', 'pie', 'heatmap', 'correlation');

-- Datasets table
CREATE TABLE public.di_datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  source TEXT,
  row_count INTEGER DEFAULT 0,
  column_count INTEGER DEFAULT 0,
  schema JSONB NOT NULL DEFAULT '{}',
  data JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- SQL queries table
CREATE TABLE public.di_sql_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  dataset_id UUID REFERENCES public.di_datasets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query TEXT NOT NULL,
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dashboards table
CREATE TABLE public.di_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  dataset_id UUID REFERENCES public.di_datasets(id) ON DELETE SET NULL,
  layout JSONB NOT NULL DEFAULT '[]',
  charts JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- A/B Testing experiments table
CREATE TABLE public.di_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  hypothesis TEXT,
  group_a_dataset_id UUID REFERENCES public.di_datasets(id) ON DELETE SET NULL,
  group_b_dataset_id UUID REFERENCES public.di_datasets(id) ON DELETE SET NULL,
  metrics JSONB NOT NULL DEFAULT '[]',
  results JSONB,
  p_value NUMERIC,
  significance_level NUMERIC DEFAULT 0.05,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Missions table
CREATE TABLE public.di_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty mission_difficulty NOT NULL DEFAULT 'beginner',
  xp_reward INTEGER NOT NULL DEFAULT 100,
  objectives JSONB NOT NULL DEFAULT '[]',
  dataset_template JSONB,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mission completions table
CREATE TABLE public.di_mission_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mission_id UUID REFERENCES public.di_missions(id) ON DELETE CASCADE,
  status mission_status NOT NULL DEFAULT 'available',
  progress INTEGER DEFAULT 0,
  submission JSONB,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, mission_id)
);

-- Portfolio items table
CREATE TABLE public.di_portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User stats table
CREATE TABLE public.di_user_stats (
  user_id UUID PRIMARY KEY,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  missions_completed INTEGER DEFAULT 0,
  queries_executed INTEGER DEFAULT 0,
  dashboards_created INTEGER DEFAULT 0,
  experiments_run INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.di_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.di_sql_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.di_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.di_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.di_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.di_mission_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.di_portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.di_user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for di_datasets
CREATE POLICY "Users can view their own datasets"
  ON public.di_datasets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own datasets"
  ON public.di_datasets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own datasets"
  ON public.di_datasets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own datasets"
  ON public.di_datasets FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for di_sql_queries
CREATE POLICY "Users can view their own queries"
  ON public.di_sql_queries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own queries"
  ON public.di_sql_queries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own queries"
  ON public.di_sql_queries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own queries"
  ON public.di_sql_queries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for di_dashboards
CREATE POLICY "Users can view their own dashboards"
  ON public.di_dashboards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dashboards"
  ON public.di_dashboards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboards"
  ON public.di_dashboards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboards"
  ON public.di_dashboards FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for di_experiments
CREATE POLICY "Users can view their own experiments"
  ON public.di_experiments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own experiments"
  ON public.di_experiments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own experiments"
  ON public.di_experiments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own experiments"
  ON public.di_experiments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for di_missions (public read)
CREATE POLICY "Anyone can view missions"
  ON public.di_missions FOR SELECT
  USING (true);

-- RLS Policies for di_mission_completions
CREATE POLICY "Users can view their own mission progress"
  ON public.di_mission_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mission progress"
  ON public.di_mission_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mission progress"
  ON public.di_mission_completions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for di_portfolio_items
CREATE POLICY "Users can view their own portfolio items"
  ON public.di_portfolio_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolio items"
  ON public.di_portfolio_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio items"
  ON public.di_portfolio_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolio items"
  ON public.di_portfolio_items FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for di_user_stats
CREATE POLICY "Users can view their own stats"
  ON public.di_user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
  ON public.di_user_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
  ON public.di_user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_di_datasets_user_id ON public.di_datasets(user_id);
CREATE INDEX idx_di_sql_queries_user_id ON public.di_sql_queries(user_id);
CREATE INDEX idx_di_dashboards_user_id ON public.di_dashboards(user_id);
CREATE INDEX idx_di_experiments_user_id ON public.di_experiments(user_id);
CREATE INDEX idx_di_mission_completions_user_id ON public.di_mission_completions(user_id);
CREATE INDEX idx_di_portfolio_items_user_id ON public.di_portfolio_items(user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_di_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_di_datasets_updated_at
  BEFORE UPDATE ON public.di_datasets
  FOR EACH ROW EXECUTE FUNCTION public.update_di_updated_at();

CREATE TRIGGER update_di_sql_queries_updated_at
  BEFORE UPDATE ON public.di_sql_queries
  FOR EACH ROW EXECUTE FUNCTION public.update_di_updated_at();

CREATE TRIGGER update_di_dashboards_updated_at
  BEFORE UPDATE ON public.di_dashboards
  FOR EACH ROW EXECUTE FUNCTION public.update_di_updated_at();

CREATE TRIGGER update_di_experiments_updated_at
  BEFORE UPDATE ON public.di_experiments
  FOR EACH ROW EXECUTE FUNCTION public.update_di_updated_at();

CREATE TRIGGER update_di_mission_completions_updated_at
  BEFORE UPDATE ON public.di_mission_completions
  FOR EACH ROW EXECUTE FUNCTION public.update_di_updated_at();

CREATE TRIGGER update_di_portfolio_items_updated_at
  BEFORE UPDATE ON public.di_portfolio_items
  FOR EACH ROW EXECUTE FUNCTION public.update_di_updated_at();

CREATE TRIGGER update_di_user_stats_updated_at
  BEFORE UPDATE ON public.di_user_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_di_updated_at();

-- Insert some sample missions
INSERT INTO public.di_missions (title, description, difficulty, xp_reward, objectives, order_index) VALUES
  ('Clean Your First Dataset', 'Learn the basics of data cleaning by removing duplicates and handling missing values', 'beginner', 100, '["Remove duplicate rows", "Handle missing values", "Rename columns"]', 1),
  ('SQL Fundamentals', 'Master basic SQL queries with SELECT, WHERE, and ORDER BY', 'beginner', 150, '["Write a SELECT query", "Use WHERE clause", "Sort results with ORDER BY"]', 2),
  ('Data Aggregation Master', 'Learn to use GROUP BY and aggregate functions', 'intermediate', 200, '["Use GROUP BY", "Apply COUNT, SUM, AVG", "Filter with HAVING"]', 3),
  ('Join Tables Like a Pro', 'Master different types of SQL joins', 'intermediate', 250, '["Perform INNER JOIN", "Use LEFT JOIN", "Create complex multi-table queries"]', 4),
  ('Build Your First Dashboard', 'Create an interactive dashboard with multiple chart types', 'intermediate', 300, '["Create 3 different charts", "Add filters", "Save to portfolio"]', 5),
  ('A/B Testing Basics', 'Design and analyze your first A/B test', 'advanced', 350, '["Set up experiment groups", "Calculate p-value", "Interpret results"]', 6),
  ('Athlete Performance Analysis', 'Analyze athlete vibe coding data to find insights', 'advanced', 400, '["Query athlete data", "Find performance patterns", "Create visualization"]', 7),
  ('Style Intelligence Insights', 'Discover which fashion styles perform best', 'advanced', 400, '["Analyze outfit data", "Calculate similarity scores", "Present findings"]', 8),
  ('Music Analytics Deep Dive', 'Explore music production patterns and trends', 'expert', 500, '["Analyze BPM patterns", "Correlate beat keys", "Build comprehensive dashboard"]', 9),
  ('Full Stack Data Project', 'Complete a full data analysis project from start to finish', 'expert', 750, '["Upload and clean data", "Perform complex queries", "Create dashboard", "Run experiments", "Document findings"]', 10);
