
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Download, Code, Monitor, Pen } from "lucide-react";
import { Sandpack } from "@codesandbox/sandpack-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Prototype } from "@/types/prototype";
import { PrototypeViewer } from "@/components/prototype/PrototypeViewer";

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
        
        // Ensure the data has the required properties with proper defaults
        const prototypeData: Prototype = {
          ...data,
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
          files: data.files || {},
          description: data.description || null,
          figma_link: data.figma_link || null,
          figma_file_key: data.figma_file_key || null,
          figma_file_name: data.figma_file_name || null,
          figma_preview_url: data.figma_preview_url || null
        };
        
        setPrototype(prototypeData);
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
        <main className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  if (error || !prototype) {
    return (
      <div className="min-h-screen flex flex-col w-full">
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

  return (
    <div className="min-h-screen flex flex-col w-full">
      <div className="flex-1 relative">
        <PrototypeViewer 
          prototype={prototype} 
          onBack={() => navigate('/dashboard')}
        />
      </div>
    </div>
  );
};

export default PrototypeView;
