-- Fix RLS policies for password_reset_codes table
-- Drop any existing policies
DROP POLICY IF EXISTS "System only can manage password reset codes" ON public.password_reset_codes;

-- Create strict policy that prevents all user access
-- Only backend functions can access this table
CREATE POLICY "System only can manage password reset codes"
ON public.password_reset_codes
FOR ALL
USING (false)
WITH CHECK (false);

-- Grant access only to service role (backend functions)
-- This ensures only edge functions can access these codes
GRANT ALL ON public.password_reset_codes TO service_role;