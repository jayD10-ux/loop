
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface InviteTeamStepProps {
  onNext: (data: { emails: string[] }) => void;
  onSkip: () => void;
}

export function InviteTeamStep({ onNext, onSkip }: InviteTeamStepProps) {
  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [invalidAnimation, setInvalidAnimation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const emailsContainerRef = useRef<HTMLDivElement>(null);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const addEmail = () => {
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) return;
    
    if (!validateEmail(trimmedEmail)) {
      setError("Please enter a valid email");
      setInvalidAnimation(true);
      setTimeout(() => setInvalidAnimation(false), 600);
      return;
    }
    
    if (emails.includes(trimmedEmail)) {
      setError("Email already added");
      setInvalidAnimation(true);
      setTimeout(() => setInvalidAnimation(false), 600);
      return;
    }
    
    setError("");
    setEmails([...emails, trimmedEmail]);
    setEmail("");
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter(e => e !== emailToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEmail();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) addEmail();
    if (emails.length > 0) {
      onNext({ emails });
    } else {
      setInvalidAnimation(true);
      setTimeout(() => setInvalidAnimation(false), 600);
    }
  };

  return (
    <form 
      ref={formRef} 
      onSubmit={handleSubmit} 
      className="space-y-6 opacity-0 animate-fade-in"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Invite Your Team</h2>
        <p className="text-muted-foreground">
          Collaborate with your teammates in Loop.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="colleague@example.com"
              className={`flex-1 transition-all duration-300 
                ${invalidAnimation ? 'animate-shake border-red-500' : ''} 
                ${error ? 'border-red-500' : ''}`}
            />
            <Button 
              type="button" 
              onClick={addEmail}
              variant="secondary"
            >
              Add
            </Button>
          </div>
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>

        <div ref={emailsContainerRef} className="flex flex-wrap gap-2">
          {emails.map((email) => (
            <div
              key={email}
              className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full text-sm animate-scale-in"
            >
              <span>{email}</span>
              <button
                type="button"
                onClick={() => removeEmail(email)}
                className="text-muted-foreground hover:text-foreground rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onSkip} className="flex-1">
          Skip for now
        </Button>
        <Button type="submit" className="flex-1">
          Send Invites
        </Button>
      </div>
    </form>
  );
}
