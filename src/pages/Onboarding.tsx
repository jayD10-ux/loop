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

interface OnboardingData {
  accountType: AccountType;
  teamName?: string;
  teamLogo?: File;
  teamInvites?: string[];
  projectName?: string;
  projectDescription?: string;
}

const ONBOARDING_STORAGE_KEY = 'onboarding_progress';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({ 
    accountType: 'individual' 
  });
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  
  useEffect(() => {
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
    if (!user || !isLoaded) return;
    
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
