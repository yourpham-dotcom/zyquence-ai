
-- LifeSync Events table
CREATE TABLE public.lifesync_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  event_time TEXT,
  location TEXT,
  host_id UUID NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- LifeSync Participants table
CREATE TABLE public.lifesync_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.lifesync_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  role TEXT NOT NULL DEFAULT 'participant',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- LifeSync Messages table
CREATE TABLE public.lifesync_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.lifesync_events(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lifesync_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifesync_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifesync_messages ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is participant of an event
CREATE OR REPLACE FUNCTION public.is_lifesync_participant(_user_id UUID, _event_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.lifesync_participants
    WHERE user_id = _user_id AND event_id = _event_id
  )
$$;

-- Events RLS: participants and hosts can view
CREATE POLICY "Hosts can create events" ON public.lifesync_events
  FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Participants can view events" ON public.lifesync_events
  FOR SELECT USING (
    auth.uid() = host_id OR public.is_lifesync_participant(auth.uid(), id)
  );

CREATE POLICY "Hosts can update events" ON public.lifesync_events
  FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete events" ON public.lifesync_events
  FOR DELETE USING (auth.uid() = host_id);

-- Participants RLS
CREATE POLICY "Participants can view event participants" ON public.lifesync_participants
  FOR SELECT USING (
    public.is_lifesync_participant(auth.uid(), event_id) OR
    EXISTS (SELECT 1 FROM public.lifesync_events WHERE id = event_id AND host_id = auth.uid())
  );

CREATE POLICY "Hosts can add participants" ON public.lifesync_participants
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.lifesync_events WHERE id = event_id AND host_id = auth.uid()) OR
    auth.uid() = user_id
  );

CREATE POLICY "Participants can update own status" ON public.lifesync_participants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Hosts can remove participants" ON public.lifesync_participants
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.lifesync_events WHERE id = event_id AND host_id = auth.uid()) OR
    auth.uid() = user_id
  );

-- Messages RLS
CREATE POLICY "Participants can view messages" ON public.lifesync_messages
  FOR SELECT USING (public.is_lifesync_participant(auth.uid(), event_id));

CREATE POLICY "Participants can send messages" ON public.lifesync_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND public.is_lifesync_participant(auth.uid(), event_id)
  );

CREATE POLICY "Users can delete own messages" ON public.lifesync_messages
  FOR DELETE USING (auth.uid() = sender_id);

-- Enable realtime for messages and participants
ALTER PUBLICATION supabase_realtime ADD TABLE public.lifesync_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lifesync_participants;
