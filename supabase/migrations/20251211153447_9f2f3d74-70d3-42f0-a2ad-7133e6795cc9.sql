-- Drop existing overly permissive storage policies for cat-images bucket
DROP POLICY IF EXISTS "Authenticated users can upload cat images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update cat images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete cat images" ON storage.objects;

-- Create admin-only policies for cat-images bucket
CREATE POLICY "Only admins can upload cat images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'cat-images' AND
    public.has_role(auth.uid(), 'admin'::public.app_role)
  );

CREATE POLICY "Only admins can update cat images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'cat-images' AND
    public.has_role(auth.uid(), 'admin'::public.app_role)
  )
  WITH CHECK (
    bucket_id = 'cat-images' AND
    public.has_role(auth.uid(), 'admin'::public.app_role)
  );

CREATE POLICY "Only admins can delete cat images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'cat-images' AND
    public.has_role(auth.uid(), 'admin'::public.app_role)
  );