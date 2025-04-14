
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { PrototypeGrid } from "@/components/dashboard/PrototypeGrid";
import { DashboardControls } from "@/components/dashboard/DashboardControls";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useProjects } from "@/hooks/use-projects";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define the prototype interface
interface Prototype {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  tech_stack: string;
  files: Record<string, string>;
  deployment_status?: 'pending' | 'deployed' | 'failed';
  deployment_url?: string;
  preview_url?: string;
  file_path?: string;
}

const Dashboard = () => {
  const { toast } = useToast();
  const { 
    projects, 
    loading: loadingProjects, 
    error: projectsError,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    refreshProjects
  } = useProjects();

  const [prototypes, setPrototypes] = useState<Prototype[]>([]);
  const [loadingPrototypes, setLoadingPrototypes] = useState(true);
  const [prototypesError, setPrototypesError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch prototypes from Supabase
  const fetchPrototypes = async () => {
    try {
      setLoadingPrototypes(true);
      setPrototypesError(null);
      
      // Use proper type casting to avoid TypeScript errors
      const { data, error } = await supabase
        .from('prototypes')
        .select('*')
        .order('created_at', { ascending: false }) as any;
      
      if (error) {
        console.error('Error fetching prototypes:', error);
        setPrototypesError(error.message);
        toast({
          title: "Error loading prototypes",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      // Transform the data to match the Prototype interface
      const transformedData = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        created_by: item.created_by,
        created_at: item.created_at,
        updated_at: item.updated_at,
        tech_stack: item.tech_stack || '',
        files: item.files || {},
        deployment_status: item.deployment_status,
        deployment_url: item.deployment_url,
        preview_url: item.preview_url,
        file_path: item.file_path
      }));
      
      setPrototypes(transformedData);
    } catch (err: any) {
      console.error('Error in fetchPrototypes:', err);
      setPrototypesError(err.message || "An unexpected error occurred");
      toast({
        title: "Error loading prototypes",
        description: err.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoadingPrototypes(false);
    }
  };

  useEffect(() => {
    fetchPrototypes();
    
    // Set up a refresh interval for prototypes with 'pending' status
    const pendingInterval = setInterval(() => {
      const hasPendingPrototypes = prototypes.some(p => p.deployment_status === 'pending');
      if (hasPendingPrototypes) {
        console.log('Refreshing prototypes with pending status...');
        fetchPrototypes();
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(pendingInterval);
  }, []);

  // Combine projects and prototypes for display
  const allItems = [
    ...(projects || []).map(project => ({
      id: project.id,
      title: project.name,
      description: project.description || "",
      thumbnailUrl: "https://placehold.co/600x400/3B82F6/FFFFFF?text=Project",
      updatedAt: new Date(project.updated_at).toLocaleDateString(),
      commentCount: 0,
      tags: [],
      source: "figma" as const,
      isTeam: false,
    })),
    ...(prototypes || []).map(prototype => ({
      id: prototype.id,
      title: prototype.name,
      description: prototype.description || "",
      thumbnailUrl: `https://placehold.co/600x400/${getTechStackColor(prototype.tech_stack)}/FFFFFF?text=${prototype.tech_stack.charAt(0).toUpperCase() + prototype.tech_stack.slice(1)}`,
      updatedAt: new Date(prototype.created_at).toLocaleDateString(),
      commentCount: 0,
      tags: [prototype.tech_stack],
      source: "code" as const,
      isTeam: false,
      status: prototype.deployment_status,
      previewUrl: prototype.preview_url || prototype.deployment_url
    }))
  ];

  // Filter items based on search query
  const filteredItems = allItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.tags && item.tags.some(tag => 
      tag.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  );

  // Sort items based on sortBy
  const sortedItems = [...filteredItems].sort((a, b) => {
    const dateA = new Date(a.updatedAt);
    const dateB = new Date(b.updatedAt);
    return sortBy === 'newest' 
      ? dateB.getTime() - dateA.getTime() 
      : dateA.getTime() - dateB.getTime();
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Refresh both projects and prototypes
    Promise.all([
      fetchPrototypes(),
      refreshProjects()
    ]).finally(() => {
      setIsRefreshing(false);
      toast({
        title: "Refreshed",
        description: "Your dashboard has been refreshed",
      });
    });
  };

  // Check if we're in a loading or error state
  const isLoading = loadingProjects || loadingPrototypes;
  const hasError = !!projectsError || !!prototypesError;

  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold">My Projects</h1>
              <p className="text-muted-foreground">
                Manage your personal prototypes
              </p>
            </div>
            <Button 
              onClick={handleRefresh}
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-sm hover:bg-muted transition-colors"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>

          <DashboardControls
            teams={[]}
            activeTeamId={null}
            onTeamChange={() => {}}
            sortBy={sortBy}
            onSortChange={setSortBy}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            hasTeams={false}
          />

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading projects and prototypes...</p>
              </div>
            </div>
          ) : hasError ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="bg-destructive/10 p-4 rounded-full inline-flex mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-destructive">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                {projectsError || prototypesError || "There was a problem loading your projects and prototypes."}
              </p>
              <Button onClick={handleRefresh} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          ) : sortedItems.length > 0 ? (
            <PrototypeGrid
              activeTab="all"
              searchQuery={searchQuery}
              customProjects={sortedItems}
            />
          ) : (
            <EmptyState 
              isTeam={false} 
              onAddPrototype={() => {
                // Find the Add Prototype button in the header and click it
                const addButton = document.querySelector('button:has(.h-4.w-4)') as HTMLButtonElement;
                if (addButton) {
                  addButton.click();
                }
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
};

// Helper function to get color for tech stack
function getTechStackColor(techStack: string): string {
  switch (techStack.toLowerCase()) {
    case 'react':
      return '61DAFB';
    case 'vanilla':
      return 'F0DB4F';
    case 'vue':
      return '42B883';
    case 'angular':
      return 'DD0031';
    case 'svelte':
      return 'FF3E00';
    case 'nextjs':
    case 'next.js':
      return '000000';
    default:
      return '6366F1';
  }
}

export default Dashboard;
