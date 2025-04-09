
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FinalStepProps {
  onAddPrototype: () => void;
  onGoDashboard: () => void;
}

export function FinalStep({ onAddPrototype, onGoDashboard }: FinalStepProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleGoDashboard = () => {
    // Call the provided callback
    onGoDashboard();
    
    // Ensure navigation to the dashboard
    navigate('/');
  };

  return (
    <div 
      ref={containerRef} 
      className="flex flex-col items-center text-center space-y-6 py-8 opacity-0 animate-fade-in"
    >
      <div 
        ref={checkRef} 
        className="text-primary animate-scale-in"
      >
        <CheckCircle2 className="h-20 w-20" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">You're all set!</h2>
        <p className="text-muted-foreground">
          Your workspace is ready. Would you like to add your first prototype?
        </p>
      </div>

      <div className="flex flex-col w-full space-y-3">
        <Button onClick={onAddPrototype} className="w-full transition-transform hover:scale-105">
          <Upload className="mr-2 h-4 w-4" />
          Add Prototype Now
        </Button>
        <Button onClick={handleGoDashboard} variant="outline" className="w-full transition-transform hover:scale-105">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
