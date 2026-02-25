
-- Events table
CREATE TABLE public.life_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  event_time TIME,
  location TEXT,
  host TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.life_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own life events" ON public.life_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Event guests table
CREATE TABLE public.event_guests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.life_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  guest_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unknown',
  added_by TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.event_guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own event guests" ON public.event_guests FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Event updates / activity log
CREATE TABLE public.event_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.life_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  change_description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.event_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own event updates" ON public.event_updates FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
