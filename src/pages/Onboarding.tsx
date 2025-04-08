
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { UsageIntentStep } from "@/components/onboarding/UsageIntentStep";
import { TeamInfoStep } from "@/components/onboarding/TeamInfoStep";
import { ProjectInfoStep } from "@/components/onboarding/ProjectInfoStep";
import { ConfirmationStep } from "@/components/onboarding/ConfirmationStep";
import { FinalStep } from "@/components/onboarding/FinalStep";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AccountType } from "@/types/auth";

interface OnboardingData {
  accountType: AccountType;
  teamName?: string;
  teamLogo?: File;
  teamInvites?: string[];
  projectName: string;
  projectDescription?: string;
}

const ONBOARDING_STORAGE_KEY = 'onboarding_progress';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({ 
    accountType: 'individual',
    projectName: ''
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUserId(session.user.id);
      }
      
      setIsSessionLoaded(true);
    };
    
    loadSession();
    
    try {
      const savedProgress = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        setOnboardingData(parsed.data || { accountType: 'individual' });
        if (parsed.step && parsed.step >= 1 && parsed.step <= 4 && !parsed.completed) {
          setStep(parsed.step);
        }
        if (parsed.completed) {
          setCompleted(true);
        }
      }
    } catch (error) {
      console.error("Error loading onboarding progress:", error);
    }
  }, []);
  
  useEffect(() => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify({
        step,
        data: onboardingData,
        completed
      }));
    } catch (error) {
      console.error("Error saving onboarding progress:", error);
    }
  }, [step, onboardingData, completed]);
  
  const handleUsageIntent = (accountType: AccountType) => {
    setError(null);
    setOnboardingData({ ...onboardingData, accountType });
    setStep(accountType === 'individual' ? 3 : 2);
  };
  
  const handleTeamInfo = (data: { teamName: string; teamLogo?: File; teamInvites?: string[] }) => {
    setError(null);
    setOnboardingData({ ...onboardingData, ...data });
    setStep(3);
  };
  
  const handleProjectInfo = (data: { projectName: string; projectDescription?: string }) => {
    setError(null);
    setOnboardingData({ ...onboardingData, ...data });
    setStep(4);
  };
  
  const completeOnboarding = async () => {
    if (!userId || !isSessionLoaded) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (!onboardingData.projectName) {
        throw new Error("Project name is required");
      }
      
      if (onboardingData.accountType === 'team' && !onboardingData.teamName) {
        throw new Error("Team name is required");
      }
      
      console.log("Attempting to finalize onboarding with:", {
        accountType: onboardingData.accountType,
        teamName: onboardingData.teamName,
        teamInvites: onboardingData.teamInvites?.length || 0,
        projectName: onboardingData.projectName,
        hasDescription: !!onboardingData.projectDescription
      });
      
      const result = await finalizeOnboarding(userId, onboardingData);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to complete onboarding");
      }
      
      setCompleted(true);
      setStep(5);
      
      toast({
        title: "Onboarding complete!",
        description: "Your account has been set up successfully.",
      });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      const errorMessage = error instanceof Error ? error.message : "Please try again.";
      
      setError(errorMessage);
      
      toast({
        title: "Error completing onboarding",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddPrototype = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    navigate('/add-prototype');
  };
  
  const handleGoDashboard = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    navigate('/');
  };
  
  const handleBack = () => {
    setError(null);
    if (step > 1) {
      if (onboardingData.accountType === 'individual' && step === 3) {
        setStep(1);
      } else {
        setStep(step - 1);
      }
    }
  };
  
  const handleRetry = () => {
    setError(null);
    completeOnboarding();
  };
  
  const totalSteps = completed ? 5 : (onboardingData.accountType === 'individual' ? 3 : 4);
  
  if (!isSessionLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <OnboardingLayout 
      currentStep={step} 
      totalSteps={totalSteps}
      onPrevious={step > 1 && step < 5 ? handleBack : undefined}
    >
      {step === 1 && (
        <UsageIntentStep 
          onNext={handleUsageIntent} 
          initialValue={onboardingData.accountType} 
        />
      )}
      
      {step === 2 && onboardingData.accountType === 'team' && (
        <TeamInfoStep 
          onNext={handleTeamInfo} 
          initialValues={{
            teamName: onboardingData.teamName || '',
            teamInvites: onboardingData.teamInvites || []
          }}
          onBack={handleBack}
        />
      )}
      
      {step === 3 && (
        <ProjectInfoStep 
          onNext={handleProjectInfo} 
          initialValues={{
            projectName: onboardingData.projectName || '',
            projectDescription: onboardingData.projectDescription || ''
          }}
          onBack={handleBack}
        />
      )}
      
      {step === 4 && (
        <ConfirmationStep 
          onComplete={error ? handleRetry : completeOnboarding}
          onBack={handleBack}
          loading={loading}
          data={onboardingData}
          error={error}
        />
      )}
      
      {step === 5 && (
        <FinalStep 
          onAddPrototype={handleAddPrototype}
          onGoDashboard={handleGoDashboard}
        />
      )}
    </OnboardingLayout>
  );
}

