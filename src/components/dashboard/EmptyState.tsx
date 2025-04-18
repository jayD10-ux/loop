
import { Button } from "@/components/ui/button";
import { Plus, Code, FileUp, PanelRight, GitBranch, FileBox } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EmptyStateProps {
  isTeam?: boolean;
  teamName?: string;
  onAddClick: () => void;
  onAddPrototype?: () => void;
}

export function EmptyState({ isTeam = false, teamName, onAddClick, onAddPrototype }: EmptyStateProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'upload'>('create');
  
  // Use onAddClick as the primary handler, fall back to onAddPrototype for backward compatibility
  const handleAddClick = onAddClick || onAddPrototype || (() => {});
  
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

        <Tabs defaultValue="create" className="mb-6" onValueChange={(value) => setActiveTab(value as 'create' | 'upload')}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="create">Create New</TabsTrigger>
            <TabsTrigger value="upload">Upload Existing</TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === 'create' ? (
          <div className="space-y-6">
            <Button 
              onClick={handleAddClick}
              className="w-full flex items-center justify-center gap-2 text-base h-12"
            >
              <Plus className="h-5 w-5" />
              Create New Prototype
            </Button>
            
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="flex flex-col py-6 h-auto" onClick={handleAddClick}>
                <Code className="h-6 w-6 mb-2" />
                <span>Code Prototype</span>
              </Button>
              <Button variant="outline" className="flex flex-col py-6 h-auto" onClick={handleAddClick}>
                <GitBranch className="h-6 w-6 mb-2" />
                <span>From Template</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Button 
              onClick={handleAddClick}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 text-base h-12"
            >
              <FileUp className="h-5 w-5" />
              Upload HTML or ZIP
            </Button>
            
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="flex flex-col py-6 h-auto" onClick={handleAddClick}>
                <FileBox className="h-6 w-6 mb-2" />
                <span>Upload HTML</span>
              </Button>
              <Button variant="outline" className="flex flex-col py-6 h-auto" onClick={handleAddClick}>
                <FileUp className="h-6 w-6 mb-2" />
                <span>Upload ZIP</span>
              </Button>
            </div>
          </div>
        )}
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
