
-- Create RLS policies for team_members that don't cause infinite recursion
ALTER TABLE IF EXISTS public.team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view team memberships" ON public.team_members;
DROP POLICY IF EXISTS "Users can view their own team memberships" ON public.team_members;

CREATE POLICY "Users can view their own team memberships" 
ON public.team_members 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Team owners can view all team members"
ON public.team_members
FOR SELECT 
USING (
  team_id IN (
    SELECT id FROM public.teams 
    WHERE owner_user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own team memberships"
ON public.team_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Team owners can insert team members"
ON public.team_members
FOR INSERT
WITH CHECK (
  team_id IN (
    SELECT id FROM public.teams 
    WHERE owner_user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own team memberships"
ON public.team_members
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own team memberships"
ON public.team_members
FOR DELETE
USING (auth.uid() = user_id);
