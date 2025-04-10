import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { ArrowLeft, Share2, Download } from "lucide-react";
import { Sandpack } from "@codesandbox/sandpack-react";

interface Prototype {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  tech_stack: string;
  files: Record<string, string>;
}

const PrototypeView = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [prototype, setPrototype] = useState<Prototype | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <main className="flex-1 flex flex-col">
        <div className="flex-1 h-[calc(100vh-10rem)]">
          <Sandpack
            template={prototype?.tech_stack as "react" | "vanilla"}
            files={sandpackFiles}
            options={{
              showNavigator: true,
              showTabs: true,
              showLineNumbers: true,
              showInlineErrors: true,
              editorHeight: '100%',
              editorWidthPercentage: 40
            }}
            theme="light"
          />
        </div>
      </main>
    </div>
  );
};

export default PrototypeView;
