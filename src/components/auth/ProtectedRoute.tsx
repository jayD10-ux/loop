
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const location = useLocation();
  
  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsSignedIn(!!session);
        
        if (session?.user) {
          // Check if user has completed onboarding
          checkOnboardingStatus(session.user.id);
        } else {
          setHasCompletedOnboarding(null);
          setIsLoaded(true);
        }
      }
    );
    
    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsSignedIn(!!session);
      
      if (session?.user) {
        // Check if user has completed onboarding
        await checkOnboardingStatus(session.user.id);
      } else {
        setHasCompletedOnboarding(null);
        setIsLoaded(true);
      }
    };
    
    checkSession();
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const checkOnboardingStatus = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('has_completed_onboarding')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching profile:", error);
        setHasCompletedOnboarding(null);
      } else {
        setHasCompletedOnboarding(profile?.has_completed_onboarding ?? false);
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setHasCompletedOnboarding(null);
    } finally {
      setIsLoaded(true);
    }
  };
  
  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isSignedIn) {
    // Redirect to login page, but save the current path to redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // Check if user has completed onboarding
  if (hasCompletedOnboarding === false && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
}
