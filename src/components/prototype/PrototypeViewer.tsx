
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
  EyeOff,
  Code,
  Pen
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FeedbackMarker } from "./FeedbackMarker";
import { CommentThread } from "./CommentThread";
import { useNavigate } from "react-router-dom";
import { Share2, Download } from "lucide-react";
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
  const sandpackFiles = Object.entries(prototype.files || {}).reduce(
    (acc, [path, content]) => {
      const sandpackPath = path.startsWith('/') ? path.substring(1) : path;
      return {
        ...acc,
        [sandpackPath]: { code: content as string },
      };
    },
    {}
  );

  // Check if sandpackFiles is empty
  const hasSandpackFiles = Object.keys(sandpackFiles).length > 0;

  // Get entry file - prefer index.html or index.js
  const entryFile = 
    Object.keys(sandpackFiles).find(file => file === "index.html") ||
    Object.keys(sandpackFiles).find(file => file === "index.js") ||
    Object.keys(sandpackFiles)[0] ||
    "index.js";

  // Error display component for preview issues
  const ErrorDisplay = () => (
    <div className="w-full h-full p-4 bg-white overflow-auto">
      <h2 className="text-xl font-semibold mb-4 text-red-500">Preview Error</h2>
      <p className="text-muted-foreground mb-4">
        There was an error displaying the preview. This may be due to incompatible code or missing dependencies.
      </p>
      <div className="mt-4">
        <h3 className="text-md font-medium mb-2">Troubleshooting:</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Check for syntax errors in your code</li>
          <li>Ensure all required dependencies are available</li>
          <li>View the code tab to examine and fix issues</li>
        </ul>
      </div>
    </div>
  );

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
              <TabsTrigger value="preview">
                <Monitor className="h-4 w-4 mr-2" /> Preview
              </TabsTrigger>
              <TabsTrigger value="code">
                <Code className="h-4 w-4 mr-2" /> Code
              </TabsTrigger>
              <TabsTrigger value="design">
                <Pen className="h-4 w-4 mr-2" /> Design
              </TabsTrigger>
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
        {activeTab === 'preview' && (
          <div className="w-full h-full" ref={previewRef}>
            {hasSandpackFiles ? (
              <Sandpack
                template={prototype.tech_stack as "react" | "vanilla"}
                files={sandpackFiles}
                options={{
                  showNavigator: false,
                  showTabs: false,
                  showLineNumbers: false,
                  showInlineErrors: true,
                  editorHeight: '0',
                  editorWidthPercentage: 0,
                  visibleFiles: [],
                  recompileMode: "immediate",
                  recompileDelay: 300,
                  autorun: true,
                  classes: {
                    'sp-preview': 'preview-only-mode',
                    'sp-layout': 'preview-only-layout',
                    'sp-stack': 'preview-only-stack',
                    'sp-wrapper': 'preview-only-wrapper',
                  }
                }}
                customSetup={{
                  entry: entryFile,
                  dependencies: {
                    "react": "^18.0.0",
                    "react-dom": "^18.0.0",
                  }
                }}
                theme="light"
              />
            ) : (
              <ErrorDisplay />
            )}
          </div>
        )}
        
        {activeTab === 'code' && (
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
                editorWidthPercentage: 60,
              }}
              customSetup={{
                entry: entryFile
              }}
              theme="light"
            />
          </div>
        )}
        
        {activeTab === 'design' && (
          <div className="w-full h-full">
            <iframe 
              src={prototype.figmaUrl || "https://placehold.co/1200x900/EC4899/FFFFFF?text=Figma+Design"}
              className="w-full h-full border-none"
              title="Figma Design"
            />
          </div>
        )}
        
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
