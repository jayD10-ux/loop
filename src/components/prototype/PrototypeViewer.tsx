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
  Eye,
  EyeOff,
  Code,
  Pen,
  Share2, 
  Download
} from "lucide-react";
import { FeedbackMarker } from "./FeedbackMarker";
import { CommentThread } from "./CommentThread";
import { useNavigate } from "react-router-dom";
import { Sandpack } from "@codesandbox/sandpack-react";
import { PreviewWindow } from "./PreviewWindow";
import { DevicePreviewControls } from "./DevicePreviewControls";
import { cn } from "@/lib/utils";

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
    previewUrl?: string;
    figma_link?: string | null;
    figma_file_key?: string | null;
    figma_file_name?: string | null;
    figma_preview_url?: string | null;
    deployment_status?: 'pending' | 'deployed' | 'failed';
    deployment_url?: string;
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

  const hasSandpackFiles = Object.keys(sandpackFiles).length > 0;

  const entryFile = 
    Object.keys(sandpackFiles).find(file => file === "index.html") ||
    Object.keys(sandpackFiles).find(file => file.endsWith(".html")) ||
    Object.keys(sandpackFiles).find(file => file === "index.js") ||
    Object.keys(sandpackFiles)[0] ||
    "index.html";

  const getDevicePreviewClass = () => {
    switch (activeDevice) {
      case "mobile":
        return "max-w-[375px] mx-auto h-full border border-gray-200 rounded-lg overflow-hidden shadow-sm";
      case "tablet":
        return "max-w-[768px] mx-auto h-full border border-gray-200 rounded-lg overflow-hidden shadow-sm";
      default:
        return "w-full h-full";
    }
  };

  const figmaUrl = prototype.figma_link || null;

  return (
    <div className="h-screen flex flex-col bg-background">
      <div 
        className={cn(
          "preview-controls transition-opacity duration-300 p-2 bg-white border-b z-10",
          controlsVisible ? "" : "opacity-0 pointer-events-none"
        )}
        ref={controlsRef}
      >
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1">
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

          {activeTab === "preview" && (
            <DevicePreviewControls 
              activeDevice={activeDevice}
              onDeviceChange={handleDeviceChange}
            />
          )}

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

      <div className="flex-1 relative">
        {activeTab === 'preview' && (
          <div className="w-full h-full absolute inset-0 m-0 p-4 bg-gray-50 overflow-auto" ref={previewRef}>
            <div className={getDevicePreviewClass()}>
              {prototype.deployment_url || prototype.deployment_status ? (
                <PreviewWindow
                  prototypeId={prototype.id}
                  deploymentStatus={prototype.deployment_status}
                  deploymentUrl={prototype.deployment_url}
                  files={prototype.files}
                />
              ) : hasSandpackFiles ? (
                <Sandpack
                  template="vanilla"
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
                      'sp-preview': 'preview-only-mode w-full h-full m-0 p-0',
                      'sp-layout': 'preview-only-layout w-full h-full m-0 p-0',
                      'sp-stack': 'preview-only-stack w-full h-full m-0 p-0',
                      'sp-wrapper': 'preview-only-wrapper w-full h-full m-0 p-0',
                      'sp-preview-container': 'w-full h-full border-none m-0 p-0',
                      'sp-preview-iframe': 'w-full h-full border-none m-0 p-0'
                    }
                  }}
                  customSetup={{
                    entry: entryFile,
                    dependencies: {}
                  }}
                  theme="light"
                />
              ) : (
                <div className="w-full h-full p-4 bg-white overflow-auto">
                  <h2 className="text-xl font-semibold mb-4 text-red-500">Preview Error</h2>
                  <p className="text-muted-foreground mb-4">
                    There was an error displaying the preview. This may be due to incompatible code or missing dependencies.
                  </p>
                  <div className="mt-4">
                    <h3 className="text-md font-medium mb-2">Troubleshooting:</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Check for syntax errors in your code</li>
                      <li>Ensure all required files are included (HTML, CSS, JS)</li>
                      <li>View the code tab to examine and fix issues</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'code' && (
          <div className="h-full w-full">
            <Sandpack
              template="vanilla"
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
                entry: entryFile,
                dependencies: {}
              }}
              theme="light"
            />
          </div>
        )}
        
        {activeTab === 'design' && (
          <div className="w-full h-full absolute inset-0 m-0 p-0">
            {prototype.figma_link ? (
              <iframe 
                src={prototype.figma_link}
                className="w-full h-full border-none m-0 p-0"
                title="Figma Design"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full w-full bg-gray-50 p-6">
                <div className="bg-white rounded-lg shadow-sm p-6 max-w-md w-full text-center">
                  <Figma className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-3">No Figma Design Connected</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    This prototype doesn't have a Figma design connected to it.
                  </p>
                </div>
              </div>
            )}
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
