import { useState, useRef } from "react";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft,
  Monitor, 
  Smartphone, 
  Tablet, 
  ExternalLink,
  Eye,
  EyeOff
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FeedbackMarker } from "./FeedbackMarker";
import { CommentThread } from "./CommentThread";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Download, Code, MessageSquare, Plus, Share2, RefreshCw } from "lucide-react";

interface PrototypeViewerProps {
  id: string;
}

export function PrototypeViewer({ id }: PrototypeViewerProps) {
  const navigate = useNavigate();
  const [activeDevice, setActiveDevice] = useState("desktop");
  const [feedbackMode, setFeedbackMode] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("preview");
  const [controlsVisible, setControlsVisible] = useState(true);
  
  const controlsRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const commentThreadRef = useRef<HTMLDivElement>(null);
  
  const prototype = {
    id,
    previewUrl: "https://placehold.co/1200x900/3B82F6/FFFFFF?text=Interactive+Prototype",
    figmaUrl: "https://figma.com/example",
    codeUrl: "https://github.com/example/repo",
    comments: [
      {
        id: "c1",
        x: 25,
        y: 30,
        author: {
          name: "Maria Rodriguez",
          avatarUrl: "https://i.pravatar.cc/150?img=6"
        },
        content: "The chart colors might be difficult for colorblind users. Can we adjust the palette?",
        createdAt: "1 day ago",
        replies: []
      }
    ]
  };

  const handleDeviceChange = (device: string) => {
    setActiveDevice(device);
  };

  const toggleFeedbackMode = () => {
    setFeedbackMode(!feedbackMode);
    setSelectedCommentId(null);
  };

  const handleCommentSelect = (commentId: string) => {
    setSelectedCommentId(commentId === selectedCommentId ? null : commentId);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleBack = () => {
    navigate('/');
  };

  const toggleControlsVisibility = () => {
    setControlsVisible(!controlsVisible);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'preview':
        return (
          <iframe 
            src={prototype.previewUrl}
            className="preview-frame"
            title="Preview"
          />
        );
      case 'code':
        return (
          <div className="bg-loop-gray-800 text-white p-4 rounded-md overflow-auto h-full">
            <pre className="text-sm">
              <code>{`// Example code content`}</code>
            </pre>
          </div>
        );
      case 'design':
        return (
          <iframe 
            src={prototype.figmaUrl}
            className="preview-frame"
            title="Figma Design"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <div 
        className={`${controlsVisible ? '' : 'opacity-0 pointer-events-none'} preview-controls transition-opacity duration-300`}
        ref={controlsRef}
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex items-center">
            <TabsList className="h-9">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
            </TabsList>
          </Tabs>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-2 bg-muted/20 rounded-md p-1">
            <Button 
              variant={activeDevice === "desktop" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => handleDeviceChange("desktop")}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button 
              variant={activeDevice === "tablet" ? "secondary" : "ghost"}
              size="sm" 
              onClick={() => handleDeviceChange("tablet")}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button 
              variant={activeDevice === "mobile" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleDeviceChange("mobile")}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-2">
            <Switch
              checked={feedbackMode}
              onCheckedChange={toggleFeedbackMode}
              id="feedback-mode"
            />
            <Label htmlFor="feedback-mode" className="text-sm">Feedback</Label>
          </div>

          <div className="flex-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleControlsVisibility}
          >
            {controlsVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex-1 relative">
        {renderTabContent()}
        
        {feedbackMode && activeTab === 'preview' && (
          <>
            {prototype.comments.map((comment) => (
              <FeedbackMarker
                key={comment.id}
                id={comment.id}
                x={comment.x}
                y={comment.y}
                count={comment.replies.length + 1}
                isSelected={selectedCommentId === comment.id}
                onClick={() => handleCommentSelect(comment.id)}
              />
            ))}
          </>
        )}

        {selectedCommentId && (
          <div className="absolute bottom-4 right-4" ref={commentThreadRef}>
            <CommentThread 
              comment={prototype.comments.find(c => c.id === selectedCommentId)!}
              onClose={() => setSelectedCommentId(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
