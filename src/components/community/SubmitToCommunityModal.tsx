import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { X, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { Prototype } from "@/types/prototype";
import { supabase } from "@/integrations/supabase/client";

interface SubmitToCommunityModalProps {
  open: boolean;
  onClose: () => void;
  prototype?: Prototype;
}

// Common tags for prototypes
const COMMON_TAGS = [
  "React", "Vue", "Angular", "Svelte", "JavaScript", "HTML/CSS", 
  "Tailwind", "Material UI", "Bootstrap", "Animation", "Dashboard", 
  "E-commerce", "Form", "Mobile", "Responsive", "Dark Mode", "Landing Page",
  "UI Component", "Navigation", "Data Viz"
];

export function SubmitToCommunityModal({ open, onClose, prototype }: SubmitToCommunityModalProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

  // Initialize form with prototype data if available
  useEffect(() => {
    if (prototype) {
      setTitle(prototype.name || "");
      setDescription(prototype.description || "");
      
      // Suggest tags based on prototype tech stack
      if (prototype.tech_stack) {
        const techTags = suggestTagsFromTechStack(prototype.tech_stack);
        setSuggestedTags(techTags);
      }
    }
  }, [prototype]);

  const suggestTagsFromTechStack = (techStack: string) => {
    // Map tech stack to relevant tags
    const techStackMap: Record<string, string[]> = {
      'react': ['React', 'JavaScript'],
      'vanilla': ['JavaScript', 'HTML/CSS'],
      'vue': ['Vue', 'JavaScript'],
      'angular': ['Angular', 'TypeScript'],
      'svelte': ['Svelte', 'JavaScript'],
      'zip-package': ['HTML/CSS', 'JavaScript'],
      'external-url': []
    };
    
    return techStackMap[techStack] || [];
  };

  const handleAddTag = (tag: string) => {
    if (tags.includes(tag)) return;
    if (tags.length >= 8) {
      toast({
        title: "Tag limit reached",
        description: "You can add a maximum of 8 tags",
        variant: "destructive"
      });
      return;
    }
    
    setTags([...tags, tag]);
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTag.trim()) {
      e.preventDefault();
      handleAddTag(customTag.trim());
      setCustomTag("");
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your prototype",
        variant: "destructive"
      });
      return;
    }
    
    if (!agreed) {
      toast({
        title: "Agreement required",
        description: "Please confirm that you understand this prototype will be public",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, we would update the prototype in Supabase
      // and set its visibility to public
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Prototype published",
        description: "Your prototype has been published to the community"
      });
      
      onClose();
      navigate(`/community/prototype/${prototype?.id || 'new-id'}`);
    } catch (error) {
      console.error("Error publishing prototype:", error);
      toast({
        title: "Publishing failed",
        description: "There was an error publishing your prototype. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Publish to Community</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your prototype a descriptive title"
              disabled={isSubmitting}
            />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what your prototype demonstrates or features (optional)"
              className="resize-none h-24"
              disabled={isSubmitting}
            />
          </div>
          
          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <Badge 
                  key={tag} 
                  className="flex items-center gap-1 pl-2 pr-1 py-1"
                >
                  {tag}
                  <button 
                    onClick={() => handleRemoveTag(tag)} 
                    className="text-muted hover:text-foreground transition-colors rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              
              {tags.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No tags added yet. Add up to 8 tags to help others discover your prototype.
                </p>
              )}
            </div>
            
            <Input
              placeholder="Add a custom tag (press Enter)"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={handleAddCustomTag}
              disabled={isSubmitting || tags.length >= 8}
              className="mb-3"
            />
            
            {/* Suggested Tags */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Suggested Tags:</Label>
              <div className="flex flex-wrap gap-2">
                {/* Show tech-based tags first */}
                {suggestedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline" 
                    className={`cursor-pointer hover:bg-primary/10 ${tags.includes(tag) ? 'bg-primary/10' : ''}`}
                    onClick={() => !tags.includes(tag) && handleAddTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
                
                {/* Show common tags */}
                {COMMON_TAGS.filter(tag => !suggestedTags.includes(tag)).slice(0, 12).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline" 
                    className={`cursor-pointer hover:bg-primary/10 ${tags.includes(tag) ? 'bg-primary/10' : ''}`}
                    onClick={() => !tags.includes(tag) && handleAddTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          {/* Agreement Checkbox */}
          <div className="flex items-start space-x-2 pt-2">
            <Checkbox 
              id="agreement" 
              checked={agreed} 
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
              disabled={isSubmitting}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="agreement"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I understand this will be public
              </Label>
              <p className="text-sm text-muted-foreground">
                Your prototype will be visible to everyone in the Loop community
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="ghost" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !agreed || !title.trim()}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Publishing...
              </>
            ) : (
              "Publish to Community"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SubmitToCommunityModal;
