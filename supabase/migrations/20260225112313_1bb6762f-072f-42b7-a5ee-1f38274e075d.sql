
-- Fix linked_tasks policies to be properly scoped
DROP POLICY "Users can create linked tasks" ON public.linked_tasks;
DROP POLICY "Users can view linked tasks" ON public.linked_tasks;

CREATE POLICY "Users can create linked tasks" ON public.linked_tasks FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.voice_sessions WHERE id = linked_tasks.session_id AND user_id = auth.uid())
);

CREATE POLICY "Users can view linked tasks" ON public.linked_tasks FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.voice_sessions WHERE id = linked_tasks.session_id AND user_id = auth.uid())
);
