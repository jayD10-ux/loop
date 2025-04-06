
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

interface CreateTeamStepProps {
  onNext: (data: { teamName: string; logo?: File }) => void;
}

export function CreateTeamStep({ onNext }: CreateTeamStepProps) {
  const [teamName, setTeamName] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [invalidAnimation, setInvalidAnimation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

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

  const handleLogoUpload = (file: File) => {
    setLogo(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName.trim()) {
      onNext({ teamName, logo: logo || undefined });
    } else {
      // Display validation error animation
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
        <h2 className="text-2xl font-bold tracking-tight">Create Your Team</h2>
        <p className="text-muted-foreground">
          Let's set up your team workspace in Loop.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="teamName">Team Name</Label>
          <Input
            ref={inputRef}
            id="teamName"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Acme, Inc."
            required
            className={`transition-all duration-300 ${invalidAnimation ? 'animate-shake border-red-500 bg-red-50' : ''}`}
          />
        </div>

        <div className="space-y-2">
          <Label>Team Logo (Optional)</Label>
          <div
            ref={dropzoneRef}
            className={`
              border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center
              transition-all cursor-pointer hover:bg-muted/50
              ${isDragging ? 'border-primary bg-primary/5 scale-105' : 'border-muted-foreground/20'}
              ${logoPreview ? 'scale-100 hover:scale-105' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
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
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full">Continue</Button>
    </form>
  );
}
