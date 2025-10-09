-- Create storage bucket for cat images
INSERT INTO storage.buckets (id, name, public)
VALUES ('cat-images', 'cat-images', true);

-- Allow public access to view cat images
CREATE POLICY "Public can view cat images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'cat-images');

-- Allow authenticated users to upload cat images
CREATE POLICY "Authenticated users can upload cat images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cat-images');

-- Allow authenticated users to update cat images
CREATE POLICY "Authenticated users can update cat images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'cat-images');

-- Allow authenticated users to delete cat images
CREATE POLICY "Authenticated users can delete cat images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'cat-images');