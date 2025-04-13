
-- Disable RLS for team_members table completely
ALTER TABLE IF EXISTS public.team_members DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing RLS policies for team_members
DROP POLICY IF EXISTS "Users can view team memberships" ON public.team_members;
DROP POLICY IF EXISTS "Users can view their own team memberships" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can view all team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can insert their own team memberships" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can insert team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can update their own team memberships" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can update team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can delete their own team memberships" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can delete team members" ON public.team_members;
DROP POLICY IF EXISTS "Anonymous users can never access team_members" ON public.team_members;

-- Add a comment documenting why we disabled RLS
COMMENT ON TABLE public.team_members IS 'Team members table with RLS disabled to resolve infinite recursion issues';
