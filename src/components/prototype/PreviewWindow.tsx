
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Prototype } from "@/types/prototype";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PreviewIframe } from "./PreviewIframe";

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
  const [currentStatus, setCurrentStatus] = useState(deploymentStatus);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const retryCount = useRef(0);
  const checkStatusInterval = useRef<number | null>(null);

  const fetchPrototypeStatus = async () => {
    // If deployment URL is already provided as a prop, use it
    if (deploymentUrl) {
      setIframeUrl(deploymentUrl);
      setCurrentStatus('deployed');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Fetching prototype data for ID:', prototypeId);
      
      // Try to fetch prototype data 
      const { data, error } = await supabase
        .from('prototypes')
        .select('deployment_status, deployment_url, preview_url, files')
        .eq('id', prototypeId)
        .single();

      if (error) {
        console.error("Error fetching prototype:", error);
        
        // If the error is related to missing columns, try to fetch just the files
        if (error.message.includes("does not exist on")) {
          console.log('Attempting to fetch only files data');
          const { data: fileData, error: fileError } = await supabase
            .from('prototypes')
            .select('files')
            .eq('id', prototypeId)
            .single();
            
          if (fileError) {
            console.error("Error fetching prototype files:", fileError);
            throw fileError;
          }
          
          if (fileData && typeof fileData.files === 'object' && Object.keys(fileData.files).length > 0) {
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

      // Process the fetched data with proper type checking
      if (data) {
        console.log('Prototype data retrieved:', data);
        
        // Use type assertion to help TypeScript understand the data structure
        const prototypeData = data as {
          preview_url?: string;
          deployment_status?: 'pending' | 'deployed' | 'failed';
          deployment_url?: string;
          files?: Record<string, string>;
        };

        // Update current status
        setCurrentStatus(prototypeData.deployment_status);

        // Decision tree for preview sources with clear priorities
        if (prototypeData.preview_url) {
          console.log('Using preview_url:', prototypeData.preview_url);
          setIframeUrl(prototypeData.preview_url);
          setIsLoading(false);
        } 
        else if (prototypeData.deployment_status === 'deployed' && prototypeData.deployment_url) {
          console.log('Using deployment_url:', prototypeData.deployment_url);
          setIframeUrl(prototypeData.deployment_url);
          setIsLoading(false);
        } 
        else if (prototypeData.deployment_status === 'pending') {
          console.log('Deployment is pending, will poll for updates');
          setLoadingMessage("Prototype deployment in progress...");
          // Continue polling - interval is set up outside this function
        } 
        else if (prototypeData.deployment_status === 'failed') {
          console.log('Deployment failed');
          setError("Deployment failed. Please try again.");
          setIsLoading(false);
        } 
        else if (prototypeData.files && typeof prototypeData.files === 'object' && Object.keys(prototypeData.files).length > 0) {
          console.log('Using files for in-browser rendering');
          setIframeUrl(null);
          setIsLoading(false);
        } 
        else {
          console.log('No valid preview source found');
          setError("No preview available for this prototype.");
          setIsLoading(false);
        }
      } else {
        console.log('No prototype data returned');
        setError("Prototype not found.");
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("Error fetching prototype status:", err);
      setError(`Error loading preview: ${err.message}`);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchPrototypeStatus();

    // Set up polling for pending deployments
    if ((currentStatus === 'pending' || !currentStatus) && !deploymentUrl) {
      console.log('Setting up polling for pending deployment');
      checkStatusInterval.current = window.setInterval(() => {
        retryCount.current += 1;
        console.log(`Polling for deployment status (${retryCount.current}/30)`);
        
        // Give up after 30 retries (2.5 minutes)
        if (retryCount.current > 30) {
          console.log('Deployment taking too long, giving up');
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
        console.log('Clearing polling interval');
        clearInterval(checkStatusInterval.current);
      }
    };
  }, [prototypeId, deploymentStatus, deploymentUrl]);

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    retryCount.current = 0;
    fetchPrototypeStatus();
  };

  const handleIframeLoad = () => {
    console.log('Iframe loaded successfully');
    setIsLoading(false);
  };

  const handleIframeError = () => {
    console.error('Iframe failed to load');
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
        <Alert variant="destructive" className="max-w-md w-full mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Preview Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  // Render either iframe or file-based preview
  return (
    <div className="h-full w-full bg-white">
      {iframeUrl ? (
        <PreviewIframe
          url={iframeUrl}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
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
