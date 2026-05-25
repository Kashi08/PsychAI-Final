-- =========================================================================
-- Supabase Row Level Security (RLS) Policy for Psychologist App
-- Run this in the Supabase SQL Editor to allow psychologists
-- to dynamically read profiles (full name and avatar seed) of linked patients.
-- =========================================================================

-- Enable psychologists to view the profile of any patient currently linked to them
CREATE POLICY "Linked psychologists can view patient profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- A user can see their own profile
  auth.uid() = user_id 
  OR 
  -- Or a psychologist can see this profile if they have an active link in patient_links
  EXISTS (
    SELECT 1 FROM public.patient_links
    WHERE patient_links.patient_id = profiles.user_id
      AND patient_links.psychologist_id = auth.uid()
      AND patient_links.status = 'active'
  )
);

-- Note: If you encounter an error saying the policy already exists or SELECT is restricted,
-- you can run this block first to clean it up:
-- DROP POLICY IF EXISTS "Linked psychologists can view patient profiles" ON public.profiles;
