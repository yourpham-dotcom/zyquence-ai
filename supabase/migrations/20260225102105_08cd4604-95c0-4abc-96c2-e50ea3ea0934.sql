
-- Step 1: Create all tables
CREATE TABLE public.sync_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  chat_type TEXT NOT NULL DEFAULT 'group',
  project_id UUID NULL REFERENCES public.ops_projects(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.sync_chat_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.sync_chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.sync_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.sync_chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  metadata JSONB NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Step 2: Enable RLS
ALTER TABLE public.sync_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_messages ENABLE ROW LEVEL SECURITY;

-- Step 3: Policies for sync_chats
CREATE POLICY "Users can view own chats" ON public.sync_chats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create chats" ON public.sync_chats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chats" ON public.sync_chats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chats" ON public.sync_chats FOR DELETE USING (auth.uid() = user_id);

-- Step 4: Policies for sync_chat_members
CREATE POLICY "Members can view chat members" ON public.sync_chat_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add members" ON public.sync_chat_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave chats" ON public.sync_chat_members FOR DELETE USING (auth.uid() = user_id);

-- Step 5: Policies for sync_messages
CREATE POLICY "Users can view messages in own chats" ON public.sync_messages FOR SELECT USING (
  chat_id IN (SELECT id FROM public.sync_chats WHERE user_id = auth.uid())
);
CREATE POLICY "Users can send messages" ON public.sync_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON public.sync_messages FOR DELETE USING (auth.uid() = user_id);

-- Step 6: Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.sync_messages;
