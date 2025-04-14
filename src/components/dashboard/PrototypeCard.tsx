import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { Code, FileCode, FileArchive, MessageSquare, ExternalLink, Clock, CheckCircle, AlertCircle, Pencil, Calendar } from "lucide-react";
import { useState } from "react";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";

interface PrototypeCardProps {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  updatedAt: string;
  commentCount?: number;
  tags?: string[];
  source: "figma" | "github" | "zip" | "code";
  isShared?: boolean;
  sharedBy?: { name: string; avatarUrl: string };
  isTeam?: boolean;
  status?: 'pending' | 'deployed' | 'failed';
  previewUrl?: string;
  figmaPreviewUrl?: string;
}

export function PrototypeCard({
  id,
  title,
  description,
  thumbnailUrl,
  updatedAt,
  commentCount = 0,
  tags = [],
  source,
  isShared,
  sharedBy,
  isTeam,
  status,
  previewUrl,
  figmaPreviewUrl
}: PrototypeCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleCardClick = () => {
    navigate(`/prototype/${id}`);
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'deployed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Deployment in progress';
      case 'deployed':
        return 'Deployed successfully';
      case 'failed':
        return 'Deployment failed';
      default:
        return '';
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      if (isToday(date)) {
        return `Today at ${format(date, 'h:mm a')}`;
      } else if (isYesterday(date)) {
        return `Yesterday at ${format(date, 'h:mm a')}`;
      } else if (isThisWeek(date)) {
        return format(date, 'EEEE');
      } else {
        return format(date, 'MMM d, yyyy');
      }
    } catch (error) {
      return dateString;
    }
  };

  const getDisplayImage = () => {
    if (!imageError) {
      if (figmaPreviewUrl) {
        return figmaPreviewUrl;
      }
      if (previewUrl) {
        return `https://placehold.co/600x400/5B21B6/FFFFFF?text=Live+Preview`;
      }
    }
    
    if (source === "figma") {
      return "https://placehold.co/600x400/A259FF/FFFFFF?text=Figma+Design";
    }
    
    return `https://placehold.co/600x400/${getTechStackColor(tags[0] || "code")}/FFFFFF?text=${(tags[0] || "Code").charAt(0).toUpperCase() + (tags[0] || "Code").slice(1)}`;
  };

  return (
    <Card 
      className="overflow-hidden transition-all hover:shadow-md cursor-pointer group border-border"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={getDisplayImage()}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />
        <div className="absolute top-2 right-2 flex gap-2">
          {source === "figma" && (
            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
              <svg className="h-3 w-3 mr-1" viewBox="0 0 38 57" xmlns="http://www.w3.org/2000/svg">
                <path fill="#1ABCFE" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"></path>
                <path fill="#0ACF83" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z"></path>
                <path fill="#FF7262" d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z"></path>
                <path fill="#F24E1E" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"></path>
                <path fill="#A259FF" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"></path>
              </svg>
              Figma
            </Badge>
          )}
          {source === "code" && (
            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
              <Code className="h-3 w-3 mr-1" />
              Code
            </Badge>
          )}
          {isTeam && (
            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Team
            </Badge>
          )}
        </div>
        
        {isHovered && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/prototype/${id}/edit`);
                  }}>
                    <Pencil className="h-5 w-5 text-gray-700" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Edit</TooltipContent>
              </Tooltip>
              
              {previewUrl && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors" onClick={handlePreviewClick}>
                      <ExternalLink className="h-5 w-5 text-gray-700" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>View preview</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
          {status && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  {getStatusIcon()}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{getStatusText()}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-3 min-h-[2.5rem]">
          {description || "No description provided"}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="px-4 py-3 bg-muted/30 flex justify-between items-center text-xs text-muted-foreground">
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          {formatDate(updatedAt)}
        </div>
        <div className="flex items-center gap-3">
          {commentCount > 0 && (
            <div className="flex items-center">
              <MessageSquare className="h-3 w-3 mr-1" />
              {commentCount}
            </div>
          )}
          {previewUrl && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handlePreviewClick}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Open live preview</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

function getTechStackColor(techStack: string): string {
  switch (techStack?.toLowerCase()) {
    case 'react':
      return '61DAFB';
    case 'vanilla':
      return 'F0DB4F';
    case 'vue':
      return '42B883';
    case 'angular':
      return 'DD0031';
    case 'svelte':
      return 'FF3E00';
    case 'nextjs':
    case 'next.js':
      return '000000';
    default:
      return '6366F1';
  }
}
