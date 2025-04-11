import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, AlertCircle, FileArchive, FileCode } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Prototype } from '@/types/prototype';

interface PrototypeUploaderProps {
  userId: string;
  onUploadComplete?: (prototype: Prototype) => void;
  className?: string;
}

export function PrototypeUploader({
  userId,
  onUploadComplete,
  className = '',
}: PrototypeUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    const validTypes = ['.html', '.htm', '.zip', 'text/html', 'application/zip'];
    const fileType = file.type;
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    
    if (!validTypes.includes(fileType) && !validTypes.includes(fileExtension)) {
      return 'Please upload an HTML or ZIP file';
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return 'File size exceeds the limit (10MB)';
    }
    
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    
    if (selectedFile) {
      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError(validationError);
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !userId) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      const prototypeId = uuidv4();
      
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const filePath = `${userId}/${prototypeId}.${fileExtension}`;
      
      console.log('Uploading file to storage:', filePath);
      
      const { error: uploadError } = await supabase.storage
        .from('prototype-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
      setUploadProgress(50);
      console.log('File uploaded successfully to storage');
      
      const prototypeData = {
        id: prototypeId,
        name: file.name.replace(`.${fileExtension}`, ''),
        description: null,
        created_by: userId,
        tech_stack: fileExtension === 'zip' ? 'zip-package' : 'html',
        files: {},
        file_path: filePath,
        deployment_status: 'pending',
      };
      
      console.log('Creating prototype record:', prototypeData);
      
      const { error: insertError } = await supabase
        .from('prototypes')
        .insert(prototypeData);
      
      if (insertError) throw new Error(`Database insertion failed: ${insertError.message}`);
      setUploadProgress(75);
      console.log('Prototype record created successfully');
      
      console.log('Triggering edge function to process prototype');
      const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-prototype`;
      console.log('Edge function URL:', functionUrl);
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ prototypeId }),
      });
      
      console.log('Edge function response status:', response.status);
      const responseData = await response.json();
      console.log('Edge function response data:', responseData);
      
      setUploadProgress(100);
      
      if (!response.ok) {
        throw new Error(`Processing failed: ${responseData.error || 'Unknown error'}`);
      }
      
      toast({
        title: 'Upload successful',
        description: 'Your prototype is being processed and will be available shortly.',
      });
      
      if (onUploadComplete) {
        onUploadComplete(prototypeData as Prototype);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed. Please try again.');
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: err.message || 'There was a problem uploading your prototype.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`${className}`}>
      <div className="space-y-4">
        {!file ? (
          <>
            <Label htmlFor="prototype-file" className="block mb-2">
              Upload prototype
            </Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <Input
                id="prototype-file"
                type="file"
                accept=".html,.htm,.zip"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center space-y-3 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground">HTML or ZIP files (max 10MB)</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-lg border p-4">
            <div className="flex items-center space-x-3">
              {file.name.endsWith('.zip') ? (
                <FileArchive className="h-8 w-8 text-primary" />
              ) : (
                <FileCode className="h-8 w-8 text-primary" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={isUploading}
                onClick={resetUpload}
              >
                Change
              </Button>
            </div>
            
            {isUploading && (
              <div className="mt-4">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300 ease-in-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-destructive flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={resetUpload}
            disabled={!file || isUploading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading
              </>
            ) : (
              'Upload and Deploy'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
