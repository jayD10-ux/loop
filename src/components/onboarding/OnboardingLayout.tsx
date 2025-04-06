
import React, { ReactNode, useEffect, useRef } from "react";
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

  useEffect(() => {
    // Set progress bar width based on current step
    if (progressRef.current) {
      progressRef.current.style.width = `${(currentStep / totalSteps) * 100}%`;
    }
  }, [currentStep, totalSteps]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div 
        ref={containerRef}
        className="w-full max-w-xl bg-background rounded-xl shadow-lg overflow-hidden border opacity-0 translate-y-4 animate-fade-in"
      >
        <div className="relative h-1 bg-muted">
          <div 
            ref={progressRef} 
            className="absolute h-full bg-primary transition-all duration-500 ease-in-out" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
        
        <div className="flex items-center p-4 border-b">
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div 
                key={index}
                className={`h-2 w-2 rounded-full transition-colors duration-300 ${index < currentStep ? 'bg-primary' : 'bg-muted'}`}
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
