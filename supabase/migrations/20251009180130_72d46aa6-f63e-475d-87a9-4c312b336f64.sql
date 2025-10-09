-- Add additional_images column to cats table for storing multiple images
ALTER TABLE cats ADD COLUMN IF NOT EXISTS additional_images text[] DEFAULT '{}';

-- Add comment to explain the column
COMMENT ON COLUMN cats.additional_images IS 'Array of additional image URLs for the cat gallery';