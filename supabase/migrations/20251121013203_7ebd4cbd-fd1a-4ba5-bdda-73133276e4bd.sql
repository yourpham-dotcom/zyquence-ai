-- Create music projects table
CREATE TABLE public.music_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  bpm NUMERIC DEFAULT 120,
  time_signature TEXT DEFAULT '4/4',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create music tracks table
CREATE TABLE public.music_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.music_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  audio_url TEXT,
  volume NUMERIC DEFAULT 0.8,
  pan NUMERIC DEFAULT 0,
  muted BOOLEAN DEFAULT false,
  solo BOOLEAN DEFAULT false,
  effects JSONB DEFAULT '{}'::jsonb,
  order_index INTEGER NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project collaborators table
CREATE TABLE public.project_collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.music_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  permission TEXT DEFAULT 'editor',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.music_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for music_projects
CREATE POLICY "Users can view their own projects and shared projects"
ON public.music_projects FOR SELECT
USING (
  auth.uid() = user_id 
  OR id IN (
    SELECT project_id FROM public.project_collaborators 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own projects"
ON public.music_projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
ON public.music_projects FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
ON public.music_projects FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for music_tracks
CREATE POLICY "Users can view tracks in their projects"
ON public.music_tracks FOR SELECT
USING (
  project_id IN (
    SELECT id FROM public.music_projects 
    WHERE user_id = auth.uid()
  ) 
  OR project_id IN (
    SELECT project_id FROM public.project_collaborators 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create tracks in their projects"
ON public.music_tracks FOR INSERT
WITH CHECK (
  project_id IN (
    SELECT id FROM public.music_projects 
    WHERE user_id = auth.uid()
  )
  OR project_id IN (
    SELECT project_id FROM public.project_collaborators 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update tracks in their projects"
ON public.music_tracks FOR UPDATE
USING (
  project_id IN (
    SELECT id FROM public.music_projects 
    WHERE user_id = auth.uid()
  )
  OR project_id IN (
    SELECT project_id FROM public.project_collaborators 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete tracks in their projects"
ON public.music_tracks FOR DELETE
USING (
  project_id IN (
    SELECT id FROM public.music_projects 
    WHERE user_id = auth.uid()
  )
);

-- RLS Policies for project_collaborators
CREATE POLICY "Users can view collaborators on their projects"
ON public.project_collaborators FOR SELECT
USING (
  project_id IN (
    SELECT id FROM public.music_projects 
    WHERE user_id = auth.uid()
  )
  OR user_id = auth.uid()
);

CREATE POLICY "Project owners can add collaborators"
ON public.project_collaborators FOR INSERT
WITH CHECK (
  project_id IN (
    SELECT id FROM public.music_projects 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Project owners can remove collaborators"
ON public.project_collaborators FOR DELETE
USING (
  project_id IN (
    SELECT id FROM public.music_projects 
    WHERE user_id = auth.uid()
  )
);

-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('music-files', 'music-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for music files
CREATE POLICY "Users can view their own music files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'music-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own music files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'music-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own music files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'music-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own music files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'music-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Enable realtime for collaboration
ALTER PUBLICATION supabase_realtime ADD TABLE public.music_tracks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_collaborators;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_music_project_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_music_projects_updated_at
BEFORE UPDATE ON public.music_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_music_project_timestamp();