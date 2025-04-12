
import { useState, useEffect, useCallback } from "react";
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
  const [error, setError] = useState<string | null>(null);
  
  // Sort options
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [searchQuery, setSearchQuery] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  
  useEffect(() => {
    // Get user session
    async function getUserId() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setError('Authentication error. Please try logging in again.');
          return null;
        }
        
        return session?.user?.id || null;
      } catch (err) {
        console.error('Unexpected error in getUserId:', err);
        setError('Authentication error. Please try logging in again.');
        return null;
      }
    }
    
    getUserId().then(id => {
      setUserId(id);
    });
  }, []);
  
  const fetchData = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching data for user ID:', userId);
      
      // Use the get_user_teams_for_access function to get team IDs
      const { data: teamIds, error: teamIdsError } = await supabase.rpc(
        'get_user_teams_for_access',
        { p_user_id: userId } 
      );
      
      if (teamIdsError) {
        console.error('Error calling team access function:', teamIdsError);
        throw new Error(`Failed to fetch team access: ${teamIdsError.message}`);
      }
      
      console.log('Team IDs:', teamIds);
      
      // If user has team access, fetch team details
      let userTeams: Team[] = [];
      
      if (teamIds && teamIds.length > 0) {
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .in('id', teamIds);
          
        if (teamsError) {
          console.error('Error fetching teams:', teamsError);
          throw new Error(`Failed to fetch teams: ${teamsError.message}`);
        }
        
        userTeams = teamsData || [];
      }
      
      console.log('User teams:', userTeams);
      setTeams(userTeams);
      
      // Set active team to first team if not already set
      if (userTeams.length > 0 && !activeTeamId) {
        setActiveTeamId(userTeams[0].id);
      }
      
      // Fetch projects - both owned by user and by teams user belongs to
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*');
        
      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
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

      // Reset retry count on successful fetch
      setRetryCount(0);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      
      // Implement exponential backoff for retries
      if (retryCount < 3) {
        const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.log(`Retrying in ${retryDelay / 1000} seconds... (Attempt ${retryCount + 1}/3)`);
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchData();
        }, retryDelay);
      } else {
        setError(error.message || "Failed to load dashboard data");
        toast({
          title: "Failed to load data",
          description: error instanceof Error ? error.message : "An unexpected error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [userId, activeTeamId, retryCount]);
  
  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, fetchData]);
  
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
    error,
    activeTeamId,
    setActiveTeamId,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    hasTeams: teams.length > 0,
    activeTeam: teams.find(team => team.id === activeTeamId),
    refreshProjects,
    retryCount,
  };
}
