
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

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Sort options
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [searchQuery, setSearchQuery] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  
  // Completely disable team functionality
  const teams = []; // Empty array
  const activeTeamId = null;
  const setActiveTeamId = () => {}; // No-op function
  const hasTeams = false;
  
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
      console.log('Fetching personal projects for user ID:', userId);
      
      // IMPORTANT: Only fetch personal projects - completely avoid team-related queries
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_type', 'user')
        .eq('owner_id', userId);
        
      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        throw new Error(`Failed to fetch projects: ${projectsError.message}`);
      }
      
      console.log('Personal projects data:', projectsData);
      
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
          description: "There was a problem loading your projects. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [userId, retryCount]);
  
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
      // Only show user's personal projects
      if (project.owner_type !== 'user') return false;
      
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
    teams: [], // Return empty array
    loading,
    error,
    activeTeamId,
    setActiveTeamId,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    hasTeams: false, // Disable team features
    activeTeam: null,
    refreshProjects,
    retryCount,
  };
}
