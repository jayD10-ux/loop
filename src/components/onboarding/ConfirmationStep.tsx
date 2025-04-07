
import React from "react";
import { Button } from "@/components/ui/button";
import { AccountType } from "@/utils/clerk-supabase-sync";
import { Check, Loader2 } from "lucide-react";

interface OnboardingData {
  accountType: AccountType;
  teamName?: string;
  teamLogo?: File;
  teamInvites?: string[];
  projectName?: string;
  projectDescription?: string;
}

interface ConfirmationStepProps {
  onComplete: () => void;
  onBack: () => void;
  loading: boolean;
  data: OnboardingData;
}

export function ConfirmationStep({ onComplete, onBack, loading, data }: ConfirmationStepProps) {
  return (
    <div className="space-y-6 py-4 opacity-0 animate-fade-in">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight">You're all set!</h2>
        <p className="text-muted-foreground">
          Here's a summary of your setup. You can change these settings later.
        </p>
      </div>
      
      <div className="space-y-4 p-4 rounded-lg border bg-muted/40">
        <div className="space-y-1">
          <h3 className="font-medium">Account Type</h3>
          <p className="capitalize">{data.accountType}</p>
        </div>
        
        {data.accountType === 'team' && (
          <>
            <div className="space-y-1">
              <h3 className="font-medium">Team Name</h3>
              <p>{data.teamName}</p>
            </div>
            
            {data.teamInvites && data.teamInvites.length > 0 && (
              <div className="space-y-1">
                <h3 className="font-medium">Team Invites</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {data.teamInvites.map((email, index) => (
                    <li key={index} className="text-sm">{email}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
        
        <div className="space-y-1">
          <h3 className="font-medium">First Project</h3>
          <p>{data.projectName}</p>
        </div>
        
        {data.projectDescription && (
          <div className="space-y-1">
            <h3 className="font-medium">Project Description</h3>
            <p className="text-sm text-muted-foreground">{data.projectDescription}</p>
          </div>
        )}
      </div>
      
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button 
          onClick={onComplete} 
          className="flex-1" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Completing Setup...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Complete Setup
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
