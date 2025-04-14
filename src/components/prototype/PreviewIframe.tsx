
import React, { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

interface PreviewIframeProps {
  url: string;
  title?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  sandbox?: string;
}

export function PreviewIframe({ 
  url, 
  title = 'Prototype Preview', 
  className = '',
  onLoad,
  onError,
  sandbox = "allow-scripts allow-same-origin allow-forms allow-popups"
}: PreviewIframeProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  // Reset state when URL changes
  useEffect(() => {
    console.log('PreviewIframe: URL changed to', url);
    setLoaded(false);
    setError(false);
    retryCount.current = 0;
  }, [url]);

  const handleLoad = () => {
    console.log('PreviewIframe: iframe loaded');
    if (iframeRef.current) {
      try {
        // Check if the iframe content has loaded properly
        const iframeDoc = iframeRef.current.contentDocument || 
                        (iframeRef.current.contentWindow && iframeRef.current.contentWindow.document);
        
        // Log the access attempt for debugging
        console.log('PreviewIframe: Accessing iframe content:', 
          iframeDoc ? 'iframe document accessible' : 'iframe document not accessible');
        
        if (iframeDoc && iframeDoc.body) {
          console.log('PreviewIframe: Body accessible:', 
            iframeDoc.body ? 'yes' : 'no');
          console.log('PreviewIframe: Body has content:', 
            iframeDoc.body.innerHTML ? 'yes' : 'no');
        }
        
        if (iframeDoc && iframeDoc.body && iframeDoc.body.innerHTML) {
          console.log('PreviewIframe: Content loaded successfully');
          setLoaded(true);
          if (onLoad) onLoad();
        } else if (retryCount.current < maxRetries) {
          // Iframe loaded but with no content, retry
          retryCount.current++;
          console.warn(`Preview iframe loaded with no content. Retrying (${retryCount.current}/${maxRetries})...`);
          setTimeout(() => {
            if (iframeRef.current) {
              console.log('PreviewIframe: Retrying with URL:', url);
              iframeRef.current.src = url;
            }
          }, 1000);
        } else {
          console.error("Preview iframe failed to load content after multiple retries");
          handleError();
        }
      } catch (e) {
        // Cross-origin issues can cause this to fail but the iframe might still work
        console.warn("Could not access iframe content due to cross-origin policy:", e);
        console.log("PreviewIframe: Continuing anyway as the preview may still work");
        setLoaded(true);
        if (onLoad) onLoad();
      }
    }
  };

  const handleError = () => {
    console.error('PreviewIframe: Error loading iframe');
    if (retryCount.current < maxRetries) {
      retryCount.current++;
      console.warn(`Preview iframe failed to load. Retrying (${retryCount.current}/${maxRetries})...`);
      setTimeout(() => {
        if (iframeRef.current) {
          console.log('PreviewIframe: Retrying after error with URL:', url);
          iframeRef.current.src = url;
        }
      }, 1000);
    } else {
      console.error('PreviewIframe: Max retries reached, showing error state');
      setError(true);
      if (onError) onError();
    }
  };

  return (
    <>
      {error && (
        <div className="flex flex-col items-center justify-center h-full w-full">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-medium mb-2">Preview Failed to Load</h3>
          <p className="text-muted-foreground text-center max-w-md">
            The preview couldn't be loaded. This might be due to network issues or 
            security restrictions.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            URL attempted: {url}
          </p>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={url}
        title={title}
        className={`w-full h-full border-0 m-0 p-0 ${className} ${error ? 'hidden' : ''}`}
        sandbox={sandbox}
        onLoad={handleLoad}
        onError={handleError}
        allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi"
      />
    </>
  );
}
