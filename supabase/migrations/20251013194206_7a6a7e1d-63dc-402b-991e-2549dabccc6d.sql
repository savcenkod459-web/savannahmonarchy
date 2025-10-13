-- Add video field to cats table
ALTER TABLE public.cats ADD COLUMN IF NOT EXISTS video TEXT;