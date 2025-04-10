
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { ArrowLeft, Share2, Download, Code, Monitor, Pen } from "lucide-react";
import { Sandpack } from "@codesandbox/sandpack-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Prototype } from "@/types/prototype";

const PrototypeView = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [prototype, setPrototype] = useState<Prototype | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("preview");

  useEffect(() => {
    const fetchPrototype = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('prototypes')
          .select('*')
          .eq('id', id)
          .single() as any;
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (!data) {
          throw new Error("Prototype not found");
        }
        
        setPrototype(data as Prototype);
      } catch (err: any) {
        console.error("Error fetching prototype:", err);
        setError(err.message || "Failed to load prototype");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrototype();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col w-full">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  if (error || !prototype) {
    return (
      <div className="min-h-screen flex flex-col w-full">
        <Header />
        <main className="flex-1 p-6">
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p className="text-muted-foreground mb-8">{error || "Prototype not found"}</p>
            <Button onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const sandpackFiles = Object.entries(prototype?.files || {}).reduce(
    (acc, [path, content]) => {
      const sandpackPath = path.startsWith('/') ? path.substring(1) : path;
      return {
        ...acc,
        [sandpackPath]: { code: content as string },
      };
    },
    {}
  );

  // Check if sandpackFiles is empty and provide a fallback
  const hasSandpackFiles = Object.keys(sandpackFiles).length > 0;
  
  if (!hasSandpackFiles) {
    console.warn("No files found in prototype for preview");
  }

  // Get entry file - prefer index.html or index.js
  const entryFile = 
    Object.keys(sandpackFiles).find(file => file === "index.html") ||
    Object.keys(sandpackFiles).find(file => file === "index.js") ||
    Object.keys(sandpackFiles)[0] ||
    "index.js";

  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      <div className="bg-muted/30 border-b">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{prototype?.name}</h1>
              <p className="text-sm text-muted-foreground">
                {prototype && new Date(prototype.created_at).toLocaleDateString()} • {prototype?.tech_stack}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-1" /> Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>
          </div>
        </div>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="container mt-4"
      >
        <TabsList>
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

        <TabsContent value="preview" className="mt-4">
          <div className="h-[calc(100vh-12rem)]">
            {hasSandpackFiles ? (
              <Sandpack
                template={prototype?.tech_stack as "react" | "vanilla"}
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
              <div className="h-full flex items-center justify-center bg-muted/10 border rounded-md">
                <div className="text-center p-6">
                  <p className="text-muted-foreground mb-2">No preview available</p>
                  <p className="text-sm text-muted-foreground">The prototype does not contain any files to preview.</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="code" className="mt-4">
          <div className="h-[calc(100vh-12rem)]">
            {hasSandpackFiles ? (
              <Sandpack
                template={prototype?.tech_stack as "react" | "vanilla"}
                files={sandpackFiles}
                options={{
                  showNavigator: true,
                  showTabs: true,
                  showLineNumbers: true,
                  showInlineErrors: true,
                  editorHeight: '100%',
                  editorWidthPercentage: 60
                }}
                customSetup={{
                  entry: entryFile
                }}
                theme="light"
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-muted/10 border rounded-md">
                <div className="text-center p-6">
                  <p className="text-muted-foreground mb-2">No code available</p>
                  <p className="text-sm text-muted-foreground">The prototype does not contain any code files.</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="design" className="mt-4">
          <div className="h-[calc(100vh-12rem)] flex items-center justify-center bg-muted/10 border rounded-md">
            <div className="text-center p-6">
              <p className="text-muted-foreground mb-2">Design view coming soon</p>
              <p className="text-sm text-muted-foreground">The design view is not yet available for this prototype.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PrototypeView;
