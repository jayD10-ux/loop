
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  isTeam?: boolean;
  teamName?: string;
  onAddPrototype?: () => void;
}

export function EmptyState({ isTeam = false, teamName = "team", onAddPrototype }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg mt-8">
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 mb-4">
        <Plus className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-xl font-semibold mb-2">
        {isTeam ? `No ${teamName} prototypes yet` : "No prototypes yet"}
      </h2>
      <p className="text-muted-foreground max-w-md mb-6">
        {isTeam
          ? `Get started by adding your first prototype to the ${teamName} team.`
          : "Get started by adding your first prototype to your workspace."}
      </p>
      <div className="flex gap-4">
        <Button onClick={onAddPrototype}>
          Create New Prototype
        </Button>
        <Button variant="outline" onClick={onAddPrototype}>
          Upload ZIP
        </Button>
      </div>
    </div>
  );
}
