
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { UsageIntentStep } from "@/components/onboarding/UsageIntentStep";
import { TeamInfoStep } from "@/components/onboarding/TeamInfoStep";
import { ProjectInfoStep } from "@/components/onboarding/ProjectInfoStep";
import { ConfirmationStep } from "@/components/onboarding/ConfirmationStep";
import { FinalStep } from "@/components/onboarding/FinalStep";
import { finalizeOnboarding } from "@/utils/onboarding-finalizer";
import { AccountType, ClerkMetadata } from "@/utils/clerk-supabase-sync";
import { toast } from "@/hooks/use-toast";

// Define the onboarding data structure
interface OnboardingData {
  accountType: AccountType;
  teamName?: string;
  teamLogo?: File;
  teamInvites?: string[];
  projectName?: string;
  projectDescription?: string;
}

// Define the storage key for caching onboarding progress
const ONBOARDING_STORAGE_KEY = 'onboarding_progress';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({ 
    accountType: 'individual' 
  });
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  
  // Load cached progress from localStorage on initial render
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        setOnboardingData(parsed.data || { accountType: 'individual' });
        // Only restore step if it's valid and onboarding is not completed
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
  
  // Save progress to localStorage when data or step changes
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
  
  // Handle usage intent selection (individual vs team)
  const handleUsageIntent = (accountType: AccountType) => {
    setOnboardingData({ ...onboardingData, accountType });
    setStep(accountType === 'individual' ? 3 : 2); // Skip team info for individuals
  };
  
  // Handle team info collection
  const handleTeamInfo = (data: { teamName: string; teamLogo?: File; teamInvites?: string[] }) => {
    setOnboardingData({ ...onboardingData, ...data });
    setStep(3);
  };
  
  // Handle project info collection
  const handleProjectInfo = (data: { projectName: string; projectDescription?: string }) => {
    setOnboardingData({ ...onboardingData, ...data });
    setStep(4);
  };
  
  // Complete onboarding and update Clerk metadata
  const completeOnboarding = async () => {
    if (!user || !isLoaded) return;
    
    setLoading(true);
    try {
      // Validate required data
      if (!onboardingData.projectName) {
        throw new Error("Project name is required");
      }
      
      if (onboardingData.accountType === 'team' && !onboardingData.teamName) {
        throw new Error("Team name is required");
      }
      
      // Finalize onboarding by creating Supabase records and updating Clerk metadata
      const result = await finalizeOnboarding(user, {
        accountType: onboardingData.accountType,
        teamName: onboardingData.teamName,
        teamInvites: onboardingData.teamInvites,
        projectName: onboardingData.projectName,
        projectDescription: onboardingData.projectDescription
      });
      
      if (!result.success) {
        throw new Error(result.error || "Failed to complete onboarding");
      }
      
      // Mark as completed
      setCompleted(true);
      setStep(5);
      
      toast({
        title: "Onboarding complete!",
        description: "Your account has been set up successfully.",
      });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Error completing onboarding",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle add prototype button on final step
  const handleAddPrototype = () => {
    // Clear cached onboarding data
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    
    // Redirect to add prototype page
    navigate('/add-prototype');
  };
  
  // Handle go to dashboard button on final step
  const handleGoDashboard = () => {
    // Clear cached onboarding data
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    
    // Redirect to dashboard
    navigate('/');
  };
  
  // Handle back navigation
  const handleBack = () => {
    if (step > 1) {
      // For individuals going back from step 3, go to step 1
      if (onboardingData.accountType === 'individual' && step === 3) {
        setStep(1);
      } else {
        setStep(step - 1);
      }
    }
  };
  
  // Calculate the total number of steps based on account type
  const totalSteps = completed ? 5 : (onboardingData.accountType === 'individual' ? 3 : 4);
  
  if (!isLoaded) {
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
          onComplete={completeOnboarding} 
          onBack={handleBack}
          loading={loading}
          data={onboardingData}
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
