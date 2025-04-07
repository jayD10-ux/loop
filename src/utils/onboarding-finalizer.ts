
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
    const { data: existingTeam, error: queryError } = await supabase
      .from('teams')
      .select('id, name')
      .eq('owner_user_id', userId)
      .maybeSingle();
    
    if (queryError) {
      console.error('Error checking for existing team:', queryError);
      throw new Error(`Failed to check for existing team: ${queryError.message}`);
    }
    
    if (existingTeam) {
      console.log('Using existing team:', existingTeam);
      return existingTeam;
    }
    
    // Create a new team
    const { data: team, error: insertError } = await supabase
      .from('teams')
      .insert({
        name: teamName.trim(),
        owner_user_id: userId
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating team:', insertError);
      
      // Handle the specific RLS recursion error
      if (insertError.message.includes('infinite recursion detected')) {
        throw new Error('Database policy error. Please contact support.');
      }
      
      throw new Error(`Failed to create team: ${insertError.message}`);
    }
    
    console.log('Created new team:', team);
    return team;
  } catch (error) {
    console.error('Error in maybeCreateTeam:', error);
    throw error; // Re-throw to be handled by caller
  }
}

/**
 * Adds the user as a team member with owner role
 */
async function addUserToTeam(userId: string, teamId: string) {
  try {
    // Check if user is already a team member
    const { data: existingMember, error: queryError } = await supabase
      .from('team_members')
      .select('id')
      .match({ team_id: teamId, user_id: userId })
      .maybeSingle();
    
    if (queryError) {
      console.error('Error checking existing team membership:', queryError);
      throw new Error(`Failed to check team membership: ${queryError.message}`);
    }
    
    if (existingMember) {
      console.log('User is already a team member');
      return;
    }
    
    // Add user as team owner
    const { error: insertError } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: userId,
        role: 'owner'
      });
    
    if (insertError) {
      console.error('Error adding user to team:', insertError);
      
      // Handle the specific RLS recursion error
      if (insertError.message.includes('infinite recursion detected')) {
        throw new Error('Database policy error. Please contact support.');
      }
      
      throw new Error(`Failed to add user to team: ${insertError.message}`);
    }
    
    console.log('Added user to team as owner');
  } catch (error) {
    console.error('Error in addUserToTeam:', error);
    throw error; // Re-throw to be handled by caller
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
    console.log('Creating project with params:', { 
      projectName, 
      ownerId, 
      ownerType, 
      projectDescription 
    });
    
    // First check if project already exists
    const { data: existingProject, error: queryError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('owner_id', ownerId)
      .eq('owner_type', ownerType)
      .eq('name', projectName.trim())
      .maybeSingle();
      
    if (queryError) {
      console.error('Error checking for existing project:', queryError);
    } else if (existingProject) {
      console.log('Project already exists, using:', existingProject);
      return existingProject;
    }
    
    // Create the project
    const { data: project, error: insertError } = await supabase
      .from('projects')
      .insert({
        name: projectName.trim(),
        description: projectDescription?.trim(),
        owner_id: ownerId,
        owner_type: ownerType 
      })
      .select()
      .maybeSingle();
    
    if (insertError) {
      console.error('Project creation error details:', insertError);
      
      // Handle the specific RLS recursion error
      if (insertError.message.includes('infinite recursion detected')) {
        throw new Error('Database policy error. Please contact support.');
      }
      
      throw new Error(`Failed to create project: ${insertError.message}`);
    }
    
    if (!project) {
      throw new Error('Project created but no data returned');
    }
    
    console.log('Created project:', project);
    return project;
  } catch (error) {
    console.error('Error in createProject:', error);
    throw error; // Re-throw to be handled by caller
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
    
    if (error) {
      console.error('Error adding team invites:', error);
      return; // Don't throw here, as this is optional
    }
    
    console.log(`Added ${invites.length} team invites`);
  } catch (error) {
    console.error('Error in addTeamInvites:', error);
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
      try {
        const team = await maybeCreateTeam(userId, teamName);
        teamId = team.id;
        
        // Step 2: Add user to team
        await addUserToTeam(userId, teamId);
        
        // Step 3: Add team invites (if any)
        if (teamInvites && teamInvites.length > 0) {
          await addTeamInvites(teamId, userId, teamInvites);
        }
      } catch (error) {
        console.error('Team creation/setup error:', error);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to set up team'
        };
      }
    }
    
    // Step 4: Create project
    try {
      const ownerType: 'user' | 'team' = teamId ? 'team' : 'user';
      
      await createProject(
        projectName,
        teamId || userId,
        ownerType,
        projectDescription
      );
    } catch (error) {
      console.error('Project creation error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create project'
      };
    }
    
    // Step 5: Update Clerk metadata
    try {
      const success = await updateClerkMetadata(user, {
        has_completed_onboarding: true,
        account_type: accountType
      });
      
      if (!success) {
        throw new Error('Failed to update user metadata');
      }
    } catch (error) {
      console.error('User metadata update error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update user metadata'
      };
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
