
-- Workflow Nodes table
CREATE TABLE public.workflow_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.ops_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  owner TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  position_x NUMERIC NOT NULL DEFAULT 0,
  position_y NUMERIC NOT NULL DEFAULT 0,
  node_type TEXT NOT NULL DEFAULT 'step',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.workflow_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workflow nodes" ON public.workflow_nodes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own workflow nodes" ON public.workflow_nodes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workflow nodes" ON public.workflow_nodes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workflow nodes" ON public.workflow_nodes FOR DELETE USING (auth.uid() = user_id);

-- Workflow Edges table
CREATE TABLE public.workflow_edges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.ops_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  source_node_id UUID NOT NULL REFERENCES public.workflow_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES public.workflow_nodes(id) ON DELETE CASCADE,
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.workflow_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workflow edges" ON public.workflow_edges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own workflow edges" ON public.workflow_edges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workflow edges" ON public.workflow_edges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workflow edges" ON public.workflow_edges FOR DELETE USING (auth.uid() = user_id);
