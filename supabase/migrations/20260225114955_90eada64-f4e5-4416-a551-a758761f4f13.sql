CREATE TABLE public.work_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  employee_name TEXT NOT NULL,
  work_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TEXT NOT NULL DEFAULT '09:00',
  end_time TEXT NOT NULL DEFAULT '17:00',
  hours NUMERIC NOT NULL DEFAULT 8,
  hourly_rate NUMERIC NOT NULL DEFAULT 0,
  total_pay NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.work_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own work logs" ON public.work_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own work logs" ON public.work_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own work logs" ON public.work_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own work logs" ON public.work_logs FOR DELETE USING (auth.uid() = user_id);