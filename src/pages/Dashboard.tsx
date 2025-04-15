
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { TabNavigation } from "@/components/dashboard/TabNavigation";
import { PrototypeGrid } from "@/components/dashboard/PrototypeGrid";
import { DashboardControls } from "@/components/dashboard/DashboardControls";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { TeamSelector } from "@/components/dashboard/TeamSelector";
import { AddPrototypeModal } from "@/components/add-prototype/AddPrototypeModal";
import { DualUploadModal } from "@/components/prototype/DualUploadModal";
import { Prototype } from "@/types/prototype";
import { Button as UIButton } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [prototypes, setPrototypes] = useState<Prototype[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "yours" | "team">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "a-z" | "z-a">("newest");
  const [activeTeam, setActiveTeam] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrototypes();
  }, [activeTab, activeTeam]);

  const fetchPrototypes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("No active session found");
        navigate("/login");
        return;
      }
      
      const userId = session.user.id;
      let query = supabase.from("prototypes").select("*");
      
      if (activeTab === "yours") {
        query = query.eq("created_by", userId);
      } else if (activeTab === "team" && activeTeam) {
        // This would need a team-based query, but for now we'll just use the user's prototypes
        query = query.eq("created_by", userId);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) {
        console.error("Error fetching prototypes:", fetchError);
        setError("Failed to load prototypes. Please try again later.");
        toast({
          title: "Error loading prototypes",
          description: "There was a problem loading your prototypes.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Fetched prototypes:", data);
      
      if (data) {
        // Ensure all required fields are present
        const validPrototypes = (data as Prototype[]).map(p => ({
          ...p,
          // Ensure required fields have default values
          created_at: p.created_at || new Date().toISOString(),
          updated_at: p.updated_at || new Date().toISOString(),
          description: p.description || null,
          files: p.files || {}
        }));
        
        setPrototypes(validPrototypes);
      } else {
        setPrototypes([]);
      }
    } catch (error) {
      console.error("Error in fetchPrototypes:", error);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const sortedAndFilteredPrototypes = () => {
    if (!Array.isArray(prototypes)) {
      console.error("prototypes is not an array:", prototypes);
      return [];
    }
    
    let filtered = [...prototypes];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        p => 
          (p.name && p.name.toLowerCase().includes(term)) || 
          (p.description && p.description.toLowerCase().includes(term))
      );
    }
    
    // Sort
    switch (sortOrder) {
      case "newest":
        return filtered.sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
      case "oldest":
        return filtered.sort((a, b) => 
          new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        );
      case "a-z":
        return filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      case "z-a":
        return filtered.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
      default:
        return filtered;
    }
  };

  const handleAddPrototype = () => {
    setShowUploadModal(true);
  };

  const handleAddSuccess = (prototype: Prototype) => {
    fetchPrototypes();
    navigate(`/prototypes/${prototype.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-6">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight">My Prototypes</h1>
            <div className="flex items-center gap-2">
              <UIButton onClick={fetchPrototypes} variant="ghost" size="icon" title="Refresh">
                <RefreshCw className="h-4 w-4" />
              </UIButton>
              <UIButton onClick={handleAddPrototype}>Add Prototype</UIButton>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <TabNavigation 
              activeTab={activeTab} 
              onTabChange={(tab) => setActiveTab(tab)} 
            />
            <DashboardControls
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              sortOrder={sortOrder}
              onSortChange={setSortOrder}
            />
          </div>
          
          {activeTab === "team" && (
            <TeamSelector 
              activeTeamId={activeTeam} 
              onTeamChange={(teamId) => setActiveTeam(teamId)}
              teams={[]} 
            />
          )}
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div 
                  key={i} 
                  className="bg-card rounded-lg shadow animate-pulse h-64"
                ></div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <h3 className="text-xl font-semibold mb-2 text-destructive">Error</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <UIButton onClick={fetchPrototypes} variant="outline">
                Try Again
              </UIButton>
            </div>
          ) : sortedAndFilteredPrototypes().length > 0 ? (
            <PrototypeGrid 
              activeTab={activeTab} 
              searchQuery={searchTerm}
              prototypes={sortedAndFilteredPrototypes()} 
            />
          ) : (
            <EmptyState 
              onAddClick={handleAddPrototype}
              onAddPrototype={handleAddPrototype} 
            />
          )}
        </div>
      </main>
      
      {showAddModal && (
        <AddPrototypeModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchPrototypes}
        />
      )}
      
      {showUploadModal && (
        <DualUploadModal
          open={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  );
};

export default Dashboard;
