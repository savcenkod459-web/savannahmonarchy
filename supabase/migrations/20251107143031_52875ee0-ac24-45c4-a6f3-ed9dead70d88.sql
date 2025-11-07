-- Create table for password reset codes
CREATE TABLE IF NOT EXISTS public.password_reset_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX idx_password_reset_codes_email ON public.password_reset_codes(user_email);
CREATE INDEX idx_password_reset_codes_code ON public.password_reset_codes(code);

-- Enable RLS
ALTER TABLE public.password_reset_codes ENABLE ROW LEVEL SECURITY;

-- No policies needed as this will be accessed via edge functions only

-- Add cleanup trigger to delete expired codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_reset_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.password_reset_codes
  WHERE expires_at < NOW() OR used = TRUE AND created_at < NOW() - INTERVAL '1 hour';
END;
$$;