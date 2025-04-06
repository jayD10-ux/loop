
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Github, Upload, FileCode, ExternalLink } from "lucide-react";

export function AddPrototypeForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, would send to API
    console.log("Submitting prototype:", { title, description });
    setUploading(true);
    
    // Simulate upload
    setTimeout(() => {
      setUploading(false);
      navigate("/");
    }, 1500);
  };
  
  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Add New Prototype</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title"
              placeholder="Enter a title for your prototype"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              placeholder="Describe your prototype"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="upload">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="upload">Upload ZIP</TabsTrigger>
              <TabsTrigger value="github">GitHub Repository</TabsTrigger>
              <TabsTrigger value="figma">Figma Link</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="border-2 border-dashed rounded-lg p-10 text-center">
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-1">Drag and drop your ZIP file</p>
                    <p className="text-sm text-muted-foreground mb-4">Or click to browse files</p>
                    <Button>Select File</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="github" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Github className="h-5 w-5" />
                      <h3 className="font-medium">GitHub Repository</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="repo-url">Repository URL</Label>
                      <Input 
                        id="repo-url"
                        placeholder="https://github.com/username/repo"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="branch">Branch (optional)</Label>
                      <Input 
                        id="branch"
                        placeholder="main"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="directory">Directory (optional)</Label>
                      <Input 
                        id="directory"
                        placeholder="src/components"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="figma" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <ExternalLink className="h-5 w-5" />
                      <h3 className="font-medium">Figma Link</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="figma-url">Figma URL</Label>
                      <Input 
                        id="figma-url"
                        placeholder="https://figma.com/file/..."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="figma-node">Frame/Node ID (optional)</Label>
                      <Input 
                        id="figma-node"
                        placeholder="Node ID"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="pt-4 flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate("/")}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!title || uploading}
            >
              {uploading ? "Uploading..." : "Add Prototype"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
