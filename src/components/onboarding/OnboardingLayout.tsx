
import React, { ReactNode, useEffect, useRef } from "react";
import anime from "animejs";
import { useNavigate } from "react-router-dom";

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  onNext,
  onPrevious
}: OnboardingLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Animate entry on first render
  useEffect(() => {
    anime({
      targets: containerRef.current,
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 800,
      easing: "easeOutQuad"
    });
  }, []);

  // Animate progress bar when step changes
  useEffect(() => {
    anime({
      targets: progressRef.current,
      width: `${(currentStep / totalSteps) * 100}%`,
      duration: 600,
      easing: "easeInOutQuad"
    });
  }, [currentStep, totalSteps]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div 
        ref={containerRef}
        className="w-full max-w-xl bg-background rounded-xl shadow-lg overflow-hidden border"
      >
        <div className="relative h-1 bg-muted">
          <div 
            ref={progressRef} 
            className="absolute h-full bg-primary" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
        
        <div className="flex items-center p-4 border-b">
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div 
                key={index}
                className={`h-2 w-2 rounded-full ${index < currentStep ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
          <div className="ml-auto text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
