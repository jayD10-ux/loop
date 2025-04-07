
import { PlusCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface EmptyStateProps {
  isTeam: boolean;
  teamName?: string;
}

export function EmptyState({ isTeam, teamName }: EmptyStateProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-lg bg-muted/10">
      <div className="mb-4 p-3 rounded-full bg-primary/10">
        {isTeam ? (
          <Users className="h-8 w-8 text-primary" />
        ) : (
          <PlusCircle className="h-8 w-8 text-primary" />
        )}
      </div>
      
      <h3 className="text-xl font-semibold mb-2">
        {isTeam 
          ? `No projects found for ${teamName || 'your team'}`
          : "You haven't created any projects yet"}
      </h3>
      
      <p className="text-muted-foreground mb-6 max-w-md">
        {isTeam
          ? "Get started by creating your first team project or invite teammates to collaborate."
          : "Create your first project to start sharing and receiving feedback."}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => navigate("/add-prototype")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add a prototype
        </Button>
        
        {isTeam && (
          <Button variant="outline" onClick={() => navigate("/team/invite")}>
            <Users className="mr-2 h-4 w-4" />
            Invite teammates
          </Button>
        )}
      </div>
    </div>
  );
}
