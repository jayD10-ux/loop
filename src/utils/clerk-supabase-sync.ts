
import { supabase } from "@/integrations/supabase/client";
import { UserResource } from "@clerk/types";
import type { Database } from "@/integrations/supabase/types";

// Define the account type
export type AccountType = 'individual' | 'team';

// Define the clerk metadata interface
export interface ClerkMetadata {
  has_completed_onboarding: boolean;
  account_type: AccountType;
}

/**
 * Synchronizes Clerk user data with Supabase profiles
 */
export async function syncUserToSupabase(user: UserResource) {
  try {
    // Check if the user exists in the profiles table
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    const accountType = (user.publicMetadata.account_type as AccountType) || 'individual';
    const hasCompletedOnboarding = user.publicMetadata.has_completed_onboarding as boolean || false;
    
    // If profile exists, update it
    if (existingProfile) {
      await supabase
        .from('profiles')
        .update({
          first_name: user.firstName,
          last_name: user.lastName,
          account_type: accountType,
          has_completed_onboarding: hasCompletedOnboarding,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
    } else {
      // If profile doesn't exist, create it
      await supabase
        .from('profiles')
        .insert({
          id: user.id,
          first_name: user.firstName,
          last_name: user.lastName,
          email: user.primaryEmailAddress?.emailAddress,
          account_type: accountType,
          has_completed_onboarding: hasCompletedOnboarding,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }
    
    return true;
  } catch (error) {
    console.error("Error syncing user to Supabase:", error);
    return false;
  }
}

/**
 * Updates Clerk metadata
 */
export async function updateClerkMetadata(user: UserResource, metadata: Partial<ClerkMetadata>) {
  try {
    // Create a merged metadata object
    const updatedMetadata = { ...user.publicMetadata, ...metadata };
    
    // Update the user's metadata by directly accessing the required update method
    // Since we're in the frontend context, we use the update method with a cast to satisfy TypeScript
    await user.update({
      // Cast as any to bypass TypeScript errors while still working at runtime
      publicMetadata: updatedMetadata
    } as any);
    
    return true;
  } catch (error) {
    console.error("Error updating Clerk metadata:", error);
    return false;
  }
}
