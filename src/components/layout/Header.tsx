import { useState, useEffect } from "react";
import { Bell, User, Plus, LogOut, Upload, FileArchive, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { DualUploadModal } from "@/components/prototype/DualUploadModal";

export const Header = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [profile, setProfile] = useState<{first_name?: string; last_name?: string} | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";

  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsSignedIn(!!session);
        
        if (session?.user) {
          // Fetch profile outside of the callback to avoid deadlock
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setIsLoaded(true);
        }
      }
    );
    
    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsSignedIn(!!session);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoaded(true);
      }
    };
    
    checkSession();
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching profile:", error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error in fetchProfile:", error);
    } finally {
      setIsLoaded(true);
    }
  };
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out."
      });
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "An error occurred while signing out.",
        variant: "destructive"
      });
    }
  };
  
  const getUserInitials = () => {
    if (!profile) return "U";
    
    const firstInitial = profile.first_name ? profile.first_name.charAt(0) : "";
    const lastInitial = profile.last_name ? profile.last_name.charAt(0) : "";
    
    return (firstInitial + lastInitial).toUpperCase() || "U";
  };

  const handleUploadSuccess = (prototype: any) => {
    toast({
      title: "Prototype added",
      description: "Your prototype has been successfully added."
    });
    
    if (isDashboard) {
      // If we're already on the dashboard, we can just refresh it
      window.location.reload();
    } else {
      // Navigate to the dashboard
      navigate('/dashboard');
    }
  };

  return (
    <header className="border-b border-border bg-background sticky top-0 z-10">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-loop-blue text-white font-bold">L</div>
            <span className="text-xl font-semibold">Loop</span>
          </Link>
          
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-4">
            <Link 
              to="/dashboard" 
              className={`text-sm transition-colors hover:text-foreground/80 ${
                location.pathname === "/dashboard" ? "font-medium text-foreground" : "text-foreground/60"
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/community" 
              className={`text-sm transition-colors hover:text-foreground/80 ${
                location.pathname.startsWith("/community") ? "font-medium text-foreground" : "text-foreground/60"
              }`}
            >
              Community
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {isLoaded ? (
            isSignedIn ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Plus className="h-4 w-4" />
                      <span>Add Prototype</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => setIsAddModalOpen(true)} className="cursor-pointer">
                      <Code className="mr-2 h-4 w-4" />
                      <span>New Prototype</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/upload-prototype')} className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      <span>Upload HTML/ZIP</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-loop-purple rounded-full"></span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt="User" />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <ModeToggle />
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">Sign up</Link>
                </Button>
                <ModeToggle />
              </>
            )
          ) : (
            <Skeleton className="h-8 w-24" />
          )}
        </div>
      </div>
      
      {/* Prototype Upload Modal */}
      <DualUploadModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </header>
  );
};
