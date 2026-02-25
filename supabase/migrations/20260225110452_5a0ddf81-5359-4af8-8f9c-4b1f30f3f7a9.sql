ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS size text;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS cost numeric DEFAULT 0;