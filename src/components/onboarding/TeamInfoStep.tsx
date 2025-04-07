
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";

interface TeamInfoStepProps {
  onNext: (data: { teamName: string; teamLogo?: File; teamInvites?: string[] }) => void;
  onBack: () => void;
  initialValues?: {
    teamName: string;
    teamInvites?: string[];
  };
}

export function TeamInfoStep({ onNext, onBack, initialValues = { teamName: '', teamInvites: [] } }: TeamInfoStepProps) {
  const [teamName, setTeamName] = useState(initialValues.teamName);
  const [teamLogo, setTeamLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState<string[]>(initialValues.teamInvites || []);
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const addEmail = () => {
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) return;
    
    if (!validateEmail(trimmedEmail)) {
      setError("Please enter a valid email");
      return;
    }
    
    if (emails.includes(trimmedEmail)) {
      setError("Email already added");
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
  
  const handleLogoUpload = (file: File) => {
    setTeamLogo(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleLogoUpload(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName.trim()) {
      setNameError("Team name is required");
      return;
    }
    
    onNext({ 
      teamName, 
      teamLogo: teamLogo || undefined, 
      teamInvites: emails 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 opacity-0 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Set up your team</h2>
        <p className="text-muted-foreground">
          Create your team workspace in Loop.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="teamName">Team Name</Label>
          <Input
            id="teamName"
            value={teamName}
            onChange={(e) => {
              setTeamName(e.target.value);
              setNameError("");
            }}
            placeholder="Acme, Inc."
            className={nameError ? "border-red-500" : ""}
          />
          {nameError && <p className="text-sm text-red-500">{nameError}</p>}
        </div>

        <div className="space-y-2">
          <Label>Team Logo (Optional)</Label>
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center
              transition-all cursor-pointer hover:bg-muted/50
              ${isDragging ? 'border-primary bg-primary/5 scale-105' : 'border-muted-foreground/20'}
              ${logoPreview ? 'scale-100 hover:scale-105' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('logo-upload')?.click()}
          >
            {logoPreview ? (
              <div className="relative w-24 h-24 rounded-full overflow-hidden">
                <img
                  src={logoPreview}
                  alt="Team logo preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop your logo here, or click to browse
                </p>
              </>
            )}
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Invite Team Members (Optional)</Label>
          <div className="flex gap-2">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="colleague@example.com"
              className={error ? "border-red-500" : ""}
            />
            <Button 
              type="button" 
              onClick={addEmail}
              variant="secondary"
            >
              Add
            </Button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="flex flex-wrap gap-2">
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

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" className="flex-1">
          Continue
        </Button>
      </div>
    </form>
  );
}
