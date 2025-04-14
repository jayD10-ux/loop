import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Prototype } from "@/types/prototype";
import { supabase } from "@/integrations/supabase/client";
import { SubmitToCommunityModal } from "@/components/community/SubmitToCommunityModal";

// Mock prototypes for the selection list
const MOCK_USER_PROTOTYPES = [
  {
    id: "1",
    name: "E-commerce Dashboard",
    description: "Redesigned e-commerce analytics dashboard with improved data visualization and user flow.",
    created_at: "2025-04-10T10:30:00",
    updated_at: "2025-04-12T15:20:00",
    tech_stack: "react",
    thumbnailUrl: "https://placehold.co/600x400/3B82F6/FFFFFF?text=E-commerce+Dashboard",
    files: {},
    created_by: "u1"
  },
  {
    id: "2",
    name: "Mobile App Onboarding",
    description: "Simplified onboarding flow for our mobile application with progress indicators and helpful tips.",
    created_at: "2025-04-05T14:15:00",
    updated_at: "2025-04-08T09:45:00",
    tech_stack: "react",
    thumbnailUrl: "https://placehold.co/600x400/8B5CF6/FFFFFF?text=Mobile+Onboarding",
    files: {},
    created_by: "u1"
  },
  {
    id: "3",
    name: "Product Detail Page",
    description: "Redesigned product page with improved image gallery, specs section, and related products.",
    created_at: "2025-03-28T11:00:00",
    updated_at: "2025-04-02T16:30:00",
    tech_stack: "vanilla",
    thumbnailUrl: "https://placehold.co/600x400/6366F1/FFFFFF?text=Product+Detail",
    files: {},
    created_by: "u1"
  }
];

// Extended Prototype type that includes thumbnailUrl
interface PrototypeWithThumbnail extends Prototype {
  thumbnailUrl?: string;
}

export function CommunitySubmit() {
  const navigate = useNavigate();
  const [userPrototypes, setUserPrototypes] = useState<PrototypeWithThumbnail[]>([]);
  const [selectedPrototype, setSelectedPrototype] = useState<PrototypeWithThumbnail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch the user's prototypes from Supabase
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setUserPrototypes(MOCK_USER_PROTOTYPES as PrototypeWithThumbnail[]);
      setLoading(false);
    }, 800);
  }, []);

  const handleSelectPrototype = (prototype: PrototypeWithThumbnail) => {
    setSelectedPrototype(prototype);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPrototype(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Submit to Community</h1>
          <p className="text-muted-foreground mb-8">
            Share your prototypes with the Loop community to get feedback and inspire others.
          </p>
          
          <Card>
            <CardHeader>
              <CardTitle>Select a prototype to publish</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border rounded-md flex gap-4 items-center">
                      <div className="w-16 h-16 bg-muted rounded" />
                      <div className="flex-1">
                        <div className="h-5 w-40 bg-muted rounded mb-2" />
                        <div className="h-4 w-full bg-muted rounded-sm" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {userPrototypes.length > 0 ? (
                    <div className="space-y-4">
                      {userPrototypes.map((prototype) => (
                        <div 
                          key={prototype.id}
                          className="p-4 border rounded-md flex gap-4 items-center hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => handleSelectPrototype(prototype)}
                        >
                          <div className="w-16 h-16 bg-muted rounded overflow-hidden">
                            <img 
                              src={prototype.thumbnailUrl || `https://placehold.co/100/text=${prototype.name}`} 
                              alt={prototype.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{prototype.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {prototype.description || "No description provided"}
                            </p>
                          </div>
                          <Button size="sm">Select</Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        You don't have any prototypes yet.
                      </p>
                      <Button onClick={() => navigate('/add-prototype')}>
                        Create a Prototype
                      </Button>
                    </div>
                  )}
                </>
              )}
              
              <div className="mt-6 pt-6 border-t">
                <Button variant="outline" onClick={() => navigate('/community')}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      {selectedPrototype && (
        <SubmitToCommunityModal
          open={isModalOpen}
          onClose={handleCloseModal}
          prototype={selectedPrototype}
        />
      )}
    </div>
  );
}

export default CommunitySubmit;
