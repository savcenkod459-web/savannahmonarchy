-- Create cats table
CREATE TABLE public.cats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  breed TEXT NOT NULL,
  age TEXT NOT NULL,
  gender TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  traits TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.cats ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (catalog is public)
CREATE POLICY "Allow public read access to cats"
ON public.cats
FOR SELECT
TO public
USING (true);

-- Create policy for authenticated users to manage cats (admin functionality)
CREATE POLICY "Allow authenticated users to insert cats"
ON public.cats
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update cats"
ON public.cats
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete cats"
ON public.cats
FOR DELETE
TO authenticated
USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cats_updated_at
BEFORE UPDATE ON public.cats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();