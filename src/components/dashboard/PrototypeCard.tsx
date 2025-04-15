import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { 
  FileArchive, 
  ExternalLink, 
  Code, 
  FileCode, 
  Figma,
  Clock,
  MessageSquareText,
  Loader2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Prototype } from "@/types/prototype";

interface PrototypeCardProps {
  prototype: Prototype;
  className?: string;
}

export function PrototypeCard({ prototype, className = "" }: PrototypeCardProps) {
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  
  // Pre-validation to prevent undefined errors
  if (!prototype || typeof prototype !== 'object') {
    console.error("PrototypeCard received invalid prototype:", prototype);
    return null;
  }

  // Ensure all required fields are present with fallbacks
  const safePrototype = {
    id: prototype.id || "unknown",
    name: prototype.name || "Untitled Prototype",
    description: prototype.description || null,
    tech_stack: prototype.tech_stack || "unknown",
    created_at: prototype.created_at || new Date().toISOString(),
    deployment_status: prototype.deployment_status || null,
    deployment_url: prototype.deployment_url || null,
    figma_link: prototype.figma_link || null,
    figma_preview_url: prototype.figma_preview_url || null,
    comments_count: prototype.comments_count || 24, // Default to 24 for demo if not available
  };
  
  const getPreviewImage = () => {
    // Priority order for preview images:
    // 1. Figma preview URL
    // 2. Deployment URL 
    // 3. Tech stack icon (fallback)
    
    if (previewError) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-muted/30 bg-[repeating-conic-gradient(#f0f0f0_0_90deg,#ffffff_0_180deg)_0_0/20px_20px]">
          <FileCode className="h-12 w-12 text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground">Preview not available</span>
        </div>
      );
    }

    // For Figma preview
    if (safePrototype.figma_preview_url && !previewError) {
      return (
        <>
          {!previewLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[repeating-conic-gradient(#f0f0f0_0_90deg,#ffffff_0_180deg)_0_0/20px_20px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
            </div>
          )}
          <img
            src={safePrototype.figma_preview_url}
            alt={safePrototype.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${previewLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setPreviewLoaded(true)}
            onError={() => setPreviewError(true)}
          />
        </>
      );
    }
    
    // For deployment URL - use iframe with checkered background before loading
    if (safePrototype.deployment_url && !previewError) {
      return (
        <>
          {!previewLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[repeating-conic-gradient(#f0f0f0_0_90deg,#ffffff_0_180deg)_0_0/20px_20px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
            </div>
          )}
          <iframe
            src={safePrototype.deployment_url}
            title={safePrototype.name}
            className={`w-full h-full border-0 transition-opacity duration-300 ${previewLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setPreviewLoaded(true)}
            onError={() => setPreviewError(true)}
            sandbox="allow-scripts allow-same-origin"
          />
        </>
      );
    }
    
    // Fallback based on tech stack - with checkered background
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[repeating-conic-gradient(#f0f0f0_0_90deg,#ffffff_0_180deg)_0_0/20px_20px]">
        {safePrototype.tech_stack === "react" ? (
          <Code className="h-12 w-12 text-sky-500 mb-2" />
        ) : safePrototype.tech_stack === "vanilla" ? (
          <FileCode className="h-12 w-12 text-amber-500 mb-2" />
        ) : safePrototype.tech_stack === "external-url" ? (
          <ExternalLink className="h-12 w-12 text-green-500 mb-2" />
        ) : safePrototype.tech_stack === "zip-package" ? (
          <FileArchive className="h-12 w-12 text-violet-500 mb-2" />
        ) : (
          <FileCode className="h-12 w-12 text-muted-foreground mb-2" />
        )}
        <span className="text-sm text-muted-foreground capitalize">
          {safePrototype.tech_stack?.replace('-', ' ') || "Unknown"}
        </span>
      </div>
    );
  };

  // Safely format the date with validation and fallback
  let formattedDate = "Recently";
  try {
    if (safePrototype.created_at) {
      formattedDate = formatDistanceToNow(new Date(safePrototype.created_at), { addSuffix: true });
    }
  } catch (error) {
    console.error("Error formatting date:", error, safePrototype.created_at);
  }

  return (
    <Link to={`/prototypes/${safePrototype.id}`}>
      <div className="h-full rounded-lg overflow-hidden border border-border bg-background shadow-sm hover:shadow-md transition-shadow">
        <div className="w-full aspect-square relative overflow-hidden">
          {getPreviewImage()}
        </div>
        
        <div className="p-3 flex items-center justify-between">
          <span className="font-medium text-sm truncate">{safePrototype.name}</span>
          <div className="flex items-center gap-2">
            <button className="p-1 text-muted-foreground hover:text-foreground rounded-full">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageSquareText size={16} />
              <span className="text-xs">{safePrototype.comments_count}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
