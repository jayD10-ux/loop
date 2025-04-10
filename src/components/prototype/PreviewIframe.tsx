import React, { useState, useEffect } from 'react';

interface PreviewIframeProps {
  url: string;
  title?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function PreviewIframe({ 
  url, 
  title = 'Prototype Preview', 
  className = '',
  onLoad,
  onError
}: PreviewIframeProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Reset state when URL changes
  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [url]);

  const handleLoad = () => {
    setLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setError(true);
    if (onError) onError();
  };

  return (
    <iframe
      src={url}
      title={title}
      className={`w-full h-full border-none ${className}`}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}
