import { useState, useEffect, useMemo } from "react";
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
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPrototypes, setSelectedPrototypes] = useState<string[]>([]);

  useEffect(() => {
    fetchPrototypes();
  }, [activeTab, activeTeam]);

  // Reset selection when changing tabs
  useEffect(() => {
    setSelectedPrototypes([]);
  }, [activeTab]);

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
      
      console.log("Fetched raw prototypes from Supabase:", data);
      
      if (data) {
        // Add validation and ensure required fields 
        const validPrototypes = (data as any[])
          .filter(p => p && typeof p === 'object' && p.id && p.name)
          .map(p => ({
            id: p.id,
            name: p.name,
            description: p.description || null,
            tech_stack: p.tech_stack || 'unknown',
            created_by: p.created_by,
            created_at: p.created_at || new Date().toISOString(),
            updated_at: p.updated_at || new Date().toISOString(),
            files: p.files || {},
            deployment_status: p.deployment_status || null,
            deployment_url: p.deployment_url || null,
            preview_url: p.preview_url || null,
            file_path: p.file_path || null,
            figma_link: p.figma_link || null,
            figma_file_key: p.figma_file_key || null,
            figma_file_name: p.figma_file_name || null,
            figma_preview_url: p.figma_preview_url || null
          }));
        
        console.log("Processed and validated prototypes:", validPrototypes);
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

  const sortedAndFilteredPrototypes = useMemo(() => {
    console.log("Computing sortedAndFilteredPrototypes with prototypes:", prototypes);
    
    if (!prototypes || !Array.isArray(prototypes) || prototypes.length === 0) {
      return [];
    }
    
    let filtered = [...prototypes];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        p => 
          (p && p.name && p.name.toLowerCase().includes(term)) || 
          (p && p.description && p.description.toLowerCase().includes(term))
      );
    }
    
    // Sort with additional null checks
    switch (sortOrder) {
      case "newest":
        return filtered.sort((a, b) => {
          if (!a || !a.created_at) return 1;
          if (!b || !b.created_at) return -1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      case "oldest":
        return filtered.sort((a, b) => {
          if (!a || !a.created_at) return 1;
          if (!b || !b.created_at) return -1;
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
      case "a-z":
        return filtered.sort((a, b) => {
          if (!a || !a.name) return 1;
          if (!b || !b.name) return -1;
          return a.name.localeCompare(b.name);
        });
      case "z-a":
        return filtered.sort((a, b) => {
          if (!a || !a.name) return 1;
          if (!b || !b.name) return -1;
          return b.name.localeCompare(a.name);
        });
      default:
        return filtered;
    }
  }, [prototypes, searchTerm, sortOrder]);

  const handleAddPrototype = () => {
    setShowUploadModal(true);
  };

  const handleAddSuccess = (prototype: Prototype) => {
    fetchPrototypes();
    navigate(`/prototypes/${prototype.id}`);
  };

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedPrototypes([]); // Clear selections when toggling mode
  };

  const handleDeletePrototypes = async (prototypeIds: string[]) => {
    if (!prototypeIds.length) return;
    
    try {
      setLoading(true);
      
      // Delete each prototype from the database
      for (const id of prototypeIds) {
        const { error } = await supabase
          .from("prototypes")
          .delete()
          .eq("id", id);
          
        if (error) {
          console.error(`Error deleting prototype ${id}:`, error);
          throw error;
        }
      }
      
      // Refresh the prototype list
      toast({
        title: prototypeIds.length === 1 
          ? "Prototype deleted" 
          : `${prototypeIds.length} prototypes deleted`,
        description: "The selected items have been removed",
      });
      
      // Clear selection and refresh
      setSelectedPrototypes([]);
      fetchPrototypes();
      
    } catch (error) {
      console.error("Error deleting prototypes:", error);
      toast({
        title: "Error deleting prototypes",
        description: "There was a problem deleting the selected prototypes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-6">
        <div className="flex flex-col gap-6">
          {/* <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight">My Prototypes</h1>
            <div className="flex items-center gap-2">
              <UIButton onClick={fetchPrototypes} variant="ghost" size="icon" title="Refresh">
                <RefreshCw className="h-4 w-4" />
              </UIButton>
              <UIButton onClick={handleAddPrototype}>Add Prototype</UIButton>
            </div>
          </div>
           */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <TabNavigation 
              activeTab={activeTab} 
              onTabChange={(tab) => setActiveTab(tab)} 
              isSelectionMode={isSelectionMode}
              onToggleSelectionMode={handleToggleSelectionMode}
              selectedCount={selectedPrototypes.length}
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
          ) : sortedAndFilteredPrototypes.length > 0 ? (
            <PrototypeGrid 
              activeTab={activeTab} 
              searchQuery={searchTerm}
              prototypes={sortedAndFilteredPrototypes} 
              isSelectionMode={isSelectionMode}
              onDeletePrototypes={handleDeletePrototypes}
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
