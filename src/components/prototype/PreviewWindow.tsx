import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PreviewIframe } from './PreviewIframe';

interface PreviewWindowProps {
  prototypeId: string;
  deploymentStatus?: 'pending' | 'deployed' | 'failed';
  deploymentUrl?: string;
  className?: string;
}

export function PreviewWindow({
  prototypeId,
  deploymentStatus: initialStatus,
  deploymentUrl: initialUrl,
  className = ''
}: PreviewWindowProps) {
  const [status, setStatus] = useState(initialStatus || 'pending');
  const [url, setUrl] = useState(initialUrl || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Poll for updates when status is pending
  useEffect(() => {
    if (status === 'deployed' && url) {
      setLoading(false);
      return;
    }

    const checkDeploymentStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('prototypes')
          .select('deployment_status, deployment_url')
          .eq('id', prototypeId)
          .single();

        if (error) throw new Error(error.message);
        if (!data) throw new Error('Prototype not found');

        if (data.deployment_status === 'deployed' && data.deployment_url) {
          setStatus('deployed');
          setUrl(data.deployment_url);
          setLoading(false);
        } else if (data.deployment_status === 'failed') {
          setStatus('failed');
          setError('Deployment failed. Please try again later.');
          setLoading(false);
        } else {
          // Still pending, continue polling
          setStatus('pending');
          // Increment retry count to show different messages
          setRetryCount(prev => prev + 1);
        }
      } catch (err) {
        console.error('Error checking deployment status:', err);
        setError('Failed to check deployment status');
        setLoading(false);
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
  }, [prototypeId, status, url]);

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
    setError('Failed to load prototype preview');
    setLoading(false);
  };

  if (error) {
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
        </div>
      </div>
    );
  }

  if (status === 'deployed' && url) {
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
    </div>
  );
}
