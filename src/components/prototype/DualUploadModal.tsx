
import { useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { 
  X, Upload, Link, FileArchive, Figma, AlertCircle, Info, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { v4 as uuidv4 } from "uuid";
import { Prototype } from "@/types/prototype";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface DualUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (prototype: Prototype) => void;
}

const figmaUrlPattern = /^https:\/\/(www\.)?figma\.com\/(file|proto)\/([a-zA-Z0-9]{22,128})\/.*$/;
const extractFigmaKey = (url: string) => {
  const match = url.match(figmaUrlPattern);
  return match ? match[3] : null;
};

const validateUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Form schema for file upload
const fileUploadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  figmaLink: z.string().optional()
    .refine(val => !val || figmaUrlPattern.test(val), {
      message: "Please enter a valid Figma file URL",
    }),
});

// Form schema for link upload
const linkUploadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  previewUrl: z.string().min(1, "URL is required")
    .refine(validateUrl, {
      message: "Please enter a valid URL",
    }),
  figmaLink: z.string().optional()
    .refine(val => !val || figmaUrlPattern.test(val), {
      message: "Please enter a valid Figma file URL",
    }),
});

type FileUploadFormValues = z.infer<typeof fileUploadSchema>;
type LinkUploadFormValues = z.infer<typeof linkUploadSchema>;

