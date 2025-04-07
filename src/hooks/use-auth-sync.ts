
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { syncUserToSupabase } from "@/utils/clerk-supabase-sync";

export function useAuthSync() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const syncData = async () => {
        try {
          setIsSyncing(true);
          setSyncError(null);
          await syncUserToSupabase(user);
        } catch (error) {
          console.error("Sync error:", error);
          setSyncError("Failed to sync user data");
        } finally {
          setIsSyncing(false);
        }
      };

      syncData();
    }
  }, [isLoaded, isSignedIn, user]);

  return { isSyncing, syncError };
}