async function finalizeOnboarding(
  userId: string,
  data: {
    accountType: AccountType;
    teamName?: string;
    teamInvites?: string[];
    projectName: string;
    projectDescription?: string;
  }
) {
  const { accountType, teamName, teamInvites, projectName, projectDescription } = data;
  
  try {
    console.log('Starting onboarding finalization with data:', { accountType, teamName, projectName });
    
    let teamId: string | undefined;
    
    // Create team if account type is team
    if (accountType === 'team' && teamName) {
      try {
        // Use RPC to bypass RLS policies completely
        const { data, error } = await supabase.rpc('create_team', {
          team_name: teamName.trim(),
          owner_id: userId
        });
        
        if (error) {
          console.error('Team creation error:', error);
          return { 
            success: false, 
            error: `Failed to create team: ${error.message}`
          };
        }
        
        teamId = data;
        console.log('Created team with ID:', teamId);
        
        // Add user as team member using RPC
        const { error: memberError } = await supabase.rpc('add_team_member', {
          team_id: teamId,
          member_id: userId,
          member_role: 'owner'
        });
        
        if (memberError) {
          console.error('Error adding user to team:', memberError);
          return { 
            success: false, 
            error: `Failed to add user to team: ${memberError.message}`
          };
        }
        
        console.log('Added user to team as owner');
        
        // Process team invites if any
        if (teamInvites && teamInvites.length > 0) {
          for (const email of teamInvites) {
            const { error: inviteError } = await supabase.rpc('create_team_invite', {
              team_id: teamId,
              email: email.trim().toLowerCase(),
              inviter_id: userId
            });
            
            if (inviteError) {
              console.error(`Error inviting ${email}:`, inviteError);
              // Continue even if invites fail, as they are not critical
            } else {
              console.log(`Invited ${email} to team`);
            }
          }
        }
      } catch (error) {
        console.error('Team creation/setup error:', error);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to set up team'
        };
      }
    }
    
    // Create project using RPC
    try {
      const ownerType = teamId ? 'team' : 'user';
      const ownerId = teamId || userId;
      
      const { error: projectError } = await supabase.rpc('create_project', {
        project_name: projectName.trim(),
        project_description: projectDescription?.trim() || null,
        owner_id: ownerId,
        owner_type: ownerType
      });
      
      if (projectError) {
        console.error('Project creation error:', projectError);
        return { 
          success: false, 
          error: `Failed to create project: ${projectError.message}`
        };
      }
      
      console.log('Created project successfully');
    } catch (error) {
      console.error('Project creation error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create project'
      };
    }
    
    // Update user profile to mark onboarding as completed using RPC
    // This is the critical part where we need to match the parameter names with the SQL function
    try {
      const { data: profileResult, error: profileError } = await supabase.rpc('complete_onboarding', {
        _user_id: userId,  // Using _user_id to match the parameter name in SQL function
        _account_type: accountType  // Using _account_type to match the parameter name in SQL function
      });
      
      if (profileError) {
        console.error('Profile update error:', profileError);
        return { 
          success: false, 
          error: `Failed to update profile: ${profileError.message}`
        };
      }

      if (!profileResult) {
        console.error('Profile update returned no result');
        return {
          success: false,
          error: 'Failed to update profile: No response from server'
        };
      }

      if (!profileResult.success) {
        console.error('Profile update failed:', profileResult);
        return {
          success: false,
          error: profileResult.error || 'Failed to update profile'
        };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update user profile'
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