export function DualUploadModal({ open, onClose, onSuccess }: DualUploadModalProps) {
  const [activeTab, setActiveTab] = useState<string>("file");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [figmaPreview, setFigmaPreview] = useState<{
    fileName: string;
    previewUrl?: string;
    fileKey: string;
  } | null>(null);
  const [isFigmaProcessing, setIsFigmaProcessing] = useState(false);
  const { toast } = useToast();

  // Form for file upload
  const fileForm = useForm<FileUploadFormValues>({
    resolver: zodResolver(fileUploadSchema),
    defaultValues: {
      name: "",
      description: "",
      figmaLink: "",
    },
  });

  // Form for link upload
  const linkForm = useForm<LinkUploadFormValues>({
    resolver: zodResolver(linkUploadSchema),
    defaultValues: {
      name: "",
      description: "",
      previewUrl: "",
      figmaLink: "",
    },
  });

  // File dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    onDrop: (acceptedFiles, rejectedFiles) => {
      setError(null);
      
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0].code === 'file-too-large') {
          setError('File is too large. Maximum size is 10MB.');
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
        if (!fileForm.getValues().name) {
          const fileName = selectedFile.name.replace(/\.zip$/, '');
          fileForm.setValue("name", fileName);
        }
      }
    }
  });

  // Process Figma link
  useEffect(() => {
    const processFigmaLink = async (figmaLink: string) => {
      if (!figmaLink || !figmaUrlPattern.test(figmaLink)) {
        setFigmaPreview(null);
        return;
      }

      const fileKey = extractFigmaKey(figmaLink);
      if (!fileKey) {
        setFigmaPreview(null);
        return;
      }

      setIsFigmaProcessing(true);
      setFigmaPreview(null);
      setError(null);

      try {
        // In a production app, this would call a backend function to access the Figma API
        // Here we're just setting mock data for demonstration
        
        // Mock Figma data response
        setTimeout(() => {
          setFigmaPreview({
            fileName: "Figma Design File",
            fileKey,
            previewUrl: "https://placehold.co/400x300/5046e4/FFFFFF?text=Figma+Preview",
          });
          setIsFigmaProcessing(false);
        }, 1000);
        
        // Uncomment for real implementation with a backend function
        /*
        const { data, error } = await supabase.functions.invoke('get-figma-file', {
          body: { fileKey },
        });
        
        if (error) throw new Error(error.message);
        
        setFigmaPreview({
          fileName: data.name,
          previewUrl: data.previewUrl,
          fileKey,
        });
        */
      } catch (err: any) {
        setError(`Failed to fetch Figma file: ${err.message}`);
        setFigmaPreview(null);
      } finally {
        setIsFigmaProcessing(false);
      }
    };

    // Process Figma link when it changes in either form
    const figmaLinkFile = fileForm.watch("figmaLink");
    const figmaLinkUrl = linkForm.watch("figmaLink");
    
    const currentFigmaLink = activeTab === "file" ? figmaLinkFile : figmaLinkUrl;
    
    if (currentFigmaLink) {
      processFigmaLink(currentFigmaLink);
    } else {
      setFigmaPreview(null);
    }
  }, [
    fileForm.watch("figmaLink"), 
    linkForm.watch("figmaLink"),
    activeTab
  ]);

  const handleClose = () => {
    setFile(null);
    setError(null);
    setIsProcessing(false);
    setFigmaPreview(null);
    fileForm.reset();
    linkForm.reset();
    onClose();
  };

  const handleFileUploadSubmit = async (data: FileUploadFormValues) => {
    if (!file) {
      setError("Please upload a ZIP file.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to add a prototype.");
      }

      const prototypeId = uuidv4();
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const filePath = `${session.user.id}/${prototypeId}.${fileExtension}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('prototypes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
      
      // Prepare prototype data
      const figmaFileKey = data.figmaLink ? extractFigmaKey(data.figmaLink) : null;
      
      const prototypeData = {
        id: prototypeId,
        name: data.name,
        description: data.description || null,
        created_by: session.user.id,
        tech_stack: 'zip-package',
        files: {},
        file_path: filePath,
        deployment_status: 'pending',
        figma_link: data.figmaLink || null,
        figma_file_key: figmaFileKey,
        figma_file_name: figmaPreview?.fileName || null,
        figma_preview_url: figmaPreview?.previewUrl || null
      };
      
      // Save to database
      const { error: insertError } = await supabase
        .from('prototypes')
        .insert(prototypeData);
      
      if (insertError) throw new Error(`Database insertion failed: ${insertError.message}`);
      
      // Trigger processing function
      const origin = window.location.origin;
      const functionUrl = `${origin}/.netlify/edge-functions/process-prototype`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prototypeId }),
      });
      
      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(`Processing failed: ${responseData.error || 'Unknown error'}`);
      }
      
      toast({
        title: 'Upload successful',
        description: 'Your prototype is being processed and will be available shortly.',
      });
      
      onSuccess(prototypeData as Prototype);
      handleClose();
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed. Please try again.');
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: err.message || 'There was a problem uploading your prototype.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLinkUploadSubmit = async (data: LinkUploadFormValues) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to add a prototype.");
      }

      const prototypeId = uuidv4();
      const figmaFileKey = data.figmaLink ? extractFigmaKey(data.figmaLink) : null;
      
      // Prepare prototype data
      const prototypeData = {
        id: prototypeId,
        name: data.name,
        description: data.description || null,
        created_by: session.user.id,
        tech_stack: 'external-url',
        files: {},
        preview_url: data.previewUrl,
        deployment_status: 'deployed',
        deployment_url: data.previewUrl,
        figma_link: data.figmaLink || null,
        figma_file_key: figmaFileKey,
        figma_file_name: figmaPreview?.fileName || null,
        figma_preview_url: figmaPreview?.previewUrl || null
      };
      
      // Save to database
      const { error: insertError } = await supabase
        .from('prototypes')
        .insert(prototypeData);
      
      if (insertError) throw new Error(`Database insertion failed: ${insertError.message}`);
      
      toast({
        title: 'Prototype added',
        description: 'Your prototype has been successfully added.',
      });
      
      onSuccess(prototypeData as Prototype);
      handleClose();
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Failed to add prototype. Please try again.');
      toast({
        variant: 'destructive',
        title: 'Failed to add prototype',
        description: err.message || 'There was a problem adding your prototype.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Prototype</DialogTitle>
          <DialogDescription>
            Upload or link to your prototype and optionally connect a Figma design.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs 
          defaultValue="file" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="file" className="flex items-center">
              <FileArchive className="mr-2 h-4 w-4" />
              Upload from File
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center">
              <Link className="mr-2 h-4 w-4" />
              Upload from Link
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="file" className="space-y-4">
            <Form {...fileForm}>
              <form onSubmit={fileForm.handleSubmit(handleFileUploadSubmit)} className="space-y-4">
                <FormField
                  control={fileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prototype Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter a name for your prototype"
                          disabled={isProcessing}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={fileForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter a description for your prototype"
                          rows={3}
                          disabled={isProcessing}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                        Maximum file size: 10MB
                      </p>
                    </>
                  )}
                </div>
                
                <FormField
                  control={fileForm.control}
                  name="figmaLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Figma Link (optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Paste a Figma file URL to connect the design"
                          disabled={isProcessing}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Connect this prototype to its Figma design for better context
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Figma Preview */}
                {isFigmaProcessing && (
                  <div className="flex items-center justify-center p-4 border rounded-md">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span className="text-sm">Fetching Figma file...</span>
                  </div>
                )}
                
                {figmaPreview && (
                  <div className="flex items-start space-x-4 p-4 border rounded-md bg-muted/30">
                    {figmaPreview.previewUrl && (
                      <div className="flex-shrink-0 w-24 h-24 relative rounded overflow-hidden">
                        <img 
                          src={figmaPreview.previewUrl} 
                          alt="Figma preview" 
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Figma className="h-4 w-4 mr-2 text-blue-500" />
                        <p className="font-medium text-sm">{figmaPreview.fileName}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Connected Figma design
                      </p>
                    </div>
                  </div>
                )}
  
                <DialogFooter className="mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleClose}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!file || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : "Add Prototype"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="link" className="space-y-4">
            <Form {...linkForm}>
              <form onSubmit={linkForm.handleSubmit(handleLinkUploadSubmit)} className="space-y-4">
                <FormField
                  control={linkForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prototype Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter a name for your prototype"
                          disabled={isProcessing}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={linkForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter a description for your prototype"
                          rows={3}
                          disabled={isProcessing}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={linkForm.control}
                  name="previewUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prototype URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com"
                          disabled={isProcessing}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the URL where your prototype is already deployed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={linkForm.control}
                  name="figmaLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Figma Link (optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Paste a Figma file URL to connect the design"
                          disabled={isProcessing}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Connect this prototype to its Figma design for better context
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Figma Preview (same as in file tab) */}
                {isFigmaProcessing && (
                  <div className="flex items-center justify-center p-4 border rounded-md">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span className="text-sm">Fetching Figma file...</span>
                  </div>
                )}
                
                {figmaPreview && (
                  <div className="flex items-start space-x-4 p-4 border rounded-md bg-muted/30">
                    {figmaPreview.previewUrl && (
                      <div className="flex-shrink-0 w-24 h-24 relative rounded overflow-hidden">
                        <img 
                          src={figmaPreview.previewUrl} 
                          alt="Figma preview" 
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Figma className="h-4 w-4 mr-2 text-blue-500" />
                        <p className="font-medium text-sm">{figmaPreview.fileName}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Connected Figma design
                      </p>
                    </div>
                  </div>
                )}
                
                <DialogFooter className="mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleClose}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : "Add Prototype"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
