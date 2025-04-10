import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PrototypeUploader } from "@/components/prototype/PrototypeUploader";
import { Prototype } from "@/types/prototype";
import { ArrowLeft } from "lucide-react";

const PrototypeUpload = () => {
  const navigate = useNavigate();
  const [uploadedPrototype, setUploadedPrototype] = useState<Prototype | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get the current user ID on component mount
  useState(() => {
    const fetchUserId = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      }
    };
    
    fetchUserId();
  });

  const handleUploadComplete = (prototype: Prototype) => {
    setUploadedPrototype(prototype);
    // Navigate to the prototype view after a short delay
    setTimeout(() => {
      navigate(`/prototypes/${prototype.id}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Upload Prototype</CardTitle>
              <CardDescription>
                Upload an HTML file or ZIP package containing your prototype.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userId ? (
                <PrototypeUploader 
                  userId={userId} 
                  onUploadComplete={handleUploadComplete}
                />
              ) : (
                <div className="text-center p-6">
                  <p className="text-muted-foreground">
                    Please sign in to upload prototypes.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {uploadedPrototype && (
            <div className="mt-6 bg-primary/10 rounded-lg p-4">
              <p className="font-medium">
                Success! Your prototype has been uploaded and is being processed.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                You will be redirected to the prototype view shortly...
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PrototypeUpload;
