
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { CreateTeamStep } from "@/components/onboarding/CreateTeamStep";
import { InviteTeamStep } from "@/components/onboarding/InviteTeamStep";
import { FinalStep } from "@/components/onboarding/FinalStep";

interface TeamData {
  teamName: string;
  logo?: File;
}

interface InviteData {
  emails: string[];
}

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [isEnterprise, setIsEnterprise] = useState(true); // In a real app, this would come from auth
  const navigate = useNavigate();

  const handleCreateTeam = (data: TeamData) => {
    setTeamData(data);
    setStep(2);
  };

  const handleInviteTeam = (data: InviteData) => {
    setInviteData(data);
    setStep(3);
  };

  const handleSkipInvite = () => {
    setInviteData({ emails: [] });
    setStep(3);
  };

  const handleAddPrototype = () => {
    navigate('/add-prototype');
  };

  const handleGoDashboard = () => {
    navigate('/');
  };

  // For individual users, show a simplified flow
  if (!isEnterprise) {
    return (
      <OnboardingLayout currentStep={1} totalSteps={1}>
        <FinalStep 
          onAddPrototype={handleAddPrototype}
          onGoDashboard={handleGoDashboard}
        />
      </OnboardingLayout>
    );
  }

  return (
    <div className="onboarding-container transition-all duration-500">
      <OnboardingLayout currentStep={step} totalSteps={3}>
        {step === 1 && (
          <CreateTeamStep onNext={handleCreateTeam} />
        )}
        
        {step === 2 && (
          <InviteTeamStep 
            onNext={handleInviteTeam}
            onSkip={handleSkipInvite}
          />
        )}
        
        {step === 3 && (
          <FinalStep 
            onAddPrototype={handleAddPrototype}
            onGoDashboard={handleGoDashboard}
          />
        )}
      </OnboardingLayout>
    </div>
  );
}
