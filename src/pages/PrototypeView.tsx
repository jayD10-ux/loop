import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { PrototypeViewer } from "@/components/prototype/PrototypeViewer";

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
        
        const { data, error } = await (supabase
          .from('prototypes') as any)
          .select('*')
          .eq('id', id)
          .single();
        
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
      <div className="bg-muted/30 border-b">
        <div className="container py-4 flex items-center">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-semibold">{prototype.name}</h1>
              <p className="text-sm text-muted-foreground">
                {new Date(prototype.created_at).toLocaleDateString()} • {prototype.tech_stack}
              </p>
            </div>
          </div>
        </div>
      </div>
      <main className="flex-1 flex flex-col">
        <PrototypeViewer 
          prototype={prototype} 
          onBack={() => navigate('/dashboard')}
        />
      </main>
    </div>
  );
};

export default PrototypeView;
