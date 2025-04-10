import { useState, useRef, useEffect } from "react";
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

  useEffect(() => {
    console.log("%c===== PROTOTYPE VIEWER DEBUG =====", "background: #222; color: #bada55; font-size: 16px;");
    console.log("Prototype tech_stack:", prototype.tech_stack);
    console.log("Prototype files structure:", prototype.files);
    
    // Detailed file inspection
    if (prototype.files) {
      console.log("Number of files:", Object.keys(prototype.files).length);
      Object.entries(prototype.files).forEach(([filename, fileContent]) => {
        console.log(`File: ${filename}`, {
          type: typeof fileContent,
          isString: typeof fileContent === 'string',
          isObject: typeof fileContent === 'object' && fileContent !== null,
          hasCodeProp: typeof fileContent === 'object' && fileContent !== null && 
                       fileContent && 'code' in fileContent,
          preview: typeof fileContent === 'string' 
                    ? fileContent.substring(0, 100) + '...' 
                    : '[Not a string]'
        });
      });
    }
    
    // Sandbox file preparation debug
    console.log("Sandpack files after transformation:", sandpackFiles);
    console.log("Sandpack files keys:", Object.keys(sandpackFiles));
    console.log("%c================================", "background: #222; color: #bada55; font-size: 16px;");
  }, [prototype, sandpackFiles]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'preview':
        // Enhanced debugging for preview rendering
        console.log("%c===== PREVIEW TAB RENDERING =====", "background: #222; color: #bada55; font-size: 16px;");
        
        // Let's determine a proper entry point
        const availableFiles = Object.keys(sandpackFiles);
        console.log("Available files for entry point detection:", availableFiles);
        
        const entryPointDetection = {
          hasIndexHtml: availableFiles.includes("index.html"),
          hasIndexJs: availableFiles.includes("index.js"),
          hasSrcIndexJs: availableFiles.includes("src/index.js")
        };
        
        console.log("Entry point detection:", entryPointDetection);
        
        const detectedEntry = entryPointDetection.hasIndexHtml ? "index.html" : (
          entryPointDetection.hasIndexJs ? "index.js" : (
            entryPointDetection.hasSrcIndexJs ? "src/index.js" : availableFiles[0] || "index.js"
          )
        );
        
        console.log("Selected entry point:", detectedEntry);
        console.log("Template being used:", prototype.tech_stack);
        console.log("%c================================", "background: #222; color: #bada55; font-size: 16px;");
        
        // Create a component to display syntax errors with helpful guidance
        const ErrorDisplay = () => (
          <div className="w-full h-full p-4 bg-white overflow-auto">
            <h2 className="text-xl font-semibold mb-4 text-red-500">Prototype Preview Error</h2>
            <p className="text-muted-foreground mb-4">
              The prototype contains modern JavaScript syntax that can't be displayed directly.
            </p>
            <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
              <p className="font-medium text-red-800">Syntax Error: Optional chaining (?.) not supported</p>
              <p className="text-sm text-red-700 mt-2">This code uses newer JavaScript features that require a modern browser.</p>
            </div>
            <div className="mt-4">
              <h3 className="text-md font-medium mb-2">What to do:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Replace <code className="bg-gray-100 px-1 rounded">?.</code> with conditional checks (e.g., <code className="bg-gray-100 px-1 rounded">if (el) el.remove()</code>)</li>
                <li>Use older JavaScript syntax for compatibility</li>
              </ul>
            </div>
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="text-md font-medium mb-2 text-blue-800">Your code:</h3>
              <div className="bg-white p-3 rounded border border-gray-200 overflow-auto max-h-64">
                <pre className="text-sm">
                  {Object.entries(sandpackFiles).map(([name, content]) => {
                    const fileContent = typeof content === 'object' && content !== null && 'code' in content 
                      ? (content as {code: string}).code 
                      : String(content);
                    return `// ${name}\n${fileContent}\n\n`;
                  }).join('')}
                </pre>
              </div>
            </div>
          </div>
        );
        
        try {
          // For files with modern syntax, display the custom error component directly
          if (Object.values(prototype.files).some(content => 
              String(content).includes('?.') || 
              String(content).includes('??') ||
              String(content).includes('=>') ||
              String(content).includes('...') ||
              String(content).includes('const ') ||
              String(content).includes('let ')
            )) {
            console.log("Detected modern syntax, showing error display");
            return <ErrorDisplay />;
          }
          
          // Using properly configured Sandpack for preview
          return (
            <div className="w-full h-full sandpack-preview-container">
              <Sandpack
                template={prototype.tech_stack as "react" | "react-ts" | "vanilla" | "vanilla-ts" | "vue" | "angular" | "svelte" | "nextjs"}
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
                  bundlerURL: "https://sandpack-bundler-n8ck.fly.dev",
                  externalResources: [
                    // Add any external resources your prototypes might need
                    "https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css"
                  ],
                  classes: {
                    'sp-preview': 'preview-only-mode',
                    'sp-layout': 'preview-only-layout',
                    'sp-stack': 'preview-only-stack',
                    'sp-wrapper': 'preview-only-wrapper',
                  }
                }}
                customSetup={{
                  entry: detectedEntry,
                  dependencies: {
                    // React dependencies
                    "react": "^18.0.0",
                    "react-dom": "^18.0.0",
                    
                    // Modern JS support
                    "@babel/runtime": "^7.13.10",
                    "core-js": "^3.8.3",
                    
                    // Common libraries that might be used
                    "lodash": "^4.17.21",
                    "axios": "^0.21.1"
                  }
                }}
                theme="light"
              />
            </div>
          );
        } catch (error) {
          console.error("Error rendering Sandpack:", error);
          return <ErrorDisplay />;
        }
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
