
import React, { useState, useEffect, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PreviewIframe } from './PreviewIframe';
import { Sandpack } from '@codesandbox/sandpack-react';

interface PreviewWindowProps {
  prototypeId: string;
  deploymentStatus?: 'pending' | 'deployed' | 'failed';
  deploymentUrl?: string;
  files?: Record<string, string>;
  className?: string;
}

type PrototypeData = {
  id: string;
  files: Record<string, any>;
  deployment_status?: string;
  deployment_url?: string;
  file_path?: string;
}

export function PreviewWindow({
  prototypeId,
  deploymentStatus: initialStatus,
  deploymentUrl: initialUrl,
  files,
  className = ''
}: PreviewWindowProps) {
  const [status, setStatus] = useState(initialStatus || 'pending');
  const [url, setUrl] = useState(initialUrl || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [usingFallback, setUsingFallback] = useState(false);
  const [prototypeFiles, setPrototypeFiles] = useState<Record<string, string> | null>(files || null);
  const [lastPolledAt, setLastPolledAt] = useState<Date | null>(null);

  // Process files for Sandpack if available
  const sandpackFiles = useCallback(() => {
    if (!prototypeFiles || Object.keys(prototypeFiles).length === 0) return null;
    
    console.log('Preparing Sandpack files from:', Object.keys(prototypeFiles));
    
    return Object.entries(prototypeFiles).reduce(
      (acc, [path, content]) => {
        const sandpackPath = path.startsWith('/') ? path.substring(1) : path;
        return {
          ...acc,
          [sandpackPath]: { code: content as string },
        };
      },
      {}
    );
  }, [prototypeFiles]);

  // Determine entry file for Sandpack
  const getEntryFile = useCallback(() => {
    if (!prototypeFiles) return "index.html";
    
    const processedFiles = sandpackFiles();
    if (!processedFiles) return "index.html";
    
    const fileKeys = Object.keys(processedFiles);
    console.log('Available files for entry point selection:', fileKeys);
    
    // Prioritize finding entry files
    const entryFile = fileKeys.find(file => file === "index.html") ||
           fileKeys.find(file => file.endsWith(".html")) ||
           fileKeys.find(file => file === "index.js") ||
           fileKeys[0] ||
           "index.html";
           
    console.log('Selected entry file:', entryFile);
    return entryFile;
  }, [prototypeFiles, sandpackFiles]);

  // Function to convert database files to typesafe format
  const convertFilesToTypedFormat = (filesObj: any): Record<string, string> => {
    console.log('Converting files data:', typeof filesObj, filesObj);
    
    const typedFiles: Record<string, string> = {};
    
    // Null check
    if (!filesObj) {
      console.warn('No files data to convert');
      return typedFiles;
    }
    
    // Check if filesObj is a proper object (not null, array, or primitive)
    if (typeof filesObj === 'object' && !Array.isArray(filesObj)) {
      try {
        Object.entries(filesObj).forEach(([key, value]) => {
          if (typeof value === 'string') {
            typedFiles[key] = value;
            console.log(`Added file: ${key} (${value.substring(0, 50)}...)`);
          } else {
            console.warn(`Skipped non-string file content for ${key}:`, typeof value);
          }
        });
      } catch (err) {
        console.error('Error processing files object:', err);
      }
    } else {
      console.warn('Files data is not a proper object:', typeof filesObj);
    }
    
    console.log('Converted to typed format with', Object.keys(typedFiles).length, 'files');
    return typedFiles;
  };

  // Poll for updates when status is pending
  useEffect(() => {
    if (status === 'deployed' && url) {
      console.log('Preview is already deployed with URL:', url);
      setLoading(false);
      return;
    }

    // If we have files, we can use Sandpack as fallback
    if (prototypeFiles && Object.keys(prototypeFiles).length > 0) {
      console.log('Using Sandpack fallback with', Object.keys(prototypeFiles).length, 'files');
      setUsingFallback(true);
      setLoading(false);
      return;
    }

    const checkDeploymentStatus = async () => {
      try {
        setLastPolledAt(new Date());
        console.log('Checking deployment status for prototype:', prototypeId);
        
        // First, try to get all columns including deployment status
        const { data: prototypeData, error: fetchError } = await supabase
          .from('prototypes')
          .select('files, deployment_status, deployment_url, file_path')
          .eq('id', prototypeId)
          .single();

        console.log('Prototype data fetched:', prototypeData);
        console.log('Fetch error:', fetchError);

        if (fetchError) {
          // Check if the error is due to missing columns
          if (fetchError.message && fetchError.message.includes('column') && 
              fetchError.message.includes('does not exist')) {
            
            console.log('Column does not exist, fetching just files');
            
            // Fall back to just fetching files if deployment columns don't exist
            const { data: filesData, error: filesError } = await supabase
              .from('prototypes')
              .select('files')
              .eq('id', prototypeId)
              .single();
              
            if (filesError) throw new Error(filesError.message);
            if (!filesData) throw new Error('Prototype not found');
            
            console.log('Files data fetched:', filesData);
            
            // Handle files data safely - filesData is the data object, not an error
            if (filesData && typeof filesData === 'object') {
              // Check if 'files' property exists to handle the TypeScript error
              const filesContent = 'files' in filesData ? filesData.files : null;
              
              if (filesContent) {
                const typedFiles = convertFilesToTypedFormat(filesContent);
                if (Object.keys(typedFiles).length > 0) {
                  setPrototypeFiles(typedFiles);
                  setUsingFallback(true);
                  setLoading(false);
                } else {
                  throw new Error('No valid files found for this prototype');
                }
              } else {
                throw new Error('No files property found in prototype data');
              }
            } else {
              throw new Error('No valid files found for this prototype');
            }
            
            return;
          } else {
            throw new Error(fetchError.message);
          }
        }

        if (!prototypeData) throw new Error('Prototype not found');
        
        console.log('Processing prototype data:', prototypeData);
        console.log('Raw files data type:', typeof prototypeData.files);
        console.log('Raw files data sample:', 
          typeof prototypeData.files === 'object' 
            ? Object.keys(prototypeData.files).slice(0, 3) 
            : String(prototypeData.files).substring(0, 100)
        );

        // Update files if not already set and files exists
        if (prototypeData && 'files' in prototypeData && prototypeData.files) {
          if (!prototypeFiles || Object.keys(prototypeFiles).length === 0) {
            const typedFiles = convertFilesToTypedFormat(prototypeData.files);
            console.log('Setting prototype files with', Object.keys(typedFiles).length, 'files');
            setPrototypeFiles(typedFiles);
          }
        }

        // If deployment columns exist and have values
        if (prototypeData && 
            'deployment_status' in prototypeData && 
            'deployment_url' in prototypeData) {
          
          const deployStatus = prototypeData.deployment_status as string;
          const deployUrl = prototypeData.deployment_url as string;
          
          console.log('Deployment status:', deployStatus);
          console.log('Deployment URL:', deployUrl);
          
          if (deployStatus === 'deployed' && deployUrl) {
            console.log('Prototype is DEPLOYED with URL:', deployUrl);
            setStatus('deployed');
            setUrl(deployUrl);
            setLoading(false);
          } else if (deployStatus === 'failed') {
            console.log('Deployment FAILED');
            setStatus('failed');
            
            // If we have files, we can still show a preview with Sandpack
            if (prototypeData && 'files' in prototypeData && prototypeData.files) {
              const typedFiles = convertFilesToTypedFormat(prototypeData.files);
              if (Object.keys(typedFiles).length > 0) {
                console.log('Using Sandpack fallback due to deployment failure');
                setPrototypeFiles(typedFiles);
                setUsingFallback(true);
                setLoading(false);
              } else {
                setError('Deployment failed and no valid files found.');
                setLoading(false);
              }
            } else {
              setError('Deployment failed. Please try again later.');
              setLoading(false);
            }
          } else {
            // Still pending, continue polling
            console.log('Deployment still PENDING, continuing to poll');
            setStatus('pending');
            // Increment retry count to show different messages
            setRetryCount(prev => prev + 1);
          }
        } else if (prototypeData) {
          // Deployment columns don't exist, use Sandpack fallback
          console.log('No deployment columns found, using Sandpack fallback');
          // Check if the prototype data has files property and it's not null or undefined
          if ('files' in prototypeData && prototypeData.files) {
            const typedFiles = convertFilesToTypedFormat(prototypeData.files);
            if (Object.keys(typedFiles).length > 0) {
              setPrototypeFiles(typedFiles);
              setUsingFallback(true);
              setLoading(false);
            } else {
              setError('No valid files found for this prototype');
              setLoading(false);
            }
          } else {
            setError('No files found for this prototype');
            setLoading(false);
          }
        }
      } catch (err: any) {
        console.error('Error checking deployment status:', err);
        setError('Failed to check deployment status');
        
        // Try to use local files as fallback if available
        if (prototypeFiles && Object.keys(prototypeFiles).length > 0) {
          console.log('Using local files as fallback after error');
          setUsingFallback(true);
          setLoading(false);
        } else {
          setLoading(false);
        }
      }
    };

    // Initial check or reset loading state when url changes
    if (!url || status === 'pending') {
      setLoading(true);
    }

    // Start polling
    const pollingInterval = setInterval(checkDeploymentStatus, 3000);
    
    // Do an immediate check
    checkDeploymentStatus();

    return () => clearInterval(pollingInterval);
  }, [prototypeId, status, url, prototypeFiles]);

  const getLoadingMessage = () => {
    const messages = [
      'Preparing your prototype...',
      'Setting up deployment...',
      'Almost there...',
      'Finalizing deployment...',
      'This is taking longer than expected...'
    ];
    
    // Cycle through different messages based on retry count
    return messages[Math.min(retryCount, messages.length - 1)];
  };

  // Handle iframe load error
  const handleIframeError = () => {
    console.error('Failed to load iframe for URL:', url);
    setError('Failed to load prototype preview');
    // If we have files, fall back to Sandpack
    if (prototypeFiles && Object.keys(prototypeFiles).length > 0) {
      console.log('Falling back to Sandpack after iframe load error');
      setUsingFallback(true);
    } else {
      setLoading(false);
    }
  };

  if (error && !usingFallback) {
    return (
      <div className={`flex flex-col items-center justify-center w-full h-full bg-muted/20 ${className}`}>
        <div className="text-center p-6 max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Preview Error</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">
            If the problem persists, please try reuploading your prototype.
          </p>
        </div>
      </div>
    );
  }

  if (loading || status === 'pending') {
    return (
      <div className={`flex flex-col items-center justify-center w-full h-full bg-muted/20 ${className}`}>
        <div className="text-center p-6 max-w-md">
          <div className="flex items-center justify-center mb-6">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
          <Skeleton className="h-6 w-48 mb-4 mx-auto" />
          <p className="text-muted-foreground">{getLoadingMessage()}</p>
          {lastPolledAt && (
            <p className="text-xs text-muted-foreground mt-2">
              Last checked: {lastPolledAt.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Use Sandpack as fallback if we have files but no deployment URL
  if (usingFallback && prototypeFiles && Object.keys(prototypeFiles).length > 0) {
    const processedFiles = sandpackFiles();
    const entryFile = getEntryFile();
    
    console.log('Rendering Sandpack fallback view with files:', Object.keys(prototypeFiles));
    console.log('Using entry file:', entryFile);
    
    return (
      <div className={`w-full h-full ${className}`}>
        <Sandpack
          template="vanilla"
          files={processedFiles || {}}
          options={{
            showNavigator: false,
            showTabs: false,
            showLineNumbers: false,
            showInlineErrors: true,
            editorHeight: '0',
            editorWidthPercentage: 0,
            visibleFiles: [],
            recompileMode: "immediate",
            recompileDelay: 300,
            autorun: true,
            classes: {
              'sp-preview': 'preview-only-mode w-full h-full m-0 p-0',
              'sp-layout': 'preview-only-layout w-full h-full m-0 p-0',
              'sp-stack': 'preview-only-stack w-full h-full m-0 p-0',
              'sp-wrapper': 'preview-only-wrapper w-full h-full m-0 p-0',
              'sp-preview-container': 'w-full h-full border-none m-0 p-0',
              'sp-preview-iframe': 'w-full h-full border-none m-0 p-0'
            }
          }}
          customSetup={{
            entry: entryFile,
            // Minimal dependencies for vanilla projects
            dependencies: {}
          }}
          theme="light"
        />
      </div>
    );
  }

  if (status === 'deployed' && url) {
    console.log('Rendering deployed iframe with URL:', url);
    return (
      <div className={`w-full h-full ${className}`}>
        <PreviewIframe 
          url={url} 
          title="Prototype Preview" 
          onError={handleIframeError}
        />
      </div>
    );
  }

  // Fallback for unexpected states
  return (
    <div className={`flex flex-col items-center justify-center w-full h-full bg-muted/20 ${className}`}>
      <p className="text-muted-foreground">Preview unavailable</p>
      <p className="text-xs text-muted-foreground mt-2">
        Status: {status}, URL: {url ? 'set' : 'not set'}, 
        Files: {prototypeFiles ? Object.keys(prototypeFiles).length : 0}
      </p>
    </div>
  );
}
