
import { Bell, User, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Link } from "react-router-dom";
import { useAuth, useUser, UserButton } from "@clerk/clerk-react";
import { Skeleton } from "@/components/ui/skeleton";

export const Header = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  return (
    <header className="border-b border-border bg-background sticky top-0 z-10">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-loop-blue text-white font-bold">L</div>
            <span className="text-xl font-semibold">Loop</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {isLoaded ? (
            isSignedIn ? (
              <>
                <Button variant="outline" size="sm" className="gap-1" asChild>
                  <Link to="/add-prototype">
                    <Plus className="h-4 w-4" />
                    <span>Add Prototype</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-loop-purple rounded-full"></span>
                </Button>
                <UserButton 
                  afterSignOutUrl="/login"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "h-8 w-8"
                    }
                  }}
                />
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
    </header>
  );
}
