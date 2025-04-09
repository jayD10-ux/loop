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
import { Sandpack } from "@codesandbox/sandpack-react";

interface PrototypeViewerProps {
  prototype: {
    id: string;
    name: string;
    description: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
    tech_stack: string;
    files: Record<string, string>;
    previewUrl?: string; // Optional, fallback to placeholder
    figmaUrl?: string; // Optional, fallback to placeholder
  };
  onBack?: () => void; // Optional callback for back navigation
}

export function PrototypeViewer({ prototype, onBack }: PrototypeViewerProps) {
  const navigate = useNavigate();
  const [activeDevice, setActiveDevice] = useState("desktop");
  const [feedbackMode, setFeedbackMode] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("preview");
  const [controlsVisible, setControlsVisible] = useState(true);
  
  const controlsRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const commentThreadRef = useRef<HTMLDivElement>(null);
  
  // Mock comments data - in a real app, these would come from the database
  const comments = [
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
  ];

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
    if (onBack) {
      onBack();
    } else {
      navigate('/dashboard'); // Default fallback
    }
  };

  const toggleControlsVisibility = () => {
    setControlsVisible(!controlsVisible);
  };

  // Prepare Sandpack files from prototype
  const sandpackFiles = Object.entries(prototype.files).reduce(
    (acc, [path, content]) => {
      const sandpackPath = path.startsWith('/') ? path.substring(1) : path;
      return {
        ...acc,
        [sandpackPath]: { code: content as string },
      };
    },
    {}
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'preview':
        // For debugging, let's log the available files
        console.log("Available files:", Object.keys(sandpackFiles));
        
        // Let's determine a proper entry point or fallback to a simple HTML renderer
        const hasIndexHtml = sandpackFiles["index.html"] !== undefined;
        const hasIndexJs = sandpackFiles["index.js"] !== undefined || sandpackFiles["src/index.js"] !== undefined;
        
        if (!hasIndexHtml && !hasIndexJs) {
          // If no proper entry files, create a simple HTML display with file contents
          return (
            <div className="w-full h-full p-4 bg-white overflow-auto">
              <h2 className="text-xl font-semibold mb-4">Prototype Preview</h2>
              <p className="text-muted-foreground mb-4">Showing content of prototype files:</p>
              {Object.entries(sandpackFiles).map(([filename, fileContent]) => (
                <div key={filename} className="mb-6">
                  <h3 className="text-md font-medium mb-2">{filename}</h3>
                  <pre className="p-3 bg-gray-100 rounded overflow-auto text-sm">
                    {typeof fileContent === 'object' && fileContent !== null && 'code' in fileContent 
                      ? (fileContent as {code: string}).code 
                      : String(fileContent)}
                  </pre>
                </div>
              ))}
            </div>
          );
        }
        
        return (
          <div className="w-full h-full sandpack-preview-container">
            <Sandpack
              template={prototype.tech_stack as "react" | "vanilla"}
              files={sandpackFiles}
              options={{
                showNavigator: false,
                showTabs: false,
                showLineNumbers: false,
                showInlineErrors: true, // Show errors to help debug
                editorHeight: '0',
                editorWidthPercentage: 0,
                classes: {
                  'sp-preview': 'preview-only-mode',
                  'sp-layout': 'preview-only-layout',
                  'sp-stack': 'preview-only-stack',
                  'sp-wrapper': 'preview-only-wrapper',
                }
              }}
              customSetup={{
                entry: hasIndexHtml ? "index.html" : (
                  sandpackFiles["index.js"] ? "index.js" : "src/index.js"
                ),
                dependencies: {
                  // Add common dependencies that might be needed
                  "react": "^18.0.0",
                  "react-dom": "^18.0.0"
                }
              }}
              theme="light"
            />
          </div>
        );
      case 'code':
        return (
          <div className="h-full w-full">
            <Sandpack
              template={prototype.tech_stack as "react" | "vanilla"}
              files={sandpackFiles}
              options={{
                showNavigator: true,
                showTabs: true,
                showLineNumbers: true,
                showInlineErrors: true,
                editorHeight: '100%',
                editorWidthPercentage: 100, // Make editor take full width
              }}
              customSetup={{
                entry: Object.keys(sandpackFiles)[0] || "index.js"
              }}
              theme="dark"
            />
          </div>
        );
      case 'design':
        return (
          <div className="w-full h-full">
            <iframe 
              src={prototype.figmaUrl || "https://placehold.co/1200x900/EC4899/FFFFFF?text=Figma+Design"}
              className="w-full h-full border-none"
              title="Figma Design"
            />
          </div>
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

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {}}
              title="Share"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {}}
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleControlsVisibility}
              title={controlsVisible ? "Hide Controls" : "Show Controls"}
            >
              {controlsVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        {renderTabContent()}
        
        {feedbackMode && activeTab === 'preview' && (
          <>
            {comments.map((comment) => (
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
              comment={comments.find(c => c.id === selectedCommentId)!}
              onClose={() => setSelectedCommentId(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
