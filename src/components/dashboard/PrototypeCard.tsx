
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { Code, FileCode, FileArchive, MessageSquare, ExternalLink, Clock, CheckCircle, AlertCircle } from "lucide-react";

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
  previewUrl
}: PrototypeCardProps) {
  const navigate = useNavigate();

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

  return (
    <Card 
      className="overflow-hidden transition-all hover:shadow-md cursor-pointer group"
      onClick={handleCardClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={thumbnailUrl} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          {updatedAt}
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
