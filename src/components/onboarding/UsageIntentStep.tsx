
import React from "react";
import { Button } from "@/components/ui/button";
import { AccountType } from "@/utils/clerk-supabase-sync";
import { UserCircle2, Users } from "lucide-react";

interface UsageIntentStepProps {
  onNext: (accountType: AccountType) => void;
  initialValue?: AccountType;
}

export function UsageIntentStep({ onNext, initialValue = 'individual' }: UsageIntentStepProps) {
  return (
    <div className="space-y-6 py-4 opacity-0 animate-fade-in">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight">How will you use Loop?</h2>
        <p className="text-muted-foreground">
          This helps us tailor your experience. You can change this later.
        </p>
      </div>
      
      <div className="grid gap-4 py-4">
        <Button
          variant="outline"
          className={`flex h-24 items-center justify-start gap-4 p-4 transition-all duration-200 hover:scale-[1.02] ${
            initialValue === 'individual' ? 'bg-primary/10 border-primary' : ''
          }`}
          onClick={() => onNext('individual')}
        >
          <div className="rounded-full bg-primary/10 p-2">
            <UserCircle2 className="h-6 w-6 text-primary" />
          </div>
          <div className="text-left">
            <div className="font-medium">Individual</div>
            <div className="text-sm text-muted-foreground">
              I'm using Loop for personal projects
            </div>
          </div>
        </Button>
        
        <Button
          variant="outline"
          className={`flex h-24 items-center justify-start gap-4 p-4 transition-all duration-200 hover:scale-[1.02] ${
            initialValue === 'team' ? 'bg-primary/10 border-primary' : ''
          }`}
          onClick={() => onNext('team')}
        >
          <div className="rounded-full bg-primary/10 p-2">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div className="text-left">
            <div className="font-medium">Team</div>
            <div className="text-sm text-muted-foreground">
              I'm collaborating with others on prototypes
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
}
