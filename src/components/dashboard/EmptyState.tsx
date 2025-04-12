
import { Button } from "@/components/ui/button";
import { Plus, Code, FileUp, PanelRight } from "lucide-react";

interface EmptyStateProps {
  isTeam?: boolean;
  teamName?: string;
  onAddPrototype: () => void;
}

export function EmptyState({ isTeam = false, teamName, onAddPrototype }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-6 bg-muted/50 p-8 rounded-full inline-flex items-center justify-center mx-auto">
          <PanelRight className="h-12 w-12 text-primary" />
        </div>

        <h2 className="text-2xl font-bold mb-3">
          {isTeam 
            ? `No prototypes in ${teamName || 'this team'} yet`
            : "No prototypes yet"
          }
        </h2>
        
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          {isTeam 
            ? `Create your first prototype for ${teamName || 'this team'} to start collaborating with your team members.`
            : "Create your first prototype to start visualizing and sharing your ideas."
          }
        </p>

        <div className="space-y-4">
          <Button 
            onClick={onAddPrototype}
            className="w-full flex items-center justify-center gap-2 text-base h-12"
          >
            <Plus className="h-5 w-5" />
            Create New Prototype
          </Button>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button variant="outline" className="flex flex-col py-6 h-auto" onClick={onAddPrototype}>
              <Code className="h-6 w-6 mb-2" />
              <span>Code Prototype</span>
            </Button>
            <Button variant="outline" className="flex flex-col py-6 h-auto" onClick={onAddPrototype}>
              <FileUp className="h-6 w-6 mb-2" />
              <span>Upload HTML/ZIP</span>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-12 p-4 border rounded-lg bg-muted/20 max-w-md">
        <h3 className="font-medium mb-2">Quick tip</h3>
        <p className="text-sm text-muted-foreground">
          You can upload HTML files, ZIP packages, or connect to external URLs to create prototypes.
          All your prototypes are automatically deployed and shareable with a unique URL.
        </p>
      </div>
    </div>
  );
}
