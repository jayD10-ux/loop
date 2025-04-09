
import { Header } from "@/components/layout/Header";
import { PrototypeGrid } from "@/components/dashboard/PrototypeGrid";
import { DashboardControls } from "@/components/dashboard/DashboardControls";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useProjects } from "@/hooks/use-projects";
import { useUser } from "@clerk/clerk-react";

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
    activeTeam
  } = useProjects();

  const { user } = useUser();
  const isTeamContext = hasTeams && activeTeamId !== null;

  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-4">
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

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : projects.length > 0 ? (
            <PrototypeGrid
              activeTab="all"
              searchQuery={searchQuery}
              customProjects={projects.map(project => ({
                id: project.id,
                title: project.name,
                description: project.description || "",
                thumbnailUrl: "https://placehold.co/600x400/3B82F6/FFFFFF?text=Project",
                updatedAt: new Date(project.updated_at).toLocaleDateString(),
                commentCount: 0,
                tags: [],
                source: "figma" as const,
                isTeam: project.owner_type === 'team',
              }))}
            />
          ) : (
            <EmptyState 
              isTeam={isTeamContext} 
              teamName={activeTeam?.name} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
