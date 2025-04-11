
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DualUploadModal } from "@/components/prototype/DualUploadModal";
import { Prototype } from "@/types/prototype";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const AddPrototype = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(true);
  
  const handleClose = () => {
    setIsModalOpen(false);
    navigate('/dashboard');
  };
  
  const handleSuccess = (prototype: Prototype) => {
    navigate(`/prototype/${prototype.id}`);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Add New Prototype</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <Button 
                size="lg" 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-5 w-5" />
                Create Prototype
              </Button>
              <p className="text-sm text-muted-foreground mt-4 text-center max-w-md">
                Create a new prototype by uploading a ZIP file or connecting to an existing deployment URL.
                You can also connect it to a Figma design file.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <DualUploadModal
        open={isModalOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default AddPrototype;
