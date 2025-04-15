
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
  };
  
  const getDeploymentStatus = () => {
    if (!safePrototype.deployment_status) return null;
    
    switch (safePrototype.deployment_status) {
      case "pending":
        return (
          <div className="flex items-center text-sm text-amber-500">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            <span>Processing</span>
          </div>
        );
      case "deployed":
        return (
          <div className="flex items-center text-sm text-green-500">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></div>
            <span>Live</span>
          </div>
        );
      case "failed":
        return (
          <div className="flex items-center text-sm text-red-500">
            <div className="h-2 w-2 rounded-full bg-red-500 mr-1.5"></div>
            <span>Failed</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getPreviewImage = () => {
    // Priority order for preview images:
    // 1. Figma preview URL
    // 2. Deployment URL 
    // 3. Tech stack icon (fallback)
    
    if (previewError) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-muted/30">
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
            <div className="absolute inset-0 flex items-center justify-center">
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
    
    // For deployment URL - use iframe
    if (safePrototype.deployment_url && !previewError) {
      return (
        <>
          {!previewLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
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
    
    // Fallback based on tech stack
    return (
      <div className="flex flex-col items-center justify-center h-full bg-muted/30">
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
      <Card className={`h-full hover:shadow-md transition-shadow overflow-hidden ${className}`}>
        <div className="w-full h-40 relative overflow-hidden bg-muted">
          {getPreviewImage()}
          
          {safePrototype.figma_link && (
            <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded p-1.5">
              <Figma className="h-4 w-4 text-blue-500" />
            </div>
          )}
        </div>
        
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="line-clamp-1 text-base">{safePrototype.name}</CardTitle>
            {getDeploymentStatus()}
          </div>
          {safePrototype.description && (
            <CardDescription className="line-clamp-2 text-xs">
              {safePrototype.description}
            </CardDescription>
          )}
        </CardHeader>
        
        <CardFooter className="pt-0 text-xs text-muted-foreground flex items-center">
          <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">{formattedDate}</span>
        </CardFooter>
      </Card>
    </Link>
  );
}
