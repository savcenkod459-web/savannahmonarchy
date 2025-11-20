-- Add video_poster column to cats table
ALTER TABLE public.cats 
ADD COLUMN IF NOT EXISTS video_poster TEXT;