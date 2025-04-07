
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProjectInfoStepProps {
  onNext: (data: { projectName: string; projectDescription?: string }) => void;
  onBack: () => void;
  initialValues?: {
    projectName: string;
    projectDescription?: string;
  };
}

export function ProjectInfoStep({ 
  onNext, 
  onBack, 
  initialValues = { projectName: '', projectDescription: '' } 
}: ProjectInfoStepProps) {
  const [projectName, setProjectName] = useState(initialValues.projectName);
  const [projectDescription, setProjectDescription] = useState(initialValues.projectDescription || '');
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      setError("Project name is required");
      return;
    }
    
    onNext({ 
      projectName, 
      projectDescription: projectDescription.trim() || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 opacity-0 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Create your first project</h2>
        <p className="text-muted-foreground">
          Let's set up your first project in Loop. You can add prototypes to it later.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="projectName">Project Name</Label>
          <Input
            id="projectName"
            value={projectName}
            onChange={(e) => {
              setProjectName(e.target.value);
              setError("");
            }}
            placeholder="My Awesome Project"
            className={error ? "border-red-500" : ""}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="projectDescription">Project Description (Optional)</Label>
          <Textarea
            id="projectDescription"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="A brief description of your project..."
            rows={3}
          />
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
