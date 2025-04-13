import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { PrototypeGrid } from "@/components/dashboard/PrototypeGrid";
import { DashboardControls } from "@/components/dashboard/DashboardControls";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useProjects } from "@/hooks/use-projects";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

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
    loading, 
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    refreshProjects
  } = useProjects();

  const [prototypes, setPrototypes] = useState<Prototype[]>([]);
  const [loadingPrototypes, setLoadingPrototypes] = useState(true);

  // Fetch prototypes from Supabase
  const fetchPrototypes = async () => {
    try {
      setLoadingPrototypes(true);
      // Use proper type casting to avoid TypeScript errors
      const { data, error } = await supabase
        .from('prototypes')
        .select('*')
        .order('created_at', { ascending: false }) as any;
      
      if (error) {
        console.error('Error fetching prototypes:', error);
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
  }, [prototypes]);

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
    fetchPrototypes();
    refreshProjects();
    toast({
      title: "Refreshed",
      description: "Your dashboard has been refreshed",
    });
  };

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
            <button 
              onClick={handleRefresh} 
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
              </svg>
              Refresh
            </button>
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

          {(loading || loadingPrototypes) ? (
            <div className="flex justify-center py-20">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading projects and prototypes...</p>
              </div>
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
