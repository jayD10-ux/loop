import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Share2, Code, Figma, Copy, Link2, Copy as CopyIcon } from "lucide-react";
import { PrototypeViewer } from "@/components/prototype/PrototypeViewer";
import { CommentThread } from "@/components/prototype/CommentThread";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Prototype } from "@/types/prototype";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Mock data for community prototype - would come from API in production
const MOCK_COMMUNITY_PROTOTYPE = {
  id: "c1",
  name: "Task Management Dashboard",
  description: "A sleek task management UI with drag-and-drop functionality and progress tracking. This prototype demonstrates a modern approach to productivity tools with a clean design system.",
  thumbnailUrl: "https://placehold.co/600x400/3B82F6/FFFFFF?text=Task+Dashboard",
  created_at: "2025-04-12T08:30:00",
  updated_at: "2025-04-12T08:30:00",
  viewCount: 238,
  commentCount: 15,
  files: {
    "index.html": `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Dashboard</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Task Dashboard</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white p-4 rounded shadow">
        <h2 class="font-medium mb-2">To Do (3)</h2>
        <div class="space-y-2">
          <div class="bg-gray-50 p-3 rounded cursor-move">
            <h3 class="font-medium">Research competitors</h3>
            <p class="text-sm text-gray-500">Analyze top 5 competitors in the market</p>
          </div>
          <div class="bg-gray-50 p-3 rounded cursor-move">
            <h3 class="font-medium">Create wireframes</h3>
            <p class="text-sm text-gray-500">Design initial wireframes for mobile app</p>
          </div>
          <div class="bg-gray-50 p-3 rounded cursor-move">
            <h3 class="font-medium">Team meeting</h3>
            <p class="text-sm text-gray-500">Weekly sync with product team</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-4 rounded shadow">
        <h2 class="font-medium mb-2">In Progress (2)</h2>
        <div class="space-y-2">
          <div class="bg-blue-50 p-3 rounded cursor-move border-l-4 border-blue-500">
            <h3 class="font-medium">User interviews</h3>
            <p class="text-sm text-gray-500">Conduct interviews with 5 potential users</p>
          </div>
          <div class="bg-blue-50 p-3 rounded cursor-move border-l-4 border-blue-500">
            <h3 class="font-medium">Design system</h3>
            <p class="text-sm text-gray-500">Create color palette and component library</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-4 rounded shadow">
        <h2 class="font-medium mb-2">Completed (4)</h2>
        <div class="space-y-2">
          <div class="bg-green-50 p-3 rounded cursor-move opacity-75">
            <h3 class="font-medium line-through">Project kickoff</h3>
            <p class="text-sm text-gray-500">Initial project planning meeting</p>
          </div>
          <div class="bg-green-50 p-3 rounded cursor-move opacity-75">
            <h3 class="font-medium line-through">Competitive analysis</h3>
            <p class="text-sm text-gray-500">Research market trends and competitors</p>
          </div>
          <div class="bg-green-50 p-3 rounded cursor-move opacity-75">
            <h3 class="font-medium line-through">User personas</h3>
            <p class="text-sm text-gray-500">Define target audience profiles</p>
          </div>
          <div class="bg-green-50 p-3 rounded cursor-move opacity-75">
            <h3 class="font-medium line-through">Feature prioritization</h3>
            <p class="text-sm text-gray-500">Identify MVP features and roadmap</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
    `,
  },
  tech_stack: "html",
  created_by: "u1",
  tags: ["Dashboard", "UI/UX", "React"],
  creator: {
    id: "u1",
    name: "Alex Chen",
    avatarUrl: "https://i.pravatar.cc/150?img=12",
    bio: "UI/UX Designer with 5+ years of experience. Focused on creating intuitive and beautiful interfaces that solve real problems."
  },
  deployment_status: "deployed" as const,
  deployment_url: "https://example.com/preview/task-dashboard",
  figma_link: "https://www.figma.com/file/example/task-dashboard"
};

// Mock comments for the prototype
const MOCK_COMMENTS = [
  {
    id: "comment1",
    x: 25,
    y: 30,
    author: {
      name: "Maria Rodriguez",
      avatarUrl: "https://i.pravatar.cc/150?img=6"
    },
    content: "The card layout looks great, but maybe we could add some subtle hover effects to make it more interactive?",
    createdAt: "1 day ago",
    replies: [
      {
        id: "reply1",
        author: {
          name: "Alex Chen",
          avatarUrl: "https://i.pravatar.cc/150?img=12"
        },
        content: "Great idea! I'll implement that in the next iteration.",
        createdAt: "20 hours ago"
      }
    ]
  },
  {
    id: "comment2",
    x: 70,
    y: 50,
    author: {
      name: "James Wilson",
      avatarUrl: "https://i.pravatar.cc/150?img=4"
    },
    content: "Consider making the completed tasks more visually distinct. Maybe use a different background color?",
    createdAt: "2 days ago",
    replies: []
  }
];

