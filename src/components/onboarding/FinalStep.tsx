
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Upload } from "lucide-react";
import anime from "animejs";

interface FinalStepProps {
  onAddPrototype: () => void;
  onGoDashboard: () => void;
}

export function FinalStep({ onAddPrototype, onGoDashboard }: FinalStepProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<HTMLDivElement>(null);

  // Animate on mount
  useEffect(() => {
    // Animate container entry
    anime({
      targets: containerRef.current,
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 800,
      easing: "easeOutQuad"
    });

    // Animate check mark
    anime({
      targets: checkRef.current,
      scale: [0, 1.2, 1],
      opacity: [0, 1],
      rotate: [45, 0],
      duration: 1000,
      delay: 300,
      easing: "easeOutElastic(1, .6)"
    });

    // Animate the text and buttons
    anime({
      targets: [
        containerRef.current?.querySelector("h2"),
        containerRef.current?.querySelector("p"),
        containerRef.current?.querySelectorAll("button")
      ],
      translateY: [20, 0],
      opacity: [0, 1],
      delay: anime.stagger(150, { start: 800 }),
      duration: 600,
      easing: "easeOutQuad"
    });
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col items-center text-center space-y-6 py-8">
      <div ref={checkRef} className="text-primary">
        <CheckCircle2 className="h-20 w-20" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">You're all set!</h2>
        <p className="text-muted-foreground">
          Your workspace is ready. Would you like to add your first prototype?
        </p>
      </div>

      <div className="flex flex-col w-full space-y-3">
        <Button onClick={onAddPrototype} className="w-full">
          <Upload className="mr-2 h-4 w-4" />
          Add Prototype Now
        </Button>
        <Button onClick={onGoDashboard} variant="outline" className="w-full">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
