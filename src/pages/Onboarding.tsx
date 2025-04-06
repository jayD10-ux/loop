
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { CreateTeamStep } from "@/components/onboarding/CreateTeamStep";
import { InviteTeamStep } from "@/components/onboarding/InviteTeamStep";
import { FinalStep } from "@/components/onboarding/FinalStep";
import anime from "animejs";

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
    
    // Animate transition between steps
    anime({
      targets: document.querySelector('.onboarding-container'),
      translateX: [0, -20, 20, 0],
      opacity: [1, 0, 0, 1],
      duration: 800,
      easing: "easeInOutQuad",
      complete: () => {
        setStep(2);
      }
    });
  };

  const handleInviteTeam = (data: InviteData) => {
    setInviteData(data);
    
    // Animate transition between steps
    anime({
      targets: document.querySelector('.onboarding-container'),
      translateX: [0, -20, 20, 0],
      opacity: [1, 0, 0, 1],
      duration: 800,
      easing: "easeInOutQuad",
      complete: () => {
        setStep(3);
      }
    });
  };

  const handleSkipInvite = () => {
    setInviteData({ emails: [] });
    
    // Animate transition between steps
    anime({
      targets: document.querySelector('.onboarding-container'),
      translateX: [0, -20, 20, 0],
      opacity: [1, 0, 0, 1],
      duration: 800,
      easing: "easeInOutQuad",
      complete: () => {
        setStep(3);
      }
    });
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
    <div className="onboarding-container">
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
