
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import anime from "animejs";

interface CreateTeamStepProps {
  onNext: (data: { teamName: string; logo?: File }) => void;
}

export function CreateTeamStep({ onNext }: CreateTeamStepProps) {
  const [teamName, setTeamName] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  // Animate form entry
  useEffect(() => {
    anime({
      targets: formRef.current?.children,
      translateY: [20, 0],
      opacity: [0, 1],
      delay: anime.stagger(100),
      duration: 800,
      easing: "easeOutQuad"
    });
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    anime({
      targets: dropzoneRef.current,
      scale: 1.05,
      borderWidth: 3,
      duration: 300,
      easing: "easeOutQuad"
    });
  };

  const handleDragLeave = () => {
    setIsDragging(false);
    
    anime({
      targets: dropzoneRef.current,
      scale: 1,
      borderWidth: 2,
      duration: 300,
      easing: "easeOutQuad"
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    anime({
      targets: dropzoneRef.current,
      scale: 1,
      borderWidth: 2,
      duration: 300,
      easing: "easeOutQuad"
    });
    
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
      
      anime({
        targets: dropzoneRef.current,
        scale: [1, 1.1, 1],
        duration: 600,
        easing: "easeOutElastic(1, .6)"
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName.trim()) {
      anime({
        targets: formRef.current,
        translateX: [0, -20],
        opacity: [1, 0],
        duration: 400,
        easing: "easeOutQuad",
        complete: () => {
          onNext({ teamName, logo: logo || undefined });
        }
      });
    } else {
      // Shake animation for validation error
      anime({
        targets: inputRef.current,
        translateX: [0, -10, 10, -10, 10, 0],
        duration: 500,
        easing: "easeInOutQuad",
        borderColor: ['#f43f5e', '#d1d5db'],
        backgroundColor: ['rgba(254,226,226,0.2)', 'rgba(255,255,255,1)'],
      });
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
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
            className="transition-all duration-300"
          />
        </div>

        <div className="space-y-2">
          <Label>Team Logo (Optional)</Label>
          <div
            ref={dropzoneRef}
            className={`
              border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center
              transition-all cursor-pointer hover:bg-muted/50
              ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'}
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
