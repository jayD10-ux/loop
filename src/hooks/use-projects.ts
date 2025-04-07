
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  owner_type: string; // Changed from "user" | "team" to string to match Supabase data
  created_at: string;
  updated_at: string;
}

interface Team {
  id: string;
  name: string;
  owner_user_id: string;
}

export function useProjects() {
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  
  // Sort options
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    if (!user) return;
    
    async function fetchData() {
      setLoading(true);
      try {
        // 1. Fetch team memberships if user has teams
        const { data: teamMemberships, error: teamMembershipsError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', user.id);
          
        if (teamMembershipsError) {
          throw new Error(`Failed to fetch team memberships: ${teamMembershipsError.message}`);
        }
        
        // 2. Get team details if user belongs to any teams
        const teamIds = teamMemberships?.map(tm => tm.team_id) || [];
        let userTeams: Team[] = [];
        
        if (teamIds.length > 0) {
          const { data: teamsData, error: teamsError } = await supabase
            .from('teams')
            .select('*')
            .in('id', teamIds);
            
          if (teamsError) {
            throw new Error(`Failed to fetch teams: ${teamsError.message}`);
          }
          
          userTeams = teamsData || [];
          
          // Set active team to first team if not already set
          if (userTeams.length > 0 && !activeTeamId) {
            setActiveTeamId(userTeams[0].id);
          }
        }
        
        setTeams(userTeams);
        
        // 3. Fetch projects - both owned by user and by teams user belongs to
        let filters = `owner_type.eq.user,owner_id.eq.${user.id}`;
        
        if (teamIds.length > 0) {
          filters += `,or(owner_type.eq.team,owner_id.in.(${teamIds.join(',')}))`;
        }
        
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .or(filters);
          
        if (projectsError) {
          throw new Error(`Failed to fetch projects: ${projectsError.message}`);
        }
        
        setProjects(projectsData || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Failed to load data",
          description: error instanceof Error ? error.message : "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [user, activeTeamId]);
  
  // Get filtered and sorted projects
  const filteredProjects = projects
    .filter(project => {
      // Apply team filter if active team is selected
      if (activeTeamId && project.owner_type === 'team') {
        if (project.owner_id !== activeTeamId) return false;
      }
      
      // Apply search filter
      if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
    });
  
  return {
    projects: filteredProjects,
    teams,
    loading,
    activeTeamId,
    setActiveTeamId,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    hasTeams: teams.length > 0,
    activeTeam: teams.find(team => team.id === activeTeamId),
  };
}