interface CommunityPrototype extends Prototype {
  viewCount: number;
  commentCount: number;
  thumbnailUrl?: string;
  tags: string[];
  creator: {
    id: string;
    name: string;
    avatarUrl: string;
    bio: string;
  };
}

export function CommunityPrototypeView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prototype, setPrototype] = useState<CommunityPrototype | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("preview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch from Supabase
    setLoading(true);
    
    // Simulate API call to get prototype
    setTimeout(() => {
      setPrototype(MOCK_COMMUNITY_PROTOTYPE as unknown as CommunityPrototype);
      setComments(MOCK_COMMENTS);
      setLoading(false);
    }, 800);
    
    // Track view (in real app)
    // const trackView = async () => {
    //   await supabase.from('prototype_views').insert({ prototype_id: id });
    // };
    // trackView();
  }, [id]);

  const handleBack = () => {
    navigate('/community');
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Prototype link copied to clipboard"
    });
  };

  const handleCopyEmbed = () => {
    // Generate embed code
    const embedCode = `<iframe src="${window.location.origin}/embed/prototype/${id}" width="100%" height="600" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Embed code copied",
      description: "Embed code copied to clipboard"
    });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex">
          <div className="flex-1 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="h-[80%] w-[80%]" />
            </div>
          </div>
          <div className="w-80 p-6 border-l h-[calc(100vh-64px)] overflow-auto">
            <Skeleton className="h-16 w-16 rounded-full mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-5/6 mb-4" />
            <Separator className="my-4" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4 mb-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!prototype) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Prototype not found</h2>
            <p className="text-muted-foreground mb-8">The prototype you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/community')}>
              Back to Community
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        {/* Main Content */}
        <div className={`flex-1 relative ${!sidebarOpen ? 'w-full' : ''}`}>
          {/* Top Bar with Back button, Tabs and Share */}
          <div className="h-12 border-b flex items-center justify-between px-4 bg-background z-10">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                ← Back
              </Button>
              
              <Tabs value={activeTab} onValueChange={handleTabChange} className="relative top-px">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="code">Code</TabsTrigger>
                  {prototype.figma_link && (
                    <TabsTrigger value="design">Design</TabsTrigger>
                  )}
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Toggle Sidebar Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleSidebar}
                className="hidden sm:flex"
              >
                {sidebarOpen ? "Hide Details" : "Show Details"}
              </Button>
              
              {/* Share Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleCopyLink}>
                    <Link2 className="h-4 w-4 mr-2" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyEmbed}>
                    <CopyIcon className="h-4 w-4 mr-2" />
                    Copy Embed Code
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Prototype Viewer */}
          <div className="absolute inset-0 top-12">
            <PrototypeViewer 
              prototype={prototype as Prototype} 
              // In the real implementation, we'd pass the comments through properly
              // and handle their display and creation
            />
          </div>
        </div>
        
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 border-l h-[calc(100vh-64px)] overflow-auto bg-background">
            <div className="p-6">
              {/* Creator Info */}
              <div className="flex items-start gap-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={prototype.creator.avatarUrl} alt={prototype.creator.name} />
                  <AvatarFallback>{prototype.creator.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{prototype.creator.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {prototype.creator.bio}
                  </p>
                </div>
              </div>
              
              {/* Prototype Info */}
              <h2 className="text-xl font-bold mb-2">{prototype.name}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {prototype.description}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {prototype.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Views</p>
                  <p className="font-medium">{prototype.viewCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Comments</p>
                  <p className="font-medium">{prototype.commentCount}</p>
                </div>
              </div>
              
              {/* External Links */}
              {prototype.figma_link && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Figma Design</h4>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => window.open(prototype.figma_link, '_blank')}>
                    <Figma className="h-4 w-4 mr-2" />
                    View Figma File
                  </Button>
                </div>
              )}
              
              {/* Comments Section */}
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Comments</h4>
                {comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map(comment => (
                      <div key={comment.id} className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
                            <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{comment.author.name}</p>
                            <p className="text-xs text-muted-foreground">{comment.createdAt}</p>
                          </div>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                        
                        {comment.replies.length > 0 && (
                          <div className="mt-3 pl-4 border-l-2 border-muted-foreground/20 space-y-3">
                            {comment.replies.map(reply => (
                              <div key={reply.id} className="mt-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage src={reply.author.avatarUrl} alt={reply.author.name} />
                                    <AvatarFallback>{reply.author.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-xs font-medium">{reply.author.name}</p>
                                    <p className="text-xs text-muted-foreground">{reply.createdAt}</p>
                                  </div>
                                </div>
                                <p className="text-xs">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No comments yet. Add a comment by clicking on the prototype.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CommunityPrototypeView;
