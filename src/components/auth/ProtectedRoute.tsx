
import { useAuth, useUser } from "@clerk/clerk-react";
import { Navigate, useLocation } from "react-router-dom";
import { ClerkMetadata } from "@/utils/clerk-supabase-sync";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const location = useLocation();
  
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
  const metadata = user?.publicMetadata as Partial<ClerkMetadata>;
  const hasCompletedOnboarding = metadata?.has_completed_onboarding === true;
  
  if (hasCompletedOnboarding === false && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
}
