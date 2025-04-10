
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { parseZipFile, injectTailwindCDN, TechStack } from "@/lib/prototype-parser";
import { useToast } from "@/hooks/use-toast";

interface AddPrototypeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddPrototypeModal({ open, onClose, onSuccess }: AddPrototypeModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip']
    },
    maxSize: 1024 * 1024 * 1024, // 1GB
    maxFiles: 1,
    onDrop: (acceptedFiles, rejectedFiles) => {
      setError(null);
      
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0].code === 'file-too-large') {
          setError('File is too large. Maximum size is 1GB.');
        } else if (rejection.errors[0].code === 'file-invalid-type') {
          setError('Only ZIP files are accepted.');
        } else {
          setError(rejection.errors[0].message);
        }
        return;
      }
      
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        
        // Use filename as default name (without extension)
        if (!name) {
          const fileName = selectedFile.name.replace(/\.zip$/, '');
          setName(fileName);
        }
      }
    }
  });

  const handleClose = () => {
    setFile(null);
    setName("");
    setDescription("");
    setError(null);
    setIsProcessing(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please upload a ZIP file.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter a name for your prototype.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Parse the ZIP file
      const { files, techStack, hasTailwind } = await parseZipFile(file);
      
      // Inject Tailwind CDN if needed
      const processedFiles = (techStack === 'vanilla' && hasTailwind) 
        ? injectTailwindCDN(files) 
        : files;
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to add a prototype.");
      }
      
      // Save to Supabase with proper type casting
      const { error: dbError } = await supabase
        .from('prototypes')
        .insert({
          name,
          description: description || null,
          created_by: session.user.id,
          tech_stack: techStack,
          files: processedFiles
        } as any);
      
      if (dbError) {
        throw new Error(dbError.message);
      }
      
      toast({
        title: "Prototype created",
        description: "Your prototype has been successfully uploaded."
      });
      
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || "Failed to process ZIP file. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add Prototype</DialogTitle>
          <DialogDescription>
            Upload a ZIP file containing your frontend project.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Prototype Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name for your prototype"
              disabled={isProcessing}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description for your prototype"
              rows={3}
              disabled={isProcessing}
            />
          </div>
          
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-border'
            } ${file ? 'bg-muted/30' : ''}`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="font-medium">{file.name}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    disabled={isProcessing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-1">
                  {isDragActive ? "Drop ZIP file here" : "Drag and drop your ZIP file"}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Or click to browse files
                </p>
                <Button type="button" size="sm" variant="outline">
                  Select ZIP File
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Maximum file size: 1GB
                </p>
              </>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            <h4 className="font-medium text-foreground mb-1">Supported file types:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>React projects (with package.json)</li>
              <li>Vanilla HTML/CSS/JS (with index.html)</li>
              <li>Tailwind CSS is automatically detected and injected for vanilla projects</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={!file || isProcessing}
          >
            {isProcessing ? "Processing..." : "Add Prototype"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
