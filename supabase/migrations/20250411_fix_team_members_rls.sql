
-- Create a proper security definer function to avoid recursive RLS policies
CREATE OR REPLACE FUNCTION public.get_user_team_memberships(p_user_id UUID)
RETURNS TABLE (team_id UUID) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT team_id FROM public.team_members WHERE user_id = p_user_id;
$$;

-- Enable proper RLS policies for team_members
DROP POLICY IF EXISTS "Users can view team memberships" ON public.team_members;

CREATE POLICY "Users can view their own team memberships" 
ON public.team_members 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own team memberships"
ON public.team_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own team memberships"
ON public.team_members
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own team memberships"
ON public.team_members
FOR DELETE
USING (auth.uid() = user_id);
