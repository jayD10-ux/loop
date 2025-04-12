
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { PrototypeGrid } from "@/components/dashboard/PrototypeGrid";
import { DashboardControls } from "@/components/dashboard/DashboardControls";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useProjects } from "@/hooks/use-projects";

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
  const { 
    projects, 
    teams, 
    loading, 
    activeTeamId, 
    setActiveTeamId,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    hasTeams,
    activeTeam,
    refreshProjects
  } = useProjects();

  const [prototypes, setPrototypes] = useState<Prototype[]>([]);
  const [loadingPrototypes, setLoadingPrototypes] = useState(true);

  const isTeamContext = hasTeams && activeTeamId !== null;

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
    } catch (err) {
      console.error('Error in fetchPrototypes:', err);
    } finally {
      setLoadingPrototypes(false);
    }
  };

  useEffect(() => {
    fetchPrototypes();
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
      isTeam: project.owner_type === 'team',
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

  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold">
                {isTeamContext 
                  ? `${activeTeam?.name} Projects` 
                  : "My Projects"}
              </h1>
              <p className="text-muted-foreground">
                {isTeamContext
                  ? "Manage and collaborate on team prototypes"
                  : "Manage your personal prototypes"}
              </p>
            </div>
          </div>

          <DashboardControls
            teams={teams}
            activeTeamId={activeTeamId}
            onTeamChange={setActiveTeamId}
            sortBy={sortBy}
            onSortChange={setSortBy}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            hasTeams={hasTeams}
          />

          {(loading || loadingPrototypes) ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : sortedItems.length > 0 ? (
            <PrototypeGrid
              activeTab="all"
              searchQuery={searchQuery}
              customProjects={sortedItems}
            />
          ) : (
            <EmptyState 
              isTeam={isTeamContext} 
              teamName={activeTeam?.name}
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
  switch (techStack) {
    case 'react':
      return '61DAFB';
    case 'vanilla':
      return 'F0DB4F';
    default:
      return '6366F1';
  }
}

export default Dashboard;
