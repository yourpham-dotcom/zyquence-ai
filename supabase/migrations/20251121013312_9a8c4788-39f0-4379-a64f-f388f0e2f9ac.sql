-- Fix function search path security warning by replacing the function
CREATE OR REPLACE FUNCTION public.update_music_project_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;