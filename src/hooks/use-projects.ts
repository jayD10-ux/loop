
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  owner_type: 'user' | 'team';
  created_at: string;
  updated_at: string;
}

interface Team {
  id: string;
  name: string;
  owner_user_id: string;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Sort options
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    // Get user session
    async function getUserId() {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user?.id || null;
    }
    
    getUserId().then(id => {
      setUserId(id);
    });
  }, []);
  
  const fetchData = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      console.log('Fetching data for user ID:', userId);
      
      // Directly query teams the user is a member of
      const { data: userTeams, error: teamsError } = await supabase.rpc(
        'get_user_team_memberships',
        { user_id: userId }
      ).then(async (result) => {
        if (result.error) {
          console.error('Error calling RPC function:', result.error);
          
          // Fallback: directly query team memberships if the RPC fails
          const { data: membershipData, error: membershipError } = await supabase
            .from('team_members')
            .select('team_id')
            .eq('user_id', userId);
            
          if (membershipError) {
            throw new Error(`Failed to fetch team memberships: ${membershipError.message}`);
          }
          
          const teamIds = membershipData?.map(membership => membership.team_id) || [];
          
          if (teamIds.length === 0) {
            return { data: [], error: null };
          }
          
          // Get team details
          const { data: teamsData, error: teamsFetchError } = await supabase
            .from('teams')
            .select('*')
            .in('id', teamIds);
            
          if (teamsFetchError) {
            throw new Error(`Failed to fetch teams: ${teamsFetchError.message}`);
          }
          
          return { data: teamsData || [], error: null };
        }
        
        // If RPC worked, get the team details
        const teamIds = result.data as string[];
        
        if (!teamIds || teamIds.length === 0) {
          return { data: [], error: null };
        }
        
        const { data: teamsData, error: teamsFetchError } = await supabase
          .from('teams')
          .select('*')
          .in('id', teamIds);
          
        if (teamsFetchError) {
          throw new Error(`Failed to fetch teams: ${teamsFetchError.message}`);
        }
        
        return { data: teamsData || [], error: null };
      });
      
      if (teamsError) {
        throw teamsError;
      }
      
      console.log('User teams:', userTeams);
      setTeams(userTeams);
      
      // Set active team to first team if not already set
      if (userTeams.length > 0 && !activeTeamId) {
        setActiveTeamId(userTeams[0].id);
      }
      
      // 3. Fetch projects - both owned by user and by teams user belongs to
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*');
        
      if (projectsError) {
        throw new Error(`Failed to fetch projects: ${projectsError.message}`);
      }
      
      console.log('Projects data:', projectsData);
      
      // With RLS, we'll only get back the projects the user has access to
      setProjects(
        (projectsData || []).map(p => ({
          ...p,
          owner_type: p.owner_type as 'user' | 'team'
        }))
      );
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Failed to load data",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, activeTeamId]);
  
  // Add refreshProjects function to manually trigger data refresh
  const refreshProjects = () => {
    fetchData();
  };
  
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
    refreshProjects,
  };
}
