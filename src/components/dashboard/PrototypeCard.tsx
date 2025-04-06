
import { Link } from "react-router-dom";
import { Clock, MessageSquare, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PrototypeCardProps {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  updatedAt: string;
  commentCount: number;
  tags?: string[];
  isShared?: boolean;
  source?: 'figma' | 'github' | 'zip';
  sharedBy?: {
    name: string;
    avatarUrl?: string;
  };
}

export function PrototypeCard({
  id,
  title,
  description,
  thumbnailUrl,
  updatedAt,
  commentCount,
  tags = [],
  isShared = false,
  source,
  sharedBy,
}: PrototypeCardProps) {
  return (
    <Link to={`/prototype/${id}`}>
      <Card className="prototype-card overflow-hidden">
        <div className="aspect-video relative group">
          <img 
            src={thumbnailUrl} 
            alt={title} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
            <div className="flex items-center gap-2">
              {source === 'figma' && (
                <Badge variant="outline" className="bg-white/90 text-black">Figma</Badge>
              )}
              {source === 'github' && (
                <Badge variant="outline" className="bg-white/90 text-black">GitHub</Badge>
              )}
              {source === 'zip' && (
                <Badge variant="outline" className="bg-white/90 text-black">ZIP</Badge>
              )}
            </div>
            <ExternalLink className="text-white h-5 w-5" />
          </div>
        </div>
        <CardContent className="p-4">
          <div className="mb-2 flex justify-between items-start">
            <h3 className="font-semibold text-lg truncate">{title}</h3>
            {isShared && sharedBy && (
              <Avatar className="h-6 w-6">
                <AvatarImage src={sharedBy.avatarUrl} />
                <AvatarFallback>{sharedBy.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{description}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{updatedAt}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{commentCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
