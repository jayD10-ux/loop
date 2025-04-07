
import { supabase } from "@/integrations/supabase/client";
import { updateClerkMetadata, AccountType } from "@/utils/clerk-supabase-sync";
import { UserResource } from "@clerk/types";
import { toast } from "@/hooks/use-toast";

/**
 * Creates a team in Supabase if one doesn't already exist for the user
 */
async function maybeCreateTeam(userId: string, teamName: string) {
  try {
    // Check if a team already exists for this user
    const { data: existingTeam } = await supabase
      .from('teams')
      .select('id, name')
      .eq('owner_user_id', userId)
      .maybeSingle();
    
    if (existingTeam) {
      console.log('Using existing team:', existingTeam);
      return existingTeam;
    }
    
    // Create a new team
    const { data: team, error } = await supabase
      .from('teams')
      .insert({
        name: teamName.trim(),
        owner_user_id: userId
      })
      .select()
      .single();
    
    if (error) throw error;
    console.log('Created new team:', team);
    return team;
  } catch (error) {
    console.error('Error creating team:', error);
    throw new Error('Failed to create team');
  }
}

/**
 * Adds the user as a team member with owner role
 */
async function addUserToTeam(userId: string, teamId: string) {
  try {
    // Check if user is already a team member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .match({ team_id: teamId, user_id: userId })
      .maybeSingle();
    
    if (existingMember) {
      console.log('User is already a team member');
      return;
    }
    
    // Add user as team owner
    const { error } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: userId,
        role: 'owner'
      });
    
    if (error) throw error;
    console.log('Added user to team as owner');
  } catch (error) {
    console.error('Error adding user to team:', error);
    throw new Error('Failed to add user to team');
  }
}

/**
 * Creates a project for the user or team
 */
async function createProject(
  projectName: string, 
  ownerId: string, 
  ownerType: 'user' | 'team',
  projectDescription?: string
) {
  try {
    // Explicitly specify owner_type as 'user' or 'team' to match the expected enum values
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        name: projectName.trim(),
        description: projectDescription?.trim(),
        owner_id: ownerId,
        owner_type: ownerType // This is already typed as 'user' | 'team'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Project creation error details:', error);
      throw error;
    }
    console.log('Created project:', project);
    return project;
  } catch (error) {
    console.error('Error creating project:', error);
    throw new Error('Failed to create project');
  }
}

/**
 * Adds team invites for the specified emails
 */
async function addTeamInvites(teamId: string, invitedBy: string, emails: string[]) {
  if (!emails || emails.length === 0) return;
  
  try {
    const invites = emails.map(email => ({
      team_id: teamId,
      invited_email: email.trim().toLowerCase(),
      invited_by: invitedBy
    }));
    
    const { error } = await supabase
      .from('team_invites')
      .insert(invites);
    
    if (error) throw error;
    console.log(`Added ${invites.length} team invites`);
  } catch (error) {
    console.error('Error adding team invites:', error);
    // Don't throw here, as this is optional and shouldn't block onboarding completion
  }
}

/**
 * Finalizes the onboarding process by creating all necessary records in Supabase
 * and updating Clerk metadata
 */
export async function finalizeOnboarding(
  user: UserResource,
  data: {
    accountType: AccountType;
    teamName?: string;
    teamInvites?: string[];
    projectName: string;
    projectDescription?: string;
  }
) {
  const userId = user.id;
  const { accountType, teamName, teamInvites, projectName, projectDescription } = data;
  
  try {
    console.log('Starting onboarding finalization with data:', { accountType, teamName, projectName });
    
    // Step 1: Create team if account type is 'team'
    let teamId: string | undefined;
    
    if (accountType === 'team' && teamName) {
      const team = await maybeCreateTeam(userId, teamName);
      teamId = team.id;
      
      // Step 2: Add user to team
      await addUserToTeam(userId, teamId);
      
      // Step 3: Add team invites (if any)
      if (teamInvites && teamInvites.length > 0) {
        await addTeamInvites(teamId, userId, teamInvites);
      }
    }
    
    // Step 4: Create project
    // The owner type is explicitly typed as 'user' | 'team'
    const ownerType: 'user' | 'team' = teamId ? 'team' : 'user';
    
    await createProject(
      projectName,
      teamId || userId,
      ownerType,
      projectDescription
    );
    
    // Step 5: Update Clerk metadata
    const success = await updateClerkMetadata(user, {
      has_completed_onboarding: true,
      account_type: accountType
    });
    
    if (!success) {
      throw new Error('Failed to update user metadata');
    }
    
    console.log('Onboarding finalized successfully');
    return { success: true };
  } catch (error) {
    console.error('Error finalizing onboarding:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}
