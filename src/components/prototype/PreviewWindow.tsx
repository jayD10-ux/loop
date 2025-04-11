
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";
import { Prototype } from "@/types/prototype";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PreviewWindowProps {
  prototypeId: string;
  deploymentStatus?: 'pending' | 'deployed' | 'failed';
  deploymentUrl?: string;
  files: Record<string, string>;
}

export function PreviewWindow({ 
  prototypeId, 
  deploymentStatus, 
  deploymentUrl,
  files 
}: PreviewWindowProps) {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Loading preview...");
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const retryCount = useRef(0);
  const checkStatusInterval = useRef<number | null>(null);

  useEffect(() => {
    const fetchPrototypeStatus = async () => {
      // If deployment URL is already provided as a prop, use it
      if (deploymentUrl) {
        setIframeUrl(deploymentUrl);
        setIsLoading(false);
        return;
      }

      try {
        // Determine which columns we need to select
        let columnsToSelect = 'files';
        
        // Try to fetch prototype data with a progressive approach
        const { data, error } = await supabase
          .from('prototypes')
          .select('deployment_status, deployment_url, preview_url, files')
          .eq('id', prototypeId)
          .single();

        if (error) {
          // Handle different types of column errors specifically
          if (error.message.includes("column 'deployment_status' does not exist") || 
              error.message.includes("column 'preview_url' does not exist")) {
            
            // Fall back to fetching just the files
            const { data: fileData, error: fileError } = await supabase
              .from('prototypes')
              .select('files')
              .eq('id', prototypeId)
              .single();
              
            if (fileError) {
              console.error("Error fetching prototype files:", fileError);
              throw fileError;
            }
            
            // If we have files but no deployment info, prepare for in-browser display
            if (fileData && typeof fileData.files === 'object' && Object.keys(fileData.files).length > 0) {
              setIframeUrl(null);
              setIsLoading(false);
              return;
            } else {
              throw new Error("No preview or files available for this prototype");
            }
          } else {
            console.error("Error fetching prototype:", error);
            throw error;
          }
        }

        // Process the fetched data
        if (data) {
          // Use type assertion to help TypeScript understand the data structure
          const prototypeData = data as {
            preview_url?: string;
            deployment_status?: 'pending' | 'deployed' | 'failed';
            deployment_url?: string;
            files?: Record<string, string>;
          };

          // Decision tree for preview sources with clear priorities
          if (prototypeData.preview_url) {
            // First priority: use direct preview URL
            setIframeUrl(prototypeData.preview_url);
            setIsLoading(false);
          } 
          else if (prototypeData.deployment_status === 'deployed' && prototypeData.deployment_url) {
            // Second priority: use deployment URL for deployed prototypes
            setIframeUrl(prototypeData.deployment_url);
            setIsLoading(false);
          } 
          else if (prototypeData.deployment_status === 'pending') {
            // Handle pending deployments
            setLoadingMessage("Prototype deployment in progress...");
            // Continue polling - interval is set up outside this function
          } 
          else if (prototypeData.deployment_status === 'failed') {
            // Handle failed deployments
            setError("Deployment failed. Please try again.");
            setIsLoading(false);
          } 
          else if (prototypeData.files && typeof prototypeData.files === 'object' && Object.keys(prototypeData.files).length > 0) {
            // Last option: use files directly for in-browser rendering
            setIframeUrl(null);
            setIsLoading(false);
          } 
          else {
            setError("No preview available for this prototype.");
            setIsLoading(false);
          }
        } else {
          setError("Prototype not found.");
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error("Error fetching prototype status:", err);
        setError(`Error loading preview: ${err.message}`);
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchPrototypeStatus();

    // Set up polling for pending deployments
    if ((deploymentStatus === 'pending' || !deploymentStatus) && !deploymentUrl) {
      checkStatusInterval.current = window.setInterval(() => {
        retryCount.current += 1;
        
        // Give up after 30 retries (2.5 minutes)
        if (retryCount.current > 30) {
          clearInterval(checkStatusInterval.current!);
          setError("Deployment is taking longer than expected. Please check back later.");
          setIsLoading(false);
        } else {
          fetchPrototypeStatus();
        }
      }, 5000); // Check every 5 seconds
    }

    // Clean up interval on unmount
    return () => {
      if (checkStatusInterval.current) {
        clearInterval(checkStatusInterval.current);
      }
    };
  }, [prototypeId, deploymentStatus, deploymentUrl]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setError("Failed to load preview. The URL might be inaccessible or incorrect.");
    setIsLoading(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-gray-50">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">{loadingMessage}</p>
        {retryCount.current > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Still working... ({retryCount.current}/30)
          </p>
        )}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-gray-50 p-6">
        <Alert variant="destructive" className="max-w-md w-full">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Preview Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render either iframe or file-based preview
  return (
    <div className="h-full w-full bg-white">
      {iframeUrl ? (
        <iframe
          ref={iframeRef}
          src={iframeUrl}
          className="w-full h-full border-none"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb; xr-spatial-tracking"
          loading="lazy"
          title="Prototype Preview"
          sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts"
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full p-6">
          <Alert className="max-w-md w-full mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Local Preview Mode</AlertTitle>
            <AlertDescription>
              This prototype is being rendered in local preview mode. Some features may be limited.
            </AlertDescription>
          </Alert>
          <div className="text-center">
            <p className="text-muted-foreground">Use Sandpack or another in-browser renderer here for file-based prototypes</p>
          </div>
        </div>
      )}
    </div>
  );
}
