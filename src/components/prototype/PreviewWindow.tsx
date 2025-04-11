
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Prototype } from "@/types/prototype";

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
      if (deploymentUrl) {
        setIframeUrl(deploymentUrl);
        setIsLoading(false);
        return;
      }

      try {
        // First try to fetch all fields we need
        const { data, error } = await supabase
          .from('prototypes')
          .select('deployment_status, deployment_url, preview_url, files')
          .eq('id', prototypeId)
          .single();

        if (error) {
          // If we get an error about columns not existing, try a more limited query
          if (error.message.includes("column 'deployment_status' does not exist") || 
              error.message.includes("column 'preview_url' does not exist")) {
            
            // Try to fetch just files, which should exist in any case
            const { data: fileData, error: fileError } = await supabase
              .from('prototypes')
              .select('files')
              .eq('id', prototypeId)
              .single();
              
            if (fileError) {
              throw fileError;
            }
            
            if (fileData && typeof fileData.files === 'object' && Object.keys(fileData.files).length > 0) {
              // We have files but no deployment or preview URL, set up for in-browser display
              setIframeUrl(null);
              setIsLoading(false);
              return;
            } else {
              throw new Error("No preview or files available for this prototype");
            }
          } else {
            throw error;
          }
        }

        // TypeScript safety: Now we know data exists and is not an error
        if (data) {
          // Use type assertion to help TypeScript understand the data structure
          const prototypeData = data as {
            preview_url?: string;
            deployment_status?: 'pending' | 'deployed' | 'failed';
            deployment_url?: string;
            files?: Record<string, string>;
          };

          // First priority: check if there's a preview URL
          if (prototypeData.preview_url) {
            setIframeUrl(prototypeData.preview_url);
            setIsLoading(false);
            return;
          }
          
          // Second priority: check deployment status and URL
          if (prototypeData.deployment_status === 'deployed' && prototypeData.deployment_url) {
            setIframeUrl(prototypeData.deployment_url);
            setIsLoading(false);
          } else if (prototypeData.deployment_status === 'pending') {
            setLoadingMessage("Prototype deployment in progress...");
            // Continue checking status
          } else if (prototypeData.deployment_status === 'failed') {
            setError("Deployment failed. Please try again.");
            setIsLoading(false);
          } else if (prototypeData.files && typeof prototypeData.files === 'object' && Object.keys(prototypeData.files).length > 0) {
            // If no deployment but has files, we can set up for in-browser display
            setIframeUrl(null); // We'll use the files directly
            setIsLoading(false);
          } else {
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

    fetchPrototypeStatus();

    // Set up polling for pending deployments
    if ((deploymentStatus === 'pending' || !deploymentStatus) && !deploymentUrl) {
      checkStatusInterval.current = window.setInterval(() => {
        retryCount.current += 1;
        
        if (retryCount.current > 30) {
          // Give up after 2.5 minutes (30 * 5 seconds)
          clearInterval(checkStatusInterval.current!);
          setError("Deployment is taking longer than expected. Please check back later.");
          setIsLoading(false);
        } else {
          fetchPrototypeStatus();
        }
      }, 5000);
    }

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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-gray-50 p-6">
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold text-red-600 mb-3">Preview Error</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
        </div>
      </div>
    );
  }

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
        />
      ) : (
        // If we don't have a URL but have files, we could render a sandpack or other preview here
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Use Sandpack or another in-browser renderer here for file-based prototypes</p>
        </div>
      )}
    </div>
  );
}
